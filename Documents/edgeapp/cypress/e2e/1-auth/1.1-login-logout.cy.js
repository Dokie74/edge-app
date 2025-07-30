// cypress/e2e/1-auth/1.1-login-logout.cy.js

describe('Authentication', () => {
  
  context('UI Login Form', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('should allow a user to log in through the form', () => {
      cy.fixture('users').then((users) => {
        const user = users.employee;
        
        // This single test verifies the UI form works.
        cy.get('input[name="email"]', { timeout: 20000 })
          .should('be.visible')
          .and('not.be.disabled')
          .type(user.email, { delay: 50 });

        cy.get('input[name="password"]').type(user.password, { delay: 50 });
        cy.get('button[type="submit"]').click();
        
        cy.url({ timeout: 15000 }).should('include', '/dashboard');
        cy.contains('Welcome,').should('be.visible');
      });
    });

    it('should show an error for invalid credentials via the form', () => {
      cy.get('input[name="email"]', { timeout: 20000 })
        .should('be.visible')
        .and('not.be.disabled')
        .type('wrong@email.com');

      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.contains('Invalid login credentials').should('be.visible');
    });
  });

  context('Programmatic Login and Logout', () => {
    it('should be able to log in as an employee via API', () => {
      // This test logs in programmatically, bypassing the flaky UI.
      cy.loginByApi('employee');
      cy.visit('/dashboard');
      
      cy.contains('Welcome,').should('be.visible');
      cy.contains('Admin Dashboard').should('not.exist');
    });

    it('should be able to log in as an admin via API', () => {
      cy.loginByApi('admin');
      cy.visit('/dashboard');

      cy.contains('Admin Dashboard').should('be.visible');
    });

    it('should be able to log out after an API login', () => {
      cy.loginByApi('employee');
      cy.visit('/dashboard');

      // You will need to replace 'Logout' with the actual text or selector for your logout button.
      cy.contains('button', /Logout|Sign Out/i).click(); 

      cy.url({ timeout: 15000 }).should('not.include', '/dashboard');
      cy.get('input[name="email"]').should('be.visible');
    });
  });
});