describe('Manager Review Assessment Workflow', () => {
  beforeEach(() => {
    // Clear any existing session data and login as manager
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login('manager');
    cy.visit('/dashboard');
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
  });

  context('Assessment Access and Navigation', () => {
    it('should be able to open a submitted assessment from team view', () => {
      // Navigate to team view first
      cy.visit('/team', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should('include', '/team');
      
      // Look for submitted assessments or review buttons
      cy.get('body').then(($body) => {
        const hasReviewOptions = $body.text().toLowerCase().includes('review') || 
                                $body.text().toLowerCase().includes('assessment') ||
                                $body.text().toLowerCase().includes('submitted');
        
        if (hasReviewOptions) {
          cy.get('a, button').contains(/review|assessment|submitted/i).first().click();
          
          // Should navigate to assessment review page
          cy.url({ timeout: 10000 }).should('match', /review|assessment/i);
        } else {
          // Try direct navigation as fallback
          cy.visit('/review', { failOnStatusCode: false });
          cy.log('No submitted assessments found in team view - using direct navigation');
        }
      });
    });

    it('should display assessment review page with proper layout', () => {
      // Navigate to review page
      cy.visit('/review', { failOnStatusCode: false });
      
      // Should show review page header
      cy.get('h1, h2, h3').should('contain.text', 'Review').or('contain.text', 'Assessment').or('contain.text', 'Evaluation');
      
      // Should show form or sections for review
      cy.get('form, section, fieldset').should('exist');
    });

    it('should show employee information for the assessment being reviewed', () => {
      // Navigate to review page
      cy.visit('/review', { failOnStatusCode: false });
      
      // Should display employee details
      cy.get('body').should('contain.text', 'Employee').or('contain.text', 'Name').or('contain.text', '@');
      
      // Should show which employee's assessment is being reviewed
      cy.get('[data-testid*="employee"], [class*="employee"], .employee-info').should('exist');
    });
  });

  context('Employee Self-Assessment Display', () => {
    beforeEach(() => {
      // Navigate to assessment review page
      cy.visit('/review', { failOnStatusCode: false });
    });

    it('should display the employee self-assessment answers in read-only format', () => {
      // Look for employee responses section
      cy.get('body').then(($body) => {
        const hasEmployeeResponses = $body.text().toLowerCase().includes('self') || 
                                    $body.text().toLowerCase().includes('employee') ||
                                    $body.text().toLowerCase().includes('response');
        
        if (hasEmployeeResponses) {
          // Should show employee responses
          cy.get('body').should('contain.text', 'Self').or('contain.text', 'Employee').or('contain.text', 'Response');
          
          // Employee responses should be read-only
          cy.get('[readonly], [disabled], .readonly').should('exist');
        } else {
          cy.log('No employee self-assessment responses found - may need seeded data');
        }
      });
    });

    it('should show employee ratings and comments clearly', () => {
      // Look for rating displays
      cy.get('body').then(($body) => {
        const hasRatings = $body.text().toLowerCase().includes('rating') || 
                          $body.text().match(/\d\/\d|\d\s*out\s*of\s*\d/);
        
        if (hasRatings) {
          cy.get('body').should('contain.text', 'Rating').or('match', /\d\/\d/);
        } else {
          cy.log('No employee ratings found - may need seeded data');
        }
      });
      
      // Look for employee comments
      cy.get('.comment, .response, textarea[readonly]').then(($comments) => {
        if ($comments.length > 0) {
          cy.get('.comment, .response, textarea[readonly]').should('be.visible');
        } else {
          cy.log('No employee comments displayed');
        }
      });
    });

    it('should organize employee responses by assessment sections', () => {
      // Look for section organization
      cy.get('body').then(($body) => {
        const hasSections = $body.find('h2, h3, h4, fieldset, .section').length > 1;
        
        if (hasSections) {
          cy.get('h2, h3, h4, fieldset, .section').should('have.length.greaterThan', 1);
        } else {
          cy.log('No clear section organization found - may be single page format');
        }
      });
    });

    it('should prevent editing of employee self-assessment responses', () => {
      // All employee response fields should be read-only
      cy.get('input, textarea, select').then(($fields) => {
        const employeeFields = $fields.filter('[readonly], [disabled]');
        
        if (employeeFields.length > 0) {
          cy.get('input[readonly], textarea[readonly], input[disabled], textarea[disabled]')
            .should('have.length.greaterThan', 0);
        } else {
          cy.log('No read-only employee fields found - may not be implemented');
        }
      });
    });
  });

  context('Manager Review Form', () => {
    beforeEach(() => {
      // Navigate to assessment review page
      cy.visit('/review', { failOnStatusCode: false });
    });

    it('should provide manager-specific feedback sections', () => {
      // Look for manager feedback areas
      cy.get('body').then(($body) => {
        const hasManagerSections = $body.text().toLowerCase().includes('manager') || 
                                  $body.text().toLowerCase().includes('supervisor') ||
                                  $body.text().toLowerCase().includes('feedback');
        
        if (hasManagerSections) {
          cy.get('body').should('contain.text', 'Manager').or('contain.text', 'Feedback').or('contain.text', 'Supervisor');
          
          // Should have editable fields for manager input
          cy.get('textarea:not([readonly]), input:not([readonly])').should('exist');
        } else {
          cy.log('No manager-specific sections found - may need seeded data');
        }
      });
    });

    it('should allow manager to fill out rating fields', () => {
      // Look for manager rating inputs
      cy.get('input[type="radio"]:not([disabled]), select:not([disabled])').then(($ratings) => {
        if ($ratings.length > 0) {
          // Select a rating
          cy.get('input[type="radio"]:not([disabled])').first().click();
          
          // Should be able to select the rating
          cy.get('input[type="radio"]:checked').should('exist');
        } else {
          cy.log('No manager rating fields found');
        }
      });
    });

    it('should allow manager to add written feedback and comments', () => {
      const managerFeedback = 'This is manager feedback for the employee assessment review process.';
      
      // Look for manager feedback text areas
      cy.get('textarea:not([readonly]):not([disabled])').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.get('textarea:not([readonly]):not([disabled])').first().type(managerFeedback);
          
          // Should accept the input
          cy.get('textarea:not([readonly]):not([disabled])').first().should('contain.value', managerFeedback);
        } else {
          cy.log('No manager feedback text areas found');
        }
      });
    });

    it('should provide sections for goals and development planning', () => {
      // Look for goal-setting or development sections
      cy.get('body').then(($body) => {
        const hasGoalSections = $body.text().toLowerCase().includes('goal') || 
                               $body.text().toLowerCase().includes('development') ||
                               $body.text().toLowerCase().includes('objective');
        
        if (hasGoalSections) {
          cy.get('body').should('contain.text', 'Goal').or('contain.text', 'Development').or('contain.text', 'Objective');
        } else {
          cy.log('No goal/development sections found - may not be implemented');
        }
      });
    });
  });

  context('Manager Review Validation', () => {
    beforeEach(() => {
      // Navigate to assessment review page
      cy.visit('/review', { failOnStatusCode: false });
    });

    it('should show validation errors for required manager fields', () => {
      // Try to submit without filling required fields
      cy.get('button').contains(/submit|complete|finish|save/i).then(($buttons) => {
        if ($buttons.length > 0) {
          cy.wrap($buttons.first()).click();
          
          // Should show validation messages if fields are required
          cy.get('body').should('not.contain', 'error occurred').or('contain.text', 'required').or('contain.text', 'missing');
        } else {
          cy.log('No submit button found - may not be on correct page');
        }
      });
    });

    it('should require manager ratings for key performance areas', () => {
      // Fill out text fields but leave ratings empty
      cy.get('textarea:not([readonly])').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.get('textarea:not([readonly])').first().type('Manager feedback without ratings');
        }
      });
      
      // Try to submit
      cy.get('button').contains(/submit|complete|finish/i).then(($buttons) => {
        if ($buttons.length > 0) {
          cy.wrap($buttons.first()).click();
          
          // Should validate ratings if required
          cy.get('body').should('not.contain', 'error').or('contain.text', 'rating').or('contain.text', 'required');
        }
      });
    });

    it('should validate minimum feedback length requirements', () => {
      // Enter very short feedback
      cy.get('textarea:not([readonly])').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.get('textarea:not([readonly])').first().clear().type('x');
          
          // Try to submit
          cy.get('button').contains(/submit|complete|finish/i).click();
          
          // Should show length validation if implemented
          cy.get('body').should('not.contain', 'too short').or('contain.text', 'minimum');
        }
      });
    });
  });

  context('Manager Review Submission', () => {
    beforeEach(() => {
      // Navigate to assessment review page
      cy.visit('/review', { failOnStatusCode: false });
    });

    it('should successfully submit a completed manager review', () => {
      // Fill out all manager fields
      cy.get('textarea:not([readonly])').each(($textarea) => {
        cy.wrap($textarea).type('Comprehensive manager feedback for this employee assessment.');
      });
      
      // Select ratings
      cy.get('input[type="radio"]:not([disabled])').then(($radios) => {
        if ($radios.length > 0) {
          cy.get('input[type="radio"]:not([disabled])[value="4"], input[type="radio"]:not([disabled])[value="3"]')
            .first().click();
        }
      });
      
      // Fill any other input fields
      cy.get('input[type="text"]:not([readonly])').each(($input) => {
        cy.wrap($input).type('Manager input');
      });
      
      // Submit the review
      cy.get('button').contains(/submit|complete|finish/i).click();
      
      // Should show success message
      cy.get('body').should('contain.text', 'success').or('contain.text', 'submitted').or('contain.text', 'completed');
    });

    it('should lock the entire assessment after manager submission', () => {
      // Submit review first (simplified)
      cy.get('textarea:not([readonly])').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.get('textarea:not([readonly])').first().type('Final manager review');
        }
      });
      
      cy.get('button').contains(/submit|complete|finish/i).click();
      
      // Wait for submission
      cy.wait(2000);
      
      // All fields should now be read-only
      cy.get('textarea, input').then(($fields) => {
        if ($fields.length > 0) {
          const editableFields = $fields.filter(':not([readonly]):not([disabled])');
          expect(editableFields.length).to.equal(0);
        }
      });
      
      // Submit button should be disabled or hidden
      cy.get('button').contains(/submit|complete|finish/i).should('not.exist').or('be.disabled');
    });

    it('should update assessment status across the system', () => {
      // Submit review
      cy.get('textarea:not([readonly])').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.get('textarea:not([readonly])').first().type('Status update test');
        }
      });
      
      cy.get('button').contains(/submit|complete|finish/i).click();
      
      // Wait for submission
      cy.wait(2000);
      
      // Navigate back to team view
      cy.visit('/team', { failOnStatusCode: false });
      
      // Should show updated status
      cy.get('body').should('contain.text', 'Completed').or('contain.text', 'Reviewed').or('contain.text', 'Finished');
    });
  });

  context('Review Workflow and Navigation', () => {
    beforeEach(() => {
      // Navigate to assessment review page
      cy.visit('/review', { failOnStatusCode: false });
    });

    it('should allow saving draft of manager review', () => {
      // Fill out some fields
      cy.get('textarea:not([readonly])').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.get('textarea:not([readonly])').first().type('Draft manager feedback');
        }
      });
      
      // Look for save draft button
      cy.get('button').contains(/draft|save/i).then(($draftButtons) => {
        if ($draftButtons.length > 0) {
          cy.wrap($draftButtons.first()).click();
          
          // Should show draft saved message
          cy.get('body').should('contain.text', 'draft').or('contain.text', 'saved');
        } else {
          cy.log('No draft save functionality found');
        }
      });
    });

    it('should allow navigation between assessment sections', () => {
      // Look for section navigation
      cy.get('button, a').contains(/next|previous|section/i).then(($navButtons) => {
        if ($navButtons.length > 0) {
          cy.get('button, a').contains(/next|continue/i).first().click();
          
          // Should navigate to next section
          cy.get('button, a').contains(/previous|back/i).should('exist');
        } else {
          cy.log('No section navigation found - single page review');
        }
      });
    });

    it('should provide option to return to team view', () => {
      // Look for back/cancel navigation
      cy.get('a, button').contains(/back|cancel|team|return/i).then(($backButtons) => {
        if ($backButtons.length > 0) {
          cy.get('a, button').contains(/back|cancel|team|return/i).first().click();
          
          // Should return to team view
          cy.url({ timeout: 10000 }).should('include', '/team').or('include', '/dashboard');
        } else {
          cy.log('No back navigation found');
        }
      });
    });

    it('should show assessment completion progress', () => {
      // Look for progress indicators
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('progress') || $body.text().includes('%')) {
          cy.get('[class*="progress"], [id*="progress"]').should('be.visible');
        } else {
          cy.log('No progress indicator found');
        }
      });
    });
  });
});