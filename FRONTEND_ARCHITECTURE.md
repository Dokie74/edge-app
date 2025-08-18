# EDGE Frontend Architecture Documentation

**Document Version:** 2.0  
**Date:** August 18, 2025  
**Status:** Production Ready - All Mock Data Removed  

## Overview

The EDGE (Employee Development & Growth Engine) frontend is a React-based application built for modern performance review management at Lucerne International. This architecture documentation outlines the complete frontend structure, patterns, and live data integration.

## Technology Stack

### Core Framework
- **React 18** - Component-based UI library
- **Create React App** - Build toolchain and development server
- **TypeScript** - Type-safe JavaScript for services and components
- **Tailwind CSS** - Utility-first CSS framework

### State Management & Data
- **React Context API** - Application-wide state management
- **Supabase Client** - Real-time database and authentication
- **Custom Hooks** - Reusable business logic
- **Live Database Integration** - No mock data, all queries against Supabase

### Development & Testing
- **Cypress** - End-to-end testing framework
- **Jest** - Unit testing
- **TypeScript Compiler** - Type checking
- **ESLint** - Code quality

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin-specific components
│   │   └── PulseQuestionsManager.tsx
│   ├── analytics/       # Data visualization components
│   │   ├── ChartComponents.tsx
│   │   └── QuestionPerformanceWidget.tsx
│   ├── modals/          # Modal dialog components
│   │   ├── CreateEmployeeModal.js
│   │   ├── CreateReviewCycleModal.js
│   │   ├── EditEmployeeModal.js
│   │   ├── GiveFeedbackModal.js
│   │   ├── GiveKudoModal.js
│   │   ├── StartReviewCycleModal.js
│   │   └── UATFeedbackModal.js
│   ├── pages/           # Main application pages
│   │   ├── Admin.js
│   │   ├── AdminDashboard.tsx
│   │   ├── Assessment.js
│   │   ├── Dashboard.js
│   │   ├── EmployeeDashboard.tsx
│   │   ├── ManagerDashboard.tsx
│   │   └── [Other pages...]
│   ├── routing/         # Navigation and routing logic
│   │   ├── AppRouter.tsx
│   │   ├── AuthenticatedApp.tsx
│   │   └── DashboardRouter.tsx
│   ├── shared/          # Shared layout components
│   │   ├── Sidebar.js
│   │   └── SidebarRouter.tsx
│   └── ui/              # Base UI components
│       ├── Button.tsx
│       ├── Card.js
│       ├── EnhancedNotificationCenter.tsx
│       ├── LoadingSpinner.tsx
│       ├── TeamHealthPulse.tsx
│       └── [Other UI components...]
├── contexts/            # React Context providers
│   ├── AppContext.js    # Main application state
│   └── index.js
├── hooks/               # Custom React hooks
│   ├── useAdmin.js
│   ├── useAssessments.js
│   ├── useKudos.js
│   └── useTeam.js
├── services/            # Business logic and API communication
│   ├── AdminService.ts
│   ├── AnalyticsService.ts
│   ├── RoleBasedAnalyticsService.ts
│   ├── TeamHealthService.ts
│   ├── supabaseClient.ts
│   └── [Other services...]
├── types/               # TypeScript type definitions
│   ├── database.ts      # Supabase-generated types
│   └── index.ts         # Application types
└── utils/               # Utility functions
    ├── assessmentUtils.js
    ├── dateUtils.js
    ├── validation.ts
    └── [Other utilities...]
```

## Component Architecture

### 1. **Page Components** (`/components/pages/`)
Top-level route components that coordinate data fetching, state management, and layout composition.

**Key Pages:**
- `AdminDashboard.tsx` - Administrative overview with live metrics
- `EmployeeDashboard.tsx` - Employee self-service interface  
- `ManagerDashboard.tsx` - Manager team oversight tools
- `Assessment.js` - Performance review interface
- `Admin.js` - System administration panel

### 2. **Modal Components** (`/components/modals/`)
Reusable dialog interfaces for data entry and editing operations.

**Pattern:**
```jsx
// Standard modal structure
const ModalComponent = ({ isOpen, onClose, onSubmit, data }) => {
  const [formState, setFormState] = useState(initialState);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formState);
    onClose();
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal content */}
      </div>
    </div>
  ) : null;
};
```

### 3. **UI Components** (`/components/ui/`)
Foundational, reusable interface elements following design system patterns.

**Design Principles:**
- Consistent Tailwind CSS classes
- Prop-based customization
- Accessibility compliance
- TypeScript interfaces for props

### 4. **Service Integration Components**
Components that directly interface with backend services for live data.

**Examples:**
- `TeamHealthPulse.tsx` - Real-time pulse survey interface
- `EnhancedNotificationCenter.tsx` - Live notification system
- `PulseQuestionsManager.tsx` - Admin question management

## Data Flow Architecture

### 1. **Live Database Integration**
All data interactions use Supabase client with real-time capabilities:

```typescript
// Example: Live data fetching
const { data, error } = await supabase
  .from('assessments')
  .select(`
    *,
    employee:employees(name, department),
    cycle:review_cycles(name, status)
  `)
  .eq('status', 'active');
```

### 2. **State Management Pattern**
```javascript
// Context-based state management
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .from('notifications')
      .on('INSERT', handleNewNotification)
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AppContext.Provider>
  );
};
```

### 3. **Service Layer Pattern**
Business logic encapsulated in service modules:

```typescript
// AnalyticsService.ts - Live data analytics
export class AnalyticsService {
  static async getDashboardAnalytics(userRole: string) {
    // Real database queries - no mock data
    const { data: assessments } = await supabase
      .from('assessments')
      .select('created_at, self_assessment_status');
      
    const { data: pulseResponses } = await supabase
      .from('team_health_pulse_responses')
      .select('response_value, pulse_questions!inner(category)')
      .eq('pulse_questions.category', 'satisfaction');
      
    return this.calculateRealMetrics(assessments, pulseResponses);
  }
}
```

## Authentication & Authorization

### 1. **Supabase Auth Integration**
```javascript
// AuthService pattern
export const authService = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password
    });
    return { user: data?.user, error };
  },
  
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};
```

### 2. **Role-Based Access Control**
```typescript
// Role-based component rendering
export const RoleBasedComponent = ({ allowedRoles, children }) => {
  const { user } = useContext(AppContext);
  const userRole = user?.user_metadata?.role;
  
  if (!allowedRoles.includes(userRole)) {
    return <AccessDenied />;
  }
  
  return children;
};
```

## Performance Optimizations

### 1. **Code Splitting**
```javascript
// Lazy loading for route components
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const EmployeeDashboard = lazy(() => import('../pages/EmployeeDashboard'));
```

### 2. **Memoization Patterns**
```javascript
// Performance optimization for expensive calculations
const MemoizedAnalytics = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveAnalyticsCalculation(data);
  }, [data]);
  
  return <AnalyticsChart data={processedData} />;
});
```

### 3. **Real-Time Optimizations**
```javascript
// Debounced real-time updates
const useRealtimeData = (table, filter) => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const debouncedUpdate = debounce((payload) => {
      setData(current => updateData(current, payload));
    }, 300);
    
    const subscription = supabase
      .from(table)
      .on('*', debouncedUpdate)
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, [table, filter]);
  
  return data;
};
```

## Testing Strategy

### 1. **Component Testing**
```javascript
// Jest + React Testing Library
test('AdminDashboard displays live metrics', async () => {
  render(<AdminDashboard />);
  
  // Wait for live data to load
  await waitFor(() => {
    expect(screen.getByText(/completion rate/i)).toBeInTheDocument();
  });
  
  // Verify no mock data indicators
  expect(screen.queryByText('N/A')).not.toBeInTheDocument();
});
```

### 2. **End-to-End Testing**
```javascript
// Cypress E2E tests
describe('Employee Assessment Flow', () => {
  it('completes full assessment with live data', () => {
    cy.login('employee@lucerne.com');
    cy.visit('/assessment');
    
    // Interact with live pulse questions
    cy.get('[data-cy="pulse-question"]').should('be.visible');
    cy.get('[data-cy="satisfaction-rating"]').click();
    
    // Submit real assessment data
    cy.get('[data-cy="submit-assessment"]').click();
    
    // Verify live data persistence
    cy.get('[data-cy="success-message"]').should('contain', 'Assessment saved');
  });
});
```

## Build & Deployment

### 1. **Build Configuration**
```json
// package.json scripts
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "type-check": "tsc --noEmit",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### 2. **Environment Configuration**
```javascript
// Environment variables
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 3. **Production Optimizations**
- Bundle size optimization with code splitting
- Asset compression and caching
- Service worker for offline capabilities
- Real-time connection management

## Security Considerations

### 1. **Data Protection**
- All sensitive operations through Supabase RLS policies
- Client-side input validation and sanitization
- CSRF protection for state-changing operations
- Secure authentication token handling

### 2. **Access Control**
- Role-based component rendering
- Route-level authorization guards
- API call authorization through Supabase client

## Migration from Mock Data

### ✅ **Completed Migrations**
- **Satisfaction Scores**: Now calculated from `team_health_pulse_responses`
- **Analytics Data**: Real-time queries against assessment completion
- **Notification System**: Live database-driven notifications
- **Dashboard Metrics**: All metrics from actual database queries
- **Trend Analysis**: Historical data from real user interactions

### **No Mock Data Remaining**
The application now operates entirely on live data:
- All hardcoded fallback values removed
- Database queries use proper table relationships
- Real-time subscriptions for dynamic updates
- Error states show "N/A" instead of fake data

## Future Architecture Enhancements

### Planned Improvements
1. **Micro-frontend Architecture** - Modular deployment strategy
2. **Advanced State Management** - Redux Toolkit for complex state
3. **Progressive Web App** - Offline capabilities and app-like experience
4. **Advanced Analytics** - Real-time dashboard with complex visualizations
5. **Internationalization** - Multi-language support

### Performance Roadmap
1. **Virtual Scrolling** - For large data sets
2. **Advanced Caching** - Service worker and memory optimization
3. **Real-time Optimization** - Connection pooling and event debouncing

---

**Document Maintenance:**
This document should be updated whenever significant architectural changes are made to the frontend codebase. All examples reflect the current live data implementation without mock data fallbacks.