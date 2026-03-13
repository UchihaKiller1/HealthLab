/// <reference types="cypress" />

const FRONTEND_BASE = "http://localhost:5173";
const API_BASE = "http://localhost:4000";

function loginWithFixture(roleKey = "validUser") {
  return cy.fixture("users").then((users) => {
    const user = users[roleKey];

    cy.intercept("POST", `${API_BASE}/users/login`, {
      statusCode: 200,
      body: {
        token: "fake-jwt-token",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      },
    }).as("loginRequest");

    cy.fixture("profile").then((profiles) => {
      const profile =
        user.role === "admin" ? profiles.adminProfile : profiles.userProfile;

      cy.intercept("GET", `${API_BASE}/users/me`, {
        statusCode: 200,
        body: profile,
      }).as("getMeAfterLogin");
    });

    cy.visit(`${FRONTEND_BASE}/login`);
    cy.get('input[name="usernameOrEmail"]').type(
      user.usernameOrEmail || user.email || user.username
    );
    cy.get('input[name="password"]').type(user.password);
    cy.pause();
    cy.get("form").submit();

    cy.wait("@loginRequest");
    cy.wait(1000);
  });
}

describe("Experiments - CRUD workflow", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.fixture("experiments").then((data) => {
      cy.intercept("GET", `${API_BASE}/api/experiments`, {
        statusCode: 200,
        body: data.approved,
      }).as("getApprovedExperiments");
    });

    cy.intercept("GET", `${API_BASE}/api/experiments/joined`, {
      statusCode: 200,
      body: [],
    }).as("getJoinedExperiments");

    cy.intercept("GET", `${API_BASE}/api/experiments/mine`, {
      statusCode: 200,
      body: [],
    }).as("getMyExperiments");

    cy.intercept("GET", `${API_BASE}/users/me`, {
      statusCode: 401,
      body: { message: "Unauthorized" },
    }).as("getMeUnauth");

    cy.visit(`${FRONTEND_BASE}/`);
  });

  afterEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("creates a new experiment with image upload (positive)", () => {
    loginWithFixture("validUser");

    cy.intercept("POST", `${API_BASE}/api/experiments`, (req) => {
      expect(req.headers["authorization"]).to.match(/^Bearer /);
      req.reply({
        statusCode: 201,
        body: { message: "Experiment submitted for approval" },
      });
    }).as("createExperiment");

    cy.visit(`${FRONTEND_BASE}/experiments/new`);

    cy.fixture("experiments").then((expData) => {
      const exp = expData.approved[0];

      cy.get('input[placeholder="Label"]').should("exist");

      // Scope to the first matching Title input to avoid multiple elements
      cy.contains("Title").parent().find("input").first().type(exp.title);
      cy.contains("Description").parent().find("textarea").type(
        exp.description
      );
      cy.contains("Category").parent().find("select").select(exp.category);
      cy.contains("Duration (days, optional)")
        .parent()
        .find("input")
        .first()
        .type(String(exp.durationDays));

      cy.get('input[type="file"]').selectFile(
        "cypress/fixtures/example.json",
        { force: true }
      );

      cy.pause();
      cy.contains("button", "Submit for review").click();
      cy.contains("Review Experiment").should("be.visible");

      cy.contains("button", "Confirm & Submit").click();
      cy.wait("@createExperiment");
      cy.wait(1000);
    });
  });

  it("shows validation alert when required fields are missing (negative)", () => {
    loginWithFixture("validUser");
    cy.visit(`${FRONTEND_BASE}/experiments/new`);

cy.fixture("experiments").then((expData) => {
  const exp = expData.approved[0];

    // Fill fields
    cy.get('input[name="title"]').should('be.visible').type(exp.title);
    cy.get('textarea[name="description"]').should('be.visible').type(exp.description);
    cy.get('select[name="category"]').select(exp.category);
    cy.get('input[name="durationDays"]').type(String(exp.durationDays));

    // Upload image
    cy.get('input[type="file"]').selectFile('cypress/fixtures/steps.png', { force: true });

    // Submit
    cy.contains("button", "Submit for review").click();
    cy.contains("Review Experiment").should("be.visible");

    cy.contains("button", "Confirm & Submit").click();
    cy.wait("@createExperiment");
  });
  });

  it("allows owner to delete one of their experiments", () => {
    loginWithFixture("validUser");

    cy.fixture("experiments").then((expData) => {
      cy.intercept("GET", `${API_BASE}/api/experiments/mine`, {
        statusCode: 200,
        body: expData.mine,
      }).as("getMyExperimentsOwner");

      cy.intercept(
        "DELETE",
        `${API_BASE}/api/experiments/${expData.mine[0]._id}`,
        {
          statusCode: 200,
          body: { message: "Deleted" },
        }
      ).as("deleteExperiment");

      cy.visit(`${FRONTEND_BASE}/profile`);
      cy.wait("@getMyExperimentsOwner");

      cy.contains("Your Experiments").should("be.visible");
      cy.contains("Home Created Experiment").should("be.visible");

      cy.on("window:confirm", () => true);
      cy.pause();
      cy.contains("button", "Delete").click();

      cy.wait("@deleteExperiment");
      cy.contains("Home Created Experiment").should("not.exist");
    });
  });
});
