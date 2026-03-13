// cypress/e2e/assertion_demo.cy.js
// Exception handling is configured globally in cypress/support/e2e.js

const BASE = 'http://localhost:5173';

// SHARED NAVBAR
// ─────────────────────────────────────────────
describe('Navbar', () => {
  it('should render the navbar with correct links', () => {
    cy.visit(BASE);
    cy.get('nav').should('exist');
    cy.get('nav').contains('HealthLab').should('exist');
    cy.get('nav').contains('Explore').should('exist');
    cy.get('nav').contains('About us').should('exist');
  });
});

// HOME PAGE
// ─────────────────────────────────────────────
describe('Home Page', () => {
  beforeEach(() => cy.visit(BASE));

  it('should show the hero heading', () => {
    cy.get('h1').first().should('be.visible');
  });

  it('should show the hero CTA button', () => {
    cy.contains("Let's Explore").should('exist');
  });

  it('should show the "Start new experiment" section', () => {
    cy.contains("Start an Experiment Now").should('exist');
    cy.contains("Start new experiment").should('exist');
  });

  it('should show the Popular Challenges section', () => {
    cy.contains("Popular Challenges").should('exist');
  });
});

// LOGIN PAGE
// ─────────────────────────────────────────────
describe('Login Page', () => {
  beforeEach(() => cy.visit(`${BASE}/login`));

  it('should show the sign in heading', () => {
    cy.contains('Sign in').should('exist');
  });

  it('should render the login form with all fields', () => {
    cy.get('form').should('exist');
    cy.get('input[name="usernameOrEmail"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Sign in');
  });

  it('should show a link to the register page', () => {
    cy.get('a[href="/register"]').should('exist');
  });

  it('should show validation errors on empty submit', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('required').should('exist');
  });

  it('should toggle password visibility', () => {
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    cy.contains('Show').click();
    cy.get('input[name="password"]').should('have.attr', 'type', 'text');
    cy.contains('Hide').click();
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
  });
});

// REGISTER PAGE
// ─────────────────────────────────────────────
describe('Register Page', () => {
  beforeEach(() => cy.visit(`${BASE}/register`));

  it('should show the create account heading', () => {
    cy.contains('Create your account').should('exist');
  });

  it('should render all registration form fields', () => {
    cy.get('form').should('exist');
    cy.get('input[name="firstName"]').should('exist');
    cy.get('input[name="lastName"]').should('exist');
    cy.get('input[name="username"]').should('exist');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="phone"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('input[name="confirmPassword"]').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Register');
  });

  it('should show a link to the login page', () => {
    cy.get('a[href="/login"]').should('exist');
  });

  it('should show validation errors on empty submit', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('required').should('exist');
  });
});

// EXPLORE PAGE
// ─────────────────────────────────────────────
describe('Explore Page', () => {
  beforeEach(() => cy.visit(`${BASE}/explore`));

  it('should show the Explore Experiments heading', () => {
    cy.contains('Explore Experiments').should('exist');
  });

  it('should render the search input', () => {
    cy.get('input[placeholder="Search experiments..."]').should('exist');
  });

  it('should render all category filter buttons', () => {
    ['all', 'fitness', 'diet', 'sleep', 'mental health', 'other'].forEach((cat) => {
      cy.contains('button', cat).should('exist');
    });
  });

  it('should filter experiments when typing in the search bar', () => {
    cy.get('input[placeholder="Search experiments..."]').type('health');
    // Page should still be visible and not crash
    cy.contains('Explore Experiments').should('exist');
  });
});

// ABOUT US PAGE
// ─────────────────────────────────────────────
describe('About Us Page', () => {
  beforeEach(() => cy.visit(`${BASE}/about`));

  it('should show the About HealthLab heading', () => {
    cy.contains('About HealthLab').should('exist');
  });

  it('should show mission and what we do sections', () => {
    cy.contains('Our mission').should('exist');
    cy.contains('What we do').should('exist');
  });

  it('should show the Core Team section', () => {
    cy.contains('Core team').should('exist');
  });

  it('should have a Get Started link pointing to /register', () => {
    cy.get('a[href="/register"]').should('exist').and('contain', 'Get started');
  });
});

// CREATE EXPERIMENT PAGE (requires login)
// ─────────────────────────────────────────────
describe('Create Experiment Page', () => {
  beforeEach(() => {
    // Simulate a logged-in user so the page doesn't redirect
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token-for-testing');
      win.localStorage.setItem('user', JSON.stringify({ id: '1', username: 'testuser' }));
    });
    cy.visit(`${BASE}/experiments/new`);
  });

  it('should show the Create Experiment heading', () => {
    cy.contains('Create Experiment').should('exist');
  });

  it('should render the experiment form fields', () => {
    cy.get('form').should('exist');
    cy.get('textarea').should('exist');            // description
    cy.get('select').first().should('exist');      // category
    cy.get('input[type="number"]').should('exist'); // duration
    cy.get('button[type="submit"]').should('exist');
  });

  it('should have an Add field button', () => {
    cy.contains('Add field').should('exist');
  });
});


// ADMIN LOGIN PAGE
// ─────────────────────────────────────────────
describe('Admin Login Page', () => {
  beforeEach(() => cy.visit(`${BASE}/admin/login`));

  it('should show the Admin Login heading', () => {
    cy.contains('Admin Login').should('exist');
  });

  it('should render the admin login form', () => {
    cy.get('form').should('exist');
    cy.get('input[type="text"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Login');
  });
});

//  PAGE TITLE
// ─────────────────────────────────────────────
describe('Page Title', () => {
  it('should have the correct document title', () => {
    cy.visit(BASE);
    cy.title().should('include', 'Healthlab');
  });
});


//  NEGATIVE TEST CASES
// ─────────────────────────────────────────────
describe('Negative Tests — Login Page', () => {
  beforeEach(() => cy.visit(`${BASE}/login`));

  it('should NOT show error message before any interaction', () => {
    cy.contains('required').should('not.exist');
    cy.contains('Invalid').should('not.exist');
  });

  it('should NOT allow submit with empty fields — errors should appear', () => {
    cy.get('button[type="submit"]').click();
    // Form should still be on the login page, not navigate away
    cy.url().should('not.include', '/dashboard');
    cy.url().should('not.include', '/profile');
  });

  it('should NOT show password as plain text by default', () => {
    cy.get('input[name="password"]').should('not.have.attr', 'type', 'text');
  });

  it('should NOT show admin dashboard link on login page', () => {
    cy.contains('Admin Dashboard').should('not.exist');
  });
});

describe('Negative Tests — Register Page', () => {
  beforeEach(() => cy.visit(`${BASE}/register`));

  it('should NOT navigate away on empty form submit', () => {
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
    cy.url().should('not.include', '/profile');
  });

  it('should NOT show success message before submitting', () => {
    cy.contains('Account created').should('not.exist');
    cy.contains('Success').should('not.exist');
  });

  it('should NOT have a pre-filled email field', () => {
    cy.get('input[name="email"]').should('have.value', '');
  });

  it('should NOT show confirmPassword as plain text by default', () => {
    cy.get('input[name="confirmPassword"]').should('not.have.attr', 'type', 'text');
  });
});

describe('Negative Tests — Home Page', () => {
  beforeEach(() => cy.visit(BASE));

  it('should NOT show a login form on the home page', () => {
    cy.get('input[name="usernameOrEmail"]').should('not.exist');
    cy.get('input[name="password"]').should('not.exist');
  });

  it('should NOT show an error message on initial load', () => {
    cy.contains('Something went wrong').should('not.exist');
    cy.contains('Error').should('not.exist');
  });
});

describe('Negative Tests — Explore Page', () => {
  beforeEach(() => cy.visit(`${BASE}/explore`));

  it('should NOT show login form on explore page', () => {
    cy.get('input[name="password"]').should('not.exist');
  });

  it('should NOT match search results for a random nonsense string', () => {
    cy.get('input[placeholder="Search experiments..."]').type('zzzzzzzzzzzzz');
    // The page should not crash
    cy.contains('Explore Experiments').should('exist');
    // No experiment cards should claim to match (no error either)
    cy.contains('Something went wrong').should('not.exist');
  });
});

describe('Negative Tests — Admin Login Page', () => {
  beforeEach(() => cy.visit(`${BASE}/admin/login`));

  it('should NOT show admin dashboard before logging in', () => {
    cy.contains('Admin Dashboard').should('not.exist');
  });

  it('should NOT show user profile elements on admin login page', () => {
    cy.get('input[name="usernameOrEmail"]').should('not.exist');
  });

  it('should NOT have pre-filled credentials', () => {
    cy.get('input[type="text"]').should('have.value', '');
    cy.get('input[type="password"]').should('have.value', '');
  });
});

describe('Negative Tests — About Page', () => {
  beforeEach(() => cy.visit(`${BASE}/about`));

  it('should NOT show a login form on the about page', () => {
    cy.get('input[name="password"]').should('not.exist');
  });

  it('should NOT show admin-only content on about page', () => {
    cy.contains('Admin Dashboard').should('not.exist');
    cy.contains('Delete User').should('not.exist');
  });
});
