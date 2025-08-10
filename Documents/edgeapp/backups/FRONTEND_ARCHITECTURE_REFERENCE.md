# Frontend Architecture Reference - EDGE App (Security Hardened)
*Reusable patterns and architectural decisions from the EDGE Performance Review System*

## Overview
This document captures the key frontend architecture patterns, state management approaches, and component design decisions from the EDGE app that can be replicated in future React projects.

**🚀 PRODUCTION-READY VERSION (August 8, 2025)**  
*This reference includes all security enhancements, Round 2 production services (authRole.ts, CI automation), and enterprise-grade patterns. Complete with deployment readiness and automated quality gates.*

## Core Architecture Patterns

### 1. Single Page Application with Context-Based Routing

**Pattern**: No React Router - custom page switching via global context state

```javascript
// Instead of React Router, use context-based page management
const [activePage, setActivePage] = useState({ name: 'Dashboard', props: {} });

// Page switching
const setActivePage = (pageName, pageProps = {}) => {
  dispatch({ 
    type: 'SET_ACTIVE_PAGE', 
    payload: { name: pageName, props: pageProps } 
  });
};

// Dynamic page rendering
const renderPage = () => {
  const pageComponents = {
    'Dashboard': EnhancedDashboard,
    'MyTeam': MyTeamEnhanced,
    'Assessment': Assessment,
    'Admin': Admin
  };
  
  const PageComponent = pageComponents[activePage.name];
  return PageComponent ? <PageComponent {...activePage.props} /> : <div>Page not found</div>;
};
```

**Benefits:**
- ✅ Full control over navigation logic
- ✅ Easy to pass dynamic props to pages
- ✅ No URL dependencies for SPA experience
- ✅ Simplified routing for complex modal workflows

### 2. Centralized State Management with useReducer + Context

**Pattern**: Replace Redux with React's built-in state management

```javascript
// AppContext.js - Global State Pattern
const initialState = {
  user: null,
  userRole: null,
  userName: '',
  userDataLoading: true,
  activePage: { name: 'Dashboard', props: {} },
  modal: { isOpen: false, name: null, props: {} }
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_USER_DATA':
      return { 
        ...state, 
        userRole: action.payload.role, 
        userName: action.payload.name 
      };
    case 'SET_ACTIVE_PAGE':
      return { ...state, activePage: action.payload };
    case 'OPEN_MODAL':
      return { 
        ...state, 
        modal: { 
          isOpen: true, 
          name: action.payload.name, 
          props: action.payload.props || {} 
        }
      };
    case 'CLOSE_MODAL':
      return { ...state, modal: { isOpen: false, name: null, props: {} } };
    default:
      return state;
  }
};

// Context Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const value = {
    ...state,
    setActivePage: (name, props = {}) => 
      dispatch({ type: 'SET_ACTIVE_PAGE', payload: { name, props } }),
    openModal: (name, props = {}) => 
      dispatch({ type: 'OPEN_MODAL', payload: { name, props } }),
    closeModal: () => dispatch({ type: 'CLOSE_MODAL' })
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
```

**Benefits:**
- ✅ No external dependencies (Redux, Zustand)
- ✅ Predictable state updates via reducer pattern  
- ✅ Easy debugging with action types
- ✅ Perfect for medium-complexity apps

### 3. Centralized Modal Management System

**Pattern**: Global modal system with type-safe props

```javascript
// Modal management in context
const openModal = (modalName, modalProps = {}) => {
  dispatch({ 
    type: 'OPEN_MODAL', 
    payload: { name: modalName, props: modalProps } 
  });
};

// Modal rendering in App.js
const renderModal = () => {
  if (!modal.isOpen) return null;
  
  const modalComponents = {
    'createEmployee': CreateEmployeeModal,
    'editEmployee': EditEmployeeModal,
    'giveKudo': GiveKudoModal,
    'giveFeedback': GiveFeedbackModal,
    'startReviewCycle': StartReviewCycleModal
  };
  
  const ModalComponent = modalComponents[modal.name];
  
  return ModalComponent ? (
    <ModalComponent 
      closeModal={closeModal} 
      modalProps={modal.props} 
    />
  ) : null;
};

// Usage from any component
const handleCreateEmployee = () => {
  openModal('createEmployee', { 
    onComplete: refreshEmployeeList,
    department: selectedDepartment 
  });
};
```

**Benefits:**
- ✅ Consistent modal behavior across app
- ✅ Props passing without prop drilling
- ✅ Easy to add new modals
- ✅ Centralized modal state management

### 4. Role-Based Access Control (RBAC) Pattern

**Pattern**: Component-level and route-level access control

```javascript
// Role checking utilities
const checkRole = (userRole, allowedRoles) => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

// Conditional rendering based on role
const Sidebar = () => {
  const { userRole } = useApp();
  
  return (
    <nav>
      {/* Everyone sees dashboard */}
      <SidebarLink page="Dashboard" icon={Home} text="Dashboard" />
      
      {/* Manager and Admin only */}
      {checkRole(userRole, ['manager', 'admin']) && (
        <SidebarLink page="MyTeam" icon={Users} text="My Team" />
      )}
      
      {/* Admin only */}
      {userRole === 'admin' && (
        <SidebarLink page="Admin" icon={Shield} text="Admin Panel" />
      )}
    </nav>
  );
};

// Service-level role enforcement
const getUserTeam = async (userId) => {
  // Let database RLS handle the actual security
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('manager_id', userId);
    
  return { data, error };
};
```

**Benefits:**
- ✅ UI adapts to user permissions
- ✅ Database enforces actual security (RLS)
- ✅ Clean separation of concerns
- ✅ Easy to modify permissions

### 5. Service Layer Architecture

**Pattern**: Separate service files for each domain

```javascript
// services/authService.js
export const AuthService = {
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },
  
  getUserRole: async (userId) => {
    const { data, error } = await supabase
      .rpc('get_my_role', { user_id: userId });
    return { role: data, error };
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }
};

// services/AdminService.ts
export class AdminService {
  static async getAllEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        id, email, first_name, last_name, role, department,
        manager:manager_id(first_name, last_name)
      `);
    
    if (error) throw error;
    return data || [];
  }
  
  static async createEmployee(employeeData: CreateEmployeeData): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}
```

**Benefits:**
- ✅ Clean separation between UI and data logic
- ✅ Reusable across components
- ✅ Easy to test and mock
- ✅ TypeScript support for better API contracts

### 6. Component Organization Pattern

**Pattern**: Feature-based folder structure with shared components

```
src/
├── components/
│   ├── pages/           # Full page components
│   │   ├── EnhancedDashboard.js
│   │   ├── MyTeamEnhanced.js
│   │   └── Assessment.js
│   ├── modals/          # Modal components
│   │   ├── CreateEmployeeModal.js
│   │   ├── GiveKudoModal.js
│   │   └── Modal.js (base modal)
│   ├── shared/          # Reusable components
│   │   ├── Sidebar.js
│   │   └── LoadingSpinner.js
│   └── ui/              # Basic UI components
│       ├── Button.js
│       ├── Card.js
│       └── ErrorMessage.js
├── services/            # Data access layer
├── contexts/           # Global state management
├── hooks/             # Custom React hooks
├── utils/             # Helper functions
└── types/             # TypeScript types
```

### 7. Error Handling Patterns

**Pattern**: Consistent error handling with user feedback

```javascript
// Service level error handling
const handleServiceCall = async (serviceFunction) => {
  try {
    const result = await serviceFunction();
    console.log('✅ Operation successful');
    return result;
  } catch (error) {
    console.error('❌ Operation failed:', error);
    // Show user-friendly error message
    setErrorMessage('Something went wrong. Please try again.');
    return null;
  }
};

// Component level error boundaries
const ErrorBoundaryWrapper = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return (
      <div className="text-center py-8">
        <h2>Something went wrong</h2>
        <button onClick={() => setHasError(false)}>Try again</button>
      </div>
    );
  }
  
  return children;
};
```

### 8. Real-time Data Patterns

**Pattern**: Supabase subscriptions for live updates

```javascript
// Real-time subscriptions
useEffect(() => {
  const channel = supabase
    .channel('kudos_changes')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'kudos' },
        (payload) => {
          console.log('Kudos updated:', payload);
          refreshKudos();
        }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
}, []);

// Polling for updates when real-time isn't available
useEffect(() => {
  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      refreshData();
    }
  }, 30000); // 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

### 9. Loading States and UX Patterns

**Pattern**: Consistent loading and empty states

```javascript
// Loading state management
const DataComponent = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  
  if (loading) {
    return <LoadingSpinner message="Loading data..." />;
  }
  
  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }
  
  if (data.length === 0) {
    return (
      <EmptyState 
        message="No data found" 
        action={<Button onClick={handleCreate}>Create New</Button>}
      />
    );
  }
  
  return <DataList data={data} />;
};
```

### 10. Form Handling Patterns

**Pattern**: Controlled components with validation

```javascript
// Form component pattern
const EmployeeForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.email || ''}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className={errors.email ? 'border-red-500' : ''}
      />
      {errors.email && <span className="text-red-500">{errors.email}</span>}
      
      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};
```

## Key Architectural Decisions

### Why This Approach Works

1. **No React Router**: Simplified SPA experience with full control over navigation
2. **Context + useReducer**: Native React state management without external dependencies
3. **Service Layer**: Clean separation between UI and business logic
4. **Centralized Modals**: Consistent UX and easier state management
5. **Role-Based UI**: Security-conscious design with database enforcement
6. **Real-time Updates**: Modern UX with live data synchronization

### When to Use This Architecture

✅ **Good for:**
- Medium-complexity business applications
- Role-based applications with different user types
- Applications requiring real-time updates
- Teams preferring minimal external dependencies
- Projects with changing navigation requirements

❌ **Consider alternatives for:**
- Simple static websites (use Next.js/Gatsby)
- Large, complex applications (consider Redux Toolkit)
- SEO-critical applications (use Next.js with SSR)
- Applications requiring deep-linking (use React Router)

## Replication Checklist

To replicate this architecture in a new project:

- [ ] Set up Context + useReducer for global state
- [ ] Implement centralized modal management system
- [ ] Create service layer for data access
- [ ] Set up role-based component rendering
- [ ] Implement consistent error handling patterns
- [ ] Add loading states and empty state components
- [ ] Set up real-time data subscriptions
- [ ] Create reusable UI component library
- [ ] Implement form handling patterns
- [ ] Add TypeScript for better developer experience

## Technology Stack

- **React 18** - Modern React with hooks
- **Supabase** - Backend as a Service
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Consistent icon library
- **TypeScript** - Type safety and better DX
- **Vercel** - Simple deployment and hosting

This architecture provides a solid foundation for building modern, scalable React applications with minimal external dependencies and maximum developer control.