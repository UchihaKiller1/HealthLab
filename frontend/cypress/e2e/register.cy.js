// ============================================================
// Feature: User Registration
// BDD Syntax - Behaviour-Driven Development
// Covers: form rendering, field validation, password strength,
//         successful registration, and duplicate email failure
// ============================================================

describe("Feature: User Registration", () => {
  // ─── Background: visit register page before each test ─────
  beforeEach(() => {
    // Given the user is on the Register page
    cy.visit("http://localhost:5173/register");
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Page loads correctly", () => {
    it("should display all registration form fields", () => {
      // Given the user visits /register
      // Then the heading should say "Create your account"
      cy.contains("h1", "Create your account").should("be.visible");

      // And all required input fields should be visible
      cy.get('input[name="firstName"]').should("be.visible");
      cy.get('input[name="lastName"]').should("be.visible");
      cy.get('input[name="username"]').should("be.visible");
      cy.get('input[name="email"]').should("be.visible");
      cy.get('input[name="phone"]').should("be.visible");
      cy.get('input[name="password"]').should("be.visible");
      cy.get('input[name="confirmPassword"]').should("be.visible");

      // And the Register button should be present
      cy.get('button[type="submit"]').contains("Register").should("be.visible");

      // And the "Sign in" link should be present
      cy.contains("a", "Sign in").should("have.attr", "href", "/login");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Submit empty form", () => {
    it("should show required validation errors when form is blank", () => {
      // Given the user does not fill in any fields
      // When the user clicks the Register button
      cy.get('button[type="submit"]').click();

      // Then "First name is required" error should appear
      cy.contains("First name is required").should("be.visible");

      // And "Last name is required" error should appear
      cy.contains("Last name is required").should("be.visible");

      // And "Username is required" error should appear
      cy.contains("Username is required").should("be.visible");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Individual field validation on blur", () => {
    it("should show error when username is too short on blur", () => {
      // Given the user types a username shorter than 3 characters
      cy.get('input[name="username"]').type("ab");

      // When focus leaves the field
      cy.get('input[name="username"]').blur();

      // Then a username error should appear
      cy.contains("3+ chars: letters, numbers, . _ -").should("be.visible");
    });

    it("should show error for invalid email format on blur", () => {
      // Given the user types an invalid email
      cy.get('input[name="email"]').type("bademail");

      // When the user blurs the email field
      cy.get('input[name="email"]').blur();

      // Then an email validation error should appear
      cy.contains("Enter a valid email").should("be.visible");
    });

    it("should show error for short password on blur", () => {
      // Given the user types a password with less than 8 characters
      cy.get('input[name="password"]').type("1234");

      // When the user blurs the password field
      cy.get('input[name="password"]').blur();

      // Then a password length error should appear
      cy.contains("Password must be at least 8 characters").should(
        "be.visible",
      );
    });

    it("should show error when confirm password does not match on blur", () => {
      // Given the user types a password
      cy.get('input[name="password"]').type("securePass1!");

      // And types a different confirm password
      cy.get('input[name="confirmPassword"]').type("differentPass");

      // When the user blurs the confirm password field
      cy.get('input[name="confirmPassword"]').blur();

      // Then a mismatch error should appear
      cy.contains("Passwords do not match").should("be.visible");
    });

    it("should show error for invalid phone number on blur", () => {
      // Given the user types a phone number that is too short
      cy.get('input[name="phone"]').type("123");

      // When the user blurs the field
      cy.get('input[name="phone"]').blur();

      // Then a phone validation error should appear
      cy.contains("Enter a valid phone").should("be.visible");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Password strength indicator", () => {
    it('should show "Weak" indicator for a short password', () => {
      // Given the user types a short, weak password
      cy.get('input[name="password"]').type("abc");

      // Then the strength label should show "Weak"
      cy.contains("Weak").should("be.visible");
    });

    it('should show "Fair" indicator for a medium-strength password', () => {
      // Given the user types a password with 8+ characters and a digit (score = 2 → Fair)
      cy.get('input[name="password"]').type("abcdefg1");

      // Then the strength label should show "Fair"
      cy.contains("Fair").should("be.visible");
    });

    it('should show "Strong" indicator for a complex password', () => {
      // Given the user types a password with uppercase, number and symbol
      cy.get('input[name="password"]').type("SecurePass1!");

      // Then the strength label should show "Strong"
      cy.contains("Strong").should("be.visible");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Toggle password visibility", () => {
    it("should show password text when Show is clicked", () => {
      // Given the user types a password
      cy.get('input[name="password"]').type("mypassword1");

      // Then password should be hidden by default
      cy.get('input[name="password"]').should("have.attr", "type", "password");

      // When the user clicks "Show"
      cy.get('button[aria-label="Show password"]').click();

      // Then the password field should reveal the text
      cy.get('input[name="password"]').should("have.attr", "type", "text");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Successful registration", () => {
    it("should redirect to /login after successful registration", () => {
      // Given the API returns a 201 Created response
      cy.intercept("POST", "http://localhost:4000/users/register", {
        statusCode: 201,
        body: { message: "User added successfully!" },
      }).as("registerRequest");

      // And the alert is stubbed
      cy.on("window:alert", (msg) => {
        expect(msg).to.contain("Registered successfully");
      });

      // When the user fills in all valid registration fields
      cy.get('input[name="firstName"]').type("John");
      cy.get('input[name="lastName"]').type("Doe");
      cy.get('input[name="username"]').type("johndoe");
      cy.get('input[name="email"]').type("john@example.com");
      cy.get('input[name="phone"]').type("+94771234567");
      cy.get('input[name="password"]').type("SecurePass1!");
      cy.get('input[name="confirmPassword"]').type("SecurePass1!");

      // And submits the form
      cy.get('button[type="submit"]').click();

      // Then the register API should be called
      cy.wait("@registerRequest");

      // And the correct payload should be sent
      cy.get("@registerRequest").its("request.body").should("deep.equal", {
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        email: "john@example.com",
        phone: "+94771234567",
        password: "SecurePass1!",
      });

      // And the user should be redirected to /login
      cy.url().should("include", "/login");
    });
  });

  // ──────────────────────────────────────────────────────────
  context("Scenario: Registration fails due to duplicate email", () => {
    it("should show an alert when email is already registered", () => {
      // Given the API returns a 400 error for duplicate email
      cy.intercept("POST", "http://localhost:4000/users/register", {
        statusCode: 400,
        body: { message: "A user already exists with this email" },
      }).as("duplicateEmail");

      // And the alert is stubbed to validate the message
      cy.on("window:alert", (msg) => {
        // Then the alert should mention the duplicate error
        expect(msg).to.contain("A user already exists with this email");
      });

      // When the user fills in a form with an already-registered email
      cy.get('input[name="firstName"]').type("Jane");
      cy.get('input[name="lastName"]').type("Smith");
      cy.get('input[name="username"]').type("janesmith");
      cy.get('input[name="email"]').type("existing@example.com");
      cy.get('input[name="phone"]').type("+94779999999");
      cy.get('input[name="password"]').type("SecurePass1!");
      cy.get('input[name="confirmPassword"]').type("SecurePass1!");

      // And submits
      cy.get('button[type="submit"]').click();

      // Then the request should complete
      cy.wait("@duplicateEmail");

      // And the user should remain on the register page
      cy.url().should("include", "/register");
    });
  });
});
