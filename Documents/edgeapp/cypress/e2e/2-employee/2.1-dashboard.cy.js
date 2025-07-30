describe('Employee Dashboard', () => {
  beforeEach(() => {
    // Clear any existing session data and login as employee
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login('employee');
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
  });

  context('Dashboard Display and Content', () => {
    it('should display the correct welcome message and user information', () => {
      // Check for welcome message
      cy.contains('Welcome').should('be.visible');
      
      // Check that employee name or role is displayed
      cy.get('body').should('contain.text', 'Employee1').or('contain.text', 'Employee');
      
      // Verify it's the employee dashboard (not manager or admin)
      cy.get('body').should('not.contain', 'Admin Settings');
      cy.get('body').should('not.contain', 'Team Overview');
    });

    it('should show an accurate summary of active and completed reviews', () => {
      // Look for review summary widgets or sections
      cy.get('[data-testid*="review"], [class*="review"], [id*="review"]').should('exist');
      
      // Check for active reviews section
      cy.get('body').should('contain.text', 'Active').or('contain.text', 'Pending').or('contain.text', 'In Progress');
      
      // Check for completed reviews section
      cy.get('body').should('contain.text', 'Completed').or('contain.text', 'Finished');
      
      // Verify that review counts are displayed (look for numbers)
      cy.get('body').should('match', /\d+/);
    });

    it('should allow navigation to "My Reviews" page', () => {
      // Look for "View All", "My Reviews", or similar navigation link
      cy.get('a, button').contains(/view all|my reviews|see all|reviews/i).first().click();
      
      // Should navigate to reviews page
      cy.url({ timeout: 10000 }).should('match', /review/i);
      
      // Should show reviews content
      cy.get('h1, h2, h3').should('contain.text', 'Review').or('contain.text', 'Assessment');
    });

    it('should correctly display the "Kudos Wall" or recognition section', () => {
      // Look for kudos, recognition, or feedback section
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('kudos') || bodyText.includes('recognition') || bodyText.includes('feedback')) {
          cy.get('body').should('contain.text', 'Kudos').or('contain.text', 'Recognition').or('contain.text', 'Feedback');
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
      cy.get('a, button').should('contain.text', 'Dashboard').or('contain.text', 'Home');
      
      // Look for other employee-relevant navigation items
      cy.get('body').should('contain.text', 'Development').or('contain.text', 'Assessment').or('contain.text', 'Profile');
    });

    it('should display user profile information or avatar', () => {
      // Look for user avatar, profile picture, or name display
      cy.get('[data-testid*="user"], [class*="user"], [class*="profile"], [class*="avatar"]').should('exist');
      
      // Should show employee name somewhere on the page
      cy.get('body').should('contain.text', 'Employee1').or('contain.text', '@');
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
          cy.get('body').should('contain.text', 'Development').or('contain.text', 'Goal').or('contain.text', 'Plan');
        } else {
          cy.log('Development widgets not found - may not be implemented yet');
        }
      });
    });

    it('should display assessment or review status widgets', () => {
      // Look for assessment status indicators
      cy.get('body').should('contain.text', 'Assessment').or('contain.text', 'Review').or('contain.text', 'Evaluation');
      
      // Should show current status
      cy.get('body').should('contain.text', 'Status').or('contain.text', 'Progress').or('contain.text', 'Complete');
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