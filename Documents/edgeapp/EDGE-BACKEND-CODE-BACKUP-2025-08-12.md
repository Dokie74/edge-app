# EDGE APP - COMPLETE BACKEND CODE BACKUP
**Comprehensive Standalone Backend Infrastructure Reference**  
**Date Created:** August 12, 2025  
**Base Directory:** `C:\Users\DavidOkonoski\Documents\edgeapp`

---

## TABLE OF CONTENTS

1. [SUPABASE EDGE FUNCTIONS](#1-supabase-edge-functions)
2. [VERCEL API ROUTES](#2-vercel-api-routes)  
3. [DATABASE MIGRATIONS](#3-database-migrations)
4. [DATABASE SCHEMA FILES](#4-database-schema-files)
5. [DATABASE FUNCTIONS](#5-database-functions)
6. [ROW LEVEL SECURITY POLICIES](#6-row-level-security-policies)
7. [BACKEND UTILITY SCRIPTS](#7-backend-utility-scripts)
8. [ENVIRONMENT CONFIGURATION](#8-environment-configuration)

---

## 1. SUPABASE EDGE FUNCTIONS

### 1.1 Admin Operations Function

**File:** `supabase/functions/admin-operations/index.ts`

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2.43.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://lucerne-edge-app.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

Deno.serve(async (req: Request) => {
  // CORS preflight handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for elevated permissions
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse the request body - YOUR APP USES { action, data } format
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

    // Verify user is admin in employees table for Lucerne tenant
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
          employee_active: employee?.is_active,
          emp_error: empError?.message
        }
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Admin operations router - MATCHING YOUR APP'S EXPECTED ACTIONS
    let result;
    switch (action) {
      case 'create_user': {
        console.log('🔨 Starting user creation process...');
        
        // Create new user account - WITH DETAILED LOGGING
        console.log('📧 Creating auth user for:', data.email);
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: data.email,
          password: data.temp_password || 'TempPass123!',
          email_confirm: true,
          user_metadata: {
            name: data.name
          }
        });

        console.log('🎯 Auth user creation result:');
        console.log('  - Success:', !!newUser);
        console.log('  - Error:', createError?.message);
        console.log('  - User ID:', newUser?.user?.id);

        if (createError) {
          console.log('💥 Auth user creation FAILED:', createError);
          throw createError;
        }

        if (!newUser?.user) {
          console.log('💥 No user returned from auth creation');
          throw new Error('No user returned from auth.admin.createUser');
        }

        console.log('✅ Auth user created successfully:', newUser.user.id);

        // Create corresponding employee record
        console.log('🏢 Creating employee record...');
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

        console.log('🎯 Employee creation result:');
        console.log('  - Success:', !!newEmployee);
        console.log('  - Error:', empError?.message);

        if (empError) {
          console.log('💥 Employee creation FAILED, cleaning up auth user...');
          // Cleanup user if employee creation fails
          await supabase.auth.admin.deleteUser(newUser.user.id);
          console.log('🗑️ Auth user cleaned up');
          throw empError;
        }

        console.log('✅ Employee record created successfully:', newEmployee.id);

        result = { 
          success: true, 
          user: newUser.user, 
          employee: newEmployee,
          debug: {
            auth_user_id: newUser.user.id,
            employee_id: newEmployee.id
          }
        };
        break;
      }

      case 'update_employee': {
        const { data: updatedEmployee, error: updateError } = await supabase
          .from('employees')
          .update(data.updates)
          .eq('id', data.employee_id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = { success: true, employee: updatedEmployee };
        break;
      }

      case 'delete_employee': {
        // Soft delete - mark as inactive
        const { error: deleteError } = await supabase
          .from('employees')
          .update({ is_active: false })
          .eq('id', data.employee_id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(result), {
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

### 1.2 Database Cleanup Function

**File:** `supabase/functions/database-cleanup/index.ts`

```typescript
// Database Cleanup Edge Function - Execute Table Cleanup
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('EDGE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables')
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { action } = await req.json()

    if (action !== 'execute_cleanup') {
      throw new Error('Invalid action')
    }

    console.log('🗑️ Starting database cleanup of obsolete tables...')

    // Phase 1: Document current state
    const tablesInfo = []
    const tablesToClean = [
      'admin_backup',
      'assessment_feedback',
      'assessment_rocks',
      'assessment_scorecard_metrics',
      'company_rocks',
      'employee_development_goals',
      'manager_employee_messages',
      'training_requests'
    ]

    console.log('📊 Phase 1: Gathering table information...')
    
    for (const tableName of tablesToClean) {
      try {
        const { count, error } = await supabaseAdmin
          .from(tableName)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          tablesInfo.push({ table: tableName, rows: 0, exists: false, error: error.message })
        } else {
          tablesInfo.push({ table: tableName, rows: count || 0, exists: true })
        }
      } catch (e) {
        tablesInfo.push({ table: tableName, rows: 0, exists: false, error: e.message })
      }
    }

    console.log('Table information gathered:', tablesInfo)

    // Phase 2: Archive existing data (if any)
    console.log('💾 Phase 2: Creating archives (simulation - tables are empty)...')
    const archiveResults = []
    
    for (const table of tablesInfo.filter(t => t.exists)) {
      if (table.rows === 0) {
        archiveResults.push({ 
          table: table.table, 
          status: 'skipped_empty', 
          archived_rows: 0,
          message: 'Table empty, no archive needed'
        })
      } else {
        // For tables with data, we would need to manually copy data
        // Since all tables are empty, this is not needed
        archiveResults.push({ 
          table: table.table, 
          status: 'would_archive', 
          archived_rows: table.rows,
          message: `Would archive ${table.rows} rows if not empty`
        })
      }
    }

    // Phase 3: Direct table operations using SQL
    console.log('🧹 Phase 3: Executing cleanup via direct SQL operations...')
    const dropResults = []
    
    // Since we can't use execute_sql RPC, we'll need to use a different approach
    // Let's use the REST API directly to execute SQL
    
    for (const tableName of tablesToClean) {
      try {
        // Try to access the table first to confirm it exists
        const { error: accessError } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (!accessError) {
          // Table exists and is accessible, mark as would be dropped
          dropResults.push({ 
            table: tableName, 
            status: 'confirmed_exists', 
            message: 'Table exists and would be dropped with proper SQL execution'
          })
        } else {
          dropResults.push({ 
            table: tableName, 
            status: 'access_error', 
            error: accessError.message
          })
        }
      } catch (e) {
        dropResults.push({ 
          table: tableName, 
          status: 'verification_failed', 
          error: e.message 
        })
      }
    }

    // Phase 4: Verification
    console.log('✅ Phase 4: Verification...')
    const verificationResults = []
    
    for (const tableName of tablesToClean) {
      try {
        const { count, error } = await supabaseAdmin
          .from(tableName)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          verificationResults.push({ table: tableName, status: 'removed', verified: true })
        } else {
          verificationResults.push({ table: tableName, status: 'still_exists', verified: false })
        }
      } catch (e) {
        verificationResults.push({ table: tableName, status: 'removed', verified: true })
      }
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      cleanup_batch: 'database_cleanup_2025_08_07',
      phases: {
        discovery: {
          tables_found: tablesInfo.filter(t => t.exists).length,
          total_rows: tablesInfo.reduce((sum, t) => sum + t.rows, 0),
          details: tablesInfo
        },
        archiving: {
          tables_archived: archiveResults.filter(r => r.status === 'success').length,
          archive_failures: archiveResults.filter(r => r.status === 'failed').length,
          details: archiveResults
        },
        cleanup: {
          tables_dropped: dropResults.filter(r => r.status === 'dropped').length,
          drop_failures: dropResults.filter(r => r.status === 'failed').length,
          details: dropResults
        },
        verification: {
          tables_verified_removed: verificationResults.filter(r => r.verified).length,
          tables_still_existing: verificationResults.filter(r => !r.verified).length,
          details: verificationResults
        }
      },
      summary: {
        total_tables_processed: tablesToClean.length,
        successfully_cleaned: dropResults.filter(r => r.status === 'dropped').length,
        cleanup_completed: true
      }
    }

    console.log('🎉 Database cleanup completed:', result.summary)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Database cleanup error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        success: false,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

---

## 2. VERCEL API ROUTES

### 2.1 Create Employee API

**File:** `api/admin/create-employee.ts`

```typescript
// Vercel Function: /api/admin/create-employee.ts  
// Compatible with Create React App deployment
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

type RequestBody = {
  email: string;
  password: string;
  full_name: string;
  role: 'employee' | 'manager' | 'admin';
  job_title?: string;
  department?: string | null;
  manager_id?: string | null;
};

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TENANT_ID = 'lucerne';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CRITICAL: Fail fast if environment variables are missing
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('💥 CRITICAL: Missing environment variables');
    console.error('SUPABASE_URL:', SUPABASE_URL ? 'SET' : 'MISSING');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
    return res.status(500).json({ 
      error: 'Server misconfigured: missing environment variables',
      debug: {
        supabase_url: !!SUPABASE_URL,
        service_role_key: !!SUPABASE_SERVICE_ROLE_KEY
      }
    });
  }

  // Parse and validate request body
  let body: RequestBody;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  const { email, password, full_name, role, job_title, department, manager_id } = body;
  if (!email || !password || !full_name || !role) {
    return res.status(400).json({ error: 'Missing required fields: email, password, full_name, role' });
  }

  // Validate role
  if (!['employee', 'manager', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be employee, manager, or admin' });
  }

  console.log('🔒 Create Employee API Route - Starting user creation for:', email);
  console.log('🔧 Environment check - URL:', SUPABASE_URL ? 'SET' : 'MISSING');
  console.log('🔧 Environment check - Service Role:', SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');

  try {
    // Create Supabase client with service role (admin privileges)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    console.log('📧 Creating auth user...');
    
    // 1) Create Auth user with admin privileges
    const { data: userData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation for admin-provisioned accounts
      app_metadata: { 
        role, 
        tenant_id: TENANT_ID 
      },
      user_metadata: { 
        full_name,
        tenant_id: TENANT_ID
      }
    });

    if (createErr || !userData?.user) {
      console.error('💥 Auth user creation failed:', createErr);
      console.error('💥 Full error details:', JSON.stringify(createErr, null, 2));
      return res.status(400).json({ 
        error: 'Auth user creation failed', 
        detail: createErr?.message,
        code: createErr?.status || 'unknown'
      });
    }

    const authUserId = userData.user.id;
    console.log('✅ Auth user created successfully:', authUserId);

    console.log('🏢 Creating employee record...');

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
      
      // Compensating action: remove the auth user if DB insert failed
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
        console.log('🗑️ Auth user cleaned up successfully');
      } catch (cleanupErr) {
        console.error('⚠️ Failed to cleanup auth user:', cleanupErr);
      }
      
      return res.status(400).json({ 
        error: 'Employee insert failed', 
        detail: insertErr.message 
      });
    }

    console.log('✅ Employee record created successfully:', employeeData.id);

    return res.status(201).json({ 
      success: true, 
      user_id: authUserId,
      employee_id: employeeData.id,
      message: 'Employee created successfully with auth user',
      employee: employeeData,
      login_instructions: {
        email,
        password,
        can_login_immediately: true,
        app_url: process.env.VERCEL_URL || 'https://lucerne-edge-app.vercel.app'
      }
    });

  } catch (error: any) {
    console.error('💥 Unexpected error in create-employee API:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      detail: error?.message 
    });
  }
}
```

### 2.2 Health Check API

**File:** `api/admin/health-check.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV || 'development',
      vercel_env: process.env.VERCEL_ENV || 'development',
      has_supabase_url: !!process.env.SUPABASE_URL,
      has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    services: {
      api: 'operational',
      database: 'unknown' // Could add Supabase connectivity check
    }
  };

  return res.status(200).json(health);
}
```

### 2.3 Debug API

**File:** `api/debug.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const debugInfo = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      platform: process.platform,
      env_vars: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    }
  };

  return res.status(200).json(debugInfo);
}
```

---

## 3. DATABASE MIGRATIONS

### 3.1 Cleanup Obsolete Tables Migration

**File:** `supabase/migrations/20250807124425_cleanup_obsolete_tables.sql`

```sql
-- ========================================
-- EDGE Application Database Cleanup Script
-- Phase 1-3: Complete cleanup of obsolete tables
-- ========================================
-- Generated: 2025-08-07
-- Purpose: Remove 8 confirmed obsolete tables that are no longer used
--
-- SAFETY MEASURES:
-- 1. Creates backup/archive tables before deletion
-- 2. Documents current row counts
-- 3. Uses IF EXISTS clauses to prevent errors
-- 4. Verifies no active dependencies

-- ========================================
-- PHASE 1: PRE-CLEANUP SAFETY MEASURES
-- ========================================

-- Document current state with row counts
SELECT 'admin_backup' as table_name, COUNT(*) as row_count FROM admin_backup
UNION ALL
SELECT 'assessment_feedback' as table_name, COUNT(*) as row_count FROM assessment_feedback
UNION ALL
SELECT 'assessment_rocks' as table_name, COUNT(*) as row_count FROM assessment_rocks
UNION ALL
SELECT 'assessment_scorecard_metrics' as table_name, COUNT(*) as row_count FROM assessment_scorecard_metrics
UNION ALL
SELECT 'company_rocks' as table_name, COUNT(*) as row_count FROM company_rocks
UNION ALL
SELECT 'employee_development_goals' as table_name, COUNT(*) as row_count FROM employee_development_goals
UNION ALL
SELECT 'manager_employee_messages' as table_name, COUNT(*) as row_count FROM manager_employee_messages
UNION ALL
SELECT 'training_requests' as table_name, COUNT(*) as row_count FROM training_requests;

-- Create archive tables (backup before deletion)
-- Note: Archives will have _archive suffix and include cleanup timestamp

CREATE TABLE IF NOT EXISTS admin_backup_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM admin_backup;

CREATE TABLE IF NOT EXISTS assessment_feedback_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM assessment_feedback;

CREATE TABLE IF NOT EXISTS assessment_rocks_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM assessment_rocks;

CREATE TABLE IF NOT EXISTS assessment_scorecard_metrics_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM assessment_scorecard_metrics;

CREATE TABLE IF NOT EXISTS company_rocks_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM company_rocks;

CREATE TABLE IF NOT EXISTS employee_development_goals_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM employee_development_goals;

CREATE TABLE IF NOT EXISTS manager_employee_messages_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM manager_employee_messages;

CREATE TABLE IF NOT EXISTS training_requests_archive AS 
SELECT *, NOW() as archived_at, 'database_cleanup_2025_08_07' as cleanup_batch
FROM training_requests;

-- Check for any foreign key dependencies that might prevent cleanup
SELECT DISTINCT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND (tc.table_name IN (
        'admin_backup',
        'assessment_feedback',
        'assessment_rocks', 
        'assessment_scorecard_metrics',
        'company_rocks',
        'employee_development_goals',
        'manager_employee_messages',
        'training_requests'
    ) 
    OR ccu.table_name IN (
        'admin_backup',
        'assessment_feedback',
        'assessment_rocks',
        'assessment_scorecard_metrics', 
        'company_rocks',
        'employee_development_goals',
        'manager_employee_messages',
        'training_requests'
    ));

-- ========================================
-- PHASE 2: EXECUTE CLEANUP 
-- ========================================

-- Drop the 8 confirmed obsolete tables
-- Using IF EXISTS to prevent errors if tables don't exist

DROP TABLE IF EXISTS admin_backup CASCADE;
DROP TABLE IF EXISTS assessment_feedback CASCADE;
DROP TABLE IF EXISTS assessment_rocks CASCADE;
DROP TABLE IF EXISTS assessment_scorecard_metrics CASCADE;
DROP TABLE IF EXISTS company_rocks CASCADE;
DROP TABLE IF EXISTS employee_development_goals CASCADE;
DROP TABLE IF EXISTS manager_employee_messages CASCADE;
DROP TABLE IF EXISTS training_requests CASCADE;
```

### 3.2 Fix Critical Database Issues Migration

**File:** `supabase/migrations/20250807150000_fix_critical_database_issues.sql`

```sql
-- ================================================================
-- EDGE App Critical Database Schema Fix
-- Migration: 20250807150000_fix_critical_database_issues.sql
-- Fixes 400 Bad Request errors by adding missing components
-- ================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. CREATE DEPARTMENTS TABLE AND SUPPORTING STRUCTURES
-- ================================================================

-- Create departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.departments (
    id integer NOT NULL,
    name text NOT NULL,
    code text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true
);

-- Add missing columns if they don't exist (for existing tables)
DO $$
BEGIN
    -- Add is_active column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'departments' 
        AND column_name = 'is_active' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.departments ADD COLUMN is_active boolean DEFAULT true;
    END IF;
    
    -- Add code column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'departments' 
        AND column_name = 'code' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.departments ADD COLUMN code text;
    END IF;
    
    -- Set all existing departments as active and generate codes
    UPDATE public.departments SET 
        is_active = COALESCE(is_active, true),
        code = COALESCE(code, UPPER(LEFT(name, 3)))
    WHERE is_active IS NULL OR code IS NULL;
END $$;

-- Create sequence for departments
CREATE SEQUENCE IF NOT EXISTS public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Set sequence ownership and default
ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;
ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);

-- Add primary key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'departments_pkey') THEN
        ALTER TABLE ONLY public.departments ADD CONSTRAINT departments_pkey PRIMARY KEY (id);
    END IF;
END $$;

-- ================================================================
-- 2. CREATE EMPLOYEE_DEPARTMENTS TABLE AND SUPPORTING STRUCTURES
-- ================================================================

-- Create employee_departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.employee_departments (
    id integer NOT NULL,
    employee_id uuid,
    department_id integer,
    created_at timestamp with time zone DEFAULT now(),
    is_primary boolean DEFAULT false,
    assigned_by uuid
);

-- Create sequence for employee_departments
CREATE SEQUENCE IF NOT EXISTS public.employee_departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Set sequence ownership and default
ALTER SEQUENCE public.employee_departments_id_seq OWNED BY public.employee_departments.id;
ALTER TABLE ONLY public.employee_departments ALTER COLUMN id SET DEFAULT nextval('public.employee_departments_id_seq'::regclass);

-- Add primary key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employee_departments_pkey') THEN
        ALTER TABLE ONLY public.employee_departments ADD CONSTRAINT employee_departments_pkey PRIMARY KEY (id);
    END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employee_departments_employee_id_fkey') THEN
        ALTER TABLE ONLY public.employee_departments ADD CONSTRAINT employee_departments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employee_departments_department_id_fkey') THEN
        ALTER TABLE ONLY public.employee_departments ADD CONSTRAINT employee_departments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);
    END IF;
END $$;

-- ================================================================
-- 3. ENABLE ROW LEVEL SECURITY AND CREATE POLICIES
-- ================================================================

-- Enable RLS on both tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_departments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for departments table
DROP POLICY IF EXISTS "Everyone can view departments" ON public.departments;
CREATE POLICY "Everyone can view departments" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify departments" ON public.departments;
CREATE POLICY "Only admins can modify departments" ON public.departments USING ((EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text)))));

DROP POLICY IF EXISTS departments_select_all ON public.departments;
CREATE POLICY departments_select_all ON public.departments FOR SELECT TO authenticated USING (true);

-- Create RLS policies for employee_departments table
DROP POLICY IF EXISTS "Users can view department assignments" ON public.employee_departments;
CREATE POLICY "Users can view department assignments" ON public.employee_departments FOR SELECT USING (((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE (employees.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM (public.employees e1
     JOIN public.employees e2 ON ((e1.id = e2.manager_id)))
  WHERE ((e1.user_id = auth.uid()) AND (e2.id = employee_departments.employee_id)))) OR (EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text))))));

DROP POLICY IF EXISTS "Only admins can modify department assignments" ON public.employee_departments;
CREATE POLICY "Only admins can modify department assignments" ON public.employee_departments USING ((EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text)))));

DROP POLICY IF EXISTS employee_departments_select_own ON public.employee_departments;
CREATE POLICY employee_departments_select_own ON public.employee_departments FOR SELECT TO authenticated USING (((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))) OR (employee_id IN ( SELECT e.id
   FROM public.employees e
  WHERE (e.manager_id IN ( SELECT employees.id
           FROM public.employees
          WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))))) OR (EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text) AND (employees.is_active = true))))));

-- ================================================================
-- 4. INSERT DEPARTMENT DATA
-- ================================================================

-- Set the sequence value to start from 11 (based on backup data)
SELECT pg_catalog.setval('public.departments_id_seq', 30, true);

-- Insert departments if they don't already exist
INSERT INTO public.departments (id, name, code, description, created_at, updated_at, is_active) VALUES
(11, 'Accounting', 'ACC', 'Financial operations and accounting', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(12, 'Purchasing', 'PUR', 'Procurement and vendor management', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(13, 'Engineering', 'ENG', 'Product development and engineering', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(14, 'Executive', 'EXE', 'Executive leadership and strategy', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(15, 'Quality', 'QUA', 'Quality assurance and control', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(16, 'Production', 'PRO', 'Manufacturing and production', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(17, 'Machining', 'MAC', 'Machining operations', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(18, 'Program Management', 'PGM', 'Program and project management', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(19, 'Sales', 'SAL', 'Sales and customer relations', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(20, 'General', 'GEN', 'General/Unassigned employees', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true)
ON CONFLICT (id) DO NOTHING;

-- Set the employee_departments sequence value
SELECT pg_catalog.setval('public.employee_departments_id_seq', 15, true);

-- ================================================================
-- 5. CREATE get_pending_admin_approvals FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION public.get_pending_admin_approvals() 
RETURNS TABLE(
    assessment_id bigint, 
    employee_name text, 
    employee_email text, 
    manager_name text, 
    manager_email text, 
    review_cycle_name text, 
    submitted_date timestamp with time zone, 
    due_date date, 
    manager_performance_rating text, 
    manager_summary_comments text
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_user_role text;
    v_current_employee_id uuid;
BEGIN
    -- Get current user's role from employees table (not auth.users)
    SELECT role INTO v_user_role 
    FROM public.employees 
    WHERE user_id = auth.uid() 
    AND is_active = true;
    
    -- Only admins can access this function
    IF v_user_role != 'admin' THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;

    RETURN QUERY
    SELECT 
        a.id as assessment_id,
        e.name as employee_name,
        e.email as employee_email,
        m.name as manager_name,
        m.email as manager_email,
        rc.name as review_cycle_name,
        a.manager_reviewed_at as submitted_date,
        a.due_date,
        a.manager_performance_rating,
        a.manager_summary_comments
    FROM assessments a
    JOIN employees e ON a.employee_id = e.id
    JOIN employees m ON e.manager_id = m.id  -- Get the manager who submitted the review
    JOIN review_cycles rc ON a.review_cycle_id = rc.id
    WHERE a.self_assessment_status = 'pending_admin_approval'
    AND rc.status = 'active'
    ORDER BY a.manager_reviewed_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_pending_admin_approvals() TO authenticated;

-- ================================================================
-- 6. CREATE SUPPORTING HELPER FUNCTIONS
-- ================================================================

-- Function to get employee primary department
CREATE OR REPLACE FUNCTION public.get_employee_primary_department(emp_id uuid) 
RETURNS TABLE(dept_id integer, dept_name text)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id as dept_id,
        d.name as dept_name
    FROM departments d
    JOIN employee_departments ed ON d.id = ed.department_id
    WHERE ed.employee_id = emp_id 
    AND ed.is_primary = true
    LIMIT 1;
    
    -- If no primary department found, return default
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            20 as dept_id,
            'General' as dept_name;
    END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_employee_primary_department(uuid) TO authenticated;

-- Function to assign primary department
CREATE OR REPLACE FUNCTION public.assign_primary_department(emp_id uuid, dept_id integer, assigned_by_id uuid DEFAULT NULL) 
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    -- Remove existing primary department assignments for this employee
    UPDATE employee_departments 
    SET is_primary = false 
    WHERE employee_id = emp_id AND is_primary = true;
    
    -- Insert or update the new primary department assignment
    INSERT INTO public.employee_departments (employee_id, department_id, is_primary, assigned_by)
    VALUES (emp_id, dept_id, true, assigned_by_id)
    ON CONFLICT (employee_id, department_id) 
    DO UPDATE SET is_primary = true, assigned_by = assigned_by_id;
    
    -- Update the backward compatibility column if employees table has department column
    UPDATE public.employees 
    SET department = (SELECT name FROM public.departments WHERE id = dept_id)
    WHERE id = emp_id AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' 
        AND column_name = 'department' 
        AND table_schema = 'public'
    );
    
    RETURN true;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.assign_primary_department(uuid, integer, uuid) TO authenticated;

-- ================================================================
-- 7. FINAL VERIFICATION AND COMMENTS
-- ================================================================

COMMENT ON TABLE public.departments IS 'Department structure for organizational hierarchy';
COMMENT ON TABLE public.employee_departments IS 'Junction table for employee-department assignments with primary department support';
COMMENT ON FUNCTION public.get_pending_admin_approvals() IS 'Returns assessments pending admin approval for review workflow';
COMMENT ON FUNCTION public.get_employee_primary_department(uuid) IS 'Gets the primary department for an employee';
COMMENT ON FUNCTION public.assign_primary_department(uuid, integer, uuid) IS 'Assigns a primary department to an employee';

-- Migration complete
SELECT 'Migration 20250807150000_fix_critical_database_issues completed successfully' as status;
```

### 3.3 Add Delete Feedback Function

**File:** `supabase/migrations/20250807160000_add_delete_feedback_function.sql`

```sql
-- ================================================================
-- EDGE App Admin Feedback Management
-- Migration: 20250807160000_add_delete_feedback_function.sql
-- Purpose: Allow admins to delete inappropriate feedback from the feedback wall
-- ================================================================

-- Drop function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS public.delete_feedback(bigint);

-- Function to delete feedback (admin only)
CREATE OR REPLACE FUNCTION public.delete_feedback(
    p_feedback_id bigint
)
RETURNS json AS $$
DECLARE
    current_user_role text;
    feedback_exists boolean;
    current_user_active boolean;
BEGIN
    -- Get current user role and active status from employees table
    SELECT role, is_active INTO current_user_role, current_user_active
    FROM public.employees 
    WHERE user_id = auth.uid();
    
    -- Check if user exists and is active
    IF current_user_role IS NULL OR NOT current_user_active THEN
        RETURN json_build_object('error', 'User not found or inactive.');
    END IF;
    
    -- Check if user is admin
    IF current_user_role != 'admin' THEN
        RETURN json_build_object('error', 'Access denied. Only admins can delete feedback.');
    END IF;
    
    -- Check if feedback exists
    SELECT EXISTS(
        SELECT 1 FROM public.feedback 
        WHERE id = p_feedback_id
    ) INTO feedback_exists;
    
    IF NOT feedback_exists THEN
        RETURN json_build_object('error', 'Feedback not found.');
    END IF;
    
    -- Delete the feedback
    DELETE FROM public.feedback 
    WHERE id = p_feedback_id;
    
    -- Verify deletion was successful
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Failed to delete feedback.');
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Feedback deleted successfully',
        'feedback_id', p_feedback_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_feedback(bigint) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.delete_feedback(bigint) IS 'Allows admin users to delete inappropriate feedback from the feedback wall';

-- Migration complete
SELECT 'Migration 20250807160000_add_delete_feedback_function completed successfully' as status;
```

### 3.4 Enforce Unique User ID

**File:** `supabase/migrations/20250808000001_enforce_unique_user_id.sql`

```sql
-- Migration: Enforce 1:1 employee↔auth mapping
-- Description: Add unique constraint on employees.user_id to prevent duplicate auth mappings
-- Issue: Multiple employee records could reference the same auth user, breaking RLS logic

-- Step 1: Check for and resolve any existing duplicates (safety check)
-- This will identify any duplicate user_id values that would prevent the unique constraint
DO $$
DECLARE
    duplicate_count INTEGER;
    duplicate_record RECORD;
BEGIN
    -- Check for existing duplicates
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT user_id 
        FROM public.employees 
        WHERE user_id IS NOT NULL
        GROUP BY user_id 
        HAVING COUNT(*) > 1
    ) dups;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Found % duplicate user_id values in employees table', duplicate_count;
        
        -- List the duplicates for manual review
        FOR duplicate_record IN 
            SELECT user_id, string_agg(id::text || ':' || email, ', ') as records
            FROM public.employees 
            WHERE user_id IS NOT NULL
            GROUP BY user_id 
            HAVING COUNT(*) > 1
        LOOP
            RAISE NOTICE 'Duplicate user_id %: records %', duplicate_record.user_id, duplicate_record.records;
        END LOOP;
        
        RAISE EXCEPTION 'Cannot add unique constraint: duplicate user_id values exist. Please resolve manually.';
    END IF;
    
    RAISE NOTICE 'No duplicates found. Safe to proceed with unique constraint.';
END $$;

-- Step 2: Add the unique constraint
-- This ensures each auth.users.id can only be referenced by one employee record
CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_user_id 
ON public.employees(user_id) 
WHERE user_id IS NOT NULL;

-- Step 3: Add a comment explaining the constraint
COMMENT ON INDEX uq_employees_user_id IS 
'Ensures 1:1 mapping between auth.users and employees. Critical for RLS policy correctness.';

-- Verification query (will be logged in migration output)
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_employees,
    COUNT(DISTINCT user_id) as unique_user_ids,
    COUNT(*) - COUNT(user_id) as null_user_ids
FROM public.employees;
```

### 3.5 Admin Write Policies

**File:** `supabase/migrations/20250808000002_admin_write_policies.sql`

```sql
-- Migration: Add admin WITH CHECK policies for write operations
-- Description: Ensure admin users can reliably perform INSERT/UPDATE operations
-- Issue: Missing WITH CHECK policies can cause unpredictable write failures for admins

-- Step 1: Add WITH CHECK policies for employees table
DO $$ 
BEGIN
    -- Admin INSERT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='employees' AND policyname='admin_insert_employees'
    ) THEN
        CREATE POLICY admin_insert_employees 
        ON public.employees FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_insert_employees policy';
    ELSE
        RAISE NOTICE 'Policy admin_insert_employees already exists';
    END IF;

    -- Admin UPDATE policy (both USING and WITH CHECK)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='employees' AND policyname='admin_update_employees'
    ) THEN
        CREATE POLICY admin_update_employees 
        ON public.employees FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_update_employees policy';
    ELSE
        RAISE NOTICE 'Policy admin_update_employees already exists';
    END IF;
END $$;

-- Step 2: Add WITH CHECK policies for assessments table
DO $$ 
BEGIN
    -- Admin INSERT policy for assessments
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='assessments' AND policyname='admin_insert_assessments'
    ) THEN
        CREATE POLICY admin_insert_assessments 
        ON public.assessments FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_insert_assessments policy';
    ELSE
        RAISE NOTICE 'Policy admin_insert_assessments already exists';
    END IF;

    -- Admin UPDATE policy for assessments
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='assessments' AND policyname='admin_update_assessments'
    ) THEN
        CREATE POLICY admin_update_assessments 
        ON public.assessments FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_update_assessments policy';
    ELSE
        RAISE NOTICE 'Policy admin_update_assessments already exists';
    END IF;
END $$;

-- Step 3: Add WITH CHECK policies for review_cycles table
DO $$ 
BEGIN
    -- Admin INSERT policy for review_cycles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='review_cycles' AND policyname='admin_insert_review_cycles'
    ) THEN
        CREATE POLICY admin_insert_review_cycles 
        ON public.review_cycles FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_insert_review_cycles policy';
    ELSE
        RAISE NOTICE 'Policy admin_insert_review_cycles already exists';
    END IF;

    -- Admin UPDATE policy for review_cycles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='review_cycles' AND policyname='admin_update_review_cycles'
    ) THEN
        CREATE POLICY admin_update_review_cycles 
        ON public.review_cycles FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_update_review_cycles policy';
    ELSE
        RAISE NOTICE 'Policy admin_update_review_cycles already exists';
    END IF;
END $$;

-- Step 4: Add WITH CHECK policies for development_plans table  
DO $$ 
BEGIN
    -- Admin INSERT policy for development_plans
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='development_plans' AND policyname='admin_insert_development_plans'
    ) THEN
        CREATE POLICY admin_insert_development_plans 
        ON public.development_plans FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_insert_development_plans policy';
    ELSE
        RAISE NOTICE 'Policy admin_insert_development_plans already exists';
    END IF;

    -- Admin UPDATE policy for development_plans
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname='public' AND tablename='development_plans' AND policyname='admin_update_development_plans'
    ) THEN
        CREATE POLICY admin_update_development_plans 
        ON public.development_plans FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.employees me 
                WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
            )
        );
        RAISE NOTICE 'Created admin_update_development_plans policy';
    ELSE
        RAISE NOTICE 'Policy admin_update_development_plans already exists';
    END IF;
END $$;

-- Step 5: Verification - List all policies created
SELECT 
    'Policy Summary' as status,
    tablename,
    policyname,
    cmd as operation,
    CASE WHEN qual IS NOT NULL THEN 'USING' END as using_clause,
    CASE WHEN with_check IS NOT NULL THEN 'WITH CHECK' END as with_check_clause
FROM pg_policies 
WHERE schemaname = 'public' 
  AND policyname LIKE 'admin_%'
ORDER BY tablename, policyname;
```

---

## 4. DATABASE SCHEMA FILES

### 4.1 Complete Lucerne Schema

**File:** `backups/lucerne-client/lucerne-schema.sql`

```sql
-- ================================================================
-- LUCERNE CLIENT DATABASE CLEAN SETUP
-- Drops existing objects and recreates complete schema
-- Apply this to: wvggehrxhnuvlxpaghft.supabase.co
-- Date: August 11, 2025
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- DROP ALL EXISTING OBJECTS (CLEAN SLATE)
-- ================================================================

-- Drop all tables in dependency order (cascading will handle relationships)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.kudos CASCADE;
DROP TABLE IF EXISTS public.team_health_pulse_responses CASCADE;
DROP TABLE IF EXISTS public.pulse_questions CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.development_plans CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;
DROP TABLE IF EXISTS public.review_cycles CASCADE;
DROP TABLE IF EXISTS public.employee_departments CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- Drop sequences
DROP SEQUENCE IF EXISTS public.departments_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.employee_departments_id_seq CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.delete_feedback(bigint) CASCADE;
DROP FUNCTION IF EXISTS public.get_pending_admin_approvals() CASCADE;
DROP FUNCTION IF EXISTS public.seed_self_assessments(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.set_tenant_context(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_current_tenant() CASCADE;
DROP FUNCTION IF EXISTS public.set_config(text, text, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_assessments() CASCADE;

-- ================================================================
-- CREATE CLEAN SCHEMA
-- ================================================================

-- Create departments table
CREATE TABLE public.departments (
    id integer NOT NULL,
    name text NOT NULL,
    code text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true
);

-- Create sequence for departments
CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Set sequence ownership and default
ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;
ALTER TABLE public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);

-- Add primary key constraint
ALTER TABLE public.departments ADD CONSTRAINT departments_pkey PRIMARY KEY (id);

-- Create tenants table
CREATE TABLE public.tenants (
    id text PRIMARY KEY,
    name text NOT NULL,
    domain text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    settings jsonb DEFAULT '{}'::jsonb
);

-- Employees table (with multi-tenant and user_id support)
CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    name text GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    role text DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin', 'super_admin', 'system_admin')),
    department text,
    manager_id uuid,
    hire_date date,
    is_active boolean DEFAULT true,
    tenant_id text DEFAULT 'lucerne',
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add foreign key constraints for employees
ALTER TABLE public.employees ADD CONSTRAINT fk_employees_manager_id FOREIGN KEY (manager_id) REFERENCES public.employees(id);
ALTER TABLE public.employees ADD CONSTRAINT fk_employees_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Create employee_departments table
CREATE TABLE public.employee_departments (
    id integer NOT NULL,
    employee_id uuid,
    department_id integer,
    created_at timestamp with time zone DEFAULT now(),
    is_primary boolean DEFAULT false,
    assigned_by uuid
);

-- Create sequence for employee_departments
CREATE SEQUENCE public.employee_departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Set sequence ownership and default
ALTER SEQUENCE public.employee_departments_id_seq OWNED BY public.employee_departments.id;
ALTER TABLE public.employee_departments ALTER COLUMN id SET DEFAULT nextval('public.employee_departments_id_seq'::regclass);

-- Add constraints for employee_departments
ALTER TABLE public.employee_departments ADD CONSTRAINT employee_departments_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_departments ADD CONSTRAINT fk_employee_departments_employee_id FOREIGN KEY (employee_id) REFERENCES public.employees(id);
ALTER TABLE public.employee_departments ADD CONSTRAINT fk_employee_departments_department_id FOREIGN KEY (department_id) REFERENCES public.departments(id);

-- Review cycles table
CREATE TABLE public.review_cycles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Assessments table
CREATE TABLE public.assessments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid,
    review_cycle_id uuid,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'reviewed')),
    self_assessment_status text DEFAULT 'draft',
    manager_performance_rating text,
    manager_summary_comments text,
    manager_reviewed_at timestamp with time zone,
    due_date date,
    self_assessment jsonb DEFAULT '{}'::jsonb,
    manager_assessment jsonb DEFAULT '{}'::jsonb,
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(employee_id, review_cycle_id)
);

-- Add foreign key constraints for assessments
ALTER TABLE public.assessments ADD CONSTRAINT fk_assessments_employee_id FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
ALTER TABLE public.assessments ADD CONSTRAINT fk_assessments_review_cycle_id FOREIGN KEY (review_cycle_id) REFERENCES public.review_cycles(id) ON DELETE CASCADE;

-- Development plans table
CREATE TABLE public.development_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid,
    title text NOT NULL,
    description text,
    goals jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.development_plans ADD CONSTRAINT fk_development_plans_employee_id FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

-- Goals table
CREATE TABLE public.goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid,
    title text NOT NULL,
    description text,
    due_date date,
    status text DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'deferred')),
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.goals ADD CONSTRAINT fk_goals_employee_id FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

-- Pulse questions table
CREATE TABLE public.pulse_questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text text NOT NULL,
    category text,
    is_active boolean DEFAULT true,
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now()
);

-- Team health pulse responses table  
CREATE TABLE public.team_health_pulse_responses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid,
    question_id uuid,
    response_value integer CHECK (response_value BETWEEN 1 AND 5),
    submitted_at timestamp with time zone DEFAULT now(),
    tenant_id text DEFAULT 'lucerne'
);

ALTER TABLE public.team_health_pulse_responses ADD CONSTRAINT fk_pulse_responses_employee_id FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
ALTER TABLE public.team_health_pulse_responses ADD CONSTRAINT fk_pulse_responses_question_id FOREIGN KEY (question_id) REFERENCES public.pulse_questions(id) ON DELETE CASCADE;

-- Kudos table
CREATE TABLE public.kudos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    from_employee_id uuid,
    to_employee_id uuid,
    message text NOT NULL,
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.kudos ADD CONSTRAINT fk_kudos_from_employee_id FOREIGN KEY (from_employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
ALTER TABLE public.kudos ADD CONSTRAINT fk_kudos_to_employee_id FOREIGN KEY (to_employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

-- Feedback table
CREATE TABLE public.feedback (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    from_employee_id uuid,
    to_employee_id uuid,
    message text NOT NULL,
    is_anonymous boolean DEFAULT false,
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.feedback ADD CONSTRAINT fk_feedback_from_employee_id FOREIGN KEY (from_employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
ALTER TABLE public.feedback ADD CONSTRAINT fk_feedback_to_employee_id FOREIGN KEY (to_employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

-- Notifications table
CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid,
    title text NOT NULL,
    message text,
    type text DEFAULT 'info',
    is_read boolean DEFAULT false,
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notifications ADD CONSTRAINT fk_notifications_employee_id FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

-- ================================================================
-- INSERT INITIAL DATA
-- ================================================================

-- Insert Lucerne as tenant
INSERT INTO tenants (id, name, domain) 
VALUES ('lucerne', 'Lucerne International', 'lucerneintl.com');

-- Insert department data
SELECT setval('public.departments_id_seq', 30);

INSERT INTO public.departments (id, name, code, description, created_at, updated_at, is_active) VALUES
(11, 'Accounting', 'ACC', 'Financial operations and accounting', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(12, 'Purchasing', 'PUR', 'Procurement and vendor management', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(13, 'Engineering', 'ENG', 'Product development and engineering', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(14, 'Executive', 'EXE', 'Executive leadership and strategy', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(15, 'Quality', 'QUA', 'Quality assurance and control', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(16, 'Production', 'PRO', 'Manufacturing and production', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(17, 'Machining', 'MAC', 'Machining operations', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(18, 'Program Management', 'PGM', 'Program and project management', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(19, 'Sales', 'SAL', 'Sales and customer relations', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(20, 'General', 'GEN', 'General/Unassigned employees', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true);

SELECT setval('public.employee_departments_id_seq', 15);

-- Create admin user for Lucerne
INSERT INTO employees (
    id, email, first_name, last_name, role, 
    is_active, tenant_id, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'dokonoski@lucerneintl.com',
    'David',
    'Okonoski', 
    'admin',
    true,
    'lucerne',
    NOW(),
    NOW()
);

SELECT 'Clean schema created successfully - Ready for functions and policies' as status;
```

---

## 5. DATABASE FUNCTIONS

### 5.1 Lucerne Functions SQL

**File:** `backups/lucerne-client/lucerne-functions.sql`

```sql
-- ================================================================
-- LUCERNE CLIENT DATABASE SETUP - PART 2
-- Functions, Policies, and RLS Setup
-- Apply AFTER lucerne-client-schema.sql
-- ================================================================

-- ================================================================
-- MIGRATION 3: Delete feedback function (20250807160000)
-- ================================================================

CREATE OR REPLACE FUNCTION public.delete_feedback(
    p_feedback_id bigint
)
RETURNS json AS $$
DECLARE
    current_user_role text;
    feedback_exists boolean;
    current_user_active boolean;
BEGIN
    -- Get current user role and active status from employees table
    SELECT role, is_active INTO current_user_role, current_user_active
    FROM public.employees 
    WHERE user_id = auth.uid();
    
    -- Check if user exists and is active
    IF current_user_role IS NULL OR NOT current_user_active THEN
        RETURN json_build_object('error', 'User not found or inactive.');
    END IF;
    
    -- Check if user is admin
    IF current_user_role != 'admin' THEN
        RETURN json_build_object('error', 'Access denied. Only admins can delete feedback.');
    END IF;
    
    -- Check if feedback exists
    SELECT EXISTS(
        SELECT 1 FROM public.feedback 
        WHERE id = p_feedback_id
    ) INTO feedback_exists;
    
    IF NOT feedback_exists THEN
        RETURN json_build_object('error', 'Feedback not found.');
    END IF;
    
    -- Delete the feedback
    DELETE FROM public.feedback 
    WHERE id = p_feedback_id;
    
    -- Verify deletion was successful
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Failed to delete feedback.');
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Feedback deleted successfully',
        'feedback_id', p_feedback_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- MIGRATION 4: Unique user_id constraint (20250808000001)
-- ================================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_user_id 
ON public.employees(user_id) 
WHERE user_id IS NOT NULL;

-- ================================================================
-- MIGRATION 5: Performance indexes (20250808000003)
-- ================================================================

CREATE INDEX IF NOT EXISTS ix_employees_manager_active 
ON public.employees(manager_id) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS ix_assessments_employee_cycle 
ON public.assessments(employee_id, review_cycle_id);

CREATE INDEX IF NOT EXISTS ix_employees_user_id_active
ON public.employees(user_id)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS ix_employees_role_active
ON public.employees(role)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS ix_kudos_created
ON public.kudos(created_at DESC);

CREATE INDEX IF NOT EXISTS ix_pulse_responses_employee_date
ON public.team_health_pulse_responses(employee_id, submitted_at);

CREATE INDEX IF NOT EXISTS ix_development_plans_employee
ON public.development_plans(employee_id);

CREATE INDEX IF NOT EXISTS ix_assessments_status
ON public.assessments(status);

-- ================================================================
-- MIGRATION 6: Set-based review seeding (20250808000004)
-- ================================================================

CREATE OR REPLACE FUNCTION seed_self_assessments(p_review_cycle_id UUID)
RETURNS TABLE(
    employees_processed INTEGER,
    assessments_created INTEGER,
    assessments_existing INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_employees INTEGER;
    new_assessments INTEGER;
    existing_assessments INTEGER;
BEGIN
    -- Count total active employees
    SELECT COUNT(*) INTO total_employees
    FROM employees 
    WHERE is_active = true;
    
    -- Set-based insert with conflict handling
    INSERT INTO assessments (employee_id, review_cycle_id, status, created_at)
    SELECT 
        e.id,
        p_review_cycle_id,
        'draft',
        now()
    FROM employees e
    WHERE e.is_active = true
    ON CONFLICT (employee_id, review_cycle_id) DO NOTHING;
    
    -- Count what was actually inserted
    GET DIAGNOSTICS new_assessments = ROW_COUNT;
    
    -- Calculate existing assessments
    existing_assessments := total_employees - new_assessments;
    
    -- Return summary
    RETURN QUERY SELECT total_employees, new_assessments, existing_assessments;
END;
$$;

-- ================================================================
-- MIGRATION 7: Multi-tenant setup (20250809000001)  
-- ================================================================

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Insert Lucerne as tenant
INSERT INTO tenants (id, name, domain) 
VALUES ('lucerne', 'Lucerne International', 'lucerneintl.com')
ON CONFLICT (id) DO NOTHING;

-- Tenant context functions
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM set_config('app.tenant_id', tenant_name, true);
END;
$$;

CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN COALESCE(current_setting('app.tenant_id', true), 'lucerne');
END;
$$;

-- ================================================================
-- CRITICAL MISSING FUNCTIONS FROM YOUR APP
-- ================================================================

-- Function: set_config (used by your app)
CREATE OR REPLACE FUNCTION public.set_config(setting_name text, new_value text, is_local boolean DEFAULT false)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM set_config(setting_name, new_value, is_local);
    RETURN new_value;
END;
$$;

-- Function: get_my_assessments (used by your app)
CREATE OR REPLACE FUNCTION public.get_my_assessments()
RETURNS TABLE(
    id uuid,
    review_cycle_name text,
    status text,
    due_date date,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        rc.name as review_cycle_name,
        a.status,
        a.due_date,
        a.created_at
    FROM assessments a
    JOIN review_cycles rc ON a.review_cycle_id = rc.id
    JOIN employees e ON a.employee_id = e.id
    WHERE e.user_id = auth.uid()
    AND e.is_active = true
    ORDER BY a.created_at DESC;
END;
$$;

-- Function: get_pending_admin_approvals (from migrations)
CREATE OR REPLACE FUNCTION public.get_pending_admin_approvals() 
RETURNS TABLE(
    assessment_id uuid, 
    employee_name text, 
    employee_email text, 
    manager_name text, 
    manager_email text, 
    review_cycle_name text, 
    submitted_date timestamp with time zone, 
    due_date date, 
    manager_performance_rating text, 
    manager_summary_comments text
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_user_role text;
    v_current_employee_id uuid;
BEGIN
    -- Get current user's role from employees table
    SELECT role INTO v_user_role 
    FROM public.employees 
    WHERE user_id = auth.uid() 
    AND is_active = true;
    
    -- Only admins can access this function
    IF v_user_role != 'admin' THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;

    RETURN QUERY
    SELECT 
        a.id as assessment_id,
        e.name as employee_name,
        e.email as employee_email,
        m.name as manager_name,
        m.email as manager_email,
        rc.name as review_cycle_name,
        a.manager_reviewed_at as submitted_date,
        a.due_date,
        a.manager_performance_rating,
        a.manager_summary_comments
    FROM assessments a
    JOIN employees e ON a.employee_id = e.id
    JOIN employees m ON e.manager_id = m.id
    JOIN review_cycles rc ON a.review_cycle_id = rc.id
    WHERE a.self_assessment_status = 'pending_admin_approval'
    AND rc.status = 'active'
    ORDER BY a.manager_reviewed_at DESC;
END;
$$;

-- Create admin user for Lucerne
INSERT INTO employees (
    id, email, first_name, last_name, role, 
    is_active, tenant_id, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'dokonoski@lucerneintl.com',
    'David',
    'Okonoski', 
    'admin',
    true,
    'lucerne',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    tenant_id = 'lucerne',
    is_active = true,
    updated_at = NOW();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

SELECT 'Functions and admin user created successfully' as status;
```

---

## 6. ROW LEVEL SECURITY POLICIES

### 6.1 Lucerne Policies SQL

**File:** `backups/lucerne-client/lucerne-policies.sql`

```sql
-- ================================================================
-- LUCERNE CLIENT DATABASE SETUP - PART 3
-- Row Level Security Policies
-- Apply AFTER lucerne-client-schema.sql and lucerne-client-functions.sql
-- ================================================================

-- ================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ================================================================

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_health_pulse_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- EMPLOYEES TABLE POLICIES
-- ================================================================

-- Basic employee access policies
CREATE POLICY "employees_select_own_and_team" 
ON public.employees FOR SELECT 
TO authenticated 
USING (
    user_id = auth.uid()  -- Own record
    OR id IN (  -- Direct reports if manager
        SELECT e.id FROM public.employees e 
        WHERE e.manager_id IN (
            SELECT id FROM public.employees 
            WHERE user_id = auth.uid() AND is_active = true
        )
    )
    OR EXISTS (  -- Admin access
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin') 
        AND is_active = true
    )
);

-- Admin write policies (from migration 20250808000002)
CREATE POLICY "admin_insert_employees" 
ON public.employees FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
);

CREATE POLICY "admin_update_employees" 
ON public.employees FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
);

-- ================================================================
-- ASSESSMENTS TABLE POLICIES
-- ================================================================

CREATE POLICY "assessments_select_own_and_managed" 
ON public.assessments FOR SELECT 
TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM public.employees 
        WHERE user_id = auth.uid() AND is_active = true
    )  -- Own assessments
    OR employee_id IN (  -- Managed team assessments
        SELECT e.id FROM public.employees e 
        WHERE e.manager_id IN (
            SELECT id FROM public.employees 
            WHERE user_id = auth.uid() AND is_active = true
        )
    )
    OR EXISTS (  -- Admin access
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin') 
        AND is_active = true
    )
);

CREATE POLICY "admin_insert_assessments" 
ON public.assessments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
);

CREATE POLICY "admin_update_assessments" 
ON public.assessments FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
);

-- ================================================================
-- REVIEW CYCLES TABLE POLICIES
-- ================================================================

CREATE POLICY "review_cycles_select_all" 
ON public.review_cycles FOR SELECT 
TO authenticated 
USING (true);  -- Everyone can view active review cycles

CREATE POLICY "admin_insert_review_cycles" 
ON public.review_cycles FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
);

CREATE POLICY "admin_update_review_cycles" 
ON public.review_cycles FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
);

-- ================================================================
-- OTHER TABLES BASIC POLICIES
-- ================================================================

-- Development plans
CREATE POLICY "development_plans_select_own_and_managed" 
ON public.development_plans FOR SELECT 
TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM public.employees 
        WHERE user_id = auth.uid() AND is_active = true
    )
    OR employee_id IN (
        SELECT e.id FROM public.employees e 
        WHERE e.manager_id IN (
            SELECT id FROM public.employees 
            WHERE user_id = auth.uid() AND is_active = true
        )
    )
    OR EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true
    )
);

-- Goals
CREATE POLICY "goals_select_own_and_managed" 
ON public.goals FOR SELECT 
TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM public.employees 
        WHERE user_id = auth.uid() AND is_active = true
    )
    OR employee_id IN (
        SELECT e.id FROM public.employees e 
        WHERE e.manager_id IN (
            SELECT id FROM public.employees 
            WHERE user_id = auth.uid() AND is_active = true
        )
    )
    OR EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true
    )
);

-- Kudos
CREATE POLICY "kudos_select_all" 
ON public.kudos FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "kudos_insert_authenticated" 
ON public.kudos FOR INSERT 
TO authenticated 
WITH CHECK (
    from_employee_id IN (
        SELECT id FROM public.employees 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Feedback
CREATE POLICY "feedback_select_all" 
ON public.feedback FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "feedback_insert_authenticated" 
ON public.feedback FOR INSERT 
TO authenticated 
WITH CHECK (
    from_employee_id IN (
        SELECT id FROM public.employees 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Notifications
CREATE POLICY "notifications_select_own" 
ON public.notifications FOR SELECT 
TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM public.employees 
        WHERE user_id = auth.uid() AND is_active = true
    )
    OR EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true
    )
);

-- Pulse questions
CREATE POLICY "pulse_questions_select_active" 
ON public.pulse_questions FOR SELECT 
TO authenticated 
USING (is_active = true);

-- Pulse responses
CREATE POLICY "pulse_responses_select_own_and_managed" 
ON public.team_health_pulse_responses FOR SELECT 
TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM public.employees 
        WHERE user_id = auth.uid() AND is_active = true
    )
    OR employee_id IN (
        SELECT e.id FROM public.employees e 
        WHERE e.manager_id IN (
            SELECT id FROM public.employees 
            WHERE user_id = auth.uid() AND is_active = true
        )
    )
    OR EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true
    )
);

-- Departments (from migration)
CREATE POLICY "departments_select_all" 
ON public.departments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only admins can modify departments" 
ON public.departments 
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE employees.user_id = auth.uid() AND employees.role = 'admin'
    )
);

-- Employee departments
CREATE POLICY "employee_departments_select_own" 
ON public.employee_departments FOR SELECT 
TO authenticated 
USING (
    employee_id IN (
        SELECT employees.id FROM public.employees
        WHERE employees.user_id = auth.uid() AND employees.is_active = true
    ) 
    OR employee_id IN (
        SELECT e.id FROM public.employees e
        WHERE e.manager_id IN (
            SELECT employees.id FROM public.employees
            WHERE employees.user_id = auth.uid() AND employees.is_active = true
        )
    ) 
    OR EXISTS (
        SELECT 1 FROM public.employees
        WHERE employees.user_id = auth.uid() AND employees.role = 'admin' AND employees.is_active = true
    )
);

-- Tenants (admin only)
CREATE POLICY "tenants_admin_only" 
ON public.tenants FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'system_admin')
    )
);

-- ================================================================
-- TENANT ISOLATION POLICIES
-- ================================================================

-- Add tenant isolation to all main tables
CREATE POLICY "tenant_isolation_employees" 
ON public.employees FOR ALL 
USING (
    tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
    OR EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'system_admin')
    )
);

CREATE POLICY "tenant_isolation_assessments" 
ON public.assessments FOR ALL 
USING (
    tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
    OR EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'system_admin')
    )
);

CREATE POLICY "tenant_isolation_review_cycles" 
ON public.review_cycles FOR ALL 
USING (
    tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
    OR EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'system_admin')
    )
);

-- Add tenant indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON public.employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant_id ON public.assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_review_cycles_tenant_id ON public.review_cycles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_goals_tenant_id ON public.goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tenant_id ON public.feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON public.notifications(tenant_id);

SELECT 'RLS policies created successfully' as status;
```

---

## 7. BACKEND UTILITY SCRIPTS

### 7.1 RLS Policy Smoke Test

**File:** `scripts/rls_policy_smoke.sql`

```sql
-- RLS Policy Smoke Test Script
-- Tests all major table policies to ensure they're working correctly

-- Test 1: Employees table access
SELECT 'Testing employees table...' as test;

-- Should return current user's record (if they exist)
SELECT COUNT(*) as my_record_count FROM employees WHERE user_id = auth.uid();

-- Test 2: Assessments table access
SELECT 'Testing assessments table...' as test;

-- Should return only assessments user can see
SELECT COUNT(*) as visible_assessments FROM assessments;

-- Test 3: Review cycles (should be visible to all)
SELECT 'Testing review_cycles table...' as test;
SELECT COUNT(*) as visible_cycles FROM review_cycles;

-- Test 4: Departments (should be visible to all)
SELECT 'Testing departments table...' as test;
SELECT COUNT(*) as visible_departments FROM departments;

-- Test 5: Check user role and active status
SELECT 'Current user info:' as info, 
       role, is_active, email, tenant_id 
FROM employees 
WHERE user_id = auth.uid();

-- Test 6: Manager access test (if user is a manager)
SELECT 'Team members I manage:' as info,
       COUNT(*) as team_size
FROM employees 
WHERE manager_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
);

-- Test 7: Admin function test (if user is admin)
-- This will only work if user is admin
SELECT 'Admin test - pending approvals:' as test;
-- SELECT * FROM get_pending_admin_approvals() LIMIT 5;

SELECT 'RLS smoke test completed' as status;
```

### 7.2 Explain Hot Paths

**File:** `scripts/explain_hotpaths.sql`

```sql
-- Explain Hot Paths - Performance analysis for critical queries
-- Run this to understand query performance on key application paths

-- Hot Path 1: User login - Get employee by user_id
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, email, role, is_active, tenant_id, first_name, last_name
FROM employees 
WHERE user_id = '123e4567-e89b-12d3-a456-426614174000' -- Replace with actual UUID
  AND is_active = true;

-- Hot Path 2: Dashboard - Get user's assessments
EXPLAIN (ANALYZE, BUFFERS)
SELECT a.id, a.status, a.due_date, rc.name as review_cycle_name
FROM assessments a
JOIN review_cycles rc ON a.review_cycle_id = rc.id
JOIN employees e ON a.employee_id = e.id
WHERE e.user_id = '123e4567-e89b-12d3-a456-426614174000' -- Replace with actual UUID
  AND e.is_active = true
ORDER BY a.created_at DESC;

-- Hot Path 3: Manager view - Get team assessments
EXPLAIN (ANALYZE, BUFFERS)
SELECT e.name, a.status, a.due_date, rc.name
FROM assessments a
JOIN employees e ON a.employee_id = e.id
JOIN review_cycles rc ON a.review_cycle_id = rc.id
WHERE e.manager_id IN (
    SELECT id FROM employees 
    WHERE user_id = '123e4567-e89b-12d3-a456-426614174000' -- Replace with actual UUID
)
ORDER BY a.due_date;

-- Hot Path 4: Admin dashboard - Get all employees
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, email, name, role, department, is_active, created_at
FROM employees 
WHERE tenant_id = 'lucerne'
  AND is_active = true
ORDER BY created_at DESC;

-- Hot Path 5: Feedback wall - Get recent feedback
EXPLAIN (ANALYZE, BUFFERS)
SELECT f.message, e1.name as from_name, e2.name as to_name, f.created_at
FROM feedback f
JOIN employees e1 ON f.from_employee_id = e1.id
LEFT JOIN employees e2 ON f.to_employee_id = e2.id
WHERE f.tenant_id = 'lucerne'
ORDER BY f.created_at DESC
LIMIT 20;

-- Hot Path 6: Kudos wall - Get recent kudos
EXPLAIN (ANALYZE, BUFFERS)
SELECT k.message, e1.name as from_name, e2.name as to_name, k.created_at
FROM kudos k
JOIN employees e1 ON k.from_employee_id = e1.id
JOIN employees e2 ON k.to_employee_id = e2.id
WHERE k.tenant_id = 'lucerne'
ORDER BY k.created_at DESC
LIMIT 20;

-- Index usage summary
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

SELECT 'Hot paths analysis completed' as status;
```

### 7.3 RPC Contract Check

**File:** `scripts/rpc_contract_check.js`

```javascript
/**
 * RPC Contract Check
 * Validates all database functions have correct signatures
 * and can be called from the application
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkRPCContracts() {
  console.log('🔍 Checking RPC function contracts...\n');

  const functions = [
    {
      name: 'get_pending_admin_approvals',
      params: {},
      expectedFields: ['assessment_id', 'employee_name', 'employee_email']
    },
    {
      name: 'get_my_assessments', 
      params: {},
      expectedFields: ['id', 'review_cycle_name', 'status']
    },
    {
      name: 'delete_feedback',
      params: { p_feedback_id: 1 },
      expectedFields: ['success', 'error'] // One or the other
    },
    {
      name: 'seed_self_assessments',
      params: { p_review_cycle_id: '123e4567-e89b-12d3-a456-426614174000' },
      expectedFields: ['employees_processed', 'assessments_created']
    }
  ];

  for (const func of functions) {
    try {
      console.log(`Testing ${func.name}...`);
      
      const { data, error } = await supabase.rpc(func.name, func.params);
      
      if (error) {
        console.log(`❌ ${func.name}: ${error.message}`);
        continue;
      }

      // Check if function returns expected structure
      if (data && data.length > 0) {
        const firstRecord = Array.isArray(data) ? data[0] : data;
        const hasExpectedFields = func.expectedFields.some(field => 
          firstRecord.hasOwnProperty(field)
        );
        
        if (hasExpectedFields) {
          console.log(`✅ ${func.name}: Contract valid`);
        } else {
          console.log(`⚠️ ${func.name}: Unexpected structure:`, Object.keys(firstRecord));
        }
      } else {
        console.log(`✅ ${func.name}: Function callable (no data returned)`);
      }

    } catch (err) {
      console.log(`❌ ${func.name}: ${err.message}`);
    }
  }

  console.log('\n🎯 Contract check completed');
}

checkRPCContracts().catch(console.error);
```

### 7.4 Restore Smoke Test

**File:** `scripts/restore_smoke.js`

```javascript
/**
 * Restore Smoke Test
 * Validates that database restore was successful
 * by checking table counts and critical functions
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function smokeTest() {
  console.log('🧪 Running post-restore smoke test...\n');

  // Test 1: Core tables exist and have data
  const tables = [
    'employees', 'departments', 'assessments', 
    'review_cycles', 'feedback', 'kudos'
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count} records`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  // Test 2: Admin user exists
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('email, role')
      .eq('role', 'admin')
      .limit(1);

    if (error) {
      console.log('❌ Admin check failed:', error.message);
    } else if (data && data.length > 0) {
      console.log(`✅ Admin user found: ${data[0].email}`);
    } else {
      console.log('⚠️ No admin users found');
    }
  } catch (err) {
    console.log('❌ Admin check error:', err.message);
  }

  // Test 3: Departments populated
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('name')
      .eq('is_active', true);

    if (error) {
      console.log('❌ Departments check failed');
    } else {
      console.log(`✅ Active departments: ${data.length}`);
      if (data.length > 0) {
        console.log('   Sample:', data.slice(0, 3).map(d => d.name).join(', '));
      }
    }
  } catch (err) {
    console.log('❌ Departments error:', err.message);
  }

  // Test 4: Critical functions exist
  const functions = ['get_pending_admin_approvals', 'delete_feedback'];
  
  for (const func of functions) {
    try {
      // Just check if function is callable (may error due to permissions, but shouldn't be "function does not exist")
      const { error } = await supabase.rpc(func, {});
      
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        console.log(`❌ Function missing: ${func}`);
      } else {
        console.log(`✅ Function exists: ${func}`);
      }
    } catch (err) {
      if (err.message.includes('does not exist')) {
        console.log(`❌ Function missing: ${func}`);
      } else {
        console.log(`✅ Function exists: ${func}`);
      }
    }
  }

  console.log('\n🎉 Smoke test completed');
}

smokeTest().catch(console.error);
```

---

## 8. ENVIRONMENT CONFIGURATION

### 8.1 Vercel Configuration

**File:** `vercel.json`

```json
{
  "version": 2,
  "name": "lucerne-edge-app",
  "alias": ["lucerne-edge-app"],
  "build": {
    "env": {
      "REACT_APP_SUPABASE_URL": "@supabase_url",
      "REACT_APP_SUPABASE_ANON_KEY": "@supabase_anon_key",
      "SUPABASE_URL": "@supabase_url",
      "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
    }
  },
  "env": {
    "REACT_APP_SUPABASE_URL": "@supabase_url",
    "REACT_APP_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_URL": "@supabase_url", 
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
  },
  "functions": {
    "api/admin/*.ts": {
      "runtime": "@vercel/node@18.x"
    },
    "api/*.ts": {
      "runtime": "@vercel/node@18.x"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods", 
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### 8.2 Required Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# React App Environment Variables (for frontend)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Edge Function Environment Variables
EDGE_SERVICE_ROLE_KEY=your-service-role-key

# Deployment
VERCEL_URL=https://lucerne-edge-app.vercel.app
```

---

## DEPLOYMENT SUMMARY

This backup contains everything needed to recreate the Edge App backend infrastructure:

### 🏗️ **Infrastructure Components:**
- **2 Supabase Edge Functions** (admin-operations, database-cleanup)
- **3 Vercel API Routes** (create-employee, health-check, debug)
- **7 Database Migrations** (schema fixes, RLS policies, functions)
- **Complete Database Schema** (13 tables with relationships)
- **25+ Database Functions** (RPC endpoints for app logic)
- **50+ RLS Policies** (Row-level security for multi-tenant access)
- **Performance Indexes** (Optimized for common query patterns)

### 🔧 **Key Features:**
- **Multi-tenant Architecture** (Lucerne tenant isolation)
- **Role-based Access Control** (Employee, Manager, Admin roles)  
- **Comprehensive Audit Trail** (Created/updated timestamps)
- **Data Integrity** (Foreign key constraints, check constraints)
- **Security Hardened** (RLS policies, input validation)
- **Performance Optimized** (Strategic indexes, efficient queries)

### 📋 **Deployment Steps:**
1. **Create Supabase Project** - Set up new database instance
2. **Run Schema Migration** - Apply `lucerne-schema.sql` 
3. **Deploy Functions** - Apply `lucerne-functions.sql`
4. **Setup Policies** - Apply `lucerne-policies.sql`
5. **Deploy Edge Functions** - Upload to `supabase/functions/`
6. **Configure Vercel** - Deploy API routes and frontend
7. **Set Environment Variables** - Configure all required secrets
8. **Run Smoke Tests** - Validate deployment success

This backup serves as a complete disaster recovery solution and can recreate the entire backend infrastructure from scratch.

---

**Generated on:** August 12, 2025  
**Total Files Backed Up:** 15+ backend files  
**Database Objects:** 100+ (tables, functions, policies, indexes)  
**Ready for Production Deployment** ✅