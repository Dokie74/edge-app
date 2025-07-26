-- Fix Development Plans Table Structure
-- This adds missing columns to the development_plans table

-- ============================================================================
-- STEP 1: ADD MISSING COLUMNS TO DEVELOPMENT_PLANS TABLE
-- ============================================================================

-- Add missing columns one by one with IF NOT EXISTS checks
DO $$
BEGIN
    -- Add manager_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'development_plans' 
        AND column_name = 'manager_id'
    ) THEN
        ALTER TABLE development_plans 
        ADD COLUMN manager_id UUID REFERENCES employees(id) ON DELETE SET NULL;
    END IF;
    
    -- Add goals column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'development_plans' 
        AND column_name = 'goals'
    ) THEN
        ALTER TABLE development_plans 
        ADD COLUMN goals TEXT NOT NULL DEFAULT '';
    END IF;
    
    -- Add objectives column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'development_plans' 
        AND column_name = 'objectives'
    ) THEN
        ALTER TABLE development_plans 
        ADD COLUMN objectives TEXT;
    END IF;
    
    -- Add skills_to_develop column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'development_plans' 
        AND column_name = 'skills_to_develop'
    ) THEN
        ALTER TABLE development_plans 
        ADD COLUMN skills_to_develop TEXT;
    END IF;
    
    -- Add resources_needed column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'development_plans' 
        AND column_name = 'resources_needed'
    ) THEN
        ALTER TABLE development_plans 
        ADD COLUMN resources_needed TEXT;
    END IF;
    
    -- Add success_metrics column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'development_plans' 
        AND column_name = 'success_metrics'
    ) THEN
        ALTER TABLE development_plans 
        ADD COLUMN success_metrics TEXT;
    END IF;
    
    -- Add target_completion_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'development_plans' 
        AND column_name = 'target_completion_date'
    ) THEN
        ALTER TABLE development_plans 
        ADD COLUMN target_completion_date DATE;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'development_plans' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE development_plans 
        ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed'));
    END IF;
    
    -- Add manager_feedback column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'development_plans' 
        AND column_name = 'manager_feedback'
    ) THEN
        ALTER TABLE development_plans 
        ADD COLUMN manager_feedback TEXT;
    END IF;
    
    -- Add manager_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'development_plans' 
        AND column_name = 'manager_rating'
    ) THEN
        ALTER TABLE development_plans 
        ADD COLUMN manager_rating INTEGER CHECK (manager_rating >= 1 AND manager_rating <= 5);
    END IF;
    
    -- Add submission_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'development_plans' 
        AND column_name = 'submission_date'
    ) THEN
        ALTER TABLE development_plans 
        ADD COLUMN submission_date TIMESTAMPTZ;
    END IF;
    
    -- Add review_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'development_plans' 
        AND column_name = 'review_date'
    ) THEN
        ALTER TABLE development_plans 
        ADD COLUMN review_date TIMESTAMPTZ;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'development_plans' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE development_plans 
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'development_plans' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE development_plans 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- ============================================================================
-- STEP 2: UPDATE EXISTING RECORDS WITH DEFAULT VALUES
-- ============================================================================

-- Update any existing records that might have NULL values
UPDATE development_plans 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE development_plans 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

UPDATE development_plans 
SET status = 'draft' 
WHERE status IS NULL;

-- Set manager_id for existing records where possible
UPDATE development_plans 
SET manager_id = e.manager_id
FROM employees e
WHERE development_plans.employee_id = e.id
AND development_plans.manager_id IS NULL;

-- ============================================================================
-- STEP 3: ADD INDEXES FOR BETTER PERFORMANCE
-- ============================================================================

-- Add indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_development_plans_employee_id ON development_plans(employee_id);
CREATE INDEX IF NOT EXISTS idx_development_plans_manager_id ON development_plans(manager_id);
CREATE INDEX IF NOT EXISTS idx_development_plans_status ON development_plans(status);
CREATE INDEX IF NOT EXISTS idx_development_plans_created_at ON development_plans(created_at);

-- ============================================================================
-- STEP 4: ENABLE RLS AND CREATE POLICIES
-- ============================================================================

-- Enable RLS on development_plans table
ALTER TABLE development_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS development_plans_select_own ON development_plans;
DROP POLICY IF EXISTS development_plans_insert_own ON development_plans;
DROP POLICY IF EXISTS development_plans_update_own ON development_plans;

-- Create RLS policies for development_plans
CREATE POLICY development_plans_select_own ON development_plans 
FOR SELECT TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    manager_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    EXISTS (
        SELECT 1 FROM employees 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    )
);

CREATE POLICY development_plans_insert_own ON development_plans 
FOR INSERT TO authenticated 
WITH CHECK (
    employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY development_plans_update_own ON development_plans 
FOR UPDATE TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    manager_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    EXISTS (
        SELECT 1 FROM employees 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    )
);

SELECT '✅ Development plans table structure fixed successfully!' as status;