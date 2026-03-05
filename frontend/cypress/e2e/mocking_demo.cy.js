describe('Quality Engineering: Mocking/Stubbing Demo - Explore Page', () => {
  it('should intercept the GET request and show mocked experiments', () => {
    
    // 1. STUBBING: This is the "fake" data that replaces your database
    // Categories must match exactly: ["all","fitness","diet","sleep","mental health","other"]
    const mockExperiments = [
      {
        _id: "mock-exp-001",
        title: "Cypress QE Experiment",
        description: "This is stubbed data used to test UI reliability for SE3010.",
        category: "fitness",
        imageUrl: "/uploads/demo.png"
      },
      {
        _id: "mock-exp-002",
        title: "Testing Fitness Methods",
        description: "A comprehensive study on fitness and productivity.",
        category: "fitness",
        imageUrl: "/uploads/fitness-study.png"
      },
      {
        _id: "mock-exp-003",
        title: "Advanced Fitness Check",
        description: "Monitoring fitness levels and physical wellbeing.",
        category: "fitness",
        imageUrl: "/uploads/fitness.png"
      }
    ];

    // 2. MOCKING: Catch the call to your backend (Port 4000)
    // We use cy.intercept to act as a "Quality Gate"
    cy.intercept('GET', 'http://localhost:4000/api/experiments', {
      statusCode: 200,
      body: mockExperiments,
    }).as('fetchExperiments');

    // 3. EXECUTION: Visit the frontend (Port 5173 - Vite default)
    cy.visit('http://localhost:5173/explore');

    // 4. VERIFICATION: Wait for the intercept and check the UI
    cy.wait('@fetchExperiments');
    
    // Check if the experiments are rendered on screen
    cy.get('h3').should('have.length', 3);
    cy.get('h3').first().should('contain', 'Cypress QE Experiment');
    cy.get('h3').eq(1).should('contain', 'Testing Fitness Methods');
    cy.get('h3').eq(2).should('contain', 'Advanced Fitness Check');
  });

  it('should filter experiments by category using mocked data', () => {
    
    const mockExperiments = [
      {
        _id: "mock-exp-001",
        title: "Cypress QE Experiment",
        description: "This is stubbed data.",
        category: "fitness",
        imageUrl: "/uploads/demo.png"
      },
      {
        _id: "mock-exp-002",
        title: "Healthy Diet Plan",
        description: "Learn about nutrition.",
        category: "diet",
        imageUrl: "/uploads/diet.png"
      },
      {
        _id: "mock-exp-003",
        title: "Morning Jog",
        description: "Fitness and endurance.",
        category: "fitness",
        imageUrl: "/uploads/jog.png"
      }
    ];

    cy.intercept('GET', 'http://localhost:4000/api/experiments', {
      statusCode: 200,
      body: mockExperiments,
    }).as('fetchExperiments');

    cy.visit('http://localhost:5173/explore');
    cy.wait('@fetchExperiments');

    // All experiments should be visible
    cy.get('h3').should('have.length', 3);

    // Click on 'fitness' category filter
    cy.contains('button', 'fitness').click();

    // Only fitness experiments should be visible
    cy.get('h3').should('have.length', 2);
    cy.get('h3').should('contain', 'Cypress QE Experiment');
    cy.get('h3').should('contain', 'Morning Jog');
  });

  it('should search experiments using mocked data', () => {
    
    const mockExperiments = [
      {
        _id: "mock-exp-001",
        title: "Cypress QE Experiment",
        description: "This is stubbed data for testing.",
        category: "fitness",
        imageUrl: "/uploads/demo.png"
      },
      {
        _id: "mock-exp-002",
        title: "Yoga and Flexibility",
        description: "Improve your fitness levels.",
        category: "fitness",
        imageUrl: "/uploads/yoga.png"
      },
      {
        _id: "mock-exp-003",
        title: "Mental Health Check",
        description: "Meditation and stress relief.",
        category: "mental health",
        imageUrl: "/uploads/mental.png"
      }
    ];

    cy.intercept('GET', 'http://localhost:4000/api/experiments', {
      statusCode: 200,
      body: mockExperiments,
    }).as('fetchExperiments');

    cy.visit('http://localhost:5173/explore');
    cy.wait('@fetchExperiments');

    // All experiments should be visible
    cy.get('h3').should('have.length', 3);

    // Search for "Cypress"
    cy.get('input[placeholder="Search experiments..."]').type('Cypress');

    // Only Cypress experiment should be visible
    cy.get('h3').should('have.length', 1);
    cy.get('h3').should('contain', 'Cypress QE Experiment');
  });

  it('should show loading state and handle empty results', () => {
    
    const mockExperiments = [];

    cy.intercept('GET', 'http://localhost:4000/api/experiments', {
      statusCode: 200,
      body: mockExperiments,
      delay: 500 // Simulate network delay
    }).as('fetchExperiments');

    cy.visit('http://localhost:5173/explore');

    // Check for loading state
    cy.contains('Loading...').should('be.visible');

    // Wait for the request to complete
    cy.wait('@fetchExperiments');

    // Should show "No experiments match" message
    cy.contains('No experiments match your search.').should('be.visible');
  });

  it('should handle API errors gracefully', () => {
    
    // 2. MOCKING: Return an error response
    cy.intercept('GET', 'http://localhost:4000/api/experiments', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('fetchExperimentsError');

    cy.visit('http://localhost:5173/explore');
    cy.wait('@fetchExperimentsError');

    // Should show empty state gracefully
    cy.contains('No experiments match your search.').should('be.visible');
  });
});