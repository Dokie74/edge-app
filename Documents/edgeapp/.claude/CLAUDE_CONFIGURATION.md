# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Reading

**🔗 Developer's Guide**: Located in `.claude/DEVELOPERS_GUIDE.md` - **READ THIS FIRST** when starting work on this project. Contains comprehensive project architecture, coding standards, workflows, and team conventions that must be followed.

**📋 Project Communications**: All Claude-related documentation, agents, and project communications are organized in the `.claude/` folder to keep the project root clean.

## Development Commands

### Basic Commands
- `npm start` - Start development server on port 3001 (not 3000)
- `npm run build` - Build for production (creates sourcemaps by default)
- `npm run build:prod` - Production build without sourcemaps (GENERATE_SOURCEMAP=false)
- `npm run type-check` - Run TypeScript type checking without emitting files
- `npm test` - Run unit tests (uses React Testing Library + Jest)

### Testing Commands
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:ci` - Run tests for CI (no watch mode)
- `npm run cypress:open` - Open Cypress GUI for E2E testing
- `npm run cypress:run` - Run Cypress tests headlessly
- `npm run test:e2e` - Full E2E test suite with server startup
- `npm run test:all` - Run both unit and E2E tests

### Special Commands
- `npm run lint` - Currently outputs placeholder message (no linter configured)
- `npm run vercel-build` - Special Vercel build command with legacy peer deps

### Supabase CLI Commands (Local Development)
- `npx supabase start` - Start local Supabase stack (Postgres, Auth, Storage, Studio)
- `npx supabase stop` - Stop local Supabase services
- `npx supabase status` - Check status of local services
- `npx supabase functions new [name]` - Create new Edge Function
- `npx supabase functions serve` - Serve Edge Functions locally
- `npx supabase functions deploy [name]` - Deploy function to cloud
- `npx supabase db reset` - Reset local database to latest migration
- `npx supabase migration new [name]` - Create new database migration
- `npx supabase db diff` - Generate migration from schema changes

## Environment Setup

### Required Environment Variables (.env file)
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REACT_APP_ENV=production
```

### Local Development Environment (Supabase CLI)
```
Local API URL: http://127.0.0.1:54321
Local DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Local Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**Local Development Workflow:**
- Start with `npx supabase start` to spin up full local stack
- Use local anon key for testing Edge Functions and API calls
- Access Studio at http://127.0.0.1:54323 for database management
- Functions directory: `supabase/functions/`
- All services run offline with full Supabase feature set

### Node.js Requirements
- Node.js version >=22.0.0 (enforced in package.json engines)
- npm is the preferred package manager

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 with TypeScript (mixed .js/.tsx files)
- **Styling**: Tailwind CSS with responsive design
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: React Context API with useReducer pattern
- **Icons**: Lucide React
- **Charts**: Recharts for analytics
- **Testing**: Jest + React Testing Library + Cypress E2E

### Core Application Structure

#### Authentication & Authorization
- Supabase Auth with email/password authentication
- Role-based access control: employee, manager, admin
- Row Level Security (RLS) enforced at database level
- User roles stored in `employees` table with fallback logic in `authService.js:19`

#### State Management Architecture
- **AppContext** (`src/contexts/AppContext.js`): Global state with reducer pattern
- **Key State**: user, userRole, userName, activePage, modal, userDataLoading
- **Actions**: SET_USER, SET_USER_DATA, SET_ACTIVE_PAGE, OPEN_MODAL, CLOSE_MODAL

#### Routing & Navigation
- **Single Page Application**: No React Router, page switching via context state
- **Page Renderer**: Dynamic component loading in `App.js:102`
- **Role-Based Pages**: Different dashboard components per role
- **Modal System**: Centralized modal management through context

### Database Schema (Key Tables)
- **employees**: User profiles with role, department, manager relationships
- **review_cycles**: Performance review periods with activation workflow
- **assessments**: Self-assessments and manager reviews linked to cycles
- **development_plans**: Individual Development Plans with manager approval
- **pulse_questions**: Dynamic employee wellbeing survey questions
- **team_health_pulse_responses**: Survey response data
- **kudos**: Recognition system tied to Core Values
- **feedback**: Continuous feedback between team members
- **notifications**: System notifications and alerts

### Component Organization

#### Page Components (`src/components/pages/`)
- **EnhancedDashboard**: Role-specific dashboard with real-time analytics
- **MyTeamEnhanced**: Manager's team view with employee widgets
- **Assessment**: Self-assessment interface with progress saving
- **ManagerReview**: Manager review workflow for team assessments
- **Admin**: System administration with employee/cycle management
- **MyDevelopmentCenterEnhanced**: Development plan creation and tracking

#### Service Layer (`src/services/`)
- **authService.js**: Authentication and role resolution
- **supabaseClient.ts**: Typed Supabase client initialization
- **AdminService.ts**: Admin operations and system stats
- **AnalyticsService.ts**: Performance and trend analytics
- **TeamHealthService.ts**: Employee wellbeing and pulse surveys

#### Shared Components
- **Modals**: Reusable modal components with centralized management
- **UI Components**: Button, Card, LoadingSpinner, ErrorMessage with consistent styling
- **Sidebar**: Fixed navigation with role-based menu items

## Development Patterns

### TypeScript Integration
- **Mixed Codebase**: Legacy .js files with new .tsx TypeScript files
- **Database Types**: Generated types in `src/types/database.ts`
- **Strict Mode**: TypeScript strict mode enabled
- **Type Checking**: Use `npm run type-check` before commits

### Data Flow Architecture
1. **Authentication**: Supabase Auth → AppContext → Role Resolution
2. **Data Fetching**: Service Layer → Components → Real-time Updates
3. **State Updates**: User Actions → Context Dispatch → Component Re-render
4. **Error Handling**: Try-catch with fallback UI and console logging

### Modal Management Pattern
```javascript
// Opening modals
openModal('modalName', { onComplete: refreshData });

// Modal rendering in App.js
{modal.isOpen && modal.name === 'modalName' && (
  <ModalComponent closeModal={closeModal} modalProps={modal.props} />
)}
```

### Real-time Data Strategy
- **Live Updates**: Supabase subscriptions for real-time changes
- **Analytics**: 100% real data from database queries (no simulated metrics)
- **Caching**: Minimal caching, prefer fresh data for accuracy

## Testing Strategy

### Unit Testing
- **Framework**: Jest + React Testing Library
- **Location**: Co-located test files or dedicated test directories
- **Coverage**: Run `npm run test:coverage` for reports

### E2E Testing
- **Framework**: Cypress with comprehensive test suites
- **Organization**: Tests organized by role and feature in `cypress/e2e/`
- **Fixtures**: Test data in `cypress/fixtures/users.json`
- **Commands**: Custom commands in `cypress/support/commands.ts`

### Test Structure
```
cypress/e2e/
├── 1-auth/          # Authentication flows
├── 2-employee/      # Employee features
├── 3-manager/       # Manager workflows  
├── 4-admin/         # Admin functionality
```

## Deployment Configuration

### Vercel Deployment
- **Platform**: Optimized for Vercel static hosting
- **Build**: Uses `vercel-build` script with legacy peer deps
- **Routing**: SPA routing via vercel.json rewrites
- **Static Assets**: Automatic optimization and CDN

### ⚠️ CRITICAL: Always Check Deployment Status
**MANDATORY**: After every git push to Vercel, IMMEDIATELY check deployment status before continuing any debugging or testing.

**Commands to check deployment:**
```bash
# Check Vercel deployment status
vercel --prod

# Or check the Vercel dashboard at vercel.com
```

**Deployment failure indicators:**
- Build errors in Vercel logs
- Runtime configuration errors  
- Function runtime version mismatches
- Missing environment variables

**If deployment fails:**
1. ❌ **STOP ALL DEBUGGING** - Code changes won't help if deployment is broken
2. 🔍 **Read Vercel build logs** - Identify the specific error
3. 🔧 **Fix deployment issue first** - Runtime configs, dependencies, etc.
4. ✅ **Verify successful deployment** - Only then test functionality

**Common deployment fixes:**
- Fix vercel.json runtime configurations
- Update package.json dependencies
- Resolve environment variable issues
- Fix TypeScript compilation errors

### Production Considerations
- **Source Maps**: Disabled in production builds (`GENERATE_SOURCEMAP=false`)
- **Environment**: Production environment detection via `REACT_APP_ENV`
- **Database**: Supabase managed PostgreSQL with connection pooling
- **SSL**: Automatic HTTPS via Vercel

## Code Quality Guidelines

### File Naming Conventions
- **Components**: PascalCase (e.g., `EnhancedDashboard.js`)
- **Services**: camelCase with Service suffix (e.g., `authService.js`)
- **Types**: PascalCase TypeScript files (e.g., `database.ts`)
- **Utils**: camelCase utility functions

### Error Handling Pattern
```javascript
try {
  // Operation
  console.log('✅ Operation successful');
} catch (error) {
  console.error('❌ Operation failed:', error);
  // Fallback behavior
}
```

### Performance Optimization
- **Real Data**: All analytics from actual database queries
- **Lazy Loading**: Dynamic component imports where beneficial
- **Optimized Queries**: Use Supabase select() to limit returned fields
- **Row Level Security**: Database-enforced security for performance

## Security Considerations

### Authentication Security
- **JWT Tokens**: Supabase managed token lifecycle
- **Role Validation**: Server-side role verification in database functions
- **Input Validation**: Client-side validation with server-side enforcement

### Data Protection
- **RLS Policies**: Row Level Security on all sensitive tables
- **Environment Variables**: Secrets management via environment variables
- **SQL Injection**: Parameterized queries through Supabase client

## Dual-System Backup Strategy

### Backup Philosophy
The project maintains **two separate system backups** for effective troubleshooting:

1. **Primary EDGE System** (Gmail login)
   - Database: `blssdohlfcmyhxtpalcf.supabase.co`
   - Purpose: Master development reference
   - Contains: Full feature set, all functions, complete RLS policies

2. **Client Deployments** (Client-specific logins)  
   - Example: Lucerne `wvggehrxhnuvlxpaghft.supabase.co`
   - Purpose: Production deployment states
   - Contains: Working configurations, known issues, troubleshooting guides

### Backup Commands
```bash
# Create backup of primary development system
node backups/create-primary-backup.js

# Create backup of Lucerne client deployment  
node clients/lucerne-international/create-backup.js

# Create both backups
node backups/create-primary-backup.js && node clients/lucerne-international/create-backup.js
```

### Using Backups for Troubleshooting
**When client deployment has issues:**
1. Read client backup to understand current state
2. Read primary backup to see how it should work  
3. Compare configurations to identify differences
4. Fix client by making it match primary (with client customizations)
5. Update client backup after successful resolution

### Backup Documentation  
- **Complete Guide**: `backups/BACKUP_SYSTEM_GUIDE.md`
- **Primary System**: `backups/edge-primary/`
- **Client Systems**: `backups/[client-name]/`