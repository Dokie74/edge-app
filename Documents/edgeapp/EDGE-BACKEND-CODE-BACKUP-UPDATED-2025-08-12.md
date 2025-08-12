# EDGE Backend Code Backup - August 12, 2025 (Updated with API Route Fixes)

## 🚀 CRITICAL UPDATE - API Route Issues & Solutions

**Status:** API routes attempted but failed - Edge Function approach successful  
**Issue:** Create Employee API route has module compatibility issues in Vercel  
**Solution:** Use Edge Function approach while API routes are being debugged

### Multiple Fix Attempts Made:
1. **TypeScript to CommonJS conversion** - Tried require() instead of import
2. **CommonJS to ES Module** - Tried .mjs extension 
3. **Environment variable verification** - Confirmed vars are set in Vercel
4. **Runtime configuration** - Updated vercel.json to support all module types

---

## Vercel Configuration (Updated)

### vercel.json - Enhanced Runtime Support
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@20"
    },
    "api/**/*.js": {
      "runtime": "@vercel/node@20"
    },
    "api/**/*.mjs": {
      "runtime": "@vercel/node@20"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### package.json - Node Runtime Requirements
```json
{
  "name": "edge-app",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=18.0.0"  // Updated from 22.0.0 for Vercel compatibility
  }
}
```

## API Route Attempts

### Attempt 1: TypeScript with ES Modules (FAILED)
```typescript
// api/admin/create-employee.ts - ORIGINAL VERSION
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ... implementation
}
```
**Error:** `SyntaxError: Cannot use import statement outside a module`

### Attempt 2: TypeScript with CommonJS (FAILED)
```typescript
// api/admin/create-employee.ts - COMMONJS VERSION
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // ... implementation
}
```
**Error:** Still module compatibility issues with TypeScript compilation

### Attempt 3: ES Module with .mjs Extension (STILL FAILING)
```javascript
// api/admin/create-employee.mjs - LATEST VERSION
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TENANT_ID = 'lucerne';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CRITICAL: Fail fast if environment variables are missing
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('💥 CRITICAL: Missing environment variables');
    return res.status(500).json({ 
      error: 'Server misconfigured: missing environment variables',
      debug: {
        supabase_url: !!SUPABASE_URL,
        service_role_key: !!SUPABASE_SERVICE_ROLE_KEY
      }
    });
  }

  // Parse and validate request body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  const { email, password, full_name, role, job_title, department, manager_id } = body;
  if (!email || !password || !full_name || !role) {
    return res.status(400).json({ error: 'Missing required fields: email, password, full_name, role' });
  }

  console.log('🔒 Create Employee API Route (.mjs) - Starting user creation for:', email);

  try {
    // Create Supabase client with service role (admin privileges)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1) Create Auth user with admin privileges
    const { data: userData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role, tenant_id: TENANT_ID },
      user_metadata: { full_name, tenant_id: TENANT_ID }
    });

    if (createErr || !userData?.user) {
      console.error('💥 Auth user creation failed:', createErr);
      return res.status(400).json({ 
        error: 'Auth user creation failed', 
        detail: createErr?.message
      });
    }

    const authUserId = userData.user.id;
    console.log('✅ Auth user created successfully:', authUserId);

    // 2) Insert employee row (service role bypasses RLS)
    const nameParts = full_name.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ') || '';

    const { data: employeeData, error: insertErr } = await supabaseAdmin
      .from('employees')
      .insert([{
        user_id: authUserId,
        email,
        name: full_name,
        first_name,
        last_name,
        role,
        job_title: job_title || 'Staff',
        department: department || null,
        manager_id: manager_id || null,
        tenant_id: TENANT_ID,
        is_active: true
      }])
      .select()
      .single();

    if (insertErr) {
      console.error('💥 Employee insert failed, cleaning up auth user...', insertErr);
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return res.status(400).json({ 
        error: 'Employee insert failed', 
        detail: insertErr.message 
      });
    }

    return res.status(201).json({ 
      success: true, 
      user_id: authUserId,
      employee_id: employeeData.id,
      message: 'Employee created successfully with auth user',
      employee: employeeData
    });

  } catch (error) {
    console.error('💥 Unexpected error in create-employee API (.mjs):', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      detail: error?.message 
    });
  }
}
```
**Status:** Still getting FUNCTION_INVOCATION_FAILED in production

## Working Solution: Edge Function Approach

### admin-operations Edge Function (WORKING ✅)
```typescript
// supabase/functions/admin-operations/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://lucerne-edge-app.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for elevated permissions
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data } = await req.json();

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify user is admin
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('role, is_active')
      .eq('email', user.email)
      .eq('tenant_id', 'lucerne')
      .single();

    if (empError || !employee || employee.role !== 'admin' || !employee.is_active) {
      return new Response(JSON.stringify({ 
        error: 'Admin access required',
        debug: {
          user_email: user.email,
          employee_found: !!employee,
          employee_role: employee?.role,
          employee_active: employee?.is_active
        }
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle create_user action
    if (action === 'create_user') {
      console.log('🔨 Starting user creation process...');
      
      // Create new user account
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.temp_password || 'TempPass123!',
        email_confirm: true,
        user_metadata: { name: data.name }
      });

      if (createError || !newUser?.user) {
        console.log('💥 Auth user creation FAILED:', createError);
        throw createError;
      }

      console.log('✅ Auth user created successfully:', newUser.user.id);

      // Create corresponding employee record
      const { data: newEmployee, error: empError } = await supabase
        .from('employees')
        .insert({
          user_id: newUser.user.id,
          email: data.email,
          name: data.name,
          first_name: data.name.split(' ')[0],
          last_name: data.name.split(' ').slice(1).join(' ') || '',
          role: data.role || 'employee',
          job_title: data.job_title,
          department: data.department,
          manager_id: data.manager_id || null,
          is_active: true,
          tenant_id: 'lucerne'
        })
        .select()
        .single();

      if (empError) {
        console.log('💥 Employee creation FAILED, cleaning up auth user...');
        await supabase.auth.admin.deleteUser(newUser.user.id);
        throw empError;
      }

      console.log('✅ Employee record created successfully:', newEmployee.id);

      return new Response(JSON.stringify({ 
        success: true, 
        user: newUser.user, 
        employee: newEmployee,
        debug: {
          auth_user_id: newUser.user.id,
          employee_id: newEmployee.id
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Admin operation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

## Deployment Status

### API Routes: ❌ FAILING
- Multiple module syntax attempts failed
- Vercel FUNCTION_INVOCATION_FAILED errors persist
- Environment variables confirmed set correctly
- Issue appears to be runtime/compilation related

### Edge Functions: ✅ WORKING  
- Successfully deployed to Supabase
- Proper authentication and authorization
- Creates both auth users and employee records
- Used as primary solution

## Environment Variables Required

### Vercel (for API routes - when working):
```
SUPABASE_URL=https://wvggehrxhnuvlxpaghft.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service role key)
```

### Supabase Edge Functions:
```
SUPABASE_URL=https://wvggehrxhnuvlxpaghft.supabase.co  
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service role key)
```

---

**Current Status:** Edge Function approach is deployed and working. API routes remain problematic but are bypassed by the frontend fix. Both auth users and employee records are now created successfully through the Edge Function path.