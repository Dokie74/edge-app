// Filename: cypress/e2e/1-auth/1.1-programmatic-login.cy.js
// Purpose: Tests login functionality programmatically for speed and stability.

describe('Programmatic Authentication', () => {
  it('should be able to log in as an employee', () => {
    // This command now handles the entire login flow via API.
    cy.login('employee');
    cy.visit('/dashboard');
    
    cy.contains('Welcome,', { timeout: 15000 }).should('be.visible');
    cy.contains('Admin Dashboard').should('not.exist');
  });

  it('should be able to log in as an admin', () => {
    cy.login('admin');
    cy.visit('/dashboard');

    cy.contains('Admin Dashboard', { timeout: 15000 }).should('be.visible');
  });

  it('should be able to log out', () => {
    cy.login('employee');
    cy.visit('/dashboard');

    // Replace 'Logout' with your actual logout button's text or selector if different
    cy.contains('button', /Logout|Sign Out/i).click();

    // After logout, we should be back on the login page
    cy.get('input[name="email"]', { timeout: 15000 }).should('be.visible');
  });
});