// ============================================================
// Feature: Create Experiment
// BDD Syntax - Behaviour-Driven Development
// Covers: page rendering, validation, custom fields,
//         review modal, successful submission, auth failure
// ============================================================

describe("Feature: Create Experiment", () => {
  // ─── Background: set auth token and visit page ────────────
  beforeEach(() => {
    // Given the user is authenticated (token set in localStorage)
    cy.window().then((win) => {
      win.localStorage.setItem("token", "fake-jwt-token-12345");
    });

    // And the user is on the Create Experiment page
    cy.visit("http://localhost:5173/experiments/new");
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Page loads correctly", () => {
    it("should display all required form fields", () => {
      // Given the user is on the Create Experiment page
      // Then the heading "Create Experiment" should be visible
      cy.contains("h1", "Create Experiment").should("be.visible");

      // And the Title input field should be visible
      cy.contains("span", "Title")
        .parent("label")
        .find("input")
        .should("be.visible");

      // And the Description textarea should be visible
      cy.contains("span", "Description")
        .parent("label")
        .find("textarea")
        .should("be.visible");

      // And the Category select dropdown should be visible
      cy.contains("span", "Category")
        .parent("label")
        .find("select")
        .should("be.visible");

      // And the Duration input should be visible
      cy.contains("span", "Duration (days, optional)")
        .parent("label")
        .find('input[type="number"]')
        .should("be.visible");

      // And the Image upload input should be visible
      cy.get('input[type="file"]').should("be.visible");

      // And the "Submit for review" button should be visible
      cy.get('button[type="submit"]')
        .contains("Submit for review")
        .should("be.visible");
    });

    it("should display all category options in the dropdown", () => {
      // Given the user sees the Category dropdown
      cy.contains("span", "Category")
        .parent("label")
        .find("select")
        .within(() => {
          // Then all expected categories should be available as options
          cy.get("option").should("have.length", 5);
          cy.get('option[value="fitness"]').should("exist");
          cy.get('option[value="diet"]').should("exist");
          cy.get('option[value="sleep"]').should("exist");
          cy.get('option[value="mental health"]').should("exist");
          cy.get('option[value="other"]').should("exist");
        });
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Submit form without required fields", () => {
    it("should show an alert when title, description or image is missing", () => {
      // Given only a title is filled but no description or image
      cy.contains("span", "Title")
        .parent("label")
        .find("input")
        .type("Test Experiment");

      // And the alert is stubbed
      cy.on("window:alert", (msg) => {
        // Then an alert about required fields should fire
        expect(msg).to.contain("Title, description and image are required");
      });

      // When the user submits the form
      cy.get('button[type="submit"]').click();

      // Then the review modal should NOT appear
      cy.contains("Review Experiment").should("not.exist");
    });

    it("should show alert when image is missing but title and desc are filled", () => {
      // Given the user fills title and description
      cy.contains("span", "Title")
        .parent("label")
        .find("input")
        .type("My Fitness Experiment");
      cy.contains("span", "Description")
        .parent("label")
        .find("textarea")
        .type("This is a fitness experiment description.");

      // And the alert is captured
      cy.on("window:alert", (msg) => {
        expect(msg).to.contain("Title, description and image are required");
      });

      // When the user submits without an image
      cy.get('button[type="submit"]').click();

      // Then the modal should not open
      cy.contains("Review Experiment").should("not.exist");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Review modal appears with valid inputs", () => {
    it("should open the review modal when all required fields are filled", () => {
      // Given the user fills in the title
      cy.contains("span", "Title")
        .parent("label")
        .find("input")
        .type("Sleep Study 2026");

      // And fills in the description
      cy.contains("span", "Description")
        .parent("label")
        .find("textarea")
        .type("Tracking sleep patterns for 7 days.");

      // And selects a category
      cy.contains("span", "Category")
        .parent("label")
        .find("select")
        .select("sleep");

      // And sets a duration
      cy.contains("span", "Duration (days, optional)")
        .parent("label")
        .find('input[type="number"]')
        .type("7");

      // And uploads an image file
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from("fake-image-data"),
          fileName: "test-image.jpg",
          mimeType: "image/jpeg",
        },
        { force: true },
      );

      // When the user clicks "Submit for review"
      cy.get('button[type="submit"]').click();

      // Then the review modal should appear
      cy.contains("Review Experiment").should("be.visible");

      // And it should display the experiment title
      cy.contains("Sleep Study 2026").should("be.visible");

      // And it should display the description
      cy.contains("Tracking sleep patterns for 7 days.").should("be.visible");

      // And it should display the selected category
      cy.contains("sleep").should("be.visible");

      // And it should display the duration
      cy.contains("7 days").should("be.visible");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: User cancels from review modal", () => {
    it("should close the review modal when Back is clicked", () => {
      // Given the review modal is open
      cy.contains("span", "Title")
        .parent("label")
        .find("input")
        .type("Cancel Test");
      cy.contains("span", "Description")
        .parent("label")
        .find("textarea")
        .type("Testing the cancel flow.");
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from("fake-image-data"),
          fileName: "test.jpg",
          mimeType: "image/jpeg",
        },
        { force: true },
      );
      cy.get('button[type="submit"]').click();
      cy.contains("Review Experiment").should("be.visible");

      // When the user clicks "Back"
      cy.contains("button", "Back").click();

      // Then the review modal should disappear
      cy.contains("Review Experiment").should("not.exist");

      // And the form should still be visible with the user's data
      cy.contains("h1", "Create Experiment").should("be.visible");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Successful experiment submission", () => {
    it("should call the API and redirect home on Confirm & Submit", () => {
      // Given the API is intercepted and returns success
      cy.intercept("POST", "http://localhost:4000/api/experiments", {
        statusCode: 201,
        body: {
          _id: "exp-001",
          title: "Diet Tracking Experiment",
          status: "pending",
        },
      }).as("createExperiment");

      // And the alert is captured
      cy.on("window:alert", (msg) => {
        expect(msg).to.contain("Experiment submitted for approval");
      });

      // When the user fills in all required fields
      cy.contains("span", "Title")
        .parent("label")
        .find("input")
        .type("Diet Tracking Experiment");
      cy.contains("span", "Description")
        .parent("label")
        .find("textarea")
        .type("Tracking diet for 30 days.");
      cy.contains("span", "Category")
        .parent("label")
        .find("select")
        .select("diet");
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from("fake-image-data"),
          fileName: "diet.jpg",
          mimeType: "image/jpeg",
        },
        { force: true },
      );

      // And submits the form
      cy.get('button[type="submit"]').click();

      // Then the review modal should appear
      cy.contains("Review Experiment").should("be.visible");

      // When the user clicks "Confirm & Submit"
      cy.contains("button", "Confirm & Submit").click();

      // Then the API should be called
      cy.wait("@createExperiment");

      // And the user should be redirected to the home page
      cy.url().should("eq", "http://localhost:5173/");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Adding custom fields to the experiment", () => {
    it("should add a text custom field and show it in the preview", () => {
      // Given the user fills the custom field label
      cy.get('input[placeholder="Label"]').type("Daily Steps");

      // And the type is already "text" by default
      // When the user clicks "Add field"
      cy.contains("button", "Add field").click();

      // Then the field preview should appear
      cy.contains("Daily Steps").should("be.visible");

      // And it should display the field type
      cy.contains("(text)").should("be.visible");
    });

    it("should show the options input when field type is set to dropdown", () => {
      // Given the user selects "dropdown" as field type
      cy.get("select").last().select("dropdown");

      // Then the options input should appear
      cy.get('input[placeholder="Options (comma separated)"]').should(
        "be.visible",
      );
    });

    it("should add a dropdown field with options and show them in preview", () => {
      // Given the user fills the field label
      cy.get('input[placeholder="Label"]').type("Energy Level");

      // And selects dropdown type
      cy.get("select").last().select("dropdown");

      // And types options separated by commas
      cy.get('input[placeholder="Options (comma separated)"]').type(
        "Low, Medium, High",
      );

      // When the user clicks "Add field"
      cy.contains("button", "Add field").click();

      // Then the field should appear in the preview with options
      cy.contains("Energy Level").should("be.visible");
      cy.contains("Low, Medium, High").should("be.visible");
    });

    it("should remove a custom field when Remove is clicked", () => {
      // Given a custom field has been added
      cy.get('input[placeholder="Label"]').type("Weight (kg)");
      cy.contains("button", "Add field").click();
      cy.contains("Weight (kg)").should("be.visible");

      // When the user clicks "Remove" on that field
      cy.contains("button", "Remove").click();

      // Then the field should disappear from the preview
      cy.contains("Weight (kg)").should("not.exist");
    });

    it("should show alert when label is empty and Add field is clicked", () => {
      // Given the label field is left empty
      // And the alert is captured
      cy.on("window:alert", (msg) => {
        // Then an alert about the required label should appear
        expect(msg).to.contain("Label required");
      });

      // When the user clicks "Add field" without a label
      cy.contains("button", "Add field").click();
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Submission fails due to unauthorized access", () => {
    it("should show an error alert when token is missing and API returns 401", () => {
      // Given the user has no auth token
      cy.window().then((win) => {
        win.localStorage.removeItem("token");
      });

      // And the API returns 401 Unauthorized
      cy.intercept("POST", "http://localhost:4000/api/experiments", {
        statusCode: 401,
        body: { message: "Unauthorized" },
      }).as("unauthorizedCreate");

      // And the alert is captured
      cy.on("window:alert", (msg) => {
        expect(msg).to.contain("Unauthorized");
      });

      // When the user fills the form and submits
      cy.contains("span", "Title")
        .parent("label")
        .find("input")
        .type("Unauthorized Test");
      cy.contains("span", "Description")
        .parent("label")
        .find("textarea")
        .type("Testing unauthorized submission.");
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from("fake-image-data"),
          fileName: "unauth.jpg",
          mimeType: "image/jpeg",
        },
        { force: true },
      );
      cy.get('button[type="submit"]').click();

      // Then the review modal appears
      cy.contains("Review Experiment").should("be.visible");

      // When the user confirms
      cy.contains("button", "Confirm & Submit").click();

      // Then the API should be called
      cy.wait("@unauthorizedCreate");

      // And the user should remain on the create page (no redirect on failure)
      cy.url().should("include", "/experiments/new");
    });
  });

  // ──────────────────────────────────────────────────────────
  // NEGATIVE TEST 1:
  // Scenario: Exceeding the maximum number of custom fields (10)
  // ──────────────────────────────────────────────────────────
  context("Scenario: Exceeding maximum custom fields limit", () => {
    it("should show an alert when user tries to add more than 10 custom fields", () => {
      // Given the alert is captured
      cy.on("window:alert", (msg) => {
        // Then the alert should warn about the max field limit
        expect(msg).to.contain("Max 10 fields");
      });

      // When the user adds 10 custom fields one by one
      for (let i = 1; i <= 10; i++) {
        cy.get('input[placeholder="Label"]').clear().type(`Field ${i}`);
        cy.contains("button", "Add field").click();
      }

      // Then 10 fields should be visible in the preview
      cy.get('input[placeholder="Label"]').should("exist");

      // When the user tries to add an 11th field
      cy.get('input[placeholder="Label"]').clear().type("Field 11");
      cy.contains("button", "Add field").click();

      // Then only 10 fields should exist (11th was blocked)
      cy.get(".space-y-3 > div").should("have.length", 10);
    });
  });

  // ──────────────────────────────────────────────────────────
  // NEGATIVE TEST 2:
  // Scenario: API returns 500 server error on experiment submission
  // ──────────────────────────────────────────────────────────
  context("Scenario: Server error during experiment submission", () => {
    it("should show an error alert and stay on page when API returns 500", () => {
      // Given the API returns a 500 Internal Server Error
      cy.intercept("POST", "http://localhost:4000/api/experiments", {
        statusCode: 500,
        body: { message: "Failed to create experiment" },
      }).as("serverError");

      // And the alert is captured
      cy.on("window:alert", (msg) => {
        // Then the alert should contain the server error message
        expect(msg).to.contain("Failed to create experiment");
      });

      // When the user fills in all required fields
      cy.contains("span", "Title")
        .parent("label")
        .find("input")
        .type("Server Error Test");
      cy.contains("span", "Description")
        .parent("label")
        .find("textarea")
        .type("Testing server failure response.");
      cy.contains("span", "Category")
        .parent("label")
        .find("select")
        .select("other");
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from("fake-image-data"),
          fileName: "error-test.jpg",
          mimeType: "image/jpeg",
        },
        { force: true },
      );

      // And submits the form
      cy.get('button[type="submit"]').click();

      // Then the review modal should appear
      cy.contains("Review Experiment").should("be.visible");

      // When the user confirms submission
      cy.contains("button", "Confirm & Submit").click();

      // Then the API should be called
      cy.wait("@serverError");

      // And the user should NOT be redirected (stays on create page)
      cy.url().should("include", "/experiments/new");
    });
  });
});
