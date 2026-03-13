/// <reference types="cypress" />

const FRONTEND_BASE = "http://localhost:5173";
const API_BASE = "http://localhost:4000";

function loginWithFixture(roleKey = "adminUser") {
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

describe("Admin - approve/reject experiments", () => {
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

  it("loads pending experiments and approves one", () => {
    loginWithFixture("adminUser");

    cy.fixture("experiments").then((expData) => {
      const pendingMock = [
        {
          ...expData.approved[1],
          _id: "pending-1",
          status: "pending",
        },
      ];

      cy.intercept("GET", `${API_BASE}/api/experiments/pending`, {
        statusCode: 200,
        body: pendingMock,
      }).as("getPending");

      cy.intercept("PATCH", `${API_BASE}/api/experiments/pending-1/approve`, {
        statusCode: 200,
        body: { message: "Approved" },
      }).as("approveExp");

      cy.visit(`${FRONTEND_BASE}/admin`);
      cy.wait("@getPending");

      cy.contains("Pending Experiments").should("be.visible");
      cy.contains(pendingMock[0].title).should("be.visible");

      cy.pause();
      cy.contains("button", "Approve").click();
      cy.wait("@approveExp");
      cy.wait(500);

      cy.contains(pendingMock[0].title).should("not.exist");
    });
  });
});
