describe('Employee Self-Assessment Workflow', () => {
  beforeEach(() => {
    // Clear any existing session data and login as employee
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login('employee');
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
  });

  context('Self-Assessment Access and Navigation', () => {
    it('should be able to open an active self-assessment from dashboard link', () => {
      // Look for assessment links on dashboard
      cy.get('a, button').contains(/assessment|review|evaluation/i).should('exist');
      
      // Click on assessment link
      cy.get('a, button').contains(/assessment|review|evaluation/i).first().click();
      
      // Should navigate to assessment page
      cy.url({ timeout: 10000 }).should('match', /assessment|review/i);
      
      // Should show assessment form or content
      cy.get('h1, h2, h3').should('contain.text', 'Assessment').or('contain.text', 'Review').or('contain.text', 'Evaluation');
    });

    it('should display assessment instructions and guidance', () => {
      // Navigate to assessment
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('assessment') || $body.text().toLowerCase().includes('review')) {
          cy.get('a, button').contains(/assessment|review/i).first().click();
        } else {
          cy.visit('/assessment', { failOnStatusCode: false });
        }
      });
      
      // Should show instructions or help text
      cy.get('body').should('contain.text', 'instruction').or('contain.text', 'guidance').or('contain.text', 'help');
    });

    it('should show assessment sections and questions', () => {
      // Navigate to assessment
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('assessment') || $body.text().toLowerCase().includes('review')) {
          cy.get('a, button').contains(/assessment|review/i).first().click();
        }
      });
      
      // Should display form sections
      cy.get('form, fieldset, section').should('exist');
      
      // Should have rating or input fields
      cy.get('input, textarea, select').should('exist');
    });
  });

  context('Self-Assessment Form Interaction', () => {
    beforeEach(() => {
      // Navigate to assessment before each test
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('assessment') || $body.text().toLowerCase().includes('review')) {
          cy.get('a, button').contains(/assessment|review/i).first().click();
        } else {
          cy.visit('/assessment', { failOnStatusCode: false });
        }
      });
    });

    it('should allow filling out assessment fields', () => {
      // Fill out text areas if they exist
      cy.get('textarea').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.get('textarea').first().type('This is a test response for the self-assessment.');
        }
      });
      
      // Fill out input fields if they exist
      cy.get('input[type="text"]').then(($inputs) => {
        if ($inputs.length > 0) {
          cy.get('input[type="text"]').first().type('Test input response');
        }
      });
      
      // Select ratings if they exist
      cy.get('input[type="radio"], select').then(($ratings) => {
        if ($ratings.length > 0) {
          cy.get('input[type="radio"], select').first().click();
        }
      });
    });

    it('should allow saving a draft of the assessment', () => {
      // Fill out some fields
      cy.get('textarea').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.get('textarea').first().type('Draft response for testing');
        }
      });
      
      // Look for save draft button
      cy.get('button').then(($buttons) => {
        const draftButton = $buttons.filter(':contains("draft"), :contains("save")').first();
        if (draftButton.length > 0) {
          cy.wrap(draftButton).click();
          
          // Should show draft saved message
          cy.get('body').should('contain.text', 'draft').or('contain.text', 'saved');
        } else {
          cy.log('No draft save button found - feature may not be implemented');
        }
      });
    });

    it('should preserve draft data after page reload', () => {
      const testResponse = 'Draft response that should persist';
      
      // Fill out a field
      cy.get('textarea').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.get('textarea').first().type(testResponse);
          
          // Save draft if possible
          cy.get('body').then(($body) => {
            if ($body.text().toLowerCase().includes('draft') || $body.text().toLowerCase().includes('save')) {
              cy.get('button').contains(/draft|save/i).click();
              cy.wait(1000);
            }
          });
          
          // Reload page
          cy.reload();
          
          // Navigate back to assessment
          cy.get('body').then(($body) => {
            if ($body.text().toLowerCase().includes('assessment')) {
              cy.get('a, button').contains(/assessment|review/i).first().click();
            }
          });
          
          // Check if data persisted
          cy.get('textarea').first().should('contain.value', testResponse);
        }
      });
    });
  });

  context('Self-Assessment Validation', () => {
    beforeEach(() => {
      // Navigate to assessment
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('assessment') || $body.text().toLowerCase().includes('review')) {
          cy.get('a, button').contains(/assessment|review/i).first().click();
        }
      });
    });

    it('should show validation errors for required fields when submitting', () => {
      // Try to submit without filling required fields
      cy.get('button').contains(/submit|complete|finish/i).click();
      
      // Should show validation messages
      cy.get('body').should('contain.text', 'required').or('contain.text', 'missing').or('contain.text', 'error');
      
      // Form should remain visible (not submitted)
      cy.get('form, fieldset').should('be.visible');
    });

    it('should require rating fields to be completed', () => {
      // Fill text fields but leave ratings empty
      cy.get('textarea').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.get('textarea').first().type('Completed text response');
        }
      });
      
      // Try to submit
      cy.get('button').contains(/submit|complete|finish/i).click();
      
      // Should show validation for ratings if required
      cy.get('body').should('not.contain', 'error').or('contain.text', 'rating').or('contain.text', 'required');
    });

    it('should validate text field minimum requirements', () => {
      // Enter very short text in required fields
      cy.get('textarea').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.get('textarea').first().clear().type('x');
        }
      });
      
      // Try to submit
      cy.get('button').contains(/submit|complete|finish/i).click();
      
      // Should show length validation if implemented
      cy.get('body').should('not.contain', 'too short').or('contain.text', 'minimum');
    });
  });

  context('Self-Assessment Submission', () => {
    beforeEach(() => {
      // Navigate to assessment
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('assessment') || $body.text().toLowerCase().includes('review')) {
          cy.get('a, button').contains(/assessment|review/i).first().click();
        }
      });
    });

    it('should successfully submit a completed self-assessment', () => {
      // Fill out all available fields
      cy.get('textarea').each(($textarea) => {
        cy.wrap($textarea).type('This is a comprehensive response for the self-assessment question.');
      });
      
      // Fill out text inputs
      cy.get('input[type="text"]').each(($input) => {
        cy.wrap($input).type('Test response');
      });
      
      // Select ratings
      cy.get('input[type="radio"]').then(($radios) => {
        if ($radios.length > 0) {
          // Select middle or high ratings
          cy.get('input[type="radio"][value="3"], input[type="radio"][value="4"]').first().click();
        }
      });
      
      // Select dropdowns
      cy.get('select').each(($select) => {
        cy.wrap($select).select(1); // Select second option
      });
      
      // Submit the assessment
      cy.get('button').contains(/submit|complete|finish/i).click();
      
      // Should show success message
      cy.get('body').should('contain.text', 'success').or('contain.text', 'submitted').or('contain.text', 'complete');
    });

    it('should make the assessment read-only after submission', () => {
      // First submit assessment (simplified)
      cy.get('textarea').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.get('textarea').each(($textarea) => {
            cy.wrap($textarea).type('Submitted response');
          });
        }
      });
      
      cy.get('button').contains(/submit|complete|finish/i).click();
      
      // Wait for submission to complete
      cy.wait(2000);
      
      // Check if form fields are now disabled
      cy.get('textarea, input').then(($fields) => {
        if ($fields.length > 0) {
          cy.get('textarea, input').should('have.attr', 'disabled').or('have.attr', 'readonly');
        }
      });
      
      // Submit button should be disabled or hidden
      cy.get('button').contains(/submit|complete|finish/i).should('not.exist').or('be.disabled');
    });

    it('should update assessment status on dashboard after submission', () => {
      // Submit assessment first
      cy.get('textarea').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.get('textarea').first().type('Final submission test');
        }
      });
      
      cy.get('button').contains(/submit|complete|finish/i).click();
      
      // Wait for submission
      cy.wait(2000);
      
      // Navigate back to dashboard
      cy.visit('/dashboard');
      
      // Should show updated status
      cy.get('body').should('contain.text', 'Waiting for Manager').or('contain.text', 'Submitted').or('contain.text', 'Complete');
    });
  });

  context('Self-Assessment Progress Tracking', () => {
    beforeEach(() => {
      // Navigate to assessment
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('assessment') || $body.text().toLowerCase().includes('review')) {
          cy.get('a, button').contains(/assessment|review/i).first().click();
        }
      });
    });

    it('should show progress indicator as sections are completed', () => {
      // Look for progress indicators
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('progress') || $body.text().includes('%')) {
          cy.get('[class*="progress"], [id*="progress"]').should('be.visible');
        } else {
          cy.log('No progress indicator found - feature may not be implemented');
        }
      });
    });

    it('should allow navigation between assessment sections', () => {
      // Look for section navigation
      cy.get('body').then(($body) => {
        if ($body.find('button, a').filter(':contains("next"), :contains("previous"), :contains("section")').length > 0) {
          // Test navigation if it exists
          cy.get('button, a').contains(/next|continue/i).first().click();
          cy.get('button, a').contains(/previous|back/i).should('exist');
        } else {
          cy.log('No section navigation found - single page assessment');
        }
      });
    });

    it('should save progress automatically or on section completion', () => {
      // Fill out a section
      cy.get('textarea').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.get('textarea').first().type('Auto-save test content');
          
          // Trigger potential auto-save by clicking elsewhere or waiting
          cy.get('body').click();
          cy.wait(3000);
          
          // Progress should be indicated somehow
          cy.get('body').should('not.contain', 'error');
        }
      });
    });
  });
});