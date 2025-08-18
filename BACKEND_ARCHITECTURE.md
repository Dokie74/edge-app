# EDGE Backend Architecture Documentation

**Document Version:** 2.0  
**Date:** August 18, 2025  
**Status:** Production Ready - Live Data Implementation Complete

## Overview

The EDGE (Employee Development & Growth Engine) backend architecture is built on Supabase, providing a complete Backend-as-a-Service (BaaS) solution with PostgreSQL database, real-time subscriptions, authentication, and Edge Functions. This document outlines the complete backend structure, database schema, and live data operations.

## Technology Stack

### Core Infrastructure
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL 15** - Primary database with advanced features
- **PostgREST** - Auto-generated REST API from database schema
- **GoTrue** - Authentication and user management
- **Realtime** - WebSocket-based live updates
- **Edge Functions** - Deno-based serverless functions

### Security & Performance
- **Row Level Security (RLS)** - Database-level authorization
- **JWT Authentication** - Stateless token-based auth
- **Database Indexes** - Optimized query performance
- **Connection Pooling** - Efficient database connections
- **CORS Configuration** - Cross-origin resource sharing

## Database Schema

### Core Tables

#### **employees**
Primary user entity with role-based access control.

```sql
CREATE TABLE public.employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  job_title TEXT,
  role TEXT CHECK (role IN ('employee', 'manager', 'admin')) DEFAULT 'employee',
  manager_id UUID REFERENCES employees(id),
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  temp_password TEXT,
  must_change_password BOOLEAN DEFAULT false,
  tenant_id TEXT DEFAULT 'lucerne',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes
CREATE INDEX ix_employees_user_id_active ON employees(user_id, is_active);
CREATE INDEX ix_employees_manager_id ON employees(manager_id);
CREATE INDEX ix_employees_department ON employees(department);
CREATE INDEX ix_employees_role_active ON employees(role, is_active);
```

#### **review_cycles**
Performance review periods and campaign management.

```sql
CREATE TABLE public.review_cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
  tenant_id TEXT DEFAULT 'lucerne',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for cycle queries
CREATE INDEX ix_review_cycles_status ON review_cycles(status);
CREATE INDEX ix_review_cycles_dates ON review_cycles(start_date, end_date);
```

#### **assessments**
Individual performance review instances.

```sql
CREATE TABLE public.assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES review_cycles(id) ON DELETE CASCADE,
  self_assessment_status TEXT CHECK (self_assessment_status IN ('not_started', 'in_progress', 'submitted')) DEFAULT 'not_started',
  manager_review_status TEXT CHECK (manager_review_status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  self_assessment_data JSONB,
  manager_review_data JSONB,
  due_date TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  manager_reviewed_at TIMESTAMPTZ,
  tenant_id TEXT DEFAULT 'lucerne',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Critical performance indexes
CREATE INDEX ix_assessments_employee_cycle ON assessments(employee_id, cycle_id);
CREATE INDEX ix_assessments_status ON assessments(self_assessment_status, manager_review_status);
CREATE INDEX ix_assessments_due_date ON assessments(due_date);
CREATE INDEX ix_assessments_overdue ON assessments(due_date) WHERE self_assessment_status != 'submitted';
```

### Team Health & Pulse System

#### **pulse_questions**
Configurable team health survey questions.

```sql
CREATE TABLE public.pulse_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id TEXT UNIQUE NOT NULL,
  question_text TEXT NOT NULL,
  category TEXT CHECK (category IN ('satisfaction', 'workload', 'support', 'engagement')) NOT NULL,
  type TEXT CHECK (type IN ('scale', 'boolean', 'choice')) DEFAULT 'scale',
  options JSONB, -- For choice questions
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for question management
CREATE INDEX ix_pulse_questions_active ON pulse_questions(is_active, sort_order);
CREATE INDEX ix_pulse_questions_category ON pulse_questions(category, is_active);
```

#### **team_health_pulse_responses**
Employee responses to pulse surveys - **LIVE DATA ONLY**.

```sql
CREATE TABLE public.team_health_pulse_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  employee_id UUID REFERENCES employees(id),
  question_id UUID REFERENCES pulse_questions(id),
  response_value JSONB NOT NULL, -- Stores actual response data
  submitted_at TIMESTAMPTZ DEFAULT now(),
  tenant_id TEXT DEFAULT 'lucerne',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes for analytics
CREATE INDEX ix_pulse_responses_employee_submitted ON team_health_pulse_responses(employee_id, submitted_at);
CREATE INDEX ix_pulse_responses_question_id ON team_health_pulse_responses(question_id);
```

### Extended Features

#### **development_plans**
Employee development and goal tracking.

```sql
CREATE TABLE public.development_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id),
  title TEXT NOT NULL,
  description TEXT,
  goals TEXT NOT NULL,
  skills_to_develop TEXT NOT NULL,
  timeline TEXT,
  status TEXT CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'needs_revision')) DEFAULT 'draft',
  manager_feedback TEXT,
  manager_reviewed_at TIMESTAMPTZ,
  manager_reviewed_by UUID REFERENCES employees(id),
  tenant_id TEXT DEFAULT 'lucerne',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### **notifications**
Real-time notification system.

```sql
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES employees(id),
  sender_id UUID REFERENCES employees(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional structured data
  read_at TIMESTAMPTZ,
  tenant_id TEXT DEFAULT 'lucerne',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for notification queries
CREATE INDEX ix_notifications_recipient ON notifications(recipient_id, created_at);
CREATE INDEX ix_notifications_unread ON notifications(recipient_id, read_at) WHERE read_at IS NULL;
```

## Row Level Security (RLS) Policies

### Employee Data Protection
```sql
-- Employees can only see their own data and their direct reports
CREATE POLICY employee_select_policy ON employees 
FOR SELECT USING (
  auth.uid() = user_id OR 
  id IN (
    SELECT employee_id FROM employees 
    WHERE manager_id = (SELECT id FROM employees WHERE user_id = auth.uid())
  )
);

-- Only admins can modify employee records
CREATE POLICY employee_update_policy ON employees 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin')
);
```

### Assessment Access Control
```sql
-- Employees can see their own assessments and assessments they manage
CREATE POLICY assessment_select_policy ON assessments 
FOR SELECT USING (
  employee_id = (SELECT id FROM employees WHERE user_id = auth.uid()) OR
  employee_id IN (
    SELECT id FROM employees 
    WHERE manager_id = (SELECT id FROM employees WHERE user_id = auth.uid())
  ) OR
  EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND role = 'admin')
);
```

### Pulse Response Privacy
```sql
-- Users can only access their own pulse responses
CREATE POLICY pulse_response_select_policy ON team_health_pulse_responses 
FOR SELECT USING (user_id = auth.uid());

-- Managers can see aggregated data (handled by functions)
-- Admins get full access via admin functions
```

## Edge Functions

### 1. **admin-operations** (`/supabase/functions/admin-operations/`)
Administrative operations and system management.

```typescript
// Core admin operations
export const adminOperations = {
  setupDatabase: async () => {
    // Initialize database structure
    // Create missing tables and functions
    // Set up RLS policies
  },
  
  getUserStats: async () => {
    // Return live user statistics
    // Employee counts by department
    // Active review cycles
  },
  
  performMaintenance: async () => {
    // Database maintenance tasks
    // Clean up old data
    // Optimize performance
  }
};
```

### 2. **create-edge-user** (`/supabase/functions/create-edge-user/`)
User creation and onboarding automation.

```typescript
export const createEdgeUser = async (userData: UserCreationData) => {
  // Create auth.users entry
  // Create corresponding employees record
  // Set up initial permissions
  // Send welcome notifications
};
```

### 3. **debug-user** (`/supabase/functions/debug-user/`)
User troubleshooting and diagnostics.

```typescript
export const debugUser = async (userId: string) => {
  // Return user auth status
  // Check employee record linkage
  // Verify permissions and roles
  // Identify any data inconsistencies
};
```

## Database Functions (PostgreSQL)

### Analytics Functions
```sql
-- Real-time satisfaction scoring
CREATE OR REPLACE FUNCTION get_department_satisfaction(dept_name TEXT)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT AVG((response_value->>'value')::DECIMAL)
    FROM team_health_pulse_responses pr
    JOIN employees e ON pr.employee_id = e.id
    JOIN pulse_questions pq ON pr.question_id = pq.id
    WHERE e.department = dept_name
      AND pq.category = 'satisfaction'
      AND pr.submitted_at >= NOW() - INTERVAL '30 days'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assessment completion metrics
CREATE OR REPLACE FUNCTION get_completion_stats(cycle_id UUID)
RETURNS TABLE (
  total_assessments BIGINT,
  completed_assessments BIGINT,
  overdue_assessments BIGINT,
  completion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_assessments,
    COUNT(*) FILTER (WHERE self_assessment_status = 'submitted' AND manager_review_status = 'completed') as completed_assessments,
    COUNT(*) FILTER (WHERE due_date < NOW() AND self_assessment_status != 'submitted') as overdue_assessments,
    ROUND(
      COUNT(*) FILTER (WHERE self_assessment_status = 'submitted' AND manager_review_status = 'completed') * 100.0 / COUNT(*), 2
    ) as completion_rate
  FROM assessments
  WHERE cycle_id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Pulse Question Management
```sql
-- Add new pulse question with validation
CREATE OR REPLACE FUNCTION add_pulse_question(
  question_id_param TEXT,
  question_text_param TEXT,
  category_param TEXT,
  type_param TEXT DEFAULT 'scale',
  options_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
  max_order INTEGER;
BEGIN
  -- Get next sort order
  SELECT COALESCE(MAX(sort_order), 0) + 1 INTO max_order FROM pulse_questions;
  
  INSERT INTO pulse_questions (
    question_id, question_text, category, type, options, sort_order
  ) VALUES (
    question_id_param, question_text_param, category_param, type_param, options_param, max_order
  ) RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Performance Optimizations

### 1. **Database Indexes**
Strategic indexes for high-frequency queries:

```sql
-- Assessment dashboard queries
CREATE INDEX ix_assessments_employee_cycle ON assessments(employee_id, cycle_id);
CREATE INDEX ix_assessments_manager_pending ON assessments(manager_review_status) 
  WHERE manager_review_status = 'pending';

-- Team health analytics
CREATE INDEX ix_pulse_responses_analytics ON team_health_pulse_responses(
  employee_id, question_id, submitted_at
);

-- Notification system
CREATE INDEX ix_notifications_unread_recipient ON notifications(recipient_id, created_at) 
  WHERE read_at IS NULL;
```

### 2. **Query Optimization**
```sql
-- Optimized manager dashboard query
SELECT 
  a.id,
  a.self_assessment_status,
  a.manager_review_status,
  a.due_date,
  e.name as employee_name,
  e.department
FROM assessments a
JOIN employees e ON a.employee_id = e.id
WHERE e.manager_id = (SELECT id FROM employees WHERE user_id = auth.uid())
  AND a.manager_review_status IN ('pending', 'in_progress')
ORDER BY a.due_date ASC;
```

### 3. **Real-time Subscriptions**
Efficient real-time updates using Supabase channels:

```sql
-- Enable real-time on critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE assessments;
ALTER PUBLICATION supabase_realtime ADD TABLE team_health_pulse_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

## Data Migration Strategy

### ✅ **Completed: Mock Data Elimination**
All mock data has been removed and replaced with live database operations:

1. **Satisfaction Scores** - Now calculated from actual `team_health_pulse_responses`
2. **Analytics Data** - Real-time queries against assessment tables
3. **Dashboard Metrics** - Live aggregations from database functions
4. **Trend Analysis** - Historical data from actual user interactions

### Database Function Updates
```sql
-- Example: Live satisfaction calculation (no fallbacks)
CREATE OR REPLACE FUNCTION calculate_live_satisfaction()
RETURNS TABLE (
  department TEXT,
  avg_satisfaction DECIMAL,
  response_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.department,
    AVG((pr.response_value->>'value')::DECIMAL) as avg_satisfaction,
    COUNT(*) as response_count
  FROM team_health_pulse_responses pr
  JOIN employees e ON pr.employee_id = e.id
  JOIN pulse_questions pq ON pr.question_id = pq.id
  WHERE pq.category = 'satisfaction'
    AND pr.submitted_at >= NOW() - INTERVAL '30 days'
  GROUP BY e.department
  HAVING COUNT(*) > 0; -- Only return departments with actual data
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Backup & Recovery

### 1. **Automated Backups**
```javascript
// Backup automation (backups/supabase-backup.js)
const backupTables = [
  'employees',
  'review_cycles', 
  'assessments',
  'pulse_questions',
  'team_health_pulse_responses',
  'development_plans',
  'notifications'
];

const createBackup = async () => {
  for (const table of backupTables) {
    const { data } = await supabase.from(table).select('*');
    await saveBackup(table, data);
  }
};
```

### 2. **Migration Scripts**
All database migrations are versioned and stored in `/supabase/migrations/`:

- `20250807124425_cleanup_obsolete_tables.sql` - Remove unused tables
- `20250808000003_performance_indexes.sql` - Add performance indexes
- `20250809000001_lucerne_tenant_setup.sql` - Multi-tenant setup

## Security Implementation

### 1. **Authentication Flow**
```sql
-- User creation trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.employees (user_id, email, name, role, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    'lucerne'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 2. **API Security**
- JWT token validation on all requests
- Row-level security policies enforce data access
- Rate limiting on sensitive endpoints
- Input validation and sanitization

## Monitoring & Observability

### 1. **Performance Monitoring**
```sql
-- Query performance tracking
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 100 -- Queries taking > 100ms
ORDER BY mean_time DESC;
```

### 2. **Health Checks**
```typescript
// System health monitoring
export const healthCheck = async () => {
  const checks = {
    database: await checkDatabaseConnection(),
    authentication: await checkAuthService(),
    realtime: await checkRealtimeConnection(),
    functions: await checkEdgeFunctions()
  };
  
  return {
    status: Object.values(checks).every(Boolean) ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  };
};
```

## Deployment Architecture

### 1. **Supabase Configuration**
```toml
# supabase/config.toml
[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
major_version = 15

[realtime]
enabled = true
```

### 2. **Environment Management**
```bash
# Production environment variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
DATABASE_URL=postgresql://postgres:password@db:5432/postgres
```

## Future Architecture Enhancements

### Planned Improvements
1. **Advanced Analytics Engine** - Complex reporting and insights
2. **Multi-tenant Architecture** - Support for multiple organizations
3. **Advanced Caching** - Redis integration for high-performance queries
4. **Event Sourcing** - Audit trails and historical analysis
5. **API Rate Limiting** - Advanced request throttling

### Scalability Roadmap
1. **Read Replicas** - Distribute query load
2. **Connection Pooling** - Optimize database connections
3. **Function Optimization** - Edge function performance tuning
4. **Data Archiving** - Historical data management

---

**Document Maintenance:**
This document reflects the current live data implementation. Update when significant backend changes are made. All examples show real database operations with no mock data dependencies.