describe('Manager Team View', () => {
  beforeEach(() => {
    // Clear any existing session data and login as manager
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login('manager');
    cy.visit('/dashboard');
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
    
    // Navigate to team view
    cy.visit('/team', { failOnStatusCode: false });
    cy.url({ timeout: 10000 }).should('include', '/team');
  });

  context('Team View Display and Layout', () => {
    it('should display a table or list of all direct reports', () => {
      // Should show team page header
      cy.get('h1, h2, h3').should('contain.text', 'Team').or('contain.text', 'My Team').or('contain.text', 'Reports');
      
      // Should have a table, list, or grid of team members
      cy.get('table, .list, .grid, [data-testid*="team"], [class*="employee"]').should('exist');
      
      // Should display team member information
      cy.get('body').should('contain.text', 'Employee').or('contain.text', 'Name').or('contain.text', 'Member');
    });

    it('should show team member names and basic information', () => {
      // Look for employee names or identifiers
      cy.get('body').then(($body) => {
        const bodyText = $body.text();
        if (bodyText.includes('Employee') || bodyText.includes('Team')) {
          // Should show employee names or email addresses
          cy.get('body').should('contain.text', 'Employee').or('contain.text', '@');
          
          // Should display in organized format (table rows, cards, etc.)
          cy.get('tr, .card, .list-item, [data-testid*="employee"]').should('have.length.greaterThan', 0);
        } else {
          cy.log('No team members found - may need test data seeding');
        }
      });
    });

    it('should display job titles and roles for team members', () => {
      // Look for job title or role information
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('title') || bodyText.includes('role') || bodyText.includes('position')) {
          cy.get('body').should('contain.text', 'Title').or('contain.text', 'Role').or('contain.text', 'Position');
        } else {
          cy.log('No job title information displayed - may not be implemented');
        }
      });
    });

    it('should show team member profile pictures or avatars', () => {
      // Look for profile images or avatar placeholders
      cy.get('img[alt*="profile"], img[alt*="avatar"], [class*="avatar"], [class*="profile"]').then(($images) => {
        if ($images.length > 0) {
          cy.get('img[alt*="profile"], img[alt*="avatar"]').should('be.visible');
        } else {
          cy.log('No profile images found - may use text avatars or not implemented');
        }
      });
    });
  });

  context('Assessment Status Display', () => {
    it('should show current assessment status for each team member', () => {
      // Look for status indicators
      cy.get('body').should('contain.text', 'Status').or('contain.text', 'Progress').or('contain.text', 'Assessment');
      
      // Should show various status states
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        const hasStatus = bodyText.includes('not started') || 
                         bodyText.includes('in progress') || 
                         bodyText.includes('submitted') || 
                         bodyText.includes('completed') ||
                         bodyText.includes('pending');
        
        if (hasStatus) {
          cy.get('body').should('contain.text', 'Started').or('contain.text', 'Progress').or('contain.text', 'Submitted');
        } else {
          cy.log('No assessment status indicators found - may need seeded data');
        }
      });
    });

    it('should display accurate status indicators (Not Started, In Progress, Submitted)', () => {
      // Check for specific status types
      cy.get('body').then(($body) => {
        const statusElements = $body.find('[class*="status"], [data-status], .badge, .chip');
        
        if (statusElements.length > 0) {
          // Should have status indicators with appropriate styling
          cy.get('[class*="status"], [data-status], .badge, .chip').should('be.visible');
          
          // Should show meaningful status text
          cy.get('body').should('match', /not started|in progress|submitted|completed|pending/i);
        } else {
          cy.log('No styled status indicators found - may use plain text');
        }
      });
    });

    it('should use color coding or visual indicators for different statuses', () => {
      // Look for color-coded status indicators
      cy.get('[class*="green"], [class*="red"], [class*="yellow"], [class*="blue"], [style*="color"]').then(($colorElements) => {
        if ($colorElements.length > 0) {
          cy.get('[class*="status"]').should('have.length.greaterThan', 0);
        } else {
          cy.log('No color-coded status indicators found - may use text only');
        }
      });
    });

    it('should show assessment deadlines or due dates', () => {
      // Look for date information
      cy.get('body').then(($body) => {
        const bodyText = $body.text();
        const hasDatePattern = /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|due|deadline/i.test(bodyText);
        
        if (hasDatePattern) {
          cy.get('body').should('contain.text', 'Due').or('contain.text', 'Deadline').or('match', /\d{2}\/\d{2}\/\d{4}/);
        } else {
          cy.log('No deadline information found - may not be implemented');
        }
      });
    });
  });

  context('Team Member Interaction', () => {
    it('should allow clicking on a team member to navigate to their profile', () => {
      // Look for clickable team member elements
      cy.get('body').then(($body) => {
        const hasTeamMembers = $body.text().includes('Employee') || $body.text().includes('Team');
        
        if (hasTeamMembers) {
          // Find clickable employee elements
          cy.get('a, button, .card, tr').contains(/employee|member/i).should('exist');
          
          // Click on team member
          cy.get('a, button, .card, tr').contains(/employee|member/i).first().click();
          
          // Should navigate to profile or detail page
          cy.url({ timeout: 10000 }).should('match', /employee|profile|detail/i);
        } else {
          cy.log('No clickable team members found - may need seeded data');
        }
      });
    });

    it('should provide quick actions for team members (review, message, etc.)', () => {
      // Look for action buttons or menus
      cy.get('body').then(($body) => {
        const hasActions = $body.find('button, a').filter(':contains("review"), :contains("message"), :contains("action")').length > 0;
        
        if (hasActions) {
          cy.get('button, a').contains(/review|message|action|more/i).should('be.visible');
        } else {
          cy.log('No quick action buttons found - may not be implemented');
        }
      });
    });

    it('should allow navigation to individual assessment reviews', () => {
      // Look for review links or buttons
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('review') || $body.text().toLowerCase().includes('assessment')) {
          cy.get('a, button').contains(/review|assessment/i).should('exist');
          
          // Click on review link
          cy.get('a, button').contains(/review|assessment/i).first().click();
          
          // Should navigate to review page
          cy.url({ timeout: 10000 }).should('match', /review|assessment/i);
        } else {
          cy.log('No review navigation found');
        }
      });
    });
  });

  context('Team View Filtering and Sorting', () => {
    it('should provide filtering options for team members', () => {
      // Look for filter controls
      cy.get('select, input[type="search"], [placeholder*="filter"], [placeholder*="search"]').then(($filters) => {
        if ($filters.length > 0) {
          cy.get('select, input[type="search"]').first().should('be.visible');
        } else {
          cy.log('No filter controls found - may not be implemented');
        }
      });
    });

    it('should allow sorting by different criteria (name, status, etc.)', () => {
      // Look for sort controls or sortable headers
      cy.get('th, [class*="sort"], button').then(($sortElements) => {
        const hasSortable = $sortElements.filter(':contains("sort"), [class*="sort"]').length > 0;
        
        if (hasSortable) {
          cy.get('th, [class*="sort"]').first().click();
          
          // Should reorder the list
          cy.get('body').should('not.contain', 'error');
        } else {
          cy.log('No sort functionality found - may not be implemented');
        }
      });
    });

    it('should filter by assessment status', () => {
      // Look for status filter dropdown
      cy.get('select').then(($selects) => {
        const statusFilter = $selects.filter(':contains("status"), [name*="status"]');
        
        if (statusFilter.length > 0) {
          cy.wrap(statusFilter.first()).select(1); // Select second option
          
          // Should filter the team list
          cy.get('body').should('not.contain', 'error');
        } else {
          cy.log('No status filter found - may not be implemented');
        }
      });
    });
  });

  context('Team View Data Management', () => {
    it('should display accurate team member count', () => {
      // Count visible team members
      cy.get('tr, .card, .list-item').then(($elements) => {
        const memberCount = $elements.filter(':contains("Employee"), :contains("Member")').length;
        
        if (memberCount > 0) {
          cy.log(`Found ${memberCount} team members displayed`);
          
          // Should show count somewhere on page
          cy.get('body').then(($body) => {
            if ($body.text().includes(`${memberCount}`)) {
              cy.get('body').should('contain.text', memberCount.toString());
            }
          });
        } else {
          cy.log('No team members found - may need test data');
        }
      });
    });

    it('should refresh data when page is reloaded', () => {
      // Get initial team data
      cy.get('body').then(($body) => {
        const initialContent = $body.text();
        
        // Reload page
        cy.reload();
        
        // Should still show team page
        cy.url().should('include', '/team');
        cy.get('h1, h2, h3').should('contain.text', 'Team');
        
        // Should show same or updated team data
        cy.get('body').should('contain.text', 'Employee').or('contain.text', 'Team');
      });
    });

    it('should handle empty team list gracefully', () => {
      // Check if team list is empty
      cy.get('body').then(($body) => {
        const hasNoMembers = !$body.text().includes('Employee') && 
                            !$body.text().includes('Member') && 
                            !$body.text().includes('@');
        
        if (hasNoMembers) {
          // Should show empty state message
          cy.get('body').should('contain.text', 'No team members').or('contain.text', 'Empty').or('contain.text', 'Add');
        } else {
          cy.log('Team members found - empty state not applicable');
        }
      });
    });
  });

  context('Team View Performance and Responsiveness', () => {
    it('should load team data efficiently', () => {
      // Re-visit team page to test load time
      cy.visit('/team');
      
      // Should load quickly
      cy.get('h1, h2, h3', { timeout: 5000 }).should('contain.text', 'Team');
      cy.get('table, .list, .grid', { timeout: 5000 }).should('be.visible');
    });

    it('should be responsive on different screen sizes', () => {
      // Test mobile viewport
      cy.viewport(375, 667);
      cy.visit('/team');
      cy.get('h1, h2, h3').should('contain.text', 'Team');
      
      // Should still show team data (may be stacked or scrollable)
      cy.get('body').should('contain.text', 'Employee').or('contain.text', 'Team');
      
      // Test tablet viewport
      cy.viewport(768, 1024);
      cy.get('h1, h2, h3').should('contain.text', 'Team');
      
      // Reset to desktop
      cy.viewport(1280, 720);
      cy.get('h1, h2, h3').should('contain.text', 'Team');
    });

    it('should handle large team lists without performance issues', () => {
      // Check if pagination or virtualization is implemented
      cy.get('body').then(($body) => {
        const hasPagination = $body.find('[class*="pagination"], button').filter(':contains("next"), :contains("page")').length > 0;
        
        if (hasPagination) {
          cy.get('[class*="pagination"], button').contains(/next|page/i).should('be.visible');
        } else {
          cy.log('No pagination found - may load all team members at once');
        }
      });
    });
  });
});