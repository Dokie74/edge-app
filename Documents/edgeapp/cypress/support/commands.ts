Cypress.Commands.add('login', (role = 'employee') => {
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
      
      // Set the session token in localStorage
      window.localStorage.setItem(localStorageKey, JSON.stringify(session));
    });
  });
});

// Add this declaration to make TypeScript happy
declare global {
  namespace Cypress {
    interface Chainable {
      login(role?: 'employee' | 'manager' | 'admin'): Chainable<void>;
    }
  }
}