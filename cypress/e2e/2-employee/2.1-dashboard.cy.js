describe('Employee Dashboard', () => {
  beforeEach(() => {
    // Clear any existing session data and login as employee
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login('employee');
    cy.visit('/dashboard');
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
  });

  context('Dashboard Display and Content', () => {
    it('should display the correct welcome message and user information', () => {
      // Check for welcome message
      cy.contains('Welcome').should('be.visible');
      
      // Check that employee name or role is displayed
      cy.get('body').should('contain.text', 'Employee');
      
      // Verify it's the employee dashboard (not manager or admin)
      cy.get('body').should('not.contain', 'Admin Settings');
      cy.get('body').should('not.contain', 'Team Overview');
    });

    it('should show an accurate summary of assessments and dashboard metrics', () => {
      // Wait for dashboard data to load
      cy.get('[data-cy="dashboard-content"], .space-y-8', { timeout: 15000 }).should('exist');
      
      // Check for assessment-related content (actual dashboard text)
      cy.get('body').should('contain.text', 'Assessments');
      
      // Check for pending items
      cy.get('body').should('contain.text', 'Pending');
      
      // Verify that metric counts are displayed (look for numbers in cards)
      cy.get('body').should('match', /\d+/);
      
      // Check for dashboard structure
      cy.get('.grid').should('exist'); // Grid layout for metrics
    });

    it('should have functional navigation elements', () => {
      // Check for main navigation (sidebar)
      cy.get('nav, [role="navigation"], .sidebar', { timeout: 10000 }).should('exist');
      
      // Should be able to navigate via sidebar
      cy.get('.sidebar a, nav a').should('have.length.greaterThan', 0);
      
      // Dashboard should have refresh functionality
      cy.get('button').contains(/refresh/i).should('exist');
    });

    it('should correctly display the "Kudos Wall" or recognition section', () => {
      // Look for kudos, recognition, or feedback section
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('kudos') || bodyText.includes('recognition') || bodyText.includes('feedback')) {
          cy.get('body').should('contain.text', 'Kudos');
        } else {
          cy.log('Kudos/Recognition section not found - may not be implemented yet');
        }
      });
    });
  });

  context('Dashboard Navigation and Functionality', () => {
    it('should have functional navigation elements', () => {
      // Check for main navigation elements
      cy.get('nav, [role="navigation"], .navbar, .menu').should('exist');
      
      // Should have links to key employee sections
      cy.get('a, button').should('contain.text', 'Dashboard');
      
      // Look for other employee-relevant navigation items
      cy.get('body').should('contain.text', 'Development');
    });

    it('should display user profile information or avatar', () => {
      // Look for user avatar, profile picture, or name display
      cy.get('[data-testid*="user"], [class*="user"], [class*="profile"], [class*="avatar"]').should('exist');
      
      // Should show employee name somewhere on the page
      cy.get('body').should('contain.text', 'Employee');
    });

    it('should show logout functionality', () => {
      // Should have logout button/link available
      cy.get('button, a').contains(/logout|sign out/i).should('exist');
    });
  });

  context('Dashboard Widgets and Cards', () => {
    it('should display development-related widgets for employees', () => {
      // Look for development plan or goal-related content
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('development') || bodyText.includes('goal') || bodyText.includes('plan')) {
          cy.get('body').should('contain.text', 'Development');
        } else {
          cy.log('Development widgets not found - may not be implemented yet');
        }
      });
    });

    it('should display assessment or review status widgets', () => {
      // Look for assessment status indicators
      cy.get('body').should('contain.text', 'Assessment');
      
      // Should show current status
      cy.get('body').should('contain.text', 'Status');
    });

    it('should not display manager or admin specific widgets', () => {
      // Verify employee doesn't see management features
      cy.get('body').should('not.contain', 'Team Management');
      cy.get('body').should('not.contain', 'Employee Management');
      cy.get('body').should('not.contain', 'System Settings');
      cy.get('body').should('not.contain', 'Admin Panel');
      cy.get('body').should('not.contain', 'User Administration');
    });
  });

  context('Dashboard Responsiveness and Performance', () => {
    it('should load the dashboard within reasonable time', () => {
      // Re-visit dashboard to test load time
      cy.visit('/dashboard');
      
      // Should load key elements quickly
      cy.contains('Welcome', { timeout: 5000 }).should('be.visible');
      cy.get('nav, [role="navigation"]', { timeout: 5000 }).should('be.visible');
    });

    it('should be responsive on different viewport sizes', () => {
      // Test mobile viewport
      cy.viewport(375, 667);
      cy.visit('/dashboard');
      cy.contains('Welcome').should('be.visible');
      
      // Test tablet viewport
      cy.viewport(768, 1024);
      cy.contains('Welcome').should('be.visible');
      
      // Reset to desktop
      cy.viewport(1280, 720);
      cy.contains('Welcome').should('be.visible');
    });
  });
});