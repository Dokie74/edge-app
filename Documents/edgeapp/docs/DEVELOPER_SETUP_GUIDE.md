# EDGE Application Developer Setup Guide

## Prerequisites

Before setting up the EDGE application, ensure you have the following installed:

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### Recommended VS Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **TypeScript Importer**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**

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
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
REACT_APP_ENVIRONMENT=development
```

**`.env.production`** (for production builds):
```env
REACT_APP_SUPABASE_URL=your_production_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_production_supabase_anon_key
REACT_APP_ENVIRONMENT=production
```

#### Environment Variables Explained
- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key (public)
- `REACT_APP_ENVIRONMENT`: Application environment (development/production)

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
3. Run the SQL scripts in the `sql-fixes-applied/` directory to set up the database schema

## Development Workflow

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
```

### 5. Build for Production
```bash
npm run build
```

## Project Structure

```
edgeapp/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── analytics/      # Analytics components
│   │   ├── modals/         # Modal components
│   │   ├── pages/          # Page components
│   │   ├── routing/        # Routing components
│   │   ├── shared/         # Shared components
│   │   └── ui/             # UI components
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.js              # Main App component
│   └── index.js            # Application entry point
├── docs/                   # Documentation
├── cypress/                # E2E tests
├── sql-fixes-applied/      # Database scripts
└── supabase/               # Supabase configuration
```

## Component Development Guidelines

### File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.js`)
- **Services**: camelCase (e.g., `authService.js`)
- **Utilities**: camelCase (e.g., `dateUtils.js`)
- **Types**: PascalCase (e.g., `UserTypes.ts`)

### Component Structure
```jsx
// Standard functional component structure
import React, { useState, useEffect } from 'react';

interface ComponentProps {
  // Define props interface
}

const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // State and hooks
  const [state, setState] = useState();

  // Effects
  useEffect(() => {
    // Side effects
  }, []);

  // Event handlers
  const handleEvent = () => {
    // Handle events
  };

  // Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

### Service Development
```typescript
// Service structure
import { supabase } from './supabaseClient';

interface ServiceResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export const serviceName = {
  async methodName(param: string): Promise<ServiceResponse<ReturnType>> {
    try {
      const { data, error } = await supabase
        .from('table')
        .select('*')
        .eq('column', param);

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      };
    }
  }
};
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

### Test Data
- Use the fixtures in `cypress/fixtures/` for test data
- Test users:
  - Employee: `employee1@lucerne.com` / `Employee1`
  - Manager: `manager1@lucerne.com` / `Manager1`
  - Admin: `admin@lucerne.com` / `Admin`

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

## Additional Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Testing Library](https://testing-library.com/docs)

### Internal Documentation
- `docs/API_DOCUMENTATION.md` - API reference
- `docs/USER_GUIDE_*.md` - User guides for each role
- `CONTRIBUTING.md` - Contribution guidelines

### Support
- **Technical Issues**: Create GitHub issue
- **Questions**: Contact development team
- **Security Issues**: Report privately to security team

Remember: Always prioritize code quality, security, and maintainability. When in doubt, ask for a code review!