# EDGE Frontend Code Backup - August 12, 2025

**Complete Frontend Code Reference for Edge App**  
*Employee Development & Growth Engine (EDGE)*

Generated: August 12, 2025  
Base Directory: `C:\Users\DavidOkonoski\Documents\edgeapp`

---

## Table of Contents

1. [Configuration Files](#configuration-files)
2. [Public Assets](#public-assets)
3. [Main Entry Files](#main-entry-files)
4. [Service Layer](#service-layer)
5. [Components](#components)
6. [Contexts & Hooks](#contexts--hooks)
7. [Types & Utilities](#types--utilities)

---

## Configuration Files

### package.json

```json
{
  "name": "edge-app",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=22.0.0"
  },
  "dependencies": {
    "@supabase/auth-ui-react": "^0.4.6",
    "@supabase/auth-ui-shared": "^0.1.8",
    "@supabase/supabase-js": "^2.39.0",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.26.1",
    "react-scripts": "5.0.1",
    "recharts": "^3.1.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:prod": "GENERATE_SOURCEMAP=false react-scripts build",
    "test": "react-scripts test",
    "test:watch": "react-scripts test --watchAll",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "test:ci": "react-scripts test --coverage --watchAll=false --ci",
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "test:e2e": "start-server-and-test start http://localhost:3001 cypress:run",
    "test:dev-plan": "start-server-and-test start http://localhost:3001 'cypress run --spec cypress/e2e/development-plan-submission.cy.js'",
    "test:all": "npm run test:ci && npm run test:e2e",
    "lint": "echo 'Linting not configured - using build-time checks'",
    "type-check": "tsc --noEmit",
    "vercel-build": "npm run build",
    "eject": "react-scripts eject"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/jest": "^30.0.0",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vercel/node": "^5.3.11",
    "autoprefixer": "^10.4.21",
    "cypress": "^14.5.3",
    "postcss": "^8.4.31",
    "start-server-and-test": "^2.0.12",
    "tailwindcss": "^3.4.17",
    "typescript": "^4.9.5"
  },
  "overrides": {
    "nth-check": "^2.1.1",
    "svgo": "^3.0.2",
    "webpack-dev-server": "^4.15.1"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "src/**/*.test.ts",
    "src/**/*.test.tsx"
  ]
}
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### vercel.json

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@18"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## Public Assets

### public/index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="EDGE - Employee Development & Growth Engine" />
    <title>EDGE | Lucerne International</title>
  </head>
  <body class="bg-gray-900 text-white">
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

### public/manifest.json

```json
{
  "short_name": "React App",
  "name": "Create React App Sample",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

### public/robots.txt

```
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:
```

---

## Main Entry Files

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

---

## Service Layer

### src/services/supabaseClient.ts

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { getCurrentTenantId } from '../utils/tenant';

// Support both React and Next.js environment variables
const supabaseUrl: string = 
  process.env.NEXT_PUBLIC_SUPABASE_URL! || 
  process.env.REACT_APP_SUPABASE_URL!;

const supabaseAnonKey: string = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || 
  process.env.REACT_APP_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey);

// Set tenant context for RLS policies
export const setTenantContext = async () => {
  const tenantId = getCurrentTenantId();
  try {
    await supabase.rpc('set_config', {
      setting_name: 'app.tenant_id',
      setting_value: tenantId,
      is_local: true
    });
  } catch (error) {
    console.warn('Failed to set tenant context:', error);
  }
};

// Initialize tenant context when client loads
if (typeof window !== 'undefined') {
  setTenantContext();
}
```

### src/services/AdminService.ts

```typescript
// SECURE AdminService.ts - TypeScript version with proper types
import { supabase } from './supabaseClient';
import { validateEmployeeForm, validateReviewCycleForm } from '../utils/validation';
import logger from '../utils/secureLogger';
import csrfProtection from '../utils/csrfProtection';
import { 
  Employee, 
  ReviewCycle, 
  EmployeeFormData,
  ReviewCycleFormData,
  ValidationResult, 
  ApiResponse, 
  ServiceResponse 
} from '../types';

interface AdminFunctionResponse {
  success: boolean;
  user?: any;
  employee?: Employee;
  error?: string;
  [key: string]: any;
}

export class AdminService {
  // VERSION CHECK - Updated August 12, 2025 11:00 AM for Auth User Fix
  static getVersion() {
    console.log('🔍 AdminService Version: AUTH_USER_FIX_v1.1 - August 12, 2025 11:00 AM');
    return 'AUTH_USER_FIX_v1.1';
  }
  // Call secure edge function with proper authentication
  static async callAdminFunction(action: string, data: any): Promise<AdminFunctionResponse> {
    try {
      // Get current session to ensure auth headers are included
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('🔐 Auth session check:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        userEmail: session?.user?.email
      });
      
      if (!session?.access_token) {
        throw new Error('User not authenticated - cannot call admin Edge Function');
      }
      
      const { data: result, error } = await supabase.functions.invoke('admin-operations', {
        body: { action, data },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Edge Function error details:', error);
        throw error;
      }
      
      if (result?.error) {
        console.error('Edge Function result error:', result);
        throw new Error(result.error + (result.debug ? ` | Debug: ${JSON.stringify(result.debug)}` : ''));
      }

      return result as AdminFunctionResponse;
    } catch (error: any) {
      console.error(`Admin operation ${action} failed:`, error);
      throw error;
    }
  }

  // Get all employees for admin management
  static async getAllEmployees(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase.rpc('get_all_employees_for_admin');
      if (error) throw error;
      
      // The function now returns JSON, so we need to parse it
      if (typeof data === 'string') {
        return JSON.parse(data) as Employee[];
      }
      
      // If it's already an array/object, return as is
      return Array.isArray(data) ? data as Employee[] : (data || []);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      
      // Try the backup simple function if the main one fails
      try {
        const { data: backupData, error: backupError } = await supabase.rpc('get_employees_simple');
        if (backupError) throw backupError;
        
        return typeof backupData === 'string' ? JSON.parse(backupData) as Employee[] : (backupData || []);
      } catch (backupErr) {
        console.error('Backup function also failed:', backupErr);
        throw new Error(`Failed to fetch employees: ${error?.message}`);
      }
    }
  }

  // Get potential managers for dropdown
  static async getPotentialManagers(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase.rpc('get_potential_managers');
      if (error) throw error;
      
      // The function now returns JSON, so we need to parse it
      let managers: Employee[];
      if (typeof data === 'string') {
        managers = JSON.parse(data) as Employee[];
      } else {
        managers = Array.isArray(data) ? data as Employee[] : (data || []);
      }
      
      return managers;
    } catch (error: any) {
      console.error('Error fetching potential managers:', error);
      throw new Error(`Failed to fetch managers: ${error?.message}`);
    }
  }

  // Create new employee with security validation - DUAL APPROACH WITH FORCED DEBUGGING
  static async createEmployee(employeeData: EmployeeFormData): Promise<ApiResponse> {
    // FORCED VERSION CHECK - This MUST appear in console if updated code is running
    AdminService.getVersion();
    console.log('🔥 AdminService.createEmployee called with:', employeeData);
    console.log('🔥 CRITICAL: This is the ENHANCED version with auth user validation');
    console.log('🔥 Current timestamp:', new Date().toISOString());
    
    try {
      // Input validation and sanitization
      const validation: ValidationResult = validateEmployeeForm(employeeData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      // Use validated and sanitized data
      const secureData = validation.data as EmployeeFormData;

      // Log security event
      logger.logUserAction('create_employee_attempt', null, { role: secureData.role });

      // APPROACH 1: Try server-side API route first (recommended)
      try {
        console.log('🚀 TRYING SERVER-SIDE API ROUTE APPROACH FIRST');
        
        const response = await fetch('/api/admin/create-employee', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: secureData.email,
            password: secureData.password || 'TempPass123!',
            full_name: secureData.name,
            role: secureData.role,
            job_title: secureData.jobTitle,
            department: secureData.department,
            manager_id: secureData.managerId || null,
          }),
        });

        if (response.ok) {
          const apiResult = await response.json();
          console.log('📡 Server-side API route response:', apiResult);
          
          // CRITICAL: Verify that auth user was actually created
          if (!apiResult.user_id) {
            console.error('💥 CRITICAL: API route succeeded but no user_id returned');
            console.error('💥 This means auth user was NOT created');
            throw new Error('API route failed: No auth user created (user_id is null)');
          }
          
          console.log('✅ Server-side API route succeeded with auth user:', apiResult.user_id);
          
          logger.logUserAction('create_employee_success', null, { 
            user_id: apiResult.user_id,
            employee_id: apiResult.employee_id,
            role: secureData.role,
            approach: 'server_api_route'
          });
          
          return {
            success: true,
            data: {
              user_id: apiResult.user_id,
              employee_id: apiResult.employee_id,
              message: 'Employee created successfully with login account!',
              next_steps: {
                can_login_immediately: true,
                signup_required: false,
                login_credentials: apiResult.login_instructions,
                instructions: `User can log in immediately with email: ${secureData.email} and the provided temporary password.`
              }
            }
          };
        } else {
          const errorResult = await response.json();
          console.error('💥 Server-side API route failed:', errorResult);
          throw new Error(`API route failed: ${errorResult.error} (${errorResult.detail || 'no details'})`);
        }
      } catch (apiError: any) {
        console.error('💥 Server-side API route FAILED - detailed error:', apiError);
        console.log('⚠️ Server-side API route not available, falling back to Edge Function:', apiError.message);
      }

      // APPROACH 2: Fallback to Edge Function (existing working implementation)
      console.log('🚀 FALLBACK: USING EDGE FUNCTION APPROACH - calling admin-operations');
      const result = await this.callAdminFunction('create_user', {
        name: secureData.name,
        email: secureData.email,
        role: secureData.role,
        job_title: secureData.jobTitle,
        department: secureData.department,
        manager_id: secureData.managerId || null,
        temp_password: secureData.password || 'TempPass123!'
      });

      if (!result.success) {
        throw new Error(result.error || 'Edge Function failed');
      }

      // CRITICAL: Verify that auth user was actually created
      if (!result.user?.id) {
        console.error('💥 CRITICAL: Edge Function succeeded but no user_id returned');
        console.error('💥 This means auth user was NOT created');
        throw new Error('Edge Function failed: No auth user created (user_id is null)');
      }

      console.log('✅ Edge Function fallback succeeded with auth user:', result.user.id);

      logger.logUserAction('create_employee_success', null, { 
        user_id: result.user?.id,
        employee_id: result.employee?.id,
        role: secureData.role,
        approach: 'edge_function_fallback'
      });
      
      return {
        success: true,
        data: {
          user_id: result.user?.id,
          employee_id: result.employee?.id,
          message: 'Employee created successfully with login account!',
          next_steps: {
            can_login_immediately: true,
            signup_required: false,
            login_credentials: {
              email: secureData.email,
              password: secureData.password || 'TempPass123!'
            },
            instructions: `User can log in immediately with email: ${secureData.email} and the provided temporary password.`
          }
        }
      };
    } catch (error: any) {
      logger.logError(error, { action: 'create_employee', data: employeeData });
      throw new Error(`Failed to create employee: ${error?.message}`);
    }
  }

  // Additional AdminService methods continued...
  // [Note: The complete AdminService continues with additional methods for updateEmployee, checkCurrentRole, etc.]
}

export default AdminService;
```

### src/services/authService.js

```javascript
import { supabase } from './supabaseClient';

export class AuthService {
  static async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }

  static async getUserRole(userEmail) {
    try {
      console.log('🔍 Looking up user role for:', userEmail);
      
      // First try to get role from employees table
      const { data: employee, error } = await supabase
        .from('employees')
        .select('role, name')
        .eq('email', userEmail.toLowerCase())
        .single();

      if (employee && !error) {
        console.log('✅ Found user in employees table:', employee);
        return {
          role: employee.role,
          name: employee.name
        };
      }

      console.log('⚠️ User not found in employees table, using fallback logic');
      
      // Fallback to hardcoded logic for existing test users
      if (userEmail === 'admin@lucerne.com') {
        return { role: 'admin', name: 'Admin' };
      } else if (userEmail === 'manager@lucerne.com') {
        return { role: 'manager', name: 'Manager' };
      } else if (userEmail === 'employee1@lucerne.com') {
        return { role: 'employee', name: 'Employee 1' };
      }
      
      // Default fallback
      return {
        role: 'employee',
        name: userEmail.split('@')[0]
      };
    } catch (err) {
      console.error('❌ Error fetching user role:', err);
      // Fallback on error
      return {
        role: 'employee',
        name: userEmail.split('@')[0]
      };
    }
  }
}
```

### src/services/index.js

```javascript
export { supabase } from './supabaseClient';
export { AuthService } from './authService';
export { SecureAuthService } from './SecureAuthService';
export { AssessmentService } from './assessmentService';
export { KudosService } from './kudosService';
export { AdminService } from './AdminService';
export { TeamService } from './teamService';
export { FeedbackService } from './feedbackService';
export { NotificationService } from './NotificationService';
export { ManagerPlaybookService } from './ManagerPlaybookService';
export { AdminApprovalService } from './adminApprovalService';
export { default as DepartmentService } from './DepartmentService';
```

### src/services/assessmentService.js

```javascript
import { supabase } from './supabaseClient';

export class AssessmentService {
  static async getMyAssessments() {
    try {
      console.log('Calling reliable get_my_assessments function');
      const { data, error } = await supabase.rpc('get_my_assessments');
      
      if (error) {
        console.error('Error from get_my_assessments:', error);
        throw error;
      }
      
      console.log('Assessments received:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getMyAssessments:', error);
      throw error;
    }
  }

  static async getAssessmentById(assessmentId) {
    const { data, error } = await supabase.rpc('get_assessment_details', {
      p_assessment_id: assessmentId
    });
    if (error) throw error;
    return data;
  }

  static async updateAssessment(assessmentId, updates) {
    try {
      console.log('Updating assessment:', assessmentId, 'with updates:', updates);
      
      const { data, error } = await supabase.rpc('update_assessment', {
        p_assessment_id: assessmentId,
        p_updates: updates
      });
      
      if (error) {
        console.error('Database error updating assessment:', error);
        throw error;
      }
      
      console.log('Update response:', data);
      
      // Check if the response indicates an error from the database function
      if (data && typeof data === 'object' && data.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error in updateAssessment:', error);
      throw error;
    }
  }

  static async submitAssessment(assessmentId) {
    // Direct table update to change status to employee_complete
    const { data, error } = await supabase
      .from('assessments')
      .update({ 
        self_assessment_status: 'employee_complete',
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .select();

    if (error) throw error;
    return data;
  }

  static async submitManagerReview(assessmentId, feedbackData) {
    try {
      console.log('submitManagerReview called for assessment ID:', assessmentId);
      console.log('Submitting manager review with full feedback data:', feedbackData);
      
      // Use the new atomic submit_manager_review function
      const { data, error } = await supabase.rpc('submit_manager_review', {
        p_assessment_id: assessmentId,
        p_feedback: feedbackData
      });

      if (error) {
        console.error('Error in submitManagerReview:', error);
        throw error;
      }
      
      console.log('submitManagerReview success, response:', data);
      
      // Check if the response indicates an error from the database function
      if (data && typeof data === 'object' && data.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('submitManagerReview failed:', error);
      throw error;
    }
  }

  static async acknowledgeReview(assessmentId) {
    // Direct table update to mark review as acknowledged by employee
    const { data, error } = await supabase
      .from('assessments')
      .update({ 
        employee_acknowledgment: true,
        review_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .select();

    if (error) throw error;
    return data;
  }
}
```

### src/services/teamService.js

```javascript
import { supabase } from './supabaseClient';

export class TeamService {
  static async getMyTeam() {
    try {
      console.log('Calling reliable get_my_team function');
      const { data, error } = await supabase.rpc('get_my_team');
      
      if (error) {
        console.error('Error from get_my_team:', error);
        throw error;
      }
      
      console.log('Team data received:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getMyTeam:', error);
      throw error;
    }
  }

  static async getTeamAssessments() {
    try {
      console.log('Calling reliable get_team_assessments function');
      const { data, error } = await supabase.rpc('get_team_assessments');
      
      if (error) {
        console.error('Error from get_team_assessments:', error);
        throw error;
      }
      
      console.log('Team assessments received:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getTeamAssessments:', error);
      throw error;
    }
  }

  static async startReviewCycle(cycleData) {
    try {
      const { data, error } = await supabase.rpc('start_review_cycle', {
        p_cycle_name: cycleData.cycleName,
        p_employee_ids: cycleData.employeeIds,
        p_due_date: cycleData.dueDate
      });
      if (error) {
        if (error.code === 'PGRST202') {
          console.warn('start_review_cycle function not found');
          return { success: false, error: 'Review cycle function not implemented yet' };
        }
        throw error;
      }
      return data;
    } catch (error) {
      if (error.code === 'PGRST202') {
        console.warn('start_review_cycle function not found');
        return { success: false, error: 'Review cycle function not implemented yet' };
      }
      throw error;
    }
  }
}
```

### src/services/feedbackService.js

```javascript
import { supabase } from './supabaseClient';

export class FeedbackService {
  static async giveFeedback(recipientId, feedbackType, message, category = 'general', isAnonymous = false) {
    const { data, error } = await supabase.rpc('give_peer_feedback', {
      p_recipient_id: recipientId,
      p_feedback_type: feedbackType,
      p_message: message,
      p_category: category,
      p_is_anonymous: isAnonymous
    });
    if (error) throw error;
    return data;
  }

  static async getEmployeesForFeedback() {
    const { data, error } = await supabase.rpc('get_employees_for_feedback');
    if (error) throw error;
    return data || [];
  }

  static async getFeedbackWall(limit = 50, feedbackType = null) {
    const { data, error } = await supabase.rpc('get_feedback_wall', {
      p_limit: limit,
      p_feedback_type: feedbackType
    });
    if (error) throw error;
    return data || [];
  }

  static async getMyFeedbackReceived(limit = 20) {
    const { data, error } = await supabase.rpc('get_my_feedback_received', {
      p_limit: limit
    });
    if (error) {
      console.error('API Error:', error);
      throw error;
    }
    return data || [];
  }

  static async getMyFeedbackGiven(limit = 20) {
    const { data, error } = await supabase.rpc('get_my_feedback_given', {
      p_limit: limit
    });
    if (error) throw error;
    return data || [];
  }

  static async markFeedbackHelpful(feedbackId) {
    const { data, error } = await supabase.rpc('mark_feedback_helpful', {
      p_feedback_id: feedbackId
    });
    if (error) throw error;
    return data;
  }

  static async deleteFeedback(feedbackId) {
    const { data, error } = await supabase.rpc('delete_feedback', {
      p_feedback_id: feedbackId
    });
    if (error) throw error;
    return data;
  }
}
```

### src/services/kudosService.js

```javascript
import { supabase } from './supabaseClient';

export class KudosService {
  static async getKudosWall() {
    const { data, error } = await supabase.rpc('get_kudos_wall');
    if (error) throw error;
    return data || [];
  }

  static async giveKudos(kudosData) {
    const { data, error } = await supabase.rpc('give_kudos', {
      p_recipient_id: kudosData.recipientId,
      p_core_value: kudosData.coreValue,
      p_message: kudosData.message
    });
    if (error) throw error;
    return data;
  }

  static async getKudosForEmployee(employeeId) {
    const { data, error } = await supabase.rpc('get_employee_kudos', {
      p_employee_id: employeeId
    });
    if (error) throw error;
    return data || [];
  }
}
```

---

## Main App Structure

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

---

*Note: This backup document contains the first portion of the complete frontend codebase. Due to length limitations, this represents approximately 25% of the total frontend code. The complete backup would continue with all components, contexts, hooks, types, and utilities.*

**Key sections already included:**
- All configuration files
- Public assets
- Main entry files  
- Core service layer including AdminService
- Main App structure

**Still to be included in a complete backup:**
- All React components (pages, modals, UI components)
- Routing components
- Context providers and hooks  
- Type definitions
- Utility functions
- CSS and styling files

This backup can be used as a reference for the current frontend architecture and core functionality of the Edge App.