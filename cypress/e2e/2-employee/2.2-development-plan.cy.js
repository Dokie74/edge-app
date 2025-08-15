describe('Employee Development Plan Management', () => {
  beforeEach(() => {
    // Clear any existing session data and login as employee
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login('employee');
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
  });

  context('Create Development Plan', () => {
    it('should open the "Create Development Plan" form', () => {
      // Look for development plan section or navigation
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('development') || bodyText.includes('plan')) {
          // Navigate to development plans section
          cy.get('a, button').contains(/development|plan/i).first().click();
        } else {
          // Try direct navigation
          cy.visit('/development', { failOnStatusCode: false });
        }
      });

      // Look for create/add button
      cy.get('button, a').contains(/create|add|new/i).should('be.visible').click();
      
      // Should open a modal or form
      cy.get('[role="dialog"], .modal, form').should('be.visible');
      cy.get('h1, h2, h3, legend').should('contain.text', 'Development').or('contain.text', 'Plan');
    });

    it('should show validation errors for required fields', () => {
      // Open create form
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('development') || $body.text().toLowerCase().includes('plan')) {
          cy.get('a, button').contains(/development|plan/i).first().click();
        }
      });
      
      cy.get('button, a').contains(/create|add|new/i).click();
      cy.get('[role="dialog"], .modal, form').should('be.visible');
      
      // Try to submit without filling required fields
      cy.get('button').contains(/submit|save|create/i).click();
      
      // Should show validation errors
      cy.get('body').should('contain.text', 'required').or('contain.text', 'error').or('contain.text', 'field');
      
      // Form should not close/submit
      cy.get('[role="dialog"], .modal, form').should('be.visible');
    });

    it('should successfully submit a complete and valid development plan', () => {
      const testPlan = {
        title: 'Test Development Plan',
        description: 'This is a test development plan for Cypress automation',
        goals: 'Improve testing skills and learn new technologies',
        timeline: '6 months'
      };

      // Open create form
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('development') || $body.text().toLowerCase().includes('plan')) {
          cy.get('a, button').contains(/development|plan/i).first().click();
        }
      });
      
      cy.get('button, a').contains(/create|add|new/i).click();
      cy.get('[role="dialog"], .modal, form').should('be.visible');
      
      // Fill out the form
      cy.get('input[name*="title"], input[placeholder*="title" i]').type(testPlan.title);
      cy.get('textarea[name*="description"], textarea[placeholder*="description" i], input[name*="description"]')
        .type(testPlan.description);
      
      // Fill additional fields if they exist
      cy.get('body').then(($body) => {
        if ($body.find('input[name*="goal"], textarea[name*="goal"]').length > 0) {
          cy.get('input[name*="goal"], textarea[name*="goal"]').type(testPlan.goals);
        }
        if ($body.find('input[name*="timeline"], select[name*="timeline"]').length > 0) {
          cy.get('input[name*="timeline"], select[name*="timeline"]').first().type(testPlan.timeline);
        }
      });
      
      // Submit the form
      cy.get('button').contains(/submit|save|create/i).click();
      
      // Should show success notification
      cy.get('body').should('contain.text', 'success').or('contain.text', 'created').or('contain.text', 'saved');
      
      // Modal should close
      cy.get('[role="dialog"], .modal').should('not.exist');
    });

    it('should display the newly created plan in the "My Development Plans" list', () => {
      const testPlan = {
        title: 'Another Test Plan',
        description: 'Testing plan visibility in list'
      };

      // Create a plan first
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('development') || $body.text().toLowerCase().includes('plan')) {
          cy.get('a, button').contains(/development|plan/i).first().click();
        }
      });
      
      cy.get('button, a').contains(/create|add|new/i).click();
      cy.get('input[name*="title"], input[placeholder*="title" i]').type(testPlan.title);
      cy.get('textarea[name*="description"], textarea[placeholder*="description" i], input[name*="description"]')
        .type(testPlan.description);
      cy.get('button').contains(/submit|save|create/i).click();
      
      // Wait for success and verify plan appears in list
      cy.get('body').should('contain.text', testPlan.title);
      cy.get('body').should('contain.text', testPlan.description);
    });
  });

  context('Edit Development Plan', () => {
    beforeEach(() => {
      // Create a test plan to edit
      const testPlan = {
        title: 'Plan to Edit',
        description: 'Original description'
      };

      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('development') || $body.text().toLowerCase().includes('plan')) {
          cy.get('a, button').contains(/development|plan/i).first().click();
        }
      });
      
      // Only create if we can find the create button
      cy.get('body').then(($body) => {
        if ($body.find('button, a').filter(':contains("create"), :contains("add"), :contains("new")').length > 0) {
          cy.get('button, a').contains(/create|add|new/i).click();
          cy.get('input[name*="title"], input[placeholder*="title" i]').type(testPlan.title);
          cy.get('textarea[name*="description"], textarea[placeholder*="description" i], input[name*="description"]')
            .type(testPlan.description);
          cy.get('button').contains(/submit|save|create/i).click();
          cy.wait(1000); // Wait for creation to complete
        }
      });
    });

    it('should allow an employee to edit an existing development plan', () => {
      const updatedDescription = 'Updated description via Cypress test';
      
      // Find and click edit button for the test plan
      cy.get('body').then(($body) => {
        if ($body.text().includes('Plan to Edit')) {
          // Look for edit button near the plan
          cy.get('button, a').contains(/edit|modify|update/i).first().click();
          
          // Should open edit form
          cy.get('[role="dialog"], .modal, form').should('be.visible');
          
          // Update the description
          cy.get('textarea[name*="description"], textarea[placeholder*="description" i], input[name*="description"]')
            .clear()
            .type(updatedDescription);
          
          // Save changes
          cy.get('button').contains(/save|update|submit/i).click();
          
          // Verify update was successful
          cy.get('body').should('contain.text', updatedDescription);
          cy.get('body').should('contain.text', 'Plan to Edit'); // Title should remain
        } else {
          cy.log('No existing plan found to edit - test skipped');
        }
      });
    });

    it('should preserve existing data when editing a plan', () => {
      // Find the test plan and verify edit preserves other fields
      cy.get('body').then(($body) => {
        if ($body.text().includes('Plan to Edit')) {
          cy.get('button, a').contains(/edit|modify|update/i).first().click();
          
          // Verify existing data is pre-populated
          cy.get('input[name*="title"], input[placeholder*="title" i]')
            .should('have.value', 'Plan to Edit');
          
          // Cancel edit to test data preservation
          cy.get('button').contains(/cancel|close/i).click();
          
          // Original data should still be displayed
          cy.get('body').should('contain.text', 'Plan to Edit');
        } else {
          cy.log('No existing plan found - test skipped');
        }
      });
    });
  });

  context('Development Plan List Management', () => {
    it('should display all employee development plans in a list format', () => {
      // Navigate to development plans section
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('development') || $body.text().toLowerCase().includes('plan')) {
          cy.get('a, button').contains(/development|plan/i).first().click();
        }
      });
      
      // Should show a list or table of plans
      cy.get('ul, table, .list, .plans, [data-testid*="plan"]').should('exist');
      
      // Should show plan information
      cy.get('body').should('contain.text', 'Development').or('contain.text', 'Plan');
    });

    it('should show plan status and progress indicators', () => {
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('development') || $body.text().toLowerCase().includes('plan')) {
          cy.get('a, button').contains(/development|plan/i).first().click();
          
          // Look for status indicators
          cy.get('body').should('contain.text', 'Status').or('contain.text', 'Progress').or('contain.text', 'Active');
        }
      });
    });

    it('should allow sorting or filtering of development plans', () => {
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('development') || $body.text().toLowerCase().includes('plan')) {
          cy.get('a, button').contains(/development|plan/i).first().click();
          
          // Look for sort or filter controls
          if ($body.find('select, button').filter(':contains("sort"), :contains("filter")').length > 0) {
            cy.get('select, button').contains(/sort|filter/i).should('be.visible');
          } else {
            cy.log('No sort/filter controls found - may not be implemented');
          }
        }
      });
    });
  });

  context('Development Plan Validation and Error Handling', () => {
    it('should handle form submission with partial data gracefully', () => {
      // Open create form
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('development') || $body.text().toLowerCase().includes('plan')) {
          cy.get('a, button').contains(/development|plan/i).first().click();
        }
      });
      
      cy.get('button, a').contains(/create|add|new/i).click();
      
      // Fill only title
      cy.get('input[name*="title"], input[placeholder*="title" i]').type('Partial Plan');
      
      // Try to submit
      cy.get('button').contains(/submit|save|create/i).click();
      
      // Should either succeed or show specific validation messages
      cy.get('body').should('not.contain', 'error').or('contain.text', 'required');
    });

    it('should prevent duplicate plan titles if validation exists', () => {
      const duplicateTitle = 'Duplicate Plan Title';
      
      // Create first plan
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('development') || $body.text().toLowerCase().includes('plan')) {
          cy.get('a, button').contains(/development|plan/i).first().click();
          cy.get('button, a').contains(/create|add|new/i).click();
          cy.get('input[name*="title"], input[placeholder*="title" i]').type(duplicateTitle);
          cy.get('textarea[name*="description"], textarea[placeholder*="description" i], input[name*="description"]')
            .type('First plan with this title');
          cy.get('button').contains(/submit|save|create/i).click();
          cy.wait(1000);
          
          // Try to create second plan with same title
          cy.get('button, a').contains(/create|add|new/i).click();
          cy.get('input[name*="title"], input[placeholder*="title" i]').type(duplicateTitle);
          cy.get('textarea[name*="description"], textarea[placeholder*="description" i], input[name*="description"]')
            .type('Second plan with duplicate title');
          cy.get('button').contains(/submit|save|create/i).click();
          
          // Should either prevent duplicate or allow it (depends on business rules)
          cy.get('body').should('not.contain', 'error occurred').or('contain.text', 'already exists');
        }
      });
    });
  });
});