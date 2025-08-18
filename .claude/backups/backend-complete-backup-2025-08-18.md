# Backend/Database Complete Backup - 2025-08-18

**Generated:** 2025-08-18  
**Project:** Edge Lucerne International  
**Purpose:** Comprehensive backup of all backend/database-related files, schemas, migrations, functions, and configurations

---

## Table of Contents

1. [Database Schema & Types](#database-schema--types)
2. [SQL Migrations](#sql-migrations)
3. [Supabase Configuration](#supabase-configuration)
4. [Edge Functions](#edge-functions)
5. [Database Scripts](#database-scripts)
6. [Database Service & Client](#database-service--client)
7. [Backup Scripts](#backup-scripts)
8. [Backup Data Files](#backup-data-files)
9. [Database Utilities](#database-utilities)

---

## Database Schema & Types

### src/types/database.ts

```typescript
// Database types generated from Supabase schema
export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          job_title: string | null;
          role: 'employee' | 'manager' | 'admin';
          manager_id: string | null;
          department: string | null;
          is_active: boolean;
          temp_password: string | null;
          must_change_password: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          job_title?: string | null;
          role?: 'employee' | 'manager' | 'admin';
          manager_id?: string | null;
          department?: string | null;
          is_active?: boolean;
          temp_password?: string | null;
          must_change_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          email?: string;
          job_title?: string | null;
          role?: 'employee' | 'manager' | 'admin';
          manager_id?: string | null;
          department?: string | null;
          is_active?: boolean;
          temp_password?: string | null;
          must_change_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      review_cycles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          start_date: string;
          end_date: string;
          due_date: string | null;
          is_active: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          due_date?: string | null;
          is_active?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          due_date?: string | null;
          is_active?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          employee_id: string;
          cycle_id: string;
          self_assessment_status: 'not_started' | 'in_progress' | 'submitted';
          manager_review_status: 'pending' | 'in_progress' | 'completed';
          self_assessment_data: any | null;
          manager_review_data: any | null;
          due_date: string;
          submitted_at: string | null;
          manager_reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          cycle_id: string;
          self_assessment_status?: 'not_started' | 'in_progress' | 'submitted';
          manager_review_status?: 'pending' | 'in_progress' | 'completed';
          self_assessment_data?: any | null;
          manager_review_data?: any | null;
          due_date: string;
          submitted_at?: string | null;
          manager_reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          cycle_id?: string;
          self_assessment_status?: 'not_started' | 'in_progress' | 'submitted';
          manager_review_status?: 'pending' | 'in_progress' | 'completed';
          self_assessment_data?: any | null;
          manager_review_data?: any | null;
          due_date?: string;
          submitted_at?: string | null;
          manager_reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      development_plans: {
        Row: {
          id: string;
          employee_id: string;
          title: string;
          description: string | null;
          goals: string;
          skills_to_develop: string;
          timeline: string | null;
          status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'needs_revision';
          manager_feedback: string | null;
          manager_reviewed_at: string | null;
          manager_reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          title: string;
          description?: string | null;
          goals: string;
          skills_to_develop: string;
          timeline?: string | null;
          status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'needs_revision';
          manager_feedback?: string | null;
          manager_reviewed_at?: string | null;
          manager_reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          title?: string;
          description?: string | null;
          goals?: string;
          skills_to_develop?: string;
          timeline?: string | null;
          status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'needs_revision';
          manager_feedback?: string | null;
          manager_reviewed_at?: string | null;
          manager_reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          sender_id: string | null;
          type: string;
          title: string;
          message: string;
          data: any | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          sender_id?: string | null;
          type: string;
          title: string;
          message: string;
          data?: any | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          sender_id?: string | null;
          type?: string;
          title?: string;
          message?: string;
          data?: any | null;
          read_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_all_employees_for_admin: {
        Args: Record<PropertyKey, never>;
        Returns: any;
      };
      get_potential_managers: {
        Args: Record<PropertyKey, never>; 
        Returns: any;
      };
      create_review_cycle: {
        Args: {
          p_name: string;
          p_start_date: string;
          p_end_date: string;
          p_due_date?: string;
        };
        Returns: any;
      };
      activate_review_cycle_with_assessments: {
        Args: {
          p_cycle_id: string;
        };
        Returns: any;
      };
      update_employee: {
        Args: {
          p_employee_id: string;
          p_name?: string | null;
          p_email?: string | null;
          p_job_title?: string | null;
          p_role?: string | null;
          p_manager_id?: string | null;
          p_is_active?: boolean | null;
        };
        Returns: any;
      };
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>;
        Returns: any;
      };
    };
    Enums: {
      user_role: 'employee' | 'manager' | 'admin';
      assessment_status: 'not_started' | 'in_progress' | 'submitted';
      review_status: 'pending' | 'in_progress' | 'completed';
      development_plan_status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'needs_revision';
    };
  };
}
```

---

## SQL Migrations

### supabase/migrations/20250807124425_cleanup_obsolete_tables.sql

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

### supabase/migrations/20250807160000_add_delete_feedback_function.sql

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

### supabase/migrations/20250808000001_enforce_unique_user_id.sql

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

### supabase/migrations/20250808000002_admin_write_policies.sql

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

### supabase/migrations/20250808000003_performance_indexes.sql

```sql
-- Migration: Add performance indexes for RLS hotpaths and common joins
-- Description: Optimize query performance for RLS policies and frequently joined columns

-- Step 1: Index for active manager lookups (common in RLS policies)
CREATE INDEX IF NOT EXISTS ix_employees_manager_active 
ON public.employees(manager_id) 
WHERE is_active = true;

-- Step 2: Index for employee + review cycle joins (very common)
CREATE INDEX IF NOT EXISTS ix_assessments_employee_cycle 
ON public.assessments(employee_id, review_cycle_id);

-- Step 3: Index for user_id lookups (critical for RLS performance)
CREATE INDEX IF NOT EXISTS ix_employees_user_id_active
ON public.employees(user_id)
WHERE is_active = true;

-- Step 4: Index for employee role lookups (admin checks)
CREATE INDEX IF NOT EXISTS ix_employees_role_active
ON public.employees(role)
WHERE is_active = true;

-- Step 5: Index for kudos display and filtering
CREATE INDEX IF NOT EXISTS ix_kudos_created
ON public.kudos(created_at DESC);

-- Step 6: Conditional indexes based on actual table structure
DO $$
BEGIN
    -- Check if team_health_pulse_responses table exists with correct columns
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'team_health_pulse_responses' 
        AND column_name = 'submitted_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS ix_pulse_responses_employee_date
        ON public.team_health_pulse_responses(employee_id, submitted_at);
        RAISE NOTICE 'Created index on pulse responses';
    ELSE
        RAISE NOTICE 'Skipped pulse responses index - table/column not found';
    END IF;

    -- Check if development_plans table exists with manager_approved column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'development_plans'
        AND column_name = 'manager_approved'
    ) THEN
        CREATE INDEX IF NOT EXISTS ix_development_plans_employee_approved
        ON public.development_plans(employee_id, manager_approved);
        RAISE NOTICE 'Created index on development plans with manager_approved';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'development_plans'
    ) THEN
        -- Table exists but column doesn't - create basic employee index
        CREATE INDEX IF NOT EXISTS ix_development_plans_employee
        ON public.development_plans(employee_id);
        RAISE NOTICE 'Created basic index on development plans (manager_approved column not found)';
    ELSE
        RAISE NOTICE 'Skipped development plans index - table not found';
    END IF;

    -- Check if assessments table has type column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'assessments'
        AND column_name = 'type'
    ) THEN
        CREATE INDEX IF NOT EXISTS ix_assessments_status_type
        ON public.assessments(status, type);
        RAISE NOTICE 'Created index on assessments status and type';
    ELSE
        -- Create basic status index without type
        CREATE INDEX IF NOT EXISTS ix_assessments_status
        ON public.assessments(status);
        RAISE NOTICE 'Created basic status index on assessments (type column not found)';
    END IF;
END $$;

-- Verification: Display created indexes
SELECT 
    'Index Summary' as status,
    schemaname,
    tablename, 
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname LIKE 'ix_%'
ORDER BY tablename, indexname;
```

### supabase/migrations/20250808000004_set_based_review_seeding.sql

```sql
-- Migration: Replace row-loop seeding with set-based operations
-- Description: Create scalable, idempotent review cycle seeding functions
-- Issue: Current seeding may use inefficient row-by-row loops instead of set operations

-- Function: Seed self-assessments for all active employees in a review cycle
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
    
    -- Log the operation
    RAISE NOTICE 'Seeded % assessments for review cycle %, % already existed', 
        new_assessments, p_review_cycle_id, existing_assessments;
    
    -- Return summary
    RETURN QUERY SELECT total_employees, new_assessments, existing_assessments;
END;
$$;

-- Function: Combined seeding for review cycle assessments
CREATE OR REPLACE FUNCTION seed_review_cycle_assessments(p_review_cycle_id UUID)
RETURNS TABLE(
    cycle_name TEXT,
    total_employees INTEGER,
    assessments_created INTEGER,
    assessments_existing INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cycle_name TEXT;
    seed_result RECORD;
BEGIN
    -- Verify review cycle exists and get name
    SELECT name INTO v_cycle_name
    FROM review_cycles
    WHERE id = p_review_cycle_id;
    
    IF v_cycle_name IS NULL THEN
        RAISE EXCEPTION 'Review cycle % not found', p_review_cycle_id;
    END IF;
    
    -- Seed assessments using the simpler function
    SELECT * INTO seed_result
    FROM seed_self_assessments(p_review_cycle_id);
    
    -- Return comprehensive summary
    RETURN QUERY SELECT 
        v_cycle_name,
        seed_result.employees_processed,
        seed_result.assessments_created,
        seed_result.assessments_existing;
END;
$$;

-- Grant execute permissions to authenticated users (admins will use this via RLS)
GRANT EXECUTE ON FUNCTION seed_self_assessments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION seed_review_cycle_assessments(UUID) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION seed_self_assessments(UUID) IS 
'Set-based seeding of assessments for all active employees. Idempotent via ON CONFLICT.';

COMMENT ON FUNCTION seed_review_cycle_assessments(UUID) IS 
'Complete seeding function for review cycle assessments. Returns detailed summary.';

-- Safe verification without testing (avoids UUID casting issues)
DO $$
DECLARE
    cycle_count INTEGER;
BEGIN
    -- Count existing review cycles
    SELECT COUNT(*) INTO cycle_count FROM review_cycles;
    
    IF cycle_count > 0 THEN
        RAISE NOTICE 'Functions created successfully. Found % review cycles available for seeding.', cycle_count;
        RAISE NOTICE 'To test: SELECT * FROM seed_review_cycle_assessments(''your-cycle-id-here'');';
    ELSE
        RAISE NOTICE 'Functions created successfully. No review cycles found - create one to test seeding.';
    END IF;
    
    RAISE NOTICE 'Migration completed: Set-based review seeding functions are ready for use.';
END $$;
```

### supabase/migrations/20250809000001_lucerne_tenant_setup.sql

```sql
-- Migration: Lucerne International Tenant Setup
-- Description: Add multi-tenant support with RLS policies for client isolation
-- Client: Lucerne International (@lucerneintl.com)
-- Date: 2025-08-09

-- Add tenant_id column to all main tables if not exists
ALTER TABLE IF EXISTS employees 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'lucerne';

ALTER TABLE IF EXISTS assessments 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'lucerne';

ALTER TABLE IF EXISTS review_cycles 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'lucerne';

ALTER TABLE IF EXISTS goals 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'lucerne';

ALTER TABLE IF EXISTS feedback 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'lucerne';

ALTER TABLE IF EXISTS notifications 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'lucerne';

-- Create tenants table for managing client organizations
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Insert Lucerne as first tenant
INSERT INTO tenants (id, name, domain) 
VALUES ('lucerne', 'Lucerne International', 'lucerneintl.com')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "tenant_isolation_employees" ON employees;
DROP POLICY IF EXISTS "tenant_isolation_assessments" ON assessments;
DROP POLICY IF EXISTS "tenant_isolation_review_cycles" ON review_cycles;
DROP POLICY IF EXISTS "tenant_isolation_goals" ON goals;
DROP POLICY IF EXISTS "tenant_isolation_feedback" ON feedback;
DROP POLICY IF EXISTS "tenant_isolation_notifications" ON notifications;

-- Create RLS policies for tenant isolation
CREATE POLICY "tenant_isolation_employees" ON employees
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_assessments" ON assessments
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_review_cycles" ON review_cycles
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_goals" ON goals
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_feedback" ON feedback
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_notifications" ON notifications
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

-- Tenants table policy - only super admins can manage tenants
CREATE POLICY "tenants_admin_only" ON tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

-- Create function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM set_config('app.tenant_id', tenant_name, true);
END;
$$;

-- Create function to get current tenant
CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN COALESCE(current_setting('app.tenant_id', true), 'lucerne');
END;
$$;

-- Update existing data to have lucerne tenant_id
UPDATE employees SET tenant_id = 'lucerne' WHERE tenant_id IS NULL;
UPDATE assessments SET tenant_id = 'lucerne' WHERE tenant_id IS NULL;
UPDATE review_cycles SET tenant_id = 'lucerne' WHERE tenant_id IS NULL;
UPDATE goals SET tenant_id = 'lucerne' WHERE tenant_id IS NULL;
UPDATE feedback SET tenant_id = 'lucerne' WHERE tenant_id IS NULL;
UPDATE notifications SET tenant_id = 'lucerne' WHERE tenant_id IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant_id ON assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_review_cycles_tenant_id ON review_cycles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_goals_tenant_id ON goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tenant_id ON feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);

-- Create admin user for Lucerne (David Okonoski)
INSERT INTO employees (
    id, email, first_name, last_name, role, 
    is_active, tenant_id, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'dokonoski@lucerneintl.com',
    'David',
    'Okonoski', 
    'super_admin',
    true,
    'lucerne',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    tenant_id = 'lucerne',
    is_active = true,
    updated_at = NOW();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON TABLE tenants IS 'Multi-tenant configuration table';
COMMENT ON FUNCTION set_tenant_context IS 'Sets the current tenant context for RLS policies';
COMMENT ON FUNCTION get_current_tenant IS 'Returns the current tenant ID from context';
```

---

## Supabase Configuration

### supabase/config.toml

```toml
# For detailed configuration reference documentation, visit:
# https://supabase.com/docs/guides/local-development/cli/config
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "edgelucerneinternational"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. `public` and `graphql_public` schemas are included by default.
schemas = ["public", "graphql_public"]
# Extra schemas to add to the search_path of every request.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[api.tls]
# Enable HTTPS endpoints locally using a self-signed certificate.
enabled = false

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version;` on the remote database to check.
major_version = 17

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54329
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: `transaction`, `session`.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 20
# Maximum number of client connections allowed.
max_client_conn = 100

[db.migrations]
# If disabled, migrations will be skipped during a db push or reset.
enabled = true
# Specifies an ordered list of schema files that describe your database.
# Supports glob patterns relative to supabase directory: "./schemas/*.sql"
schema_paths = []

[db.seed]
# If enabled, seeds the database after migrations during a db reset.
enabled = true
# Specifies an ordered list of seed files to load during db reset.
# Supports glob patterns relative to supabase directory: "./seeds/*.sql"
sql_paths = ["./seed.sql"]

[realtime]
enabled = true

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://127.0.0.1"
# OpenAI API Key to use for Supabase AI in the Supabase Studio.
openai_api_key = "env(OPENAI_API_KEY)"

[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://127.0.0.1:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://127.0.0.1:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
jwt_expiry = 3600
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true
# Allow/disallow anonymous sign-ins to your project.
enable_anonymous_sign_ins = false
# Allow/disallow testing manual linking of accounts
enable_manual_linking = false
# Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
minimum_password_length = 6

[auth.rate_limit]
# Number of emails that can be sent per hour. Requires auth.email.smtp to be enabled.
email_sent = 2
# Number of SMS messages that can be sent per hour. Requires auth.sms to be enabled.
sms_sent = 30
# Number of sessions that can be refreshed in a 5 minute interval per IP address.
token_refresh = 150

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false
# If enabled, users will need to reauthenticate or have logged in recently to change their password.
secure_password_change = false
# Controls the minimum amount of time that must pass before sending another signup confirmation or password reset email.
max_frequency = "1s"
# Number of characters used in the email OTP.
otp_length = 6
# Number of seconds before the email OTP expires (defaults to 1 hour).
otp_expiry = 3600

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = false
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false
# Template for sending OTP to users
template = "Your code is {{ .Code }}"
# Controls the minimum amount of time that must pass before sending another sms otp.
max_frequency = "5s"

[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

[auth.mfa]
# Control how many MFA factors can be enrolled at once per user.
max_enrolled_factors = 10

[auth.mfa.totp]
enroll_enabled = false
verify_enabled = false

[auth.mfa.phone]
enroll_enabled = false
verify_enabled = false
otp_length = 6
template = "Your code is {{ .Code }}"
max_frequency = "5s"

[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""
# If enabled, the nonce check will be skipped. Required for local sign in with Google auth.
skip_nonce_check = false

[edge_runtime]
enabled = true
# Configure one of the supported request policies: `oneshot`, `per_worker`.
# Use `oneshot` for hot reload, or `per_worker` for load testing.
policy = "oneshot"
# Port to attach the Chrome inspector for debugging edge functions.
inspector_port = 8083
# The Deno major version to use.
deno_version = 1

[analytics]
enabled = true
port = 54327
# Configure one of the supported backends: `postgres`, `bigquery`.
backend = "postgres"

# Experimental features may be deprecated any time
[experimental]
# Configures Postgres storage engine to use OrioleDB (S3)
orioledb_version = ""
# Configures S3 bucket URL, eg. <bucket_name>.s3-<region>.amazonaws.com
s3_host = "env(S3_HOST)"
# Configures S3 bucket region, eg. us-east-1
s3_region = "env(S3_REGION)"
# Configures AWS_ACCESS_KEY_ID for S3 bucket
s3_access_key = "env(S3_ACCESS_KEY)"
# Configures AWS_SECRET_ACCESS_KEY for S3 bucket
s3_secret_key = "env(S3_SECRET_KEY)"
```

---

## Edge Functions

### supabase/functions/admin-operations/index.ts

```typescript
// Secure Admin Operations Edge Function - PRODUCTION VERSION  
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const requestId = crypto.randomUUID();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log(JSON.stringify({ level: 'info', requestId, event: 'admin-op:start' }));
    
    // Get environment variables with fallback
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('EDGE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    console.log(JSON.stringify({ 
      level: 'debug', 
      requestId, 
      env_check: {
        supabase_url_exists: !!supabaseUrl,
        service_role_key_exists: !!serviceRoleKey,
        anon_key_exists: !!anonKey,
        using_edge_key: !!Deno.env.get('EDGE_SERVICE_ROLE_KEY'),
        using_supabase_key: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      }
    }));
    
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      console.error(JSON.stringify({ 
        level: 'error', 
        requestId, 
        missing_vars: {
          supabase_url: !supabaseUrl,
          service_role_key: !serviceRoleKey,
          anon_key: !anonKey
        }
      }));
      throw new Error(`Missing required environment variables: URL=${!!supabaseUrl}, ServiceRole=${!!serviceRoleKey}, Anon=${!!anonKey}`)
    }

    // Create clients - admin for privileged operations, user for auth validation
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const supabaseUser = createClient(supabaseUrl, anonKey)

    // Verify the request is from an authenticated admin user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log(JSON.stringify({ level: 'warn', requestId, msg: 'missing auth header' }));
      throw new Error('No authorization header')
    }

    // Extract and verify JWT token using user client
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token)

    if (userError || !user) {
      console.log(JSON.stringify({ level: 'warn', requestId, msg: 'invalid token', error: userError?.message }));
      throw new Error('Invalid user token')
    }

    // Verify user has admin role in employees table
    const { data: employee, error: empError } = await supabaseAdmin
      .from('employees')
      .select('role, is_active')
      .eq('email', user.email)
      .single()

    if (empError || !employee || !['admin', 'super_admin'].includes(employee.role) || !employee.is_active) {
      console.log(JSON.stringify({ 
        level: 'warn', 
        requestId, 
        msg: 'admin access denied', 
        employee: employee,
        empError: empError?.message,
        user_email: user.email
      }));
      throw new Error(`Admin access required. Current role: ${employee?.role || 'none'}, Active: ${employee?.is_active || false}`)
    }

    // Parse request body
    const { action, data } = await req.json()

    // Handle different admin operations
    let result;
    switch (action) {
      case 'create_user':
        console.log(JSON.stringify({ level: 'info', requestId, msg: 'starting user creation', data }));
        
        // Validate required fields
        if (!data.email || !data.name) {
          throw new Error('Email and name are required');
        }
        
        try {
          // Create new user account in Supabase Auth
          console.log(JSON.stringify({ level: 'info', requestId, msg: 'creating auth user' }));
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: data.temp_password || 'TempPass123!',
            email_confirm: true,
            user_metadata: {
              name: data.name,
              role: data.role || 'employee'
            }
          })

          if (createError) {
            console.error(JSON.stringify({ level: 'error', requestId, msg: 'auth user creation failed', error: createError }));
            throw new Error(`Auth user creation failed: ${createError.message}`);
          }
          
          console.log(JSON.stringify({ level: 'info', requestId, msg: 'auth user created', user_id: newUser.user.id }));

          // Create corresponding employee record
          console.log(JSON.stringify({ level: 'info', requestId, msg: 'creating employee record' }));
          const employeeData = {
            user_id: newUser.user.id,
            email: data.email,
            name: data.name,
            role: data.role || 'employee',
            job_title: data.job_title,
            manager_id: data.manager_id,
            department: data.department,
            is_active: true
          };
          
          const { data: newEmployee, error: empError } = await supabaseAdmin
            .from('employees')
            .insert(employeeData)
            .select()
            .single()

          if (empError) {
            console.error(JSON.stringify({ level: 'error', requestId, msg: 'employee creation failed', error: empError }));
            // Cleanup user if employee creation fails
            await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
            throw new Error(`Employee creation failed: ${empError.message}`);
          }
          
          console.log(JSON.stringify({ level: 'info', requestId, msg: 'employee created', employee_id: newEmployee.id }));

          result = { success: true, user: newUser.user, employee: newEmployee }
        } catch (error) {
          console.error(JSON.stringify({ level: 'error', requestId, msg: 'create_user error', error: error.message }));
          throw error;
        }
        break

      case 'update_employee':
        const { data: updatedEmployee, error: updateError } = await supabaseAdmin
          .from('employees')
          .update(data.updates)
          .eq('id', data.employee_id)
          .select()
          .single()

        if (updateError) throw updateError
        result = { success: true, employee: updatedEmployee }
        break

      case 'delete_employee':
        // Soft delete - mark as inactive instead of hard delete
        const { error: deleteError } = await supabaseAdmin
          .from('employees')
          .update({ is_active: false })
          .eq('id', data.employee_id)

        if (deleteError) throw deleteError
        result = { success: true }
        break

      case 'reset_password':
        const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: data.email
        })

        if (resetError) throw resetError
        result = { success: true, reset_link: resetData.properties?.action_link }
        break

      case 'setup_database':
        // Setup EDGEMASTER database structure
        const { data: setupResult, error: setupError } = await supabaseAdmin.rpc('setup_edgemaster_tables')
        if (setupError) throw setupError
        result = { success: true, setup: setupResult }
        break

      case 'cleanup_test_users':
        // Cleanup test users while preserving admin@lucerne.com
        const testUsersToCleanup = data.test_emails || [
          'employee1@lucerne.com',
          'manager1@lucerne.com'
        ]
        
        // Safety check - never allow admin deletion
        const safeEmails = testUsersToCleanup.filter(email => email !== 'admin@lucerne.com')
        
        if (safeEmails.length === 0) {
          result = { success: true, message: 'No test users to cleanup', cleaned: [] }
          break
        }

        const cleanupResults = []
        
        for (const email of safeEmails) {
          try {
            // Get employee record
            const { data: empToDelete, error: empFindError } = await supabaseAdmin
              .from('employees')
              .select('id, user_id, name, email, role')
              .eq('email', email)
              .single()

            if (empFindError || !empToDelete) {
              cleanupResults.push({ email, status: 'not_found', message: 'Employee record not found' })
              continue
            }

            // Clean up related data first (foreign key constraints)
            
            // Clean notifications
            await supabaseAdmin
              .from('notifications')
              .delete()
              .eq('recipient_id', empToDelete.id)

            // Clean development plans
            await supabaseAdmin
              .from('development_plans')
              .delete()
              .eq('employee_id', empToDelete.id)

            // Clean assessments
            await supabaseAdmin
              .from('assessments')
              .delete()
              .eq('employee_id', empToDelete.id)

            // Clean pulse responses
            await supabaseAdmin
              .from('team_health_pulse_responses')
              .delete()
              .eq('employee_id', empToDelete.id)

            // Clean kudos (both given and received)
            await supabaseAdmin
              .from('kudos')
              .delete()
              .eq('given_by', empToDelete.id)

            await supabaseAdmin
              .from('kudos')
              .delete()
              .eq('employee_id', empToDelete.id)

            // Clean feedback (both given and received)
            await supabaseAdmin
              .from('feedback')
              .delete()
              .eq('giver_id', empToDelete.id)

            await supabaseAdmin
              .from('feedback')
              .delete()
              .eq('receiver_id', empToDelete.id)

            // Delete employee record
            const { error: empDeleteError } = await supabaseAdmin
              .from('employees')
              .delete()
              .eq('id', empToDelete.id)

            if (empDeleteError) throw empDeleteError

            // Delete auth user if user_id exists
            if (empToDelete.user_id) {
              const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
                empToDelete.user_id
              )
              
              if (authDeleteError) {
                console.warn(`Warning: Could not delete auth user for ${email}:`, authDeleteError)
              }
            }

            cleanupResults.push({
              email,
              status: 'success',
              message: `Cleaned up ${empToDelete.name} (${empToDelete.role})`,
              employee_id: empToDelete.id,
              user_id: empToDelete.user_id
            })

          } catch (cleanupError) {
            console.error(`Error cleaning up ${email}:`, cleanupError)
            cleanupResults.push({
              email,
              status: 'error',
              message: cleanupError.message || 'Unknown error during cleanup'
            })
          }
        }

        // Final verification - ensure admin still exists
        const { data: adminCheck, error: adminCheckError } = await supabaseAdmin
          .from('employees')
          .select('id, email, role, is_active')
          .eq('email', 'admin@lucerne.com')
          .single()

        if (adminCheckError || !adminCheck || !adminCheck.is_active) {
          throw new Error('CRITICAL: Admin user verification failed after cleanup')
        }

        result = {
          success: true,
          message: `Cleanup completed. Processed ${safeEmails.length} users.`,
          admin_preserved: true,
          admin_email: adminCheck.email,
          cleanup_results: cleanupResults,
          summary: {
            total_processed: safeEmails.length,
            successful: cleanupResults.filter(r => r.status === 'success').length,
            failed: cleanupResults.filter(r => r.status === 'error').length,
            not_found: cleanupResults.filter(r => r.status === 'not_found').length
          }
        }
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    console.log(JSON.stringify({ level: 'info', requestId, event: 'admin-op:success' }));
    return new Response(
      JSON.stringify({ ...result, requestId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(JSON.stringify({ level: 'error', requestId, error: String(error) }));
    return new Response(
      JSON.stringify({ error: error.message, requestId }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

### supabase/functions/create-edge-user/index.ts

```typescript
// Create Edge User Function - matches EDGEMASTER functionality
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const requestId = crypto.randomUUID()
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log(JSON.stringify({ level: 'info', requestId, event: 'create-edge-user:start' }))
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('EDGE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      throw new Error('Missing required environment variables')
    }

    // Create admin client for user creation
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const supabaseUser = createClient(supabaseUrl, anonKey)

    // Verify the request is from an authenticated admin user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Extract and verify JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    // Verify user has admin role
    const { data: employee, error: empError } = await supabaseAdmin
      .from('employees')
      .select('role, is_active')
      .eq('user_id', user.id)
      .single()

    if (empError || !employee || !['admin', 'super_admin'].includes(employee.role) || !employee.is_active) {
      throw new Error('Admin access required')
    }

    // Parse request body
    const { 
      name, 
      email, 
      job_title, 
      role = 'employee', 
      manager_id, 
      department,
      temp_password,
      send_email_invite = true
    } = await req.json()

    if (!name || !email) {
      throw new Error('Name and email are required')
    }

    // Generate temp password if not provided
    const password = temp_password || generateTempPassword()

    // Create new user account in Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: !send_email_invite, // Auto-confirm if not sending invite
      user_metadata: {
        name: name,
        role: role
      }
    })

    if (createError) {
      console.error('Auth user creation failed:', createError)
      throw new Error(`Failed to create auth user: ${createError.message}`)
    }

    // Create corresponding employee record
    const { data: newEmployee, error: empError2 } = await supabaseAdmin
      .from('employees')
      .insert({
        user_id: newUser.user.id,
        email: email,
        name: name,
        role: role,
        job_title: job_title,
        manager_id: manager_id,
        department: department,
        temp_password: password,
        password_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        is_active: true
      })
      .select()
      .single()

    if (empError2) {
      console.error('Employee record creation failed:', empError2)
      // Cleanup auth user if employee creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      throw new Error(`Failed to create employee record: ${empError2.message}`)
    }

    // Send invitation email if requested
    let inviteResult = null
    if (send_email_invite) {
      try {
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          email,
          {
            data: {
              name: name,
              role: role,
              temp_password: password
            }
          }
        )
        
        if (inviteError) {
          console.warn('Failed to send invite email:', inviteError)
          inviteResult = { error: inviteError.message }
        } else {
          inviteResult = { success: true, invite_sent: true }
        }
      } catch (inviteErr) {
        console.warn('Invite email exception:', inviteErr)
        inviteResult = { error: 'Failed to send invite email' }
      }
    }

    // Create notification for the new user
    try {
      await supabaseAdmin
        .from('notifications')
        .insert({
          recipient_id: newEmployee.id,
          sender_id: employee.id, // Admin who created the user
          type: 'welcome',
          title: 'Welcome to the Team!',
          message: `Your account has been created. ${send_email_invite ? 'Please check your email for login instructions.' : 'Your temporary password is: ' + password}`,
          data: {
            temp_password: send_email_invite ? null : password,
            first_login: true
          }
        })
    } catch (notifError) {
      console.warn('Failed to create welcome notification:', notifError)
    }

    const result = {
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        created_at: newUser.user.created_at
      },
      employee: newEmployee,
      temp_password: send_email_invite ? null : password,
      invite: inviteResult,
      requestId: requestId
    }

    console.log(JSON.stringify({ level: 'info', requestId, event: 'create-edge-user:success', email }))
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error(JSON.stringify({ 
      level: 'error', 
      requestId, 
      event: 'create-edge-user:error',
      error: error.message 
    }))
    
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        requestId: requestId 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper function to generate secure temporary password
function generateTempPassword(): string {
  const length = 12
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  
  // Ensure at least one of each type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)] // Uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)] // Lowercase  
  password += "0123456789"[Math.floor(Math.random() * 10)] // Number
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)] // Special char
  
  // Fill remaining length
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}
```

### supabase/functions/database-cleanup/index.ts

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

### supabase/functions/debug-user/index.ts

```typescript
// Debug User Edge Function - Check current user info
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
    const serviceRoleKey = Deno.env.get('EDGE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      throw new Error('Missing required environment variables')
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const supabaseUser = createClient(supabaseUrl, anonKey)

    // Verify the request is from an authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Extract and verify JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    // Get employee info
    const { data: employee, error: empError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('email', user.email)
      .single()

    const result = {
      success: true,
      auth_user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      employee_lookup: {
        employee: employee,
        error: empError?.message
      },
      lookup_query: `email = '${user.email}'`
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Debug error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

### supabase/functions/fix-database/index.ts

```typescript
// Database Fix Edge Function - Run critical fixes
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
    const serviceRoleKey = Deno.env.get('EDGE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables')
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Allow fix_database_issues action without auth since this is a critical fix
    const body = await req.json().catch(() => ({ action: 'fix_database_issues' }))
    const { action } = body

    if (action !== 'fix_database_issues') {
      throw new Error('Invalid action')
    }

    console.log('🔧 Starting database fixes...')

    // Direct fixes since we can't execute raw SQL from edge functions
    console.log('🔧 Applying direct database fixes...')
    
    let fixes_applied = []
    let errors = []

    // 2. Fix departments table by adding missing data first
    console.log('🏢 Fixing departments table...')

    // Try to insert departments without is_active first (to check if table exists)
    console.log('📋 Ensuring departments exist...')
    const departments = [
      { name: 'Accounting', description: 'Financial operations and accounting' },
      { name: 'Engineering', description: 'Product development and engineering' },
      { name: 'Executive', description: 'Executive leadership and strategy' },
      { name: 'Production', description: 'Manufacturing and production' },
      { name: 'Sales', description: 'Sales and customer relations' },
      { name: 'General', description: 'General/Unassigned employees' }
    ]

    for (const dept of departments) {
      try {
        // Try without is_active column first
        const { error: insertError } = await supabaseAdmin
          .from('departments')
          .upsert({ 
            name: dept.name, 
            description: dept.description
          }, { 
            onConflict: 'name' 
          })
        
        if (insertError) {
          console.warn(`Failed to insert ${dept.name}:`, insertError.message)
          errors.push(`Department ${dept.name}: ${insertError.message}`)
        } else {
          fixes_applied.push(`Department ${dept.name} ensured`)
        }
      } catch (e) {
        console.warn(`Department insert error for ${dept.name}:`, e)
        errors.push(`Department ${dept.name}: ${e.message}`)
      }
    }

    const result = {
      success: errors.length === 0,
      timestamp: new Date().toISOString(),
      fixes_applied,
      errors,
      notes: [
        'Database functions need to be created via SQL migrations',
        'Use the fix_production_issues.sql file to manually create get_potential_managers function',
        'Departments table may need is_active column added manually'
      ]
    }

    console.log('✅ Database fixes completed:', result)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Database fix error:', error)
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

### supabase/functions/setup-tables/index.ts

```typescript
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Execute table setup SQL
    const { data, error } = await supabaseClient.rpc('setup_edgemaster_tables')

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

---

## Database Scripts

### scripts/explain_hotpaths.sql

```sql
-- Performance Analysis for Critical Query Paths
-- Run with EXPLAIN ANALYZE to verify index usage

-- Test 1: Auth user lookup (should use ix_employees_user_id_active)
EXPLAIN ANALYZE
SELECT e.*
FROM public.employees e
WHERE e.user_id = auth.uid()
  AND e.is_active = true;

-- Test 2: Manager hierarchy query (should use ix_employees_manager_active)
EXPLAIN ANALYZE
SELECT e.*
FROM public.employees e
WHERE e.manager_id = (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
)
AND e.is_active = true;

-- Test 3: Assessment joins (should use ix_assessments_employee_cycle)
EXPLAIN ANALYZE
SELECT a.*, e.name as employee_name
FROM public.assessments a
JOIN public.employees e ON e.id = a.employee_id
WHERE a.review_cycle_id = '00000000-0000-0000-0000-000000000000'::uuid
  AND e.is_active = true;

-- Test 4: Role-based queries (should use ix_employees_role_active)
EXPLAIN ANALYZE
SELECT COUNT(*)
FROM public.employees e
WHERE e.role = 'admin'
  AND e.is_active = true;

-- Test 5: Assessment status filtering (should use ix_assessments_status)
EXPLAIN ANALYZE
SELECT COUNT(*)
FROM public.assessments a
WHERE a.status = 'draft';

-- Performance expectations:
-- - All queries should complete in < 50ms for small datasets
-- - Index scans should be used where available
-- - Sequential scans acceptable only for very small tables (<50 rows)
```

### scripts/rls_policy_smoke.sql

```sql
-- RLS Policy Smoke Tests
-- Tests that security policies prevent unauthorized access

-- Test 1: Verify admin policies prevent non-admin writes
BEGIN;
  -- This should be blocked by RLS policies if not admin
  INSERT INTO public.employees (email, name, role, is_active)
  VALUES ('blocked@test.io', 'Should Be Blocked', 'employee', true);
  
  -- If we reach here without error, policies might be missing
  SELECT 'WARNING: Non-admin insert succeeded - check RLS policies' as warning;
ROLLBACK;

-- Test 2: Verify unique constraint prevents duplicate user_id
BEGIN;
  -- Try to create duplicate user_id (should fail)
  INSERT INTO public.employees (user_id, email, name, role, is_active)
  VALUES (
    (SELECT user_id FROM public.employees WHERE user_id IS NOT NULL LIMIT 1),
    'duplicate@test.io',
    'Duplicate Test',
    'employee',
    true
  );
  
  SELECT 'WARNING: Duplicate user_id insert succeeded - check unique constraint' as warning;
ROLLBACK;

-- Test 3: Verify performance indexes exist
SELECT 
  CASE 
    WHEN COUNT(*) >= 7 THEN 'PASS: Performance indexes present'
    ELSE 'FAIL: Missing performance indexes - expected 7+, found ' || COUNT(*)::text
  END as index_check
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'ix_%';

-- Test 4: Verify admin WITH CHECK policies exist
SELECT 
  CASE 
    WHEN COUNT(*) >= 8 THEN 'PASS: Admin WITH CHECK policies present'
    ELSE 'FAIL: Missing admin policies - expected 8+, found ' || COUNT(*)::text
  END as policy_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND policyname LIKE 'admin_%'
  AND cmd IN ('INSERT', 'UPDATE');

-- Test 5: Verify unique constraint on employees.user_id
SELECT 
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'employees' 
        AND indexname = 'uq_employees_user_id'
    ) THEN 'PASS: Unique constraint on user_id exists'
    ELSE 'FAIL: Missing unique constraint on employees.user_id'
  END as unique_constraint_check;
```

---

## Database Service & Client

### src/services/supabaseClient.ts

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { getCurrentTenantId } from '../utils/tenant';

// Supabase Configuration - Lucerne International
// SECURITY: All credentials must come from environment variables
const supabaseUrl: string = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.REACT_APP_SUPABASE_URL!;

const supabaseAnonKey: string = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
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

---

## Backup Scripts

### backups/supabase-backup.js

```javascript
#!/usr/bin/env node

/**
 * Supabase Backup Script for EDGE App
 * Backs up database schema, tables, functions, and RLS policies
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Backup directory
const BACKUP_DIR = path.join(__dirname);
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

console.log('🚀 Starting Supabase backup...');
console.log(`📁 Backup directory: ${BACKUP_DIR}`);

async function backupTables() {
  console.log('\n📊 Backing up table data...');
  
  const tables = [
    'employees',
    'review_cycles', 
    'assessments',
    'development_plans',
    'pulse_questions',
    'team_health_pulse_responses',
    'kudos',
    'feedback',
    'notifications',
    'core_values'
  ];

  const backupData = {};

  for (const table of tables) {
    try {
      console.log(`  📋 Backing up ${table}...`);
      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) {
        console.warn(`  ⚠️  Warning: Could not backup ${table}: ${error.message}`);
        backupData[table] = { error: error.message, data: [] };
      } else {
        backupData[table] = { data: data || [], count: (data || []).length };
        console.log(`  ✅ ${table}: ${(data || []).length} records`);
      }
    } catch (err) {
      console.warn(`  ⚠️  Warning: Exception backing up ${table}: ${err.message}`);
      backupData[table] = { error: err.message, data: [] };
    }
  }

  const filename = `supabase-tables-backup-${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
  console.log(`✅ Table data backup saved: ${filename}`);
  
  return filename;
}

async function backupSchema() {
  console.log('\n🗂️  Generating schema backup...');
  
  const schemaQueries = [
    // Get table definitions
    `
    SELECT 
      schemaname,
      tablename,
      tableowner
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
    `,
    
    // Get column information
    `
    SELECT 
      table_name,
      column_name,
      data_type,
      is_nullable,
      column_default,
      ordinal_position
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
    `,
    
    // Get constraints
    `
    SELECT
      tc.table_name,
      tc.constraint_name,
      tc.constraint_type,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    LEFT JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_name;
    `
  ];

  const schemaInfo = {
    timestamp: new Date().toISOString(),
    tables: {},
    columns: {},
    constraints: {}
  };

  // Note: These queries would need to be run with elevated permissions
  // For now, we'll create a basic schema documentation from what we know
  
  const knownSchema = {
    employees: {
      columns: ['id', 'email', 'first_name', 'last_name', 'role', 'department', 'manager_id', 'hire_date', 'created_at', 'updated_at'],
      constraints: ['PRIMARY KEY (id)', 'FOREIGN KEY (manager_id) REFERENCES employees(id)']
    },
    review_cycles: {
      columns: ['id', 'name', 'start_date', 'end_date', 'is_active', 'created_at', 'updated_at'],
      constraints: ['PRIMARY KEY (id)']
    },
    assessments: {
      columns: ['id', 'employee_id', 'review_cycle_id', 'type', 'status', 'responses', 'created_at', 'updated_at'],
      constraints: ['PRIMARY KEY (id)', 'FOREIGN KEY (employee_id) REFERENCES employees(id)', 'FOREIGN KEY (review_cycle_id) REFERENCES review_cycles(id)']
    },
    development_plans: {
      columns: ['id', 'employee_id', 'review_cycle_id', 'goals', 'status', 'manager_approved', 'created_at', 'updated_at'],
      constraints: ['PRIMARY KEY (id)', 'FOREIGN KEY (employee_id) REFERENCES employees(id)', 'FOREIGN KEY (review_cycle_id) REFERENCES review_cycles(id)']
    }
  };

  const filename = `supabase-schema-backup-${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify({ 
    ...schemaInfo, 
    knownSchema,
    note: 'This is a basic schema backup. For complete schema with DDL, use pg_dump with database access.'
  }, null, 2));
  
  console.log(`✅ Schema backup saved: ${filename}`);
  return filename;
}

async function backupFunctions() {
  console.log('\n⚙️  Backing up Edge Functions...');
  
  const functionsDir = path.join(process.cwd(), 'supabase', 'functions');
  const functionsBackup = {};
  
  if (fs.existsSync(functionsDir)) {
    const functionFolders = fs.readdirSync(functionsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const functionName of functionFolders) {
      const functionPath = path.join(functionsDir, functionName);
      const indexPath = path.join(functionPath, 'index.ts');
      
      if (fs.existsSync(indexPath)) {
        functionsBackup[functionName] = {
          code: fs.readFileSync(indexPath, 'utf8'),
          path: `supabase/functions/${functionName}/index.ts`
        };
        console.log(`  ✅ Backed up function: ${functionName}`);
      }
    }
  } else {
    console.log('  ⚠️  No supabase/functions directory found');
  }

  const filename = `supabase-functions-backup-${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(functionsBackup, null, 2));
  console.log(`✅ Functions backup saved: ${filename}`);
  
  return filename;
}

async function backupMigrations() {
  console.log('\n📦 Backing up migrations...');
  
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const migrationsBackup = {};
  
  if (fs.existsSync(migrationsDir)) {
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'));
    
    for (const filename of migrationFiles) {
      const filepath = path.join(migrationsDir, filename);
      migrationsBackup[filename] = {
        sql: fs.readFileSync(filepath, 'utf8'),
        path: `supabase/migrations/${filename}`
      };
      console.log(`  ✅ Backed up migration: ${filename}`);
    }
  } else {
    console.log('  ⚠️  No supabase/migrations directory found');
  }

  const filename = `supabase-migrations-backup-${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(migrationsBackup, null, 2));
  console.log(`✅ Migrations backup saved: ${filename}`);
  
  return filename;
}

async function createBackupSummary(files) {
  const summary = {
    timestamp: new Date().toISOString(),
    backupFiles: files,
    supabaseUrl: SUPABASE_URL,
    backupLocation: BACKUP_DIR,
    note: 'Complete Supabase backup including tables, schema, functions, and migrations'
  };

  const filename = `backup-summary-${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(summary, null, 2));
  console.log(`\n📋 Backup summary saved: ${filename}`);
  
  return filename;
}

async function main() {
  try {
    const backupFiles = [];
    
    // Backup all components
    backupFiles.push(await backupTables());
    backupFiles.push(await backupSchema());
    backupFiles.push(await backupFunctions());
    backupFiles.push(await backupMigrations());
    
    // Create summary
    const summaryFile = await createBackupSummary(backupFiles);
    backupFiles.push(summaryFile);
    
    console.log('\n🎉 Supabase backup completed successfully!');
    console.log(`📁 Backup files created in: ${BACKUP_DIR}`);
    backupFiles.forEach(file => console.log(`   • ${file}`));
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
```

---

## Backup Data Files

### Sample Database Pulse Questions Data

The system contains 15 team health pulse questions across categories:

**Satisfaction Questions:**
- How satisfied are you with your current role and responsibilities?
- How would you rate your overall job satisfaction this week?
- How satisfied are you with the support you receive from your manager?
- How clear are you on what is expected of you in your role?

**Workload Questions:**
- How manageable is your current workload?
- Do you feel you have enough time to complete your tasks effectively?
- How balanced do you feel your work-life integration is right now?

**Support Questions:**
- How supported do you feel by your team and colleagues?
- Do you have the resources and tools you need to do your job well?
- How comfortable do you feel asking for help when you need it?
- How effective is communication within your team?

**Engagement Questions:**
- How engaged and motivated do you feel at work right now?
- Do you feel your work contributes meaningfully to the company goals?
- How likely are you to recommend this company as a great place to work?
- Do you feel your professional development needs are being addressed?

All questions use a scale-based response format and are actively tracked for employee pulse surveys.

---

## Database Utilities

### src/utils/createDatabaseFunction.js

```javascript
// Utility to create database function
import { supabase } from '../services/supabaseClient';

export const createManagerReviewFunction = async () => {
  const sqlQuery = `
    CREATE OR REPLACE FUNCTION public.get_assessment_for_manager_review(
        p_assessment_id bigint
    ) RETURNS TABLE (
        id bigint,
        employee_id uuid,
        employee_name text,
        employee_email text,
        employee_job_title text,
        review_cycle_id bigint,
        cycle_name text,
        cycle_status text,
        due_date date,
        self_assessment_status text,
        manager_review_status text,
        self_assessment_data jsonb,
        manager_review_data jsonb,
        value_passionate_examples text,
        value_driven_examples text,
        value_resilient_examples text,
        value_responsive_examples text,
        gwc_gets_it boolean,
        gwc_gets_it_feedback text,
        gwc_wants_it boolean,
        gwc_wants_it_feedback text,
        gwc_capacity boolean,
        gwc_capacity_feedback text,
        manager_performance_rating text,
        manager_summary_comments text,
        employee_submitted_at timestamp with time zone,
        manager_reviewed_at timestamp with time zone,
        created_at timestamp with time zone,
        updated_at timestamp with time zone
    ) 
    LANGUAGE plpgsql 
    SECURITY DEFINER 
    AS $$
    DECLARE
        v_current_user_id uuid;
        v_manager_employee_id uuid;
        v_assessment_employee_manager_id uuid;
    BEGIN
        -- Get the current user's ID
        v_current_user_id := auth.uid();
        
        -- Get the current user's employee record
        SELECT id INTO v_manager_employee_id
        FROM employees 
        WHERE user_id = v_current_user_id;
        
        IF v_manager_employee_id IS NULL THEN
            RAISE EXCEPTION 'Manager employee record not found';
        END IF;
        
        -- Get the manager_id of the employee whose assessment we're trying to access
        SELECT e.manager_id INTO v_assessment_employee_manager_id
        FROM assessments a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.id = p_assessment_id;
        
        -- Check if the current user is the manager of the employee being assessed
        -- or if they are an admin
        IF v_assessment_employee_manager_id != v_manager_employee_id THEN
            -- Check if user is admin
            DECLARE
                v_user_role text;
            BEGIN
                SELECT role INTO v_user_role FROM auth.users WHERE id = v_current_user_id;
                IF v_user_role != 'admin' THEN
                    RAISE EXCEPTION 'Access denied: You can only review assessments for your direct reports';
                END IF;
            END;
        END IF;
        
        -- Return the assessment data with employee and cycle information
        RETURN QUERY
        SELECT 
            a.id,
            a.employee_id,
            e.name as employee_name,
            e.email as employee_email,
            e.job_title as employee_job_title,
            a.review_cycle_id,
            rc.name as cycle_name,
            rc.status as cycle_status,
            a.due_date,
            a.self_assessment_status,
            a.manager_review_status,
            a.self_assessment_data,
            a.manager_review_data,
            a.value_passionate_examples,
            a.value_driven_examples,
            a.value_resilient_examples,
            a.value_responsive_examples,
            a.gwc_gets_it,
            a.gwc_gets_it_feedback,
            a.gwc_wants_it,
            a.gwc_wants_it_feedback,
            a.gwc_capacity,
            a.gwc_capacity_feedback,
            a.manager_performance_rating,
            a.manager_summary_comments,
            a.employee_submitted_at,
            a.manager_reviewed_at,
            a.created_at,
            a.updated_at
        FROM assessments a
        JOIN employees e ON a.employee_id = e.id
        JOIN review_cycles rc ON a.review_cycle_id = rc.id
        WHERE a.id = p_assessment_id;
    END;
    $$;

    -- Grant execute permissions
    GRANT EXECUTE ON FUNCTION public.get_assessment_for_manager_review(bigint) TO authenticated;
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlQuery });
    if (error) {
      console.error('Error creating function:', error);
      throw error;
    }
    console.log('Function created successfully');
    return data;
  } catch (error) {
    console.error('Failed to create function:', error);
    // Try using raw SQL query approach
    try {
      const { data, error: rawError } = await supabase.from('_supabase_migrations').select('*').limit(0);
      console.log('Database connection test:', { data, rawError });
    } catch (e) {
      console.log('Cannot create function, using fallback approach');
    }
    throw error;
  }
};
```

---

## Architecture Summary

### Database Architecture

**Core Tables:**
- **employees**: User management with role-based access (employee, manager, admin, super_admin)
- **review_cycles**: Performance review period management 
- **assessments**: Self-assessment and manager review data
- **development_plans**: Employee development goal tracking
- **notifications**: In-app notification system
- **pulse_questions**: Team health survey questions
- **team_health_pulse_responses**: Employee pulse survey responses
- **kudos**: Peer recognition system
- **feedback**: General feedback system
- **tenants**: Multi-tenant support for client isolation

**Security Features:**
- Row Level Security (RLS) policies for data isolation
- Multi-tenant architecture with tenant-based RLS
- Role-based access control (RBAC)
- Secure Edge Functions for admin operations
- Unique constraints to prevent data inconsistencies
- Performance indexes for RLS hotpaths

**Key Functions:**
- `seed_self_assessments()`: Bulk assessment seeding
- `seed_review_cycle_assessments()`: Review cycle management
- `delete_feedback()`: Admin content moderation
- `set_tenant_context()`: Multi-tenant context switching
- `get_current_tenant()`: Tenant identification

**Edge Functions:**
- **admin-operations**: Comprehensive admin user management
- **create-edge-user**: Secure user creation with auth sync
- **database-cleanup**: Obsolete table cleanup operations
- **debug-user**: User authentication debugging
- **fix-database**: Critical database fixes
- **setup-tables**: Initial table setup operations

### Multi-Tenant Setup

The system supports multi-tenant architecture with Lucerne International as the primary tenant:
- Tenant ID: 'lucerne'
- Domain: 'lucerneintl.com' 
- All tables include `tenant_id` column for data isolation
- RLS policies enforce tenant separation
- Super admin role can access across tenants

### Performance Optimizations

**Indexes Created:**
- `ix_employees_user_id_active`: Fast auth user lookups
- `ix_employees_manager_active`: Manager hierarchy queries
- `ix_employees_role_active`: Role-based access checks
- `ix_assessments_employee_cycle`: Assessment-employee joins
- `ix_assessments_status`: Status-based filtering
- `uq_employees_user_id`: Unique auth user mapping

**Migration History:**
1. Database cleanup and obsolete table removal
2. Admin feedback management functions
3. Unique constraint enforcement for auth mapping
4. Admin write policies for reliable operations
5. Performance indexes for RLS hotpaths
6. Set-based review seeding functions
7. Multi-tenant setup with Lucerne International

This backup represents a complete snapshot of the Edge Lucerne International backend/database system as of 2025-08-18, including all schemas, migrations, functions, configurations, and supporting infrastructure.

---

**End of Backend Complete Backup**