# EDGE Application Developer Setup Guide

**Version: 5.0 - Production Ready**  
**Date: July 30, 2025**  
**Status: Enhanced Developer Experience**

## Prerequisites

Before setting up the EDGE application, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher recommended) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** (v3+ recommended)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)
- **Docker** (optional, for containerized development) - [Download](https://docker.com/)

### Additional Tools
- **Supabase CLI** - For database management and local development
- **Cypress** - For end-to-end testing (installed with project dependencies)
- **PostgreSQL** (optional, if not using Supabase local)

### Recommended VS Code Extensions
- **ES7+ React/Redux/React-Native snippets** - Enhanced React development
- **Prettier - Code formatter** - Consistent code formatting
- **ESLint** - Code quality and error detection
- **TypeScript Importer** - Automatic import management
- **Auto Rename Tag** - Synchronized HTML/JSX tag editing
- **GitLens** - Enhanced Git capabilities
- **Thunder Client** - API testing within VS Code
- **Tailwind CSS IntelliSense** - Tailwind class suggestions
- **Supabase** - Supabase integration and management
- **Error Lens** - Inline error display
- **Bracket Pair Colorizer 2** - Enhanced bracket matching
- **Path Intellisense** - File path autocomplete

## Project Setup

### 1. Clone the Repository
```bash
git clone [repository-url]
cd edgeapp
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

#### Create Environment Files
Create the following files in the project root:

**`.env.local`** (for local development):
```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application Configuration
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=5.0
REACT_APP_DEBUG_MODE=true

# Feature Flags (Development)
REACT_APP_ENABLE_PULSE_QUESTIONS=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_TEAM_HEALTH=true
REACT_APP_ENABLE_MANAGER_APPROVALS=true

# Development Tools
REACT_APP_ENABLE_REDUX_DEVTOOLS=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
```

**`.env.production`** (for production builds):
```env
# Supabase Configuration (Production)
REACT_APP_SUPABASE_URL=your_production_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_production_supabase_anon_key
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Application Configuration
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=5.0
REACT_APP_DEBUG_MODE=false

# Feature Flags (Production)
REACT_APP_ENABLE_PULSE_QUESTIONS=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_TEAM_HEALTH=true
REACT_APP_ENABLE_MANAGER_APPROVALS=true

# Production Optimization
GENERATE_SOURCEMAP=false
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
```

#### Environment Variables Explained
- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key (public)
- `REACT_APP_SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations
- `REACT_APP_ENVIRONMENT`: Application environment (development/staging/production)
- `REACT_APP_VERSION`: Application version for tracking and debugging
- `REACT_APP_DEBUG_MODE`: Enables additional debugging features
- `REACT_APP_ENABLE_*`: Feature flags for enabling/disabling specific features
- `GENERATE_SOURCEMAP`: Whether to generate source maps in production builds
- `REACT_APP_ENABLE_PERFORMANCE_MONITORING`: Performance tracking and analytics

### 4. Supabase Setup

#### Local Supabase Development
1. **Install Supabase CLI**:
   ```bash
   npm install -g @supabase/cli
   ```

2. **Initialize Supabase** (if not already done):
   ```bash
   supabase init
   ```

3. **Start Local Supabase**:
   ```bash
   supabase start
   ```

4. **Run Database Migrations**:
   ```bash
   supabase db push
   ```

#### Supabase Cloud Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env.local`
3. Apply the database schema using Supabase migrations:
   ```bash
   # Apply all migrations
   supabase db push --linked
   
   # Apply pulse questions management
   psql -f pulse_questions_management.sql
   
   # Apply any additional schema updates
   psql -f fix_question_performance_function.sql
   ```
4. Seed the database with initial data:
   ```bash
   supabase db seed --linked
   ```

### 5. TypeScript Configuration

The project now includes comprehensive TypeScript support:

#### TypeScript Configuration Files
- `tsconfig.json` - Main TypeScript configuration
- `tsconfig.build.json` - Production build configuration
- `types/` directory - Custom type definitions

#### Key TypeScript Features
- **Strict Mode**: Full type safety enforcement
- **Path Mapping**: Simplified imports with absolute paths
- **Interface Definitions**: Complete type coverage for all components
- **Service Layer Types**: Strongly typed API responses and data models

## Enhanced Development Workflow

### 1. Start Development Server
```bash
npm start
# or
yarn start
```
The application will open at `http://localhost:3000`

### 2. Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 3. Linting and Formatting
```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

### 4. TypeScript Checking
```bash
# Run TypeScript compiler check
npm run type-check

# Run TypeScript in watch mode
npm run type-check:watch

# TypeScript compilation for production
npm run build:types
```

### 5. Enhanced Testing Suite
```bash
# Run all tests with coverage
npm run test:coverage

# Run E2E tests
npm run cypress:open
npm run cypress:run

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Performance testing
npm run test:performance
```

### 6. Database Management
```bash
# Start local Supabase instance
supabase start

# Apply database migrations
supabase db push --linked

# Reset database with fresh data
supabase db reset --linked

# Generate TypeScript types from database
supabase gen types typescript --linked > src/types/database.ts
```

### 5. Build for Production
```bash
npm run build
```

## Project Structure

```
edgeapp/
├── public/                     # Static assets and PWA configuration
├── src/
│   ├── components/             # React components (TypeScript)
│   │   ├── admin/              # Admin-specific components
│   │   ├── analytics/          # Analytics and reporting components
│   │   ├── modals/             # Modal dialogs and popups
│   │   ├── pages/              # Page components with enhanced dashboards
│   │   ├── routing/            # Routing and navigation components
│   │   ├── shared/             # Shared/common components
│   │   └── ui/                 # Reusable UI components with real-time data
│   ├── contexts/               # React Context providers
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # API services and data layer
│   ├── types/                  # TypeScript type definitions
│   │   ├── api.ts              # API response types
│   │   ├── database.ts         # Database schema types
│   │   └── components.ts       # Component prop types
│   ├── utils/                  # Utility functions and helpers
│   │   ├── validation.ts       # Input validation utilities
│   │   ├── analytics.ts        # Analytics and tracking utilities
│   │   └── performance.ts      # Performance monitoring utilities
│   ├── App.tsx                 # Main App component (TypeScript)
│   └── index.tsx               # Application entry point (TypeScript)
├── docs/                       # Comprehensive documentation
├── cypress/                    # E2E tests and fixtures
│   ├── e2e/                    # End-to-end test specs
│   ├── fixtures/               # Test data and mock responses
│   └── support/                # Test utilities and commands
├── supabase/                   # Supabase configuration and migrations
│   ├── migrations/             # Database migration files
│   ├── functions/              # Edge functions
│   └── config.toml             # Supabase project configuration
├── tests/                      # Unit and integration tests
│   ├── components/             # Component tests
│   ├── services/               # Service layer tests
│   └── utils/                  # Utility function tests
└── .github/                    # GitHub Actions and workflows
    └── workflows/              # CI/CD pipeline configurations
```

## Component Development Guidelines

### File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.js`)
- **Services**: camelCase (e.g., `authService.js`)
- **Utilities**: camelCase (e.g., `dateUtils.js`)
- **Types**: PascalCase (e.g., `UserTypes.ts`)

### Enhanced Component Structure (TypeScript)
```tsx
// Enhanced TypeScript component structure
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ComponentService } from '../services/ComponentService';
import type { ComponentData, ServiceResponse } from '../types/api';

// Props interface with comprehensive typing
interface ComponentProps {
  id: string;
  data?: ComponentData;
  onUpdate?: (data: ComponentData) => void;
  className?: string;
  isLoading?: boolean;
}

// Component with full TypeScript support
const ComponentName: React.FC<ComponentProps> = ({
  id,
  data,
  onUpdate,
  className = '',
  isLoading = false
}) => {
  // Typed state management
  const [componentData, setComponentData] = useState<ComponentData | null>(data || null);
  const [error, setError] = useState<string | null>(null);
  
  // Context usage
  const { currentUser, updateNotification } = useAppContext();

  // Memoized computations
  const processedData = useMemo(() => {
    return componentData ? processData(componentData) : null;
  }, [componentData]);

  // Callback functions with proper typing
  const handleUpdate = useCallback(async (newData: Partial<ComponentData>) => {
    try {
      setError(null);
      const response: ServiceResponse<ComponentData> = await ComponentService.update(id, newData);
      
      if (response.success && response.data) {
        setComponentData(response.data);
        onUpdate?.(response.data);
        updateNotification('Component updated successfully', 'success');
      } else {
        setError(response.error || 'Update failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [id, onUpdate, updateNotification]);

  // Effects with proper dependencies
  useEffect(() => {
    if (!data && id) {
      ComponentService.fetchById(id)
        .then(response => {
          if (response.success && response.data) {
            setComponentData(response.data);
          }
        })
        .catch(err => setError(err.message));
    }
  }, [id, data]);

  // Early returns for loading and error states
  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // Main render with proper TypeScript JSX
  return (
    <div className={`component-container ${className}`}>
      {processedData && (
        <div className="component-content">
          {/* Component JSX with type safety */}
          <h3>{processedData.title}</h3>
          <p>{processedData.description}</p>
          <button
            onClick={() => handleUpdate({ status: 'updated' })}
            className="btn btn-primary"
          >
            Update
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function with proper typing
const processData = (data: ComponentData) => {
  return {
    title: data.title?.toUpperCase() || 'Untitled',
    description: data.description || 'No description available'
  };
};

export default ComponentName;
export type { ComponentProps };
```

### Enhanced Service Development (TypeScript)
```typescript
// Enhanced service structure with comprehensive typing
import { supabase } from './supabaseClient';
import type { Database } from '../types/database';
import type { ServiceResponse, ServiceError } from '../types/api';
import { validateInput } from '../utils/validation';
import { trackAnalytics } from '../utils/analytics';
import { handleServiceError } from '../utils/errorHandling';

// Type-safe database reference
type Tables = Database['public']['Tables'];
type ComponentData = Tables['components']['Row'];
type ComponentInsert = Tables['components']['Insert'];
type ComponentUpdate = Tables['components']['Update'];

// Enhanced service class with full TypeScript support
export class ComponentService {
  // Create operation with validation and analytics
  static async create(data: ComponentInsert): Promise<ServiceResponse<ComponentData>> {
    try {
      // Input validation
      const validation = validateInput(data, 'component');
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Input validation failed',
            details: validation.errors,
            retryable: true
          }
        };
      }

      // Database operation with RLS
      const { data: result, error } = await supabase
        .from('components')
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Analytics tracking
      await trackAnalytics('component_created', {
        componentId: result.id,
        timestamp: new Date().toISOString()
      });

      return {
        data: result,
        success: true,
        metadata: {
          timestamp: new Date().toISOString(),
          operation: 'create'
        }
      };
    } catch (error) {
      return handleServiceError(error, 'ComponentService.create');
    }
  }

  // Read operation with caching and optimization
  static async fetchById(id: string): Promise<ServiceResponse<ComponentData>> {
    try {
      // Check cache first (if implemented)
      const cached = await this.getCachedData(id);
      if (cached) {
        return { data: cached, success: true };
      }

      const { data, error } = await supabase
        .from('components')
        .select(`
          *,
          related_table:related_table_id(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Component not found',
              retryable: false
            }
          };
        }
        throw error;
      }

      // Cache the result
      await this.setCachedData(id, data);

      return { data, success: true };
    } catch (error) {
      return handleServiceError(error, 'ComponentService.fetchById');
    }
  }

  // Update operation with optimistic updates
  static async update(
    id: string, 
    updates: ComponentUpdate
  ): Promise<ServiceResponse<ComponentData>> {
    try {
      const validation = validateInput(updates, 'componentUpdate');
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Update validation failed',
            details: validation.errors,
            retryable: true
          }
        };
      }

      const { data, error } = await supabase
        .from('components')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Invalidate cache
      await this.invalidateCache(id);

      // Track analytics
      await trackAnalytics('component_updated', {
        componentId: id,
        fields: Object.keys(updates)
      });

      return { data, success: true };
    } catch (error) {
      return handleServiceError(error, 'ComponentService.update');
    }
  }

  // Batch operations for efficiency
  static async fetchMultiple(
    filters: Partial<ComponentData>,
    limit = 50
  ): Promise<ServiceResponse<ComponentData[]>> {
    try {
      let query = supabase
        .from('components')
        .select('*')
        .limit(limit);

      // Apply filters dynamically
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key as keyof ComponentData, value);
        }
      });

      const { data, error } = await query;

      if (error) throw error;

      return { data: data || [], success: true };
    } catch (error) {
      return handleServiceError(error, 'ComponentService.fetchMultiple');
    }
  }

  // Cache management methods
  private static async getCachedData(id: string): Promise<ComponentData | null> {
    // Implement caching logic (Redis, localStorage, etc.)
    return null;
  }

  private static async setCachedData(id: string, data: ComponentData): Promise<void> {
    // Implement cache storage
  }

  private static async invalidateCache(id: string): Promise<void> {
    // Implement cache invalidation
  }
}

// Export service instance for backward compatibility
export const componentService = ComponentService;
```

## Database Development

### Schema Management
- Database schema is managed through Supabase migrations
- SQL files in `sql-fixes-applied/` contain applied database changes
- Always test schema changes locally before applying to production

### Row Level Security (RLS)
Ensure all tables have appropriate RLS policies:
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Example policy
CREATE POLICY "Users can view own records" 
  ON table_name FOR SELECT 
  USING (user_id = auth.uid());
```

## Testing Guidelines

### Unit Testing
- Use Jest and React Testing Library
- Test files should be named `*.test.js` or `*.test.tsx`
- Place test files next to the components they test

### E2E Testing
- Use Cypress for end-to-end testing
- Test files located in `cypress/e2e/`
- Run with `npm run cypress:open`

### Enhanced Test Data
- Use the fixtures in `cypress/fixtures/` for comprehensive test data
- **Test Users** (with full feature access):
  - Employee: `employee1@lucerne.com` / `Employee1` (pulse questions, development plans)
  - Manager: `manager1@lucerne.com` / `Manager1` (team management, approvals, analytics)
  - Admin: `admin@lucerne.com` / `Admin` (pulse question management, system oversight)

### Test Scenarios
- **Pulse Question Workflows**: Creating, editing, and analyzing survey questions
- **Team Health Analytics**: Manager dashboards with real-time team insights
- **Manager Approval Workflows**: Review approval processes and quality assessment
- **Enhanced My Team View**: Comprehensive team management interface
- **Development Plan Management**: End-to-end development planning and tracking

### Test Environment Features
- **Real-time Data**: Tests use actual database operations (not mocked)
- **Analytics Testing**: Performance metrics and dashboard functionality
- **TypeScript Coverage**: Full type checking in test files
- **Accessibility Testing**: WCAG compliance and screen reader compatibility

## Performance Considerations

### Code Splitting
- Use React.lazy() for route-level code splitting
- Implement dynamic imports for large components

### State Management
- Use React hooks for local state
- Consider Context API for global state
- Avoid prop drilling by using composition

### Asset Optimization
- Optimize images before adding to `public/` folder
- Use WebP format when possible
- Implement lazy loading for images

## Security Best Practices

### Authentication
- Never store credentials in code
- Use Supabase Auth for all authentication
- Implement proper session management

### Data Handling
- Validate all inputs on both client and server
- Sanitize data before database operations
- Use parameterized queries to prevent SQL injection

### Environment Variables
- Never commit `.env` files to git
- Use different keys for development and production
- Rotate keys regularly

## Debugging

### Browser DevTools
- Use React Developer Tools extension
- Monitor network requests in Network tab
- Check console for errors and warnings

### Supabase Debugging
- Use Supabase dashboard to monitor API calls
- Check database logs for query performance
- Use Supabase CLI for local debugging

### Common Issues and Solutions

#### Build Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Supabase Connection Issues
```bash
# Check environment variables
echo $REACT_APP_SUPABASE_URL

# Restart Supabase local instance
supabase stop
supabase start
```

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Restart TypeScript service in VS Code
Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

## Git Workflow

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes

### Commit Messages
```
type(scope): description

feat(auth): add login validation
fix(dashboard): resolve performance issue
docs(readme): update setup instructions
```

### Pull Request Process
1. Create feature branch from `main`
2. Make changes and commit with descriptive messages
3. Write tests for new functionality
4. Ensure all tests pass
5. Create pull request with detailed description
6. Request code review
7. Address feedback and merge

## Deployment

### Development Deployment
```bash
# Build the project
npm run build

# Deploy to development environment
[deployment-specific commands]
```

### Production Deployment
```bash
# Set production environment
export NODE_ENV=production

# Build with production config
npm run build

# Run production checks
npm run test:ci
npm run lint:ci

# Deploy
[production-deployment-commands]
```

### Development Best Practices (Updated)

#### Code Quality Standards
- **TypeScript First**: All new code must be written in TypeScript
- **Component Testing**: Minimum 80% test coverage for components
- **Service Testing**: 90% coverage for service layer functions
- **Type Safety**: No `any` types without explicit justification
- **Performance**: Components must meet Core Web Vitals standards

#### Security Guidelines
- **Input Validation**: All user inputs must be validated and sanitized
- **RLS Compliance**: All database operations must respect Row Level Security
- **Error Handling**: Never expose sensitive information in error messages
- **Authentication**: All protected routes must verify user permissions
- **Data Privacy**: PII must be handled according to privacy policies

#### Performance Optimization
- **Bundle Size**: Monitor and optimize JavaScript bundle sizes
- **Database Queries**: Use proper indexing and query optimization
- **Image Optimization**: Implement lazy loading and WebP format
- **Caching Strategy**: Implement appropriate caching for API responses
- **Real-time Updates**: Use WebSocket connections efficiently

## Additional Resources

### External Documentation
- [React 18 Documentation](https://reactjs.org/docs) - Latest React features and patterns
- [Supabase Documentation](https://supabase.com/docs) - Database and authentication
- [TypeScript Handbook](https://www.typescriptlang.org/docs) - Advanced TypeScript concepts
- [Testing Library](https://testing-library.com/docs) - Testing best practices
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Cypress Documentation](https://docs.cypress.io/) - End-to-end testing

### Internal Documentation (Updated)
- `docs/API_DOCUMENTATION.md` - Complete API reference with TypeScript types
- `docs/USER_GUIDE_ADMIN.md` - Admin guide with pulse questions management
- `docs/USER_GUIDE_MANAGER.md` - Manager guide with enhanced team features
- `docs/USER_GUIDE_EMPLOYEE.md` - Employee guide with team health participation
- `docs/DEPLOYMENT_CICD_GUIDE.md` - Production deployment and CI/CD strategies
- `docs/MONITORING_LOGGING_STRATEGY.md` - Observability and performance monitoring

### Development Tools & Resources
- **GitHub Actions**: Automated CI/CD pipelines with TypeScript checking
- **Supabase Dashboard**: Real-time database monitoring and management
- **Vercel Analytics**: Production performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **Lighthouse**: Performance and accessibility auditing

### Support & Community
- **Technical Issues**: Create detailed GitHub issues with reproduction steps
- **Feature Requests**: Use GitHub discussions for feature proposals
- **Security Issues**: Report privately to security@lucerne.com
- **Code Reviews**: All PRs require approval from core team members
- **Documentation**: Contribute to docs for any new features or changes

### Production Readiness Checklist
- [ ] TypeScript compilation passes without errors
- [ ] All tests pass (unit, integration, E2E)
- [ ] Code coverage meets minimum thresholds
- [ ] Performance benchmarks are met
- [ ] Security audit passes
- [ ] Documentation is updated
- [ ] Database migrations are tested
- [ ] Feature flags are configured

**Remember**: EDGE is now production-ready with comprehensive TypeScript support, real-time analytics, and enterprise-grade features. Always prioritize code quality, security, type safety, and maintainability. When in doubt, refer to existing patterns or ask for a code review!

**🎉 Ready for Production Development - All Systems Enhanced! 🎉**