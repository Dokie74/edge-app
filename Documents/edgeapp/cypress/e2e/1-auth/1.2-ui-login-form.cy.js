// Filename: cypress/e2e/1-auth/1.2-ui-login-form.cy.js
// Purpose: A single, isolated test for the UI form. This test may remain flaky,
// but it will no longer block the rest of our testing.

describe('UI Login Form', () => {
  it('should allow a user to log in through the form', () => {
    cy.visit('/');
    cy.fixture('users').then((users) => {
      const user = users.employee;
      
      // We give this test a very long timeout and add delays to try and survive
      // the flaky re-renders of the Supabase component.
      cy.get('input[name="email"]', { timeout: 20000 })
        .should('be.visible')
        .and('be.enabled')
        .type(user.email, { delay: 100 });

      cy.get('input[name="password"]').type(user.password, { delay: 100 });
      cy.get('button[type="submit"]').click();
      
      cy.url({ timeout: 20000 }).should('include', '/dashboard');
      cy.contains('Welcome,').should('be.visible');
    });
  });
});