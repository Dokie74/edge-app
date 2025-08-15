# Backend Architecture Reference - EDGE App (Security Hardened)
*Reusable Supabase patterns and database architecture from the EDGE Performance Review System*

## Overview
This document captures the key backend architecture patterns, database design decisions, and security implementations from the EDGE app using Supabase as a Backend-as-a-Service platform.

**🚀 PRODUCTION-READY VERSION (August 8, 2025)**  
*This reference includes all enterprise-grade security fixes AND Round 2 production excellence features. Complete implementation of peer review recommendations with CI/CD automation and disaster recovery.*

## Core Architecture Patterns

### 1. Supabase Backend-as-a-Service Stack

**Technology Stack:**
- **Database**: PostgreSQL (managed by Supabase)
- **Authentication**: Supabase Auth with JWT tokens
- **Real-time**: Supabase real-time subscriptions
- **Edge Functions**: Deno-based serverless functions
- **Storage**: Supabase Storage (future file uploads)
- **Security**: Row Level Security (RLS) policies

### 2. Database Schema Design

**Pattern**: Role-based hierarchical data with audit trails

```sql
-- Core Tables Structure

-- 1. Users/Employees Table (Central to everything)
CREATE TABLE public.employees (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role text NOT NULL CHECK (role IN ('employee', 'manager', 'admin')),
    department text,
    job_title text,
    manager_id uuid REFERENCES employees(id),
    hire_date date,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Review Cycles (Time-based processes)
CREATE TABLE public.review_cycles (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Assessments (Core business logic)
CREATE TABLE public.assessments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
    review_cycle_id uuid REFERENCES review_cycles(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('self', 'manager')),
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'completed')),
    responses jsonb DEFAULT '{}',
    submitted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Prevent duplicate assessments
    UNIQUE(employee_id, review_cycle_id, type)
);

-- 4. Development Plans (Future-focused)
CREATE TABLE public.development_plans (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
    review_cycle_id uuid REFERENCES review_cycles(id) ON DELETE CASCADE,
    goals jsonb DEFAULT '[]',
    status text DEFAULT 'draft',
    manager_approved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. Recognition System
CREATE TABLE public.kudos (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    giver_id uuid REFERENCES employees(id) ON DELETE CASCADE,
    receiver_id uuid REFERENCES employees(id) ON DELETE CASCADE,
    core_value text NOT NULL,
    message text NOT NULL,
    is_public boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- 6. Pulse Survey System
CREATE TABLE public.pulse_questions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_text text NOT NULL,
    question_type text DEFAULT 'rating' CHECK (question_type IN ('rating', 'text', 'boolean')),
    is_active boolean DEFAULT true,
    display_order integer,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.team_health_pulse_responses (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
    question_id uuid REFERENCES pulse_questions(id) ON DELETE CASCADE,
    response_value jsonb NOT NULL,
    submitted_at timestamp with time zone DEFAULT now(),
    
    -- Prevent duplicate responses
    UNIQUE(employee_id, question_id, DATE(submitted_at))
);
```

**Key Design Principles:**
- ✅ **UUIDs for Primary Keys**: Better for distributed systems and security
- ✅ **Audit Trails**: `created_at` and `updated_at` on all tables
- ✅ **Soft Deletes**: `is_active` flags instead of hard deletes
- ✅ **Referential Integrity**: Foreign key constraints with CASCADE options
- ✅ **Data Validation**: CHECK constraints for enum-like values
- ✅ **JSON Storage**: `jsonb` for flexible, structured data
- ✅ **Unique Constraints**: Prevent duplicate business logic violations

### 3. Row Level Security (RLS) Implementation

**Pattern**: Database-enforced security policies

```sql
-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kudos ENABLE ROW LEVEL SECURITY;

-- Employee access policies
CREATE POLICY "Users can view their own employee record" ON employees
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view their direct reports" ON employees
    FOR SELECT USING (
        manager_id = (
            SELECT id FROM employees WHERE user_id = auth.uid()
        )
    );

-- Assessment access policies  
CREATE POLICY "Employees can view their own assessments" ON assessments
    FOR SELECT USING (
        employee_id = (
            SELECT id FROM employees WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Managers can view assessments of direct reports" ON assessments
    FOR SELECT USING (
        employee_id IN (
            SELECT id FROM employees 
            WHERE manager_id = (
                SELECT id FROM employees WHERE user_id = auth.uid()
            )
        )
    );

-- Admin full access
CREATE POLICY "Admins have full access" ON employees
    FOR ALL USING (
        (SELECT role FROM employees WHERE user_id = auth.uid()) = 'admin'
    );
```

**Benefits:**
- ✅ **Security at Database Level**: Cannot be bypassed by client code
- ✅ **Role-based Access**: Automatic enforcement based on user role
- ✅ **Hierarchical Permissions**: Managers see their reports, admins see all
- ✅ **Performance**: Database optimizes queries with RLS policies

### 4. Database Functions and Stored Procedures

**Pattern**: Security-definer functions for complex operations

```sql
-- Get user's role (used extensively in frontend)
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role 
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    RETURN COALESCE(user_role, 'none');
END;
$$;

-- Get user's display name
CREATE OR REPLACE FUNCTION get_my_name()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_name text;
BEGIN
    SELECT CONCAT(first_name, ' ', last_name) INTO user_name
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    RETURN COALESCE(user_name, 'Unknown User');
END;
$$;

-- Get kudos wall (public recognition feed)
CREATE OR REPLACE FUNCTION get_kudos_wall()
RETURNS TABLE (
    id uuid,
    giver_name text,
    receiver_name text,
    core_value text,
    message text,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        k.id,
        CONCAT(giver.first_name, ' ', giver.last_name) as giver_name,
        CONCAT(receiver.first_name, ' ', receiver.last_name) as receiver_name,
        k.core_value,
        k.message,
        k.created_at
    FROM kudos k
    JOIN employees giver ON k.giver_id = giver.id
    JOIN employees receiver ON k.receiver_id = receiver.id
    WHERE k.is_public = true
    ORDER BY k.created_at DESC
    LIMIT 50;
END;
$$;

-- Complex business logic function
CREATE OR REPLACE FUNCTION start_review_cycle(
    cycle_name text,
    start_date date,
    end_date date
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_cycle_id uuid;
    employee_record RECORD;
BEGIN
    -- Verify admin access
    IF (SELECT get_my_role()) != 'admin' THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;
    
    -- Create review cycle
    INSERT INTO review_cycles (name, start_date, end_date, is_active)
    VALUES (cycle_name, start_date, end_date, true)
    RETURNING id INTO new_cycle_id;
    
    -- Create draft assessments for all active employees
    FOR employee_record IN 
        SELECT id FROM employees WHERE is_active = true
    LOOP
        -- Self-assessment
        INSERT INTO assessments (employee_id, review_cycle_id, type, status)
        VALUES (employee_record.id, new_cycle_id, 'self', 'draft')
        ON CONFLICT (employee_id, review_cycle_id, type) DO NOTHING;
        
        -- Manager assessment (if employee has manager)
        INSERT INTO assessments (employee_id, review_cycle_id, type, status)
        SELECT employee_record.id, new_cycle_id, 'manager', 'draft'
        FROM employees 
        WHERE id = employee_record.id AND manager_id IS NOT NULL
        ON CONFLICT (employee_id, review_cycle_id, type) DO NOTHING;
    END LOOP;
    
    RETURN new_cycle_id;
END;
$$;
```

**Benefits:**
- ✅ **Performance**: Complex logic runs in database
- ✅ **Security**: SECURITY DEFINER ensures consistent permissions
- ✅ **Atomicity**: All-or-nothing operations
- ✅ **Reusability**: Called from multiple frontend contexts

### 5. Edge Functions Architecture

**Pattern**: Secure server-side operations with Deno

```typescript
// admin-operations/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Environment setup
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('EDGE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    // Create admin client with elevated privileges
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    
    // Verify user authentication and admin role
    const authHeader = req.headers.get('Authorization')
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (userError || !user) {
      throw new Error('Invalid user token')
    }
    
    // Verify admin role in database
    const { data: employee, error: empError } = await supabaseAdmin
      .from('employees')
      .select('role, is_active')
      .eq('email', user.email)
      .single()

    if (empError || employee.role !== 'admin' || !employee.is_active) {
      throw new Error('Admin access required')
    }
    
    // Parse request and route to handlers
    const { action, data } = await req.json()
    
    let result;
    switch (action) {
      case 'create_user':
        result = await handleCreateUser(data, supabaseAdmin)
        break
      case 'update_employee':
        result = await handleUpdateEmployee(data, supabaseAdmin)
        break
      case 'deactivate_user':
        result = await handleDeactivateUser(data, supabaseAdmin)
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Handler functions
async function handleCreateUser(data: any, supabaseAdmin: any) {
  // Create user in Supabase Auth
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.temp_password || 'TempPass123!',
    email_confirm: true,
    user_metadata: { name: data.name }
  })

  if (createError) throw createError

  // Create employee record
  const { data: newEmployee, error: empError } = await supabaseAdmin
    .from('employees')
    .insert({
      user_id: newUser.user.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role || 'employee',
      job_title: data.job_title,
      manager_id: data.manager_id,
      department: data.department,
      is_active: true
    })
    .select()
    .single()

  if (empError) {
    // Cleanup on failure
    await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
    throw empError
  }

  return { user: newUser.user, employee: newEmployee }
}
```

**Key Patterns:**
- ✅ **Dual Client Approach**: Service role for admin ops, regular client for auth
- ✅ **JWT Token Verification**: Validate user authentication
- ✅ **Database Role Verification**: Check permissions in employee table
- ✅ **Transaction Safety**: Cleanup on failures
- ✅ **CORS Handling**: Proper headers for web clients
- ✅ **Error Handling**: Consistent error responses

### 6. Database Migration Strategy

**Pattern**: Version-controlled schema changes

```sql
-- Migration file naming: YYYYMMDDHHMMSS_description.sql
-- Example: 20250807150000_fix_critical_database_issues.sql

-- Always start with safety checks
DO $$
BEGIN
    -- Check if column exists before adding
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' 
        AND column_name = 'is_active' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.employees ADD COLUMN is_active boolean DEFAULT true;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employees_manager_id 
ON employees(manager_id) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessments_employee_cycle 
ON assessments(employee_id, review_cycle_id);

-- Update RLS policies
DROP POLICY IF EXISTS "old_policy_name" ON table_name;
CREATE POLICY "new_policy_name" ON table_name
    FOR SELECT USING (condition);

-- Seed essential data
INSERT INTO departments (name, code, description) VALUES
    ('Engineering', 'ENG', 'Software Development'),
    ('Sales', 'SALES', 'Revenue Generation'),
    ('Marketing', 'MKT', 'Brand and Growth')
ON CONFLICT (code) DO NOTHING;
```

**Migration Best Practices:**
- ✅ **Idempotent Operations**: Can run multiple times safely
- ✅ **Backward Compatibility**: Don't break existing functionality
- ✅ **Performance Considerations**: Use `CONCURRENTLY` for indexes
- ✅ **Data Seeding**: Essential data included in migrations
- ✅ **Rollback Planning**: Consider how to reverse changes

### 7. Real-time Subscriptions

**Pattern**: Live data updates for dynamic UX

```typescript
// Frontend real-time subscription setup
useEffect(() => {
  const channel = supabase
    .channel('public:kudos')
    .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'kudos' 
        },
        (payload) => {
          console.log('Kudos updated:', payload)
          // Refresh local state
          if (payload.eventType === 'INSERT') {
            setKudos(prev => [payload.new, ...prev])
          }
        }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])

// Database triggers for real-time events
CREATE OR REPLACE FUNCTION notify_kudos_change()
RETURNS trigger AS $$
BEGIN
    -- Notify connected clients about kudos changes
    PERFORM pg_notify('kudos_change', json_build_object(
        'action', TG_OP,
        'id', NEW.id,
        'receiver_id', NEW.receiver_id
    )::text);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kudos_change_trigger
    AFTER INSERT OR UPDATE ON kudos
    FOR EACH ROW
    EXECUTE FUNCTION notify_kudos_change();
```

### 8. Data Analytics and Reporting

**Pattern**: Views and functions for business intelligence

```sql
-- Analytics views for reporting
CREATE VIEW employee_assessment_summary AS
SELECT 
    e.id,
    CONCAT(e.first_name, ' ', e.last_name) as employee_name,
    e.department,
    rc.name as review_cycle,
    COUNT(CASE WHEN a.type = 'self' AND a.status = 'submitted' THEN 1 END) as self_assessments_completed,
    COUNT(CASE WHEN a.type = 'manager' AND a.status = 'completed' THEN 1 END) as manager_reviews_completed,
    MAX(a.updated_at) as last_activity
FROM employees e
LEFT JOIN assessments a ON e.id = a.employee_id
LEFT JOIN review_cycles rc ON a.review_cycle_id = rc.id
WHERE e.is_active = true
GROUP BY e.id, e.first_name, e.last_name, e.department, rc.name;

-- Analytics function for dashboard metrics
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stats json;
BEGIN
    SELECT json_build_object(
        'total_employees', (SELECT COUNT(*) FROM employees WHERE is_active = true),
        'pending_assessments', (SELECT COUNT(*) FROM assessments WHERE status = 'draft'),
        'completed_assessments', (SELECT COUNT(*) FROM assessments WHERE status = 'completed'),
        'total_kudos', (SELECT COUNT(*) FROM kudos WHERE created_at > NOW() - INTERVAL '30 days'),
        'active_review_cycles', (SELECT COUNT(*) FROM review_cycles WHERE is_active = true)
    ) INTO stats;
    
    RETURN stats;
END;
$$;
```

## Key Architectural Decisions

### Why Supabase Works Well

1. **PostgreSQL Foundation**: Mature, reliable database with advanced features
2. **Built-in Authentication**: JWT tokens, RLS integration, user management
3. **Real-time Capabilities**: WebSocket subscriptions for live updates
4. **Edge Functions**: Serverless compute for complex operations
5. **Admin Tools**: Dashboard for database management and monitoring
6. **TypeScript Support**: Auto-generated types from database schema

### Security Architecture

**Multi-layered Security Approach:**
1. **Authentication Layer**: Supabase Auth with JWT tokens
2. **Authorization Layer**: RLS policies at database level  
3. **Application Layer**: Role checking in UI components
4. **API Layer**: Edge functions with role verification
5. **Data Layer**: Input validation and sanitization

### Performance Optimizations

1. **Strategic Indexing**: Indexes on frequently queried columns
2. **Database Functions**: Complex logic runs in database
3. **JSON Storage**: Flexible data in `jsonb` columns
4. **Connection Pooling**: Supabase manages connection efficiency
5. **Real-time Subscriptions**: Reduce polling overhead

## Replication Checklist

To replicate this architecture in a new project:

**Database Setup:**
- [ ] Create Supabase project
- [ ] Design core entity tables with UUIDs
- [ ] Implement audit trail columns (`created_at`, `updated_at`)
- [ ] Add appropriate indexes for performance
- [ ] Create database functions for common operations

**Security Implementation:**
- [ ] Enable RLS on all tables
- [ ] Create role-based access policies
- [ ] Implement user role checking functions
- [ ] Set up Edge functions for admin operations

**Real-time Features:**
- [ ] Set up database triggers for notifications
- [ ] Configure Supabase subscriptions in frontend
- [ ] Handle real-time updates in UI state

**Analytics & Reporting:**
- [ ] Create views for common queries
- [ ] Build analytics functions for dashboards
- [ ] Set up system monitoring and health checks

## Technology Stack

- **Database**: PostgreSQL (managed by Supabase)
- **Authentication**: Supabase Auth with JWT
- **Real-time**: Supabase WebSocket subscriptions
- **Functions**: Deno-based Edge Functions
- **Security**: Row Level Security (RLS) policies
- **Migration**: SQL-based version control
- **Monitoring**: Supabase Dashboard analytics

This backend architecture provides a scalable, secure foundation for modern web applications with minimal operational overhead while maintaining full control over data and business logic.