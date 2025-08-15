// Enhanced login command with session caching and API monitoring
Cypress.Commands.add('login', (role = 'employee') => {
  cy.session([role], () => {
    cy.fixture('users').then((users) => {
      const user = users[role];
      if (!user) {
        throw new Error(`User role "${role}" not found in fixtures/users.json`);
      }

      const supabaseUrl = Cypress.env('SUPABASE_URL') || 'https://blssdohlfcmyhxtpalcf.supabase.co';
      const supabaseAnonKey = Cypress.env('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsc3Nkb2hsZmNteWh4dHBhbGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzY2MDUsImV4cCI6MjA2OTMxMjYwNX0.9rdfNgKhcTcru1KpBPUFCLNcxgc3aasQq7WT-9hAPvM';
      
      cy.request({
        method: 'POST',
        url: `${supabaseUrl}/auth/v1/token?grant_type=password`,
        body: {
          email: user.email,
          password: user.password,
        },
        headers: {
          'apikey': supabaseAnonKey,
        }
      }).then(({ body }) => {
        const session = body;
        const projectRef = supabaseUrl.split('.')[0].replace('https://', '');
        const localStorageKey = `sb-${projectRef}-auth-token`;
        
        // Set up localStorage with session data
        cy.window().then((win) => {
          win.localStorage.setItem(localStorageKey, JSON.stringify(session));
        });
      });
    });
  });
});

// Setup comprehensive API interception for EDGE app
Cypress.Commands.add('setupApiInterception', () => {
  // Auth endpoints
  cy.intercept('POST', '**/auth/v1/token**').as('authLogin');
  cy.intercept('POST', '**/auth/v1/logout**').as('authLogout');
  
  // Core data endpoints
  cy.intercept('GET', '**/rest/v1/employees**').as('getEmployees');
  cy.intercept('GET', '**/rest/v1/assessments**').as('getAssessments');
  cy.intercept('POST', '**/rest/v1/assessments**').as('createAssessment');
  cy.intercept('PATCH', '**/rest/v1/assessments**').as('updateAssessment');
  
  // Development plans
  cy.intercept('GET', '**/rest/v1/development_plans**').as('getDevelopmentPlans');
  cy.intercept('POST', '**/rest/v1/development_plans**').as('createDevelopmentPlan');
  
  // Review cycles
  cy.intercept('GET', '**/rest/v1/review_cycles**').as('getReviewCycles');
  
  // Team health and pulse
  cy.intercept('GET', '**/rest/v1/team_health_pulse_responses**').as('getPulseResponses');
  cy.intercept('POST', '**/rest/v1/team_health_pulse_responses**').as('submitPulseResponse');
  
  // Notifications and feedback
  cy.intercept('GET', '**/rest/v1/notifications**').as('getNotifications');
  cy.intercept('GET', '**/rest/v1/feedback**').as('getFeedback');
  cy.intercept('POST', '**/rest/v1/feedback**').as('createFeedback');
  
  // Kudos system
  cy.intercept('GET', '**/rest/v1/kudos**').as('getKudos');
  cy.intercept('POST', '**/rest/v1/kudos**').as('createKudos');
});

// Wait for role-specific dashboard to load
Cypress.Commands.add('waitForRoleBasedDashboard', (role) => {
  cy.visit('/dashboard');
  
  switch (role) {
    case 'admin':
      cy.contains('Admin Dashboard', { timeout: 15000 }).should('be.visible');
      break;
    case 'manager':
      cy.contains('Manager Dashboard', { timeout: 15000 }).should('be.visible');
      break;
    case 'employee':
    default:
      cy.contains('Welcome,', { timeout: 15000 }).should('be.visible');
      cy.contains('Admin Dashboard').should('not.exist');
      break;
  }
});

// Verify user doesn't see unauthorized content
Cypress.Commands.add('verifyNoUnauthorizedContent', (role) => {
  const restrictedContent = {
    employee: [
      'Admin Dashboard',
      'Employee Management',
      'System Settings',
      'Team Management',
      'Review Cycle Management'
    ],
    manager: [
      'Admin Dashboard',
      'System Settings',
      'Employee Management'
    ],
    admin: [] // Admin can see everything
  };
  
  const restricted = restrictedContent[role] || [];
  restricted.forEach(content => {
    cy.get('body').should('not.contain', content);
  });
});

// Custom selector validation for data-cy attributes
Cypress.Commands.add('getByDataCy', (selector) => {
  return cy.get(`[data-cy="${selector}"]`);
});

// Validate critical elements have data-cy selectors
Cypress.Commands.add('validateDataCySelectors', () => {
  const criticalSelectors = ['button', 'input[type="submit"]', 'a[href]', '[role="button"]'];
  
  criticalSelectors.forEach(selector => {
    cy.get(selector).each(($el) => {
      if (!$el.attr('data-cy') && !$el.attr('data-testid')) {
        cy.log(`Warning: Missing data-cy on ${selector} - "${$el.text().slice(0, 30)}"`);
      }
    });
  });
});

// Enhanced TypeScript declarations
declare global {
  namespace Cypress {
    interface Chainable {
      login(role?: 'employee' | 'manager' | 'admin'): Chainable<void>;
      setupApiInterception(): Chainable<void>;
      waitForRoleBasedDashboard(role: 'employee' | 'manager' | 'admin'): Chainable<void>;
      verifyNoUnauthorizedContent(role: 'employee' | 'manager' | 'admin'): Chainable<void>;
      getByDataCy(selector: string): Chainable<JQuery<HTMLElement>>;
      validateDataCySelectors(): Chainable<void>;
    }
  }
}