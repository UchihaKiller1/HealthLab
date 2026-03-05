// ============================================================
// Feature: User Login
// BDD Syntax - Behaviour-Driven Development
// Covers: form rendering, validation, success, and failure flows
// ============================================================

describe("Feature: User Login", () => {
  // ─── Background: visit login page before each test ────────
  beforeEach(() => {
    // Given the user is on the Login page
    cy.visit("http://localhost:5173/login");
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Page loads correctly", () => {
    it("should display all form elements on the login page", () => {
      // Given the user visits /login
      // Then the sign-in heading should be visible
      cy.contains("h1", "Sign in").should("be.visible");

      // And the username/email input should be visible
      cy.get('input[name="usernameOrEmail"]').should("be.visible");

      // And the password input should be visible
      cy.get('input[name="password"]').should("be.visible");

      // And the Sign in button should be visible
      cy.get('button[type="submit"]').contains("Sign in").should("be.visible");

      // And the "Create account" link should be present
      cy.contains("a", "Create account").should(
        "have.attr",
        "href",
        "/register",
      );
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Submit form with empty fields", () => {
    it("should show validation errors when form is submitted empty", () => {
      // Given the user is on the login page
      // When the user clicks Sign in without filling any fields
      cy.get('button[type="submit"]').click();

      // Then a "Username or email is required" error should appear
      cy.contains("Username or email is required").should("be.visible");

      // And a "Password is required" error should appear
      cy.contains("Password is required").should("be.visible");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Inline validation on blur", () => {
    it("should show error when invalid email format is typed and focus is lost", () => {
      // Given the user types an invalid email format
      cy.get('input[name="usernameOrEmail"]').type("not-an-email@");

      // When the user leaves (blurs) the field
      cy.get('input[name="usernameOrEmail"]').blur();

      // Then an email validation error should appear
      cy.contains("Enter a valid email").should("be.visible");
    });

    it("should show error when password is less than 8 characters on blur", () => {
      // Given the user types a short password
      cy.get('input[name="password"]').type("abc");

      // When the user leaves the field
      cy.get('input[name="password"]').blur();

      // Then a minimum length error should appear
      cy.contains("Minimum 8 characters").should("be.visible");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Toggle password visibility", () => {
    it("should toggle password field between hidden and visible text", () => {
      // Given the user types a password
      cy.get('input[name="password"]').type("mypassword");

      // Then the password field should be of type "password" by default
      cy.get('input[name="password"]').should("have.attr", "type", "password");

      // When the user clicks the "Show" button
      cy.get('button[aria-label="Show password"]').click();

      // Then the password field should become type "text"
      cy.get('input[name="password"]').should("have.attr", "type", "text");

      // When the user clicks "Hide"
      cy.get('button[aria-label="Hide password"]').click();

      // Then it should revert to type "password"
      cy.get('input[name="password"]').should("have.attr", "type", "password");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Successful login", () => {
    it("should store token and redirect to home on valid credentials", () => {
      // Given the API returns a successful login response
      cy.intercept("POST", "http://localhost:4000/users/login", {
        statusCode: 200,
        body: {
          token: "fake-jwt-token-12345",
          user: {
            id: "user-001",
            email: "john@example.com",
            username: "johndoe",
            role: "user",
          },
        },
      }).as("loginRequest");

      // When the user fills in valid credentials
      cy.get('input[name="usernameOrEmail"]').type("johndoe");
      cy.get('input[name="password"]').type("password123");

      // And submits the form
      cy.get('button[type="submit"]').click();

      // Then the API should be called once
      cy.wait("@loginRequest");

      // And the token should be stored in localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem("token")).to.equal(
          "fake-jwt-token-12345",
        );
      });

      // And the user should be redirected to the home page
      cy.url().should("eq", "http://localhost:5173/");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Failed login with wrong credentials", () => {
    it("should show an alert when credentials are invalid", () => {
      // Given the API returns a 400 with invalid credentials error
      cy.intercept("POST", "http://localhost:4000/users/login", {
        statusCode: 400,
        body: { message: "Invalid credentials" },
      }).as("failedLogin");

      // And the user stubs the alert to capture it
      cy.on("window:alert", (msg) => {
        // Then the alert should contain "Invalid credentials"
        expect(msg).to.contain("Invalid credentials");
      });

      // When the user fills in wrong credentials and submits
      cy.get('input[name="usernameOrEmail"]').type("wronguser");
      cy.get('input[name="password"]').type("wrongpassword");
      cy.get('button[type="submit"]').click();

      // Then the request should complete
      cy.wait("@failedLogin");

      // And the user should stay on the login page
      cy.url().should("include", "/login");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Login with email instead of username", () => {
    it("should accept email format in the usernameOrEmail field", () => {
      // Given the API returns a successful login response
      cy.intercept("POST", "http://localhost:4000/users/login", {
        statusCode: 200,
        body: {
          token: "email-login-token",
          user: {
            id: "user-002",
            email: "jane@example.com",
            username: "jane",
            role: "user",
          },
        },
      }).as("emailLogin");

      // When the user types a valid email address
      cy.get('input[name="usernameOrEmail"]').type("jane@example.com");
      cy.get('input[name="password"]').type("securepass123");

      // And submits
      cy.get('button[type="submit"]').click();

      // Then the request should be made with the email
      cy.wait("@emailLogin").its("request.body").should("deep.include", {
        usernameOrEmail: "jane@example.com",
      });
    });
  });
});
