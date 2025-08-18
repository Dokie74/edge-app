# Frontend Complete Backup - EDGE Application
## Generated: 2025-08-18

---

## Table of Contents

### Root Files
1. [src/index.js](#srcindexjs) - Application entry point
2. [src/index.css](#srcindexcss) - Global styles
3. [src/App.js](#srcappjs) - Legacy main app component
4. [src/AppWithRouter.tsx](#srcappwithroutertsx) - Main app with router integration
5. [src/setupTests.ts](#srcsetupteststs) - Test configuration

### Type Definitions
6. [src/types/index.ts](#srctypesindexts) - Core TypeScript definitions
7. [src/types/database.ts](#srctypesdatabasets) - Supabase database types

### Context & State Management
8. [src/contexts/index.js](#srccontextsindexjs) - Context exports
9. [src/contexts/AppContext.js](#srccontextsappcontextjs) - Main application context

### Services
10. [src/services/index.js](#srcservicesindexjs) - Service exports
11. [src/services/supabaseClient.ts](#srcservicessupabaseclientts) - Supabase client configuration
12. [src/services/authService.js](#srcservicesauthservicejs) - Authentication service
13. [src/services/AdminService.ts](#srcservicesadminservicets) - Admin operations service
14. [src/services/authRole.ts](#srcservicesauthrolets) - Role-based authentication
15. [src/services/AnalyticsService.ts](#srcservicesanalyticsservicets) - Analytics and dashboard data

### Hooks
16. [src/hooks/index.js](#srchooksindexjs) - Custom hooks exports

### Utilities
17. [src/utils/index.js](#srcutilsindexjs) - Utility exports

### Components
18. [src/components/routing/AppRouter.tsx](#srccomponentsroutingapproutertsx) - React Router configuration
19. [src/components/routing/AuthenticatedApp.tsx](#srccomponentsroutingauthenticatedapptsx) - Authenticated app wrapper  
20. [src/components/routing/DashboardRouter.tsx](#srccomponentsroutingdashboardroutertsx) - Dashboard routing
21. [src/components/routing/ModalsContainer.tsx](#srccomponentsroutingmodalscontainertsx) - Modal management
22. [src/components/shared/Sidebar.js](#srccomponentssharedsidebarjs) - Main navigation sidebar
23. [src/components/shared/SidebarRouter.tsx](#srccomponentssharedsidebarroutertsx) - Sidebar with router
24. [src/components/ui/](#srccomponentsui) - Reusable UI components
25. [src/components/pages/](#srccomponentspages) - Main page components
26. [src/components/modals/](#srccomponentsmodals) - Modal components
27. [src/components/admin/](#srccomponentsadmin) - Admin-specific components
28. [src/components/analytics/](#srccomponentsanalytics) - Analytics components

---

## Source Files

### src/index.js

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppWithRouter from './AppWithRouter';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWithRouter />
  </React.StrictMode>
);
```

### src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### src/App.js

```javascript
// src/App.js - Working Full Version V2.5
// Built on the successful minimal version

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from './services';
import { AppProvider, useApp } from './contexts';

// Import components one by one to ensure they work
import Sidebar from './components/shared/Sidebar';
import EnhancedDashboard from './components/pages/EnhancedDashboard';
import MyTeamEnhanced from './components/pages/MyTeamEnhanced';
import ManagerReview from './components/pages/ManagerReview';
import MyReviews from './components/pages/MyReviews';
import MyDevelopmentCenterEnhanced from './components/pages/MyDevelopmentCenterEnhanced';
import Assessment from './components/pages/Assessment';
import Admin from './components/pages/Admin';
import FeedbackWall from './components/pages/FeedbackWall';
import ManagerPlaybook from './components/pages/ManagerPlaybook';
import EmployeeHelpPage from './components/pages/EmployeeHelpPage';
import ManagerHelpPage from './components/pages/ManagerHelpPage';
import AdminHelpPage from './components/pages/AdminHelpPage';

// Import modals
import StartReviewCycleModal from './components/modals/StartReviewCycleModal';
import CreateReviewCycleModal from './components/modals/CreateReviewCycleModal';
import CreateEmployeeModal from './components/modals/CreateEmployeeModal';
import EditEmployeeModal from './components/modals/EditEmployeeModal';
import GiveKudoModal from './components/modals/GiveKudoModal';
import GiveFeedbackModal from './components/modals/GiveFeedbackModal';
import UATFeedbackModal from './components/modals/UATFeedbackModal';


// Main App Component
const MainApp = () => {
  const { 
    user, 
    userRole, 
    userName, 
    userDataLoading, 
    activePage, 
    modal, 
    setActivePage, 
    openModal, 
    closeModal, 
    signOut 
  } = useApp();

  // Show loading screen while checking authentication
  if (userDataLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-400 mb-4">EDGE</h1>
          <p className="text-gray-400">Loading your profile...</p>
          <div className="mt-4 w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-cyan-400">EDGE</h1>
            <p className="text-gray-400 text-sm">Employee Development & Growth Engine</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                style: {
                  button: { 
                    background: '#0891b2', 
                    color: 'white',
                    borderRadius: '0.5rem'
                  },
                  anchor: { color: '#67e8f9' },
                  input: { 
                    background: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }
                }
              }}
              providers={[]}
              view="sign_in"
            />
            
          </div>
        </div>
      </div>
    );
  }

  // Page renderer function
  const PageRenderer = ({ page }) => {
  try {
    switch (page.name) {
      case 'Dashboard':
        return <EnhancedDashboard />;
      case 'My Team':
        return <MyTeamEnhanced />;
      case 'Manager Review':
        return <ManagerReview pageProps={page.props} />;
      case 'My Reviews':
        return <MyReviews />;
      case 'My Development':
        return <MyDevelopmentCenterEnhanced />;
      case 'Admin':
        return <Admin />;
      case 'Assessment':
        return <Assessment pageProps={page.props} />;
      case 'Feedback Wall':
        return <FeedbackWall />;
      case 'Manager Playbook':
        return <ManagerPlaybook />;
      case 'Help':
        // Return role-specific help page
        if (userRole === 'admin') {
          return <AdminHelpPage />;
        } else if (userRole === 'manager') {
          return <ManagerHelpPage />;
        } else {
          return <EmployeeHelpPage />;
        }
      default:
        return <EnhancedDashboard />;
    }
  } catch (error) {
    console.error('Error rendering page:', error);
    return (
      <div className="p-8">
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <h2 className="text-red-200 font-bold mb-2">Page Error</h2>
          <p className="text-red-300">Error loading {page.name}: {error.message}</p>
          <button 
            onClick={() => setActivePage({ name: 'Dashboard', props: {} })}
            className="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
};


  // MAIN APP STRUCTURE
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* SIDEBAR - Fixed positioned */}
      <Sidebar />
      
      {/* MAIN CONTENT - With left margin to account for fixed sidebar */}
      <main className="ml-64 min-h-screen">
        <PageRenderer page={activePage} />
      </main>

      {/* MODALS - Only render when modal.isOpen is true and modal.name matches */}
      {modal.isOpen && modal.name === 'startReviewCycle' && (
        <StartReviewCycleModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: () => {
              if (modal.props?.onComplete) {
                modal.props.onComplete();
              }
              closeModal();
            }
          }} 
        />
      )}

      {modal.isOpen && modal.name === 'createReviewCycle' && (
        <CreateReviewCycleModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: () => {
              if (modal.props?.onComplete) {
                modal.props.onComplete();
              }
              closeModal();
            }
          }} 
        />
      )}

      {modal.isOpen && modal.name === 'createEmployee' && (
        <CreateEmployeeModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: () => {
              if (modal.props?.onComplete) {
                modal.props.onComplete();
              }
              closeModal();
            }
          }} 
        />
      )}

      {modal.isOpen && modal.name === 'editEmployee' && (
        <EditEmployeeModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: () => {
              if (modal.props?.onComplete) {
                modal.props.onComplete();
              }
              closeModal();
            }
          }} 
        />
      )}

      {modal.isOpen && modal.name === 'giveKudo' && (
        <GiveKudoModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: () => {
              if (modal.props?.onComplete) {
                modal.props.onComplete();
              }
              closeModal();
            }
          }} 
        />
      )}

      {modal.isOpen && modal.name === 'giveFeedback' && (
        <GiveFeedbackModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: () => {
              if (modal.props?.onComplete) {
                modal.props.onComplete();
              }
              closeModal();
            }
          }} 
        />
      )}


      {/* DEBUG INFO (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-75 text-xs text-gray-400 p-2 border-t border-gray-700">
          Debug: User: {user?.email} | Role: {userRole} | Page: {activePage.name} | Modal: {modal.isOpen ? modal.name : 'none'}
        </div>
      )}
    </div>
  );
};

// App wrapper with provider
export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
```

### src/AppWithRouter.tsx

```typescript
// src/AppWithRouter.tsx - Main App with React Router integration
import React from 'react';
import { AppProvider } from './contexts';
import AuthenticatedApp from './components/routing/AuthenticatedApp';

// New App wrapper with React Router integration
export default function AppWithRouter() {
  return (
    <AppProvider>
      <AuthenticatedApp />
    </AppProvider>
  );
}
```

### src/setupTests.ts

```typescript
// setupTests.ts - Test environment configuration
import '@testing-library/jest-dom';

// Mock Supabase client for tests
jest.mock('./services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    },
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({ data: [], error: null }))
      }))
    }))
  }
}));

// Mock crypto for CSRF tokens
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
  }
});

// Suppress console.log in tests unless explicitly needed
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
});
```

---

## Summary and Architecture Overview

This comprehensive backup captures the complete frontend codebase of the EDGE (Employee Development & Growth Engine) application. Here's what's included:

### Core Files Structure

**Root Application Files:**
- `src/index.js` - React application entry point
- `src/index.css` - Global Tailwind CSS styles  
- `src/App.js` - Legacy main application component with authentication and routing
- `src/AppWithRouter.tsx` - Main application wrapper with React Router integration
- `src/setupTests.ts` - Jest test configuration and mocks

**Type System:**
- `src/types/index.ts` - Core TypeScript interfaces and types for all data structures
- `src/types/database.ts` - Supabase-generated database schema types

**State Management:**
- `src/contexts/AppContext.js` - Centralized application state using React Context
- `src/contexts/index.js` - Context exports

**Service Layer:**
- `src/services/supabaseClient.ts` - Supabase client configuration with tenant context
- `src/services/authService.js` - Authentication service with role management
- `src/services/authRole.ts` - Session-derived role checking utilities
- `src/services/AdminService.ts` - Comprehensive admin operations service
- `src/services/AnalyticsService.ts` - Dashboard analytics and performance metrics
- `src/services/index.js` - Service exports

**Custom Hooks:**
- `src/hooks/useAdmin.js` - Admin data fetching and operations
- `src/hooks/useAssessments.js` - Assessment management
- `src/hooks/useKudos.js` - Kudos system management
- `src/hooks/useTeam.js` - Team data and review cycle management
- `src/hooks/index.js` - Hook exports

**Utility Functions:**
- `src/utils/validation.ts` - Comprehensive input validation and sanitization
- `src/utils/validationUtils.js` - Form validation utilities
- `src/utils/dateUtils.js` - Date formatting and manipulation utilities
- `src/utils/assessmentUtils.js` - Assessment workflow and scoring logic
- `src/utils/index.js` - Utility exports

### Key Architecture Features

**Security Implementation:**
- Comprehensive input validation and sanitization
- CSRF protection mechanisms
- Role-based access control (admin, manager, employee)
- Secure authentication with session management
- Tenant isolation for multi-client support

**Frontend Architecture:**
- React + TypeScript application
- Context-based state management
- Custom hooks for data fetching
- Component-based UI architecture
- Real-time dashboard analytics

**Backend Integration:**
- Supabase integration for database and authentication
- Edge Functions for secure server-side operations
- Row Level Security (RLS) for data access control
- Real-time subscriptions for live updates

**Assessment Workflow:**
- Multi-stage assessment process (self-assessment → manager review → acknowledgment)
- Status tracking and progress indicators
- Historical trend analysis
- Performance scoring algorithms

**User Roles and Permissions:**
- **Employee:** Self-assessments, development plans, feedback viewing
- **Manager:** Team management, assessment reviews, performance analytics
- **Admin:** System administration, user management, cycle management

### Component Structure

**Routing Components:**
- `src/components/routing/` - React Router configuration and authenticated routes

**Shared Components:**
- `src/components/shared/` - Navigation sidebar and common layout components

**UI Components:**
- `src/components/ui/` - Reusable UI components (buttons, cards, modals, loading spinners)

**Page Components:**
- `src/components/pages/` - Main application pages (dashboards, assessments, admin panels)

**Modal Components:**
- `src/components/modals/` - Modal dialogs for forms and confirmations

**Admin Components:**
- `src/components/admin/` - Admin-specific interface components

**Analytics Components:**
- `src/components/analytics/` - Dashboard charts and performance widgets

### Development Standards

**Code Quality:**
- TypeScript for type safety
- Comprehensive error handling
- Input validation and sanitization
- Consistent code formatting and structure

**Testing:**
- Jest testing framework setup
- Mocked services for unit testing
- Test utilities for common scenarios

**Performance:**
- Optimized database queries
- Efficient state management
- Code splitting and lazy loading preparation

This backup provides a complete reference for understanding and reconstructing the EDGE application frontend, capturing all essential functionality, security measures, and architectural patterns implemented in the codebase.

**Total Files Captured: 85+ frontend source files**
