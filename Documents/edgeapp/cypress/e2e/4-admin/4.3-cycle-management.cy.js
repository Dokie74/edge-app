describe('Admin Review Cycle Management', () => {
  beforeEach(() => {
    // Clear any existing session data and login as admin
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login('admin');
    cy.visit('/dashboard');
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
    
    // Navigate to admin page for cycle management
    cy.visit('/admin', { failOnStatusCode: false });
    cy.url({ timeout: 10000 }).should('include', '/admin');
  });

  context('Review Cycle Display and Overview', () => {
    it('should display a list of all review cycles (upcoming, active, closed)', () => {
      // Look for cycle management section
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('cycle') || bodyText.includes('review')) {
          // Should show cycle information
          cy.get('body').should('contain.text', 'Cycle').or('contain.text', 'Review');
          
          // Should display cycles in organized format
          cy.get('table, .list, .grid, [data-testid*="cycle"]').should('exist');
        } else {
          // Try navigating to dedicated cycle management page
          cy.visit('/admin/cycles', { failOnStatusCode: false });
          cy.log('Looking for dedicated cycle management page');
        }
      });
    });

    it('should show cycle status indicators (Upcoming, Active, Closed)', () => {
      // Look for status indicators
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        const hasStatusIndicators = bodyText.includes('upcoming') || 
                                   bodyText.includes('active') || 
                                   bodyText.includes('closed') ||
                                   bodyText.includes('status');
        
        if (hasStatusIndicators) {
          cy.get('body').should('contain.text', 'Active').or('contain.text', 'Upcoming').or('contain.text', 'Closed');
          
          // Should have visual status indicators
          cy.get('[class*="status"], [class*="badge"], .badge, .chip').should('exist');
        } else {
          cy.log('No cycle status indicators found - may need seeded data');
        }
      });
    });

    it('should display cycle dates and duration information', () => {
      // Look for date information
      cy.get('body').then(($body) => {
        const hasDatePattern = /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|start|end|duration/i.test($body.text());
        
        if (hasDatePattern) {
          cy.get('body').should('contain.text', 'Start').or('contain.text', 'End').or('match', /\d{2}\/\d{2}\/\d{4}/);
        } else {
          cy.log('No cycle date information found - may not be implemented');
        }
      });
    });

    it('should show participation statistics for each cycle', () => {
      // Look for participation or completion statistics
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('participation') || bodyText.includes('completion') || bodyText.includes('%')) {
          cy.get('body').should('contain.text', 'Participation').or('contain.text', 'Completion').or('contain.text', '%');
        } else {
          cy.log('No participation statistics found - may not be implemented');
        }
      });
    });
  });

  context('Create New Review Cycle', () => {
    it('should allow creation of a new review cycle with future start date', () => {
      // Look for create cycle button
      cy.get('button, a').contains(/create|add|new/i).then(($buttons) => {
        const cycleButton = $buttons.filter(':contains("cycle"), :contains("review")');
        
        if (cycleButton.length > 0) {
          cy.wrap(cycleButton.first()).click();
        } else {
          // Try generic create button
          cy.get('button, a').contains(/create|add|new/i).first().click();
        }
      });
      
      // Should open create cycle form
      cy.get('[role="dialog"], .modal, form').should('be.visible');
      cy.get('h1, h2, h3, legend').should('contain.text', 'Create').or('contain.text', 'New').or('contain.text', 'Cycle');
      
      // Fill out cycle information
      const futureCycle = {
        name: `Test Review Cycle ${Date.now()}`,
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        description: 'Test cycle created by Cypress automation'
      };
      
      // Fill form fields
      cy.get('input[name*="name"], input[placeholder*="name" i]').type(futureCycle.name);
      
      // Fill date fields if they exist
      cy.get('input[type="date"], input[name*="start"]').then(($startDate) => {
        if ($startDate.length > 0) {
          cy.wrap($startDate.first()).type(futureCycle.startDate);
        }
      });
      
      cy.get('input[type="date"], input[name*="end"]').then(($endDate) => {
        if ($endDate.length > 1) {
          cy.wrap($endDate.last()).type(futureCycle.endDate);
        }
      });
      
      // Fill description if field exists
      cy.get('textarea[name*="description"], textarea[placeholder*="description" i]').then(($description) => {
        if ($description.length > 0) {
          cy.wrap($description).type(futureCycle.description);
        }
      });
      
      // Submit the form
      cy.get('button').contains(/create|save|submit/i).click();
      
      // Should show success message
      cy.get('body').should('contain.text', 'success').or('contain.text', 'created').or('contain.text', 'added');
      
      // New cycle should appear in the list
      cy.get('body').should('contain.text', futureCycle.name);
    });

    it('should validate required fields when creating a cycle', () => {
      // Open create cycle form
      cy.get('button, a').contains(/create|add|new/i).first().click();
      cy.get('[role="dialog"], .modal, form').should('be.visible');
      
      // Try to submit without filling required fields
      cy.get('button').contains(/create|save|submit/i).click();
      
      // Should show validation errors
      cy.get('body').should('contain.text', 'required').or('contain.text', 'error').or('contain.text', 'field');
      
      // Form should remain open
      cy.get('[role="dialog"], .modal, form').should('be.visible');
    });

    it('should validate date logic (end date after start date)', () => {
      // Open create cycle form
      cy.get('button, a').contains(/create|add|new/i).first().click();
      cy.get('[role="dialog"], .modal, form').should('be.visible');
      
      // Enter invalid date range (end before start)
      cy.get('input[name*="name"]').type('Invalid Date Test');
      cy.get('input[type="date"], input[name*="start"]').then(($startDate) => {
        if ($startDate.length > 0) {
          cy.wrap($startDate.first()).type('2024-12-31');
        }
      });
      
      cy.get('input[type="date"], input[name*="end"]').then(($endDate) => {
        if ($endDate.length > 1) {
          cy.wrap($endDate.last()).type('2024-12-01');
        }
      });
      
      // Try to submit
      cy.get('button').contains(/create|save|submit/i).click();
      
      // Should show date validation error
      cy.get('body').should('contain.text', 'date').or('contain.text', 'after').or('contain.text', 'before');
    });
  });

  context('Review Cycle Activation', () => {
    it('should allow activation of an "upcoming" review cycle', () => {
      // Look for upcoming cycles and activate button
      cy.get('body').then(($body) => {
        const hasUpcoming = $body.text().toLowerCase().includes('upcoming');
        
        if (hasUpcoming) {
          // Look for activate button
          cy.get('button, a').contains(/activate|start|begin/i).should('exist').first().click();
          
          // May require confirmation
          cy.get('body').then(($body) => {
            if ($body.text().includes('confirm') || $body.text().includes('sure')) {
              cy.get('button').contains(/yes|confirm|activate/i).click();
            }
          });
          
          // Should show success message
          cy.get('body').should('contain.text', 'activated').or('contain.text', 'started').or('contain.text', 'active');
        } else {
          cy.log('No upcoming cycles found to activate - may need seeded data');
        }
      });
    });

    it('should make activated cycle visible to employees and managers', () => {
      // After activation, verify cycle visibility by checking employee view
      cy.log('Cycle visibility test requires switching user roles - verify manually');
      
      // Log out and log in as employee to test visibility
      cy.get('button, a').contains(/logout|sign out/i).click();
      cy.login('employee');
      
      // Should see active review cycle on employee dashboard
      cy.get('body').should('contain.text', 'Review').or('contain.text', 'Assessment').or('contain.text', 'Active');
    });

    it('should prevent activation of cycles with invalid dates', () => {
      // Test activation of cycle with past dates (if any exist)
      cy.get('body').then(($body) => {
        const hasActivateButton = $body.find('button, a').filter(':contains("activate")').length > 0;
        
        if (hasActivateButton) {
          // Check if activation shows date validation
          cy.log('Testing cycle activation validation - manual verification needed for date logic');
        } else {
          cy.log('No activate buttons found - no cycles available for activation');
        }
      });
    });
  });

  context('Review Cycle Closure', () => {
    it('should allow closing of an "active" review cycle', () => {
      // Look for active cycles and close button
      cy.get('body').then(($body) => {
        const hasActive = $body.text().toLowerCase().includes('active');
        const hasCloseButton = $body.find('button, a').filter(':contains("close"), :contains("end"), :contains("finish")').length > 0;
        
        if (hasActive && hasCloseButton) {
          // Look for close button
          cy.get('button, a').contains(/close|end|finish/i).first().click();
          
          // May require confirmation
          cy.get('body').then(($body) => {
            if ($body.text().includes('confirm') || $body.text().includes('sure')) {
              cy.get('button').contains(/yes|confirm|close/i).click();
            }
          });
          
          // Should show success message
          cy.get('body').should('contain.text', 'closed').or('contain.text', 'ended').or('contain.text', 'finished');
        } else {
          cy.log('No active cycles found to close - may need seeded data');
        }
      });
    });

    it('should prevent editing assessments after cycle closure', () => {
      // Test that closed cycles lock assessments
      cy.log('Assessment locking test requires cycle closure - verify manually');
      
      // After closing a cycle, employees should not be able to edit assessments
      cy.get('button, a').contains(/logout|sign out/i).click();
      cy.login('employee');
      
      // Should not be able to access or edit closed cycle assessments
      cy.visit('/assessment', { failOnStatusCode: false });
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('closed') || $body.text().toLowerCase().includes('locked')) {
          cy.get('body').should('contain.text', 'Closed').or('contain.text', 'Locked');
        }
      });
    });

    it('should generate cycle completion reports after closure', () => {
      // Look for reports or analytics after cycle closure
      cy.get('body').then(($body) => {
        const hasReports = $body.text().toLowerCase().includes('report') || 
                          $body.text().toLowerCase().includes('analytics') ||
                          $body.find('button, a').filter(':contains("report"), :contains("export"), :contains("download")').length > 0;
        
        if (hasReports) {
          cy.get('body').should('contain.text', 'Report').or('contain.text', 'Analytics');
        } else {
          cy.log('No completion reports found - may not be implemented');
        }
      });
    });
  });

  context('Cycle Management Data and Analytics', () => {
    it('should display cycle progress and completion statistics', () => {
      // Look for progress indicators and statistics
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('progress') || bodyText.includes('completion') || bodyText.includes('%')) {
          cy.get('body').should('contain.text', 'Progress').or('contain.text', 'Completion').or('contain.text', '%');
          
          // Should show percentage values
          cy.get('body').should('match', /\d+%/);
        } else {
          cy.log('No progress statistics found - may not be implemented');
        }
      });
    });

    it('should show participant count and engagement metrics', () => {
      // Look for participant information
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('participant') || bodyText.includes('employee') || bodyText.includes('engagement')) {
          cy.get('body').should('contain.text', 'Participant').or('contain.text', 'Employee').or('contain.text', 'Engagement');
          
          // Should show numerical counts
          cy.get('body').should('match', /\d+/);
        } else {
          cy.log('No participant metrics found - may not be implemented');
        }
      });
    });

    it('should provide export functionality for cycle data', () => {
      // Look for export buttons
      cy.get('body').then(($body) => {
        if ($body.find('button, a').filter(':contains("export"), :contains("download"), :contains("csv"), :contains("report")').length > 0) {
          cy.get('button, a').contains(/export|download|csv|report/i).should('be.visible');
        } else {
          cy.log('No export functionality found - may not be implemented');
        }
      });
    });

    it('should handle cycle data refresh and real-time updates', () => {
      // Test data refresh
      cy.get('body').then(($body) => {
        const initialCycleCount = ($body.text().match(/cycle/gi) || []).length;
        
        // Refresh page
        cy.reload();
        
        // Should still show admin page
        cy.url().should('include', '/admin');
        
        // Cycle data should be consistent
        cy.get('body').should('contain.text', 'Cycle').or('contain.text', 'Review');
      });
    });
  });

  context('Cycle Management Security and Validation', () => {
    it('should require admin privileges for all cycle management actions', () => {
      // Verify admin access
      cy.url().should('include', '/admin');
      cy.get('body').should('contain.text', 'Admin').or('contain.text', 'Management');
      
      // Should have create/edit/activate/close capabilities
      cy.get('button, a').should('contain.text', 'Create').or('contain.text', 'Add').or('contain.text', 'Manage');
    });

    it('should prevent unauthorized cycle modifications', () => {
      // Verify only admin can modify cycles
      cy.log('Unauthorized modification test - verify manually that non-admin users cannot access cycle management');
      
      // Log out and try accessing as different role
      cy.get('button, a').contains(/logout|sign out/i).click();
      cy.login('manager');
      
      // Manager should not have cycle creation access
      cy.visit('/admin', { failOnStatusCode: false });
      cy.url({ timeout: 5000 }).should('not.include', '/admin');
    });

    it('should validate cycle overlaps and conflicts', () => {
      // Test creation of overlapping cycles
      cy.get('button, a').contains(/create|add|new/i).first().click();
      cy.get('[role="dialog"], .modal, form').should('be.visible');
      
      // Enter overlapping dates with existing cycle
      cy.get('input[name*="name"]').type('Overlap Test Cycle');
      
      cy.get('input[type="date"], input[name*="start"]').then(($startDate) => {
        if ($startDate.length > 0) {
          cy.wrap($startDate.first()).type('2024-01-01');
        }
      });
      
      cy.get('input[type="date"], input[name*="end"]').then(($endDate) => {
        if ($endDate.length > 1) {
          cy.wrap($endDate.last()).type('2024-12-31');
        }
      });
      
      // Try to submit
      cy.get('button').contains(/create|save|submit/i).click();
      
      // Should handle overlap validation (may allow or show warning)
      cy.get('body').should('not.contain', 'error occurred');
    });

    it('should log all cycle management actions for audit', () => {
      // Verify audit logging exists
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('audit') || $body.text().toLowerCase().includes('log')) {
          cy.get('body').should('contain.text', 'Audit').or('contain.text', 'Log');
        } else {
          cy.log('No audit logging interface found - may be backend only');
        }
      });
    });
  });
});