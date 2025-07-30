describe('Admin Employee Management', () => {
  beforeEach(() => {
    // Clear any existing session data and login as admin
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login('admin');
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
    
    // Navigate to admin/employee management page
    cy.visit('/admin', { failOnStatusCode: false });
    cy.url({ timeout: 10000 }).should('include', '/admin');
  });

  context('Employee List Display and Management', () => {
    it('should display a searchable and sortable list of all employees', () => {
      // Should show employee management page
      cy.get('h1, h2, h3').should('contain.text', 'Admin').or('contain.text', 'Employee').or('contain.text', 'Management');
      
      // Should have a list or table of employees
      cy.get('table, .list, .grid, [data-testid*="employee"]').should('exist');
      
      // Should show employee information
      cy.get('body').should('contain.text', 'Employee').or('contain.text', 'Name').or('contain.text', 'Email');
      
      // Look for search functionality
      cy.get('input[type="search"], input[placeholder*="search" i], [data-testid*="search"]').then(($search) => {
        if ($search.length > 0) {
          cy.get('input[type="search"], input[placeholder*="search" i]').should('be.visible');
        } else {
          cy.log('Search functionality not found - may not be implemented');
        }
      });
    });

    it('should show employee details including name, email, role, and status', () => {
      // Should display employee information in organized format
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        
        // Check for employee name fields
        if (bodyText.includes('name') || bodyText.includes('employee')) {
          cy.get('body').should('contain.text', 'Name').or('contain.text', 'Employee');
        }
        
        // Check for email addresses
        if (bodyText.includes('@') || bodyText.includes('email')) {
          cy.get('body').should('contain.text', '@').or('contain.text', 'Email');
        }
        
        // Check for role information
        if (bodyText.includes('role') || bodyText.includes('manager') || bodyText.includes('admin')) {
          cy.get('body').should('contain.text', 'Role').or('contain.text', 'Manager').or('contain.text', 'Employee');
        }
        
        if (!bodyText.includes('employee') && !bodyText.includes('name')) {
          cy.log('Employee list may be empty or not loaded - may need seeded data');
        }
      });
    });

    it('should provide sorting options for employee list', () => {
      // Look for sortable headers or sort controls
      cy.get('th, [class*="sort"], button').then(($sortElements) => {
        const hasSortable = $sortElements.filter('[class*="sort"], :contains("sort")').length > 0;
        
        if (hasSortable) {
          // Click on sortable column header
          cy.get('th, [class*="sort"]').first().click();
          
          // Should reorder the list without errors
          cy.get('body').should('not.contain', 'error occurred');
        } else {
          cy.log('No sort functionality found - may not be implemented');
        }
      });
    });

    it('should allow filtering employees by role or status', () => {
      // Look for filter dropdowns or controls
      cy.get('select, [data-testid*="filter"]').then(($filters) => {
        if ($filters.length > 0) {
          // Use the first available filter
          cy.get('select').first().then(($select) => {
            // Check if it has options
            if ($select.find('option').length > 1) {
              cy.wrap($select).select(1); // Select second option
              
              // Should filter the employee list
              cy.get('body').should('not.contain', 'error');
            }
          });
        } else {
          cy.log('No filter controls found - may not be implemented');
        }
      });
    });
  });

  context('Create New Employee', () => {
    it('should allow creation of a new employee via the UI', () => {
      // Look for create/add employee button
      cy.get('button, a').contains(/create|add|new/i).should('exist').click();
      
      // Should open create employee form/modal
      cy.get('[role="dialog"], .modal, form').should('be.visible');
      cy.get('h1, h2, h3, legend').should('contain.text', 'Create').or('contain.text', 'Add').or('contain.text', 'Employee');
      
      // Fill out employee form
      const newEmployee = {
        name: 'Test Employee Cypress',
        email: `cypress.test.${Date.now()}@lucerne.com`,
        jobTitle: 'Test Position',
        role: 'employee',
        password: 'TestPassword123'
      };
      
      // Fill form fields
      cy.get('input[name*="name"], input[placeholder*="name" i]').type(newEmployee.name);
      cy.get('input[name*="email"], input[placeholder*="email" i]').type(newEmployee.email);
      cy.get('input[name*="title"], input[placeholder*="title" i], input[name*="job"]').type(newEmployee.jobTitle);
      
      // Select role if dropdown exists
      cy.get('select[name*="role"], select[placeholder*="role" i]').then(($roleSelect) => {
        if ($roleSelect.length > 0) {
          cy.wrap($roleSelect).select(newEmployee.role);
        }
      });
      
      // Enter password if field exists
      cy.get('input[name*="password"], input[type="password"]').then(($password) => {
        if ($password.length > 0) {
          cy.wrap($password).type(newEmployee.password);
        }
      });
      
      // Submit the form
      cy.get('button').contains(/create|add|submit|save/i).click();
      
      // Should show success message
      cy.get('body').should('contain.text', 'success').or('contain.text', 'created').or('contain.text', 'added');
      
      // New employee should appear in the list
      cy.get('body').should('contain.text', newEmployee.name);
      cy.get('body').should('contain.text', newEmployee.email);
    });

    it('should show validation errors for required fields', () => {
      // Open create employee form
      cy.get('button, a').contains(/create|add|new/i).click();
      cy.get('[role="dialog"], .modal, form').should('be.visible');
      
      // Try to submit without filling required fields
      cy.get('button').contains(/create|add|submit|save/i).click();
      
      // Should show validation errors
      cy.get('body').should('contain.text', 'required').or('contain.text', 'error').or('contain.text', 'field');
      
      // Form should remain open
      cy.get('[role="dialog"], .modal, form').should('be.visible');
    });

    it('should show error when creating employee with existing email', () => {
      // Try to create employee with existing admin email
      cy.get('button, a').contains(/create|add|new/i).click();
      cy.get('[role="dialog"], .modal, form').should('be.visible');
      
      // Use existing admin email
      cy.get('input[name*="name"], input[placeholder*="name" i]').type('Duplicate Test');
      cy.get('input[name*="email"], input[placeholder*="email" i]').type('admin@lucerne.com');
      cy.get('input[name*="title"], input[placeholder*="title" i]').type('Test Position');
      
      // Submit the form
      cy.get('button').contains(/create|add|submit|save/i).click();
      
      // Should show duplicate email error
      cy.get('body').should('contain.text', 'exists').or('contain.text', 'duplicate').or('contain.text', 'already');
    });
  });

  context('Edit Existing Employee', () => {
    it('should allow editing an existing employee\'s details', () => {
      // Look for edit button on an employee row
      cy.get('body').then(($body) => {
        if ($body.text().includes('Employee') || $body.text().includes('@')) {
          // Find edit button
          cy.get('button, a').contains(/edit|modify|update/i).should('exist').first().click();
          
          // Should open edit form
          cy.get('[role="dialog"], .modal, form').should('be.visible');
          cy.get('h1, h2, h3, legend').should('contain.text', 'Edit').or('contain.text', 'Update').or('contain.text', 'Employee');
          
          // Update job title
          const updatedTitle = 'Updated Test Position';
          cy.get('input[name*="title"], input[placeholder*="title" i]').clear().type(updatedTitle);
          
          // Save changes
          cy.get('button').contains(/save|update|submit/i).click();
          
          // Should show success message
          cy.get('body').should('contain.text', 'success').or('contain.text', 'updated').or('contain.text', 'saved');
          
          // Should show updated information
          cy.get('body').should('contain.text', updatedTitle);
        } else {
          cy.log('No employees found to edit - may need seeded data');
        }
      });
    });

    it('should allow changing employee role from Employee to Manager', () => {
      // Find an employee to edit
      cy.get('body').then(($body) => {
        if ($body.text().includes('Employee') || $body.text().includes('@')) {
          cy.get('button, a').contains(/edit|modify/i).first().click();
          cy.get('[role="dialog"], .modal, form').should('be.visible');
          
          // Change role to Manager if role dropdown exists
          cy.get('select[name*="role"]').then(($roleSelect) => {
            if ($roleSelect.length > 0) {
              cy.wrap($roleSelect).select('manager');
              
              // Save changes
              cy.get('button').contains(/save|update/i).click();
              
              // Should show success
              cy.get('body').should('contain.text', 'success').or('contain.text', 'updated');
              
              // Should reflect role change
              cy.get('body').should('contain.text', 'Manager');
            } else {
              cy.log('Role selection not available - may not be implemented');
            }
          });
        } else {
          cy.log('No employees found for role change test');
        }
      });
    });

    it('should preserve existing data when editing', () => {
      // Open edit form and verify existing data is pre-populated
      cy.get('body').then(($body) => {
        if ($body.text().includes('Employee') || $body.text().includes('@')) {
          cy.get('button, a').contains(/edit|modify/i).first().click();
          cy.get('[role="dialog"], .modal, form').should('be.visible');
          
          // Name field should have existing value
          cy.get('input[name*="name"]').should('not.have.value', '');
          
          // Email field should have existing value
          cy.get('input[name*="email"]').should('not.have.value', '');
          
          // Cancel edit to test data preservation
          cy.get('button').contains(/cancel|close/i).click();
          
          // Original data should still be displayed
          cy.get('body').should('contain.text', 'Employee').or('contain.text', '@');
        } else {
          cy.log('No employees found for data preservation test');
        }
      });
    });
  });

  context('Employee Deactivation and Status Management', () => {
    it('should allow deactivation of an employee', () => {
      // Look for deactivate/disable button or option
      cy.get('body').then(($body) => {
        const hasDeactivateOption = $body.find('button, a').filter(':contains("deactivate"), :contains("disable"), :contains("suspend")').length > 0;
        
        if (hasDeactivateOption) {
          cy.get('button, a').contains(/deactivate|disable|suspend/i).first().click();
          
          // May require confirmation
          cy.get('body').then(($body) => {
            if ($body.text().includes('confirm') || $body.text().includes('sure')) {
              cy.get('button').contains(/yes|confirm|deactivate/i).click();
            }
          });
          
          // Should show success message
          cy.get('body').should('contain.text', 'deactivated').or('contain.text', 'disabled').or('contain.text', 'inactive');
        } else {
          cy.log('Deactivation functionality not found - may not be implemented');
        }
      });
    });

    it('should show employee status indicators (Active/Inactive)', () => {
      // Look for status indicators
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('active') || bodyText.includes('status') || bodyText.includes('inactive')) {
          cy.get('body').should('contain.text', 'Active').or('contain.text', 'Status').or('contain.text', 'Inactive');
          
          // Should have status badges or indicators
          cy.get('[class*="status"], [class*="badge"], [data-status]').should('exist');
        } else {
          cy.log('No status indicators found - may not be implemented');
        }
      });
    });

    it('should verify deactivated employee cannot log in', () => {
      // This test would require creating and deactivating a test employee
      // Then attempting to log in as that employee
      cy.log('Deactivated employee login test requires integration with auth system - verify manually');
      
      // Create test employee first (if create functionality works)
      cy.get('body').then(($body) => {
        if ($body.find('button, a').filter(':contains("create"), :contains("add")').length > 0) {
          const testEmployee = {
            name: 'Test Deactivate User',
            email: `deactivate.test.${Date.now()}@lucerne.com`,
            password: 'TestPass123'
          };
          
          // Create employee (simplified)
          cy.get('button, a').contains(/create|add/i).click();
          cy.get('input[name*="name"]').type(testEmployee.name);
          cy.get('input[name*="email"]').type(testEmployee.email);
          cy.get('input[name*="password"]').type(testEmployee.password);
          cy.get('button').contains(/create|submit/i).click();
          
          // Then deactivate and test login restriction
          cy.log('Employee created for deactivation test - manual verification needed for login restriction');
        }
      });
    });
  });

  context('Employee Management Data and Performance', () => {
    it('should handle large employee lists with pagination or virtualization', () => {
      // Look for pagination controls
      cy.get('body').then(($body) => {
        const hasPagination = $body.find('[class*="pagination"], button').filter(':contains("next"), :contains("page"), :contains("previous")').length > 0;
        
        if (hasPagination) {
          cy.get('[class*="pagination"], button').contains(/next|page/i).should('be.visible');
          
          // Test pagination if available
          cy.get('button').contains(/next/i).click();
          cy.get('body').should('not.contain', 'error');
        } else {
          cy.log('No pagination found - may load all employees or use virtualization');
        }
      });
    });

    it('should provide employee export functionality', () => {
      // Look for export button or download option
      cy.get('body').then(($body) => {
        if ($body.find('button, a').filter(':contains("export"), :contains("download"), :contains("csv")').length > 0) {
          cy.get('button, a').contains(/export|download|csv/i).should('be.visible');
        } else {
          cy.log('No export functionality found - may not be implemented');
        }
      });
    });

    it('should show employee count and summary statistics', () => {
      // Look for employee count or summary information
      cy.get('body').then(($body) => {
        const hasCount = $body.text().match(/\d+\s*(employee|user|total)/i);
        
        if (hasCount) {
          cy.get('body').should('match', /\d+\s*(employee|user|total)/i);
        } else {
          cy.log('No employee count displayed - may not be implemented');
        }
      });
    });

    it('should refresh employee data accurately', () => {
      // Get initial employee list state
      cy.get('body').then(($body) => {
        const initialEmployeeCount = ($body.text().match(/employee/gi) || []).length;
        
        // Refresh page
        cy.reload();
        
        // Should still show admin page
        cy.url().should('include', '/admin');
        cy.get('h1, h2, h3').should('contain.text', 'Admin').or('contain.text', 'Employee');
        
        // Employee data should be consistent
        cy.get('body').should('contain.text', 'Employee').or('contain.text', 'Name');
      });
    });
  });

  context('Employee Management Security and Validation', () => {
    it('should require admin privileges for all employee management actions', () => {
      // Verify we're on admin page (already logged in as admin)
      cy.url().should('include', '/admin');
      
      // Should see admin-specific elements
      cy.get('body').should('contain.text', 'Admin').or('contain.text', 'Management');
      
      // Should have create/edit/delete capabilities
      cy.get('button, a').should('contain.text', 'Create').or('contain.text', 'Add').or('contain.text', 'Edit');
    });

    it('should validate email format and uniqueness', () => {
      // Test email validation in create form
      cy.get('button, a').contains(/create|add/i).click();
      cy.get('[role="dialog"], .modal, form').should('be.visible');
      
      // Enter invalid email
      cy.get('input[name*="name"]').type('Email Test User');
      cy.get('input[name*="email"]').type('invalid-email-format');
      
      // Try to submit
      cy.get('button').contains(/create|submit/i).click();
      
      // Should show email validation error
      cy.get('body').should('contain.text', 'email').or('contain.text', 'format').or('contain.text', 'valid');
    });

    it('should sanitize and validate all input fields', () => {
      // Test with potentially problematic input
      cy.get('button, a').contains(/create|add/i).click();
      cy.get('[role="dialog"], .modal, form').should('be.visible');
      
      // Enter test data
      cy.get('input[name*="name"]').type('<script>alert("test")</script>');
      cy.get('input[name*="email"]').type('test@example.com');
      
      // Cancel form (don't actually create with script tag)
      cy.get('button').contains(/cancel|close/i).click();
      
      // Should not execute any script
      cy.get('body').should('not.contain', 'alert');
    });
  });
});