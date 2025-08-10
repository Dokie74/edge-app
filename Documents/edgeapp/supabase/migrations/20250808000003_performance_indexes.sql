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