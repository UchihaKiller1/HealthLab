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

describe("UI - Navbar, Footer, buttons", () => {
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

  it("shows navbar and footer on main pages", () => {
    cy.get("nav").should("be.visible");

    cy.contains("a", "About us").click();
    cy.url().should("include", "/about");

    cy.visit(`${FRONTEND_BASE}/profile`);
    cy.get("footer").should("be.visible");
    cy.contains("footer", "Privacy Policy").should("be.visible");
  });

  it("shows Join Now when not logged in and Profile when logged in", () => {
    cy.contains("a", "Join Now").should("be.visible");

    loginWithFixture("validUser");

    cy.url().should("eq", `${FRONTEND_BASE}/`);
    cy.get('a[aria-label="Profile"]').should("be.visible");
  });
});
