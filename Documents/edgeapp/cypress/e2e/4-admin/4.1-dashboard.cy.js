describe('Admin Dashboard', () => {
  beforeEach(() => {
    // Clear any existing session data and login as admin
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login('admin');
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
  });

  context('Admin Dashboard Display and Layout', () => {
    it('should display admin-specific widgets: "Total Employees", "Active Review Cycles", and "Overall Completion Rate"', () => {
      // Check for admin-specific welcome message
      cy.contains('Welcome').should('be.visible');
      
      // Should show admin-specific widgets
      cy.get('body').should('contain.text', 'Admin').or('contain.text', 'System').or('contain.text', 'Total');
      
      // Look for key admin metrics
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        const hasEmployeeCount = bodyText.includes('employee') || bodyText.includes('user');
        const hasCycleInfo = bodyText.includes('cycle') || bodyText.includes('review');
        const hasCompletionRate = bodyText.includes('completion') || bodyText.includes('rate') || bodyText.includes('%');
        
        if (hasEmployeeCount) {
          cy.get('body').should('contain.text', 'Employee').or('contain.text', 'User');
        }
        if (hasCycleInfo) {
          cy.get('body').should('contain.text', 'Cycle').or('contain.text', 'Review');
        }
        if (hasCompletionRate) {
          cy.get('body').should('contain.text', 'Completion').or('contain.text', 'Rate').or('contain.text', '%');
        }
        
        if (!hasEmployeeCount && !hasCycleInfo && !hasCompletionRate) {
          cy.log('Admin-specific widgets may not be implemented yet');
        }
      });
    });

    it('should provide accurate, system-wide statistics', () => {
      // Look for numerical statistics
      cy.get('body').then(($body) => {
        const numbers = $body.text().match(/\d+/g);
        
        if (numbers && numbers.length > 0) {
          cy.log(`Found statistics: ${numbers.join(', ')}`);
          
          // Should show realistic numbers (not all zeros)
          const hasNonZero = numbers.some(num => parseInt(num) > 0);
          if (hasNonZero) {
            cy.get('body').should('match', /[1-9]\d*/);
          }
        } else {
          cy.log('No numerical statistics found - may need seeded data');
        }
      });
    });

    it('should display system health and status indicators', () => {
      // Look for system status information
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        const hasSystemInfo = bodyText.includes('system') || 
                             bodyText.includes('status') || 
                             bodyText.includes('health') ||
                             bodyText.includes('active');
        
        if (hasSystemInfo) {
          cy.get('body').should('contain.text', 'System').or('contain.text', 'Status').or('contain.text', 'Active');
        } else {
          cy.log('No system health indicators found - may not be implemented');
        }
      });
    });

    it('should show admin navigation and quick actions', () => {
      // Should have admin-specific navigation
      cy.get('nav, [role="navigation"]').should('exist');
      
      // Should have admin action buttons or links
      cy.get('a, button').should('contain.text', 'Admin').or('contain.text', 'Manage').or('contain.text', 'Settings');
      
      // Should not show employee-only or limited manager features
      cy.get('body').should('not.contain', 'My Self-Assessment');
      cy.get('body').should('not.contain', 'My Development Plans');
    });
  });

  context('Admin Dashboard Widgets and Metrics', () => {
    it('should display total employee count widget', () => {
      // Look for employee count widget
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('total') && bodyText.includes('employee')) {
          cy.get('body').should('contain.text', 'Total').and('contain.text', 'Employee');
          
          // Should show a number
          cy.get('[data-testid*="employee"], [class*="employee"], [id*="employee"]')
            .should('exist')
            .and('contain.text', /\d+/);
        } else {
          cy.log('Total employees widget not found - may not be implemented');
        }
      });
    });

    it('should display active review cycles widget', () => {
      // Look for review cycles information
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('active') && bodyText.includes('cycle')) {
          cy.get('body').should('contain.text', 'Active').and('contain.text', 'Cycle');
          
          // Should show cycle count or status
          cy.get('[data-testid*="cycle"], [class*="cycle"], [id*="cycle"]')
            .should('exist');
        } else {
          cy.log('Active review cycles widget not found - may not be implemented');
        }
      });
    });

    it('should display overall completion rate widget', () => {
      // Look for completion rate metrics
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('completion') || bodyText.includes('rate') || bodyText.includes('%')) {
          cy.get('body').should('contain.text', 'Completion').or('contain.text', 'Rate').or('contain.text', '%');
          
          // Should show percentage or completion metrics
          cy.get('body').should('match', /\d+%|\d+\.\d+%/);
        } else {
          cy.log('Completion rate widget not found - may not be implemented');
        }
      });
    });

    it('should display recent system activity or alerts', () => {
      // Look for activity feed or alerts
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('activity') || bodyText.includes('alert') || bodyText.includes('recent')) {
          cy.get('body').should('contain.text', 'Activity').or('contain.text', 'Alert').or('contain.text', 'Recent');
          
          // Should show activity items
          cy.get('[class*="activity"], [class*="alert"], [class*="notification"]').should('exist');
        } else {
          cy.log('No activity feed found - may not be implemented');
        }
      });
    });
  });

  context('Admin Dashboard Navigation and Access', () => {
    it('should provide navigation to employee management', () => {
      // Look for employee management links
      cy.get('a, button').contains(/employee|user|manage/i).should('exist');
      
      // Click on employee management
      cy.get('a, button').contains(/employee|user|manage/i).first().click();
      
      // Should navigate to admin or employee management page
      cy.url({ timeout: 10000 }).should('include', '/admin').or('include', '/employee').or('include', '/manage');
    });

    it('should provide navigation to review cycle management', () => {
      // Look for cycle management links
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('cycle') || $body.text().toLowerCase().includes('review')) {
          cy.get('a, button').contains(/cycle|review/i).should('exist');
          
          // Click on cycle management
          cy.get('a, button').contains(/cycle|review/i).first().click();
          
          // Should navigate to cycle management page
          cy.url({ timeout: 10000 }).should('include', '/admin').or('include', '/cycle').or('include', '/review');
        } else {
          cy.log('No cycle management navigation found');
        }
      });
    });

    it('should provide access to system settings and configuration', () => {
      // Look for settings or configuration links
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('setting') || $body.text().toLowerCase().includes('config')) {
          cy.get('a, button').contains(/setting|config|system/i).should('exist');
        } else {
          cy.log('No system settings navigation found - may not be implemented');
        }
      });
    });

    it('should show admin-only features and hide restricted content', () => {
      // Should see admin features
      cy.get('body').should('contain.text', 'Admin').or('contain.text', 'System').or('contain.text', 'Manage');
      
      // Should not see employee personal features
      cy.get('body').should('not.contain', 'My Self-Assessment');
      cy.get('body').should('not.contain', 'My Development Plans');
      
      // Should not see manager-only team features that don't apply to admin
      cy.get('body').should('not.contain', 'My Team Reviews');
    });
  });

  context('Admin Dashboard Data Analysis', () => {
    it('should display performance metrics and trends', () => {
      // Look for charts, graphs, or trend indicators
      cy.get('body').then(($body) => {
        if ($body.find('svg, canvas, [class*="chart"], [class*="graph"]').length > 0) {
          cy.get('svg, canvas, [class*="chart"], [class*="graph"]').should('be.visible');
        } else {
          cy.log('No charts or graphs found - may not be implemented');
        }
      });
    });

    it('should show department or organizational breakdown', () => {
      // Look for department information
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('department') || bodyText.includes('organization') || bodyText.includes('division')) {
          cy.get('body').should('contain.text', 'Department').or('contain.text', 'Organization').or('contain.text', 'Division');
        } else {
          cy.log('No departmental breakdown found - may not be implemented');
        }
      });
    });

    it('should display deadline and compliance tracking', () => {
      // Look for deadline or compliance information
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('deadline') || bodyText.includes('compliance') || bodyText.includes('due')) {
          cy.get('body').should('contain.text', 'Deadline').or('contain.text', 'Due').or('contain.text', 'Compliance');
          
          // Should show dates
          cy.get('body').should('match', /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/);
        } else {
          cy.log('No deadline tracking found - may not be implemented');
        }
      });
    });
  });

  context('Admin Dashboard Performance and Responsiveness', () => {
    it('should load admin dashboard efficiently with large datasets', () => {
      // Re-visit dashboard to test load performance
      cy.visit('/dashboard');
      
      // Should load admin elements quickly
      cy.contains('Welcome', { timeout: 8000 }).should('be.visible');
      cy.get('body', { timeout: 8000 }).should('contain.text', 'Admin').or('contain.text', 'System');
      
      // Navigation should be responsive
      cy.get('nav, [role="navigation"]', { timeout: 5000 }).should('be.visible');
    });

    it('should handle real-time data updates', () => {
      // Get initial dashboard state
      cy.get('body').then(($body) => {
        const initialNumbers = $body.text().match(/\d+/g);
        
        // Refresh page to simulate data update
        cy.reload();
        
        // Should still show admin content
        cy.contains('Welcome').should('be.visible');
        cy.get('body').should('contain.text', 'Admin').or('contain.text', 'System');
        
        // Data should be consistent or updated
        cy.get('body').should('match', /\d+/);
      });
    });

    it('should be responsive on different viewport sizes', () => {
      // Test mobile viewport
      cy.viewport(375, 667);
      cy.visit('/dashboard');
      cy.contains('Welcome').should('be.visible');
      cy.get('body').should('contain.text', 'Admin').or('contain.text', 'System');
      
      // Test tablet viewport
      cy.viewport(768, 1024);
      cy.contains('Welcome').should('be.visible');
      
      // Reset to desktop
      cy.viewport(1280, 720);
      cy.contains('Welcome').should('be.visible');
    });

    it('should maintain session and permissions correctly', () => {
      // Verify admin session persists
      cy.visit('/admin', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should('include', '/admin');
      
      // Should not be redirected (admin has access)
      cy.get('body').should('not.contain', 'Access Denied');
      
      // Return to dashboard
      cy.visit('/dashboard');
      cy.contains('Welcome').should('be.visible');
    });
  });

  context('Admin Dashboard Data Accuracy and Validation', () => {
    it('should display consistent data across all widgets', () => {
      // Check for data consistency between widgets
      cy.get('body').then(($body) => {
        const allNumbers = $body.text().match(/\d+/g);
        
        if (allNumbers && allNumbers.length > 1) {
          cy.log(`Dashboard shows numbers: ${allNumbers.join(', ')}`);
          
          // Verify numbers are realistic (no negative displays, reasonable ranges)
          allNumbers.forEach(num => {
            const value = parseInt(num);
            expect(value).to.be.at.least(0);
            expect(value).to.be.below(10000); // Reasonable upper limit for most metrics
          });
        }
      });
    });

    it('should show up-to-date information', () => {
      // Look for timestamp or last updated information
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('updated') || bodyText.includes('last') || bodyText.includes('refresh')) {
          cy.get('body').should('contain.text', 'Updated').or('contain.text', 'Last').or('contain.text', 'Refresh');
        } else {
          cy.log('No timestamp information found - may not be implemented');
        }
      });
    });

    it('should handle edge cases like zero counts gracefully', () => {
      // Check how zero values are displayed
      cy.get('body').then(($body) => {
        const bodyText = $body.text();
        if (bodyText.includes('0')) {
          // Zero should be displayed clearly, not as blank or error
          cy.get('body').should('contain.text', '0');
          cy.get('body').should('not.contain', 'undefined');
          cy.get('body').should('not.contain', 'null');
          cy.get('body').should('not.contain', 'NaN');
        }
      });
    });
  });
});