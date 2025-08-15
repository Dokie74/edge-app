# EDGE Performance Management - E2E Test Strategy

## Executive Summary
This document outlines the comprehensive testing strategy for the EDGE Performance Management application using Cypress E2E testing framework. The strategy focuses on business-critical user journeys, role-based access control, and data integrity across the performance review lifecycle.

## Application Context

### Technology Stack
- **Frontend:** React 18 + TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **State Management:** React Context API with useReducer
- **Authentication:** Supabase Auth with JWT tokens
- **Deployment:** Vercel (Static hosting)

### User Roles & Responsibilities
| Role | Key Responsibilities | Critical Journeys |
|------|---------------------|-------------------|
| **Employee** | Complete assessments, create development plans, submit feedback | Self-assessment workflow, development planning |
| **Manager** | Review team assessments, approve development plans, provide feedback | Team review process, manager approval workflows |
| **Admin** | Manage employees, configure review cycles, system administration | User management, cycle activation, system configuration |

## Risk Assessment & Test Prioritization

### P0 - Business Critical (Must Pass Before Release)
1. **Authentication & Authorization**
   - User login/logout across all roles
   - Role-based dashboard access control
   - Session management and token refresh

2. **Assessment Workflow**
   - Employee self-assessment completion
   - Assessment data persistence and validation
   - Manager review and approval process

3. **Data Integrity**
   - Assessment responses saved correctly
   - Development plan creation and approval
   - Manager-employee relationships maintained

### P1 - User Experience Critical (Should Pass)
1. **Navigation & UI**
   - Role-specific navigation elements
   - Modal functionality (create employee, development plans)
   - Responsive design across viewports

2. **Development Plans**
   - Plan creation and goal setting
   - Manager review and feedback workflow
   - Plan status tracking and updates

3. **Team Management**
   - Manager team view functionality
   - Employee widget interactions
   - Team health pulse surveys

### P2 - Feature Enhancement (Good to Have)
1. **Recognition Systems**
   - Kudos creation and display
   - Feedback submission and viewing
   - Notification system functionality

2. **Analytics & Reporting**
   - Dashboard analytics accuracy
   - Performance trend calculations
   - System health monitoring

## Test Data Management Strategy

### Static Test Data (Fixtures)
```json
{
  "users": {
    "employee": { "email": "employee1@lucerne.com", "password": "Employee1" },
    "manager": { "email": "manager1@lucerne.com", "password": "Manager1" },
    "admin": { "email": "cypress-admin@lucerne.com", "password": "CypressAdmin123!" }
  },
  "departments": ["IT", "HR", "Sales", "Marketing", "Operations"],
  "review_cycles": {
    "active": { "name": "Q1 2024 Performance Review", "status": "active" },
    "completed": { "name": "Q4 2023 Performance Review", "status": "completed" }
  }
}
```

### Dynamic Test Data
- **Assessment Responses:** Generated during test execution
- **Development Goals:** Created through UI interactions
- **Feedback Records:** Submitted via test workflows

### Database Reset Strategy
```sql
-- Execute before each test suite run
DELETE FROM team_health_pulse_responses WHERE employee_id IN (SELECT id FROM employees WHERE email LIKE '%@lucerne.com');
DELETE FROM development_plans WHERE employee_id IN (SELECT id FROM employees WHERE email LIKE '%@lucerne.com');
DELETE FROM assessments WHERE employee_id IN (SELECT id FROM employees WHERE email LIKE '%@lucerne.com');
-- Reset to known state using create-cypress-test-data-corrected.sql
```

## Test Execution Strategy

### Browser Matrix
| Browser | Versions | Viewport Sizes | Priority |
|---------|----------|----------------|----------|
| Chrome | Latest, Latest-1 | Desktop (1280x720), Tablet (768x1024) | P0 |
| Firefox | Latest | Desktop (1280x720) | P1 |
| Edge | Latest | Desktop (1280x720) | P1 |

### Test Organization Structure
```
cypress/e2e/
├── 1-auth/                 # Authentication flows (P0)
│   ├── 1.1-login-logout.cy.js
│   ├── 1.2-role-access.cy.js
│   └── 1.3-session-management.cy.js
├── 2-employee/             # Employee workflows (P0-P1)
│   ├── 2.1-dashboard.cy.js
│   ├── 2.2-development-plan.cy.js
│   └── 2.3-self-assessment.cy.js
├── 3-manager/              # Manager workflows (P0-P1)
│   ├── 3.1-dashboard.cy.js
│   ├── 3.2-team-view.cy.js
│   └── 3.3-review-assessment.cy.js
├── 4-admin/                # Admin workflows (P1-P2)
│   ├── 4.1-dashboard.cy.js
│   ├── 4.2-employee-management.cy.js
│   └── 4.3-cycle-management.cy.js
└── 5-integration/          # Cross-role workflows (P1)
    ├── 5.1-assessment-lifecycle.cy.js
    └── 5.2-development-plan-approval.cy.js
```

## API Monitoring & Network Testing

### Critical API Endpoints
```javascript
// Authentication
cy.intercept('POST', '**/auth/v1/token**').as('login');
cy.intercept('POST', '**/auth/v1/logout**').as('logout');

// Core Data Operations
cy.intercept('GET', '**/rest/v1/employees**').as('getEmployees');
cy.intercept('GET', '**/rest/v1/assessments**').as('getAssessments');
cy.intercept('POST', '**/rest/v1/assessments**').as('createAssessment');
cy.intercept('GET', '**/rest/v1/development_plans**').as('getDevelopmentPlans');

// Real-time Features
cy.intercept('GET', '**/rest/v1/notifications**').as('getNotifications');
cy.intercept('POST', '**/rest/v1/team_health_pulse_responses**').as('submitPulse');
```

### Network Validation Patterns
- **Response Time:** API calls should complete within 2 seconds
- **Error Handling:** Proper error responses for 401, 403, 500 status codes
- **Data Consistency:** Verify data matches between API response and UI display

## Selector Strategy & Element Identification

### Data-Cy Attribute Standards
```html
<!-- Navigation Elements -->
<nav data-cy="main-navigation">
  <button data-cy="nav-dashboard">Dashboard</button>
  <button data-cy="nav-assessments">Assessments</button>
</nav>

<!-- Form Elements -->
<form data-cy="assessment-form">
  <input data-cy="assessment-question-1" />
  <button data-cy="submit-assessment">Submit</button>
</form>

<!-- Modal Components -->
<div data-cy="modal-create-employee">
  <button data-cy="modal-close">Close</button>
  <button data-cy="modal-submit">Create Employee</button>
</div>
```

### Fallback Selector Hierarchy
1. **Primary:** `[data-cy="selector"]`
2. **Secondary:** `[data-testid="selector"]`
3. **Fallback:** Semantic selectors (`button[aria-label="Submit"]`)
4. **Last Resort:** Text-based selectors (with .contains())

## Performance & Reliability Standards

### Test Execution Targets
- **Full Suite Runtime:** < 10 minutes
- **Individual Test:** < 30 seconds
- **Test Flakiness Rate:** < 2%
- **CI Success Rate:** > 95%

### Retry & Recovery Strategy
```javascript
// Automatic retry for network-dependent tests
{ retries: { runMode: 2, openMode: 1 } }

// Custom retry logic for authentication
cy.window().its('localStorage').then((storage) => {
  if (!storage.getItem('sb-project-auth-token')) {
    cy.login(role); // Retry authentication
  }
});
```

## Failure Analysis & Reporting

### Automated Failure Classification
1. **Authentication Failures:** Token expiry, role access issues
2. **Network Failures:** API timeout, connectivity issues
3. **UI Failures:** Element not found, interaction failures
4. **Data Failures:** Assertion mismatches, state inconsistencies

### Debugging Artifacts
- **Screenshots:** Captured on test failure
- **Network Logs:** API request/response details
- **Console Logs:** Application error messages
- **Video Recording:** Full test execution (on CI failure)

### Failure Resolution Workflow
1. **Immediate:** Check for environmental issues (test data, network)
2. **Short-term:** Investigate application changes causing failures
3. **Long-term:** Update selectors and test logic for application evolution

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/cypress-tests.yml
- name: Run Cypress E2E Tests
  uses: cypress-io/github-action@v4
  with:
    build: npm run build
    start: npm start
    wait-on: 'http://localhost:3001'
    spec: cypress/e2e/**/*.cy.js
    browser: chrome
```

### Test Execution Triggers
- **Pull Requests:** Run P0 smoke tests
- **Main Branch Merge:** Full test suite execution
- **Scheduled:** Daily full regression runs
- **Manual:** On-demand test execution for specific features

## Maintenance & Evolution

### Regular Maintenance Tasks
- **Weekly:** Review test execution reports and flaky test identification
- **Monthly:** Update test data and validate selector stability
- **Quarterly:** Review test coverage and add new critical journey tests
- **Release Cycle:** Update tests for new features and deprecated functionality

### Success Metrics
- **Coverage:** All P0 journeys covered with automated tests
- **Reliability:** <2% flaky test rate maintained
- **Speed:** Test suite execution time within SLA
- **Detection:** Critical bugs caught before production release

## Appendix

### Useful Cypress Commands for EDGE App
```javascript
// Setup API interception for comprehensive monitoring
cy.setupApiInterception();

// Login with session caching
cy.login('manager');

// Verify role-based access
cy.waitForRoleBasedDashboard('manager');
cy.verifyNoUnauthorizedContent('manager');

// Use data-cy selectors
cy.getByDataCy('submit-assessment').click();

// Validate selector compliance
cy.validateDataCySelectors();
```

### Environment Configuration
```javascript
// cypress.config.ts
export default defineConfig({
  env: {
    SUPABASE_URL: 'https://blssdohlfcmyhxtpalcf.supabase.co',
    SUPABASE_ANON_KEY: '[your-anon-key]'
  },
  e2e: {
    baseUrl: 'http://localhost:3001',
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 120000,
    video: false,
    screenshotOnRunFailure: true,
    retries: { runMode: 2, openMode: 1 }
  }
});
```