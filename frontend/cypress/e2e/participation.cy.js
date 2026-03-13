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

describe("Participation - Join, Leave, Daily Entry", () => {
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

  it("joins an experiment from Home (positive)", () => {
    loginWithFixture("validUser");

    cy.fixture("experiments").then((expData) => {
      const exp = expData.approved[0];

      cy.intercept("GET", `${API_BASE}/api/experiments/joined`, {
        statusCode: 200,
        body: [],
      }).as("getJoinedBefore");

      cy.intercept("POST", `${API_BASE}/api/experiments/${exp._id}/join`, {
        statusCode: 200,
        body: { message: "Joined" },
      }).as("joinExperiment");

      cy.visit(`${FRONTEND_BASE}/`);
      cy.wait("@getApprovedExperiments");

      cy.contains("Popular Challenges").should("be.visible");

      cy.pause();
      cy.contains("button", exp.title).click();
      cy.contains("Daily Entry").should("not.exist");

      cy.contains("button", "Join Experiment").click();
      cy.wait("@joinExperiment");
      cy.wait(1000);
    });
  });

  it("loads joined experiments and allows leaving (positive)", () => {
    loginWithFixture("validUser");

    cy.fixture("experiments").then((expData) => {
      const joined = expData.joined;

      cy.intercept("GET", `${API_BASE}/api/experiments/joined`, {
        statusCode: 200,
        body: joined,
      }).as("getJoinedAfterLogin");

      cy.intercept(
        "POST",
        `${API_BASE}/api/experiments/${joined[0]._id}/leave`,
        {
          statusCode: 200,
          body: { message: "Left" },
        }
      ).as("leaveExperiment");

      cy.visit(`${FRONTEND_BASE}/profile`);
      cy.wait("@getJoinedAfterLogin");

      cy.contains("Joined Experiments").should("be.visible");
      cy.contains(joined[0].title).should("be.visible");

      cy.pause();
      cy.contains("button", "Leave").click();
      cy.wait("@leaveExperiment");

      cy.contains(joined[0].title).should("not.exist");
    });
  });

  it("submits a daily entry for a joined experiment", () => {
    loginWithFixture("validUser");

    cy.fixture("experiments").then((expData) => {
      const joined = expData.joined[0];

      cy.intercept("GET", `${API_BASE}/api/experiments/joined`, {
        statusCode: 200,
        body: [joined],
      }).as("getJoinedForEntry");

      cy.intercept(
        "GET",
        `${API_BASE}/api/experiments/${joined._id}/submission-status`,
        {
          statusCode: 200,
          body: { submittedToday: false },
        }
      ).as("getSubmissionStatus");

      cy.intercept("POST", `${API_BASE}/api/experiments/${joined._id}/submit`, {
        statusCode: 201,
        body: { message: "Submitted" },
      }).as("submitDailyEntry");

      cy.visit(`${FRONTEND_BASE}/profile`);
      cy.wait("@getJoinedForEntry");

      cy.contains(joined.title)
        .parent()
        .contains("button", "Daily Entry")
        .click();
      cy.wait("@getSubmissionStatus");

      cy.contains("label", "Mood").parent().find("select").select("Happy");

      cy.pause();
      cy.contains("button", "Submit").click();
      cy.wait("@submitDailyEntry");
      cy.wait(1000);
    });
  });
});
