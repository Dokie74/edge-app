-- Fix Assessments Table Structure - CORRECTED VERSION
-- This adds missing columns to the assessments table with proper data types

-- ============================================================================
-- STEP 1: CHECK EXISTING TABLE STRUCTURES AND ADD MISSING COLUMNS
-- ============================================================================

-- First, let's check what type the review_cycles.id column actually is
DO $$
DECLARE
    review_cycles_id_type TEXT;
    employees_id_type TEXT;
BEGIN
    -- Get the data type of review_cycles.id
    SELECT data_type INTO review_cycles_id_type
    FROM information_schema.columns 
    WHERE table_name = 'review_cycles' 
    AND column_name = 'id';
    
    -- Get the data type of employees.id  
    SELECT data_type INTO employees_id_type
    FROM information_schema.columns 
    WHERE table_name = 'employees' 
    AND column_name = 'id';
    
    RAISE NOTICE 'review_cycles.id type: %', COALESCE(review_cycles_id_type, 'NOT FOUND');
    RAISE NOTICE 'employees.id type: %', COALESCE(employees_id_type, 'NOT FOUND');
    
    -- Add cycle_id column with matching type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name = 'cycle_id'
    ) THEN
        IF review_cycles_id_type = 'bigint' THEN
            ALTER TABLE assessments 
            ADD COLUMN cycle_id BIGINT REFERENCES review_cycles(id) ON DELETE CASCADE;
        ELSIF review_cycles_id_type = 'uuid' THEN
            ALTER TABLE assessments 
            ADD COLUMN cycle_id UUID REFERENCES review_cycles(id) ON DELETE CASCADE;
        ELSIF review_cycles_id_type = 'integer' THEN
            ALTER TABLE assessments 
            ADD COLUMN cycle_id INTEGER REFERENCES review_cycles(id) ON DELETE CASCADE;
        ELSE
            -- Default to bigint if we can't determine the type
            ALTER TABLE assessments 
            ADD COLUMN cycle_id BIGINT REFERENCES review_cycles(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Add employee_id column with matching type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name = 'employee_id'
    ) THEN
        IF employees_id_type = 'bigint' THEN
            ALTER TABLE assessments 
            ADD COLUMN employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE;
        ELSIF employees_id_type = 'uuid' THEN
            ALTER TABLE assessments 
            ADD COLUMN employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE;
        ELSIF employees_id_type = 'integer' THEN
            ALTER TABLE assessments 
            ADD COLUMN employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE;
        ELSE
            -- Default to bigint if we can't determine the type
            ALTER TABLE assessments 
            ADD COLUMN employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Add other columns that don't depend on foreign keys
    
    -- Add self_assessment_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name = 'self_assessment_status'
    ) THEN
        ALTER TABLE assessments 
        ADD COLUMN self_assessment_status TEXT DEFAULT 'not_started' 
        CHECK (self_assessment_status IN ('not_started', 'in_progress', 'completed'));
    END IF;
    
    -- Add manager_review_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name = 'manager_review_status'
    ) THEN
        ALTER TABLE assessments 
        ADD COLUMN manager_review_status TEXT DEFAULT 'pending' 
        CHECK (manager_review_status IN ('pending', 'in_progress', 'completed'));
    END IF;
    
    -- Add due_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name = 'due_date'
    ) THEN
        ALTER TABLE assessments 
        ADD COLUMN due_date DATE;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE assessments 
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE assessments 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add self_assessment_data column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name = 'self_assessment_data'
    ) THEN
        ALTER TABLE assessments 
        ADD COLUMN self_assessment_data JSONB;
    END IF;
    
    -- Add manager_review_data column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name = 'manager_review_data'
    ) THEN
        ALTER TABLE assessments 
        ADD COLUMN manager_review_data JSONB;
    END IF;
    
    -- Add manager_notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name = 'manager_notes'
    ) THEN
        ALTER TABLE assessments 
        ADD COLUMN manager_notes TEXT;
    END IF;
    
    -- Add overall_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name = 'overall_rating'
    ) THEN
        ALTER TABLE assessments 
        ADD COLUMN overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5);
    END IF;
END $$;

-- ============================================================================
-- STEP 2: ENSURE REVIEW_CYCLES TABLE HAS REQUIRED COLUMNS
-- ============================================================================

-- Add missing columns to review_cycles table if they don't exist
DO $$
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'review_cycles' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE review_cycles 
        ADD COLUMN status TEXT DEFAULT 'draft' 
        CHECK (status IN ('draft', 'active', 'closed'));
    END IF;
    
    -- Add name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'review_cycles' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE review_cycles 
        ADD COLUMN name TEXT DEFAULT 'Review Cycle';
    END IF;
    
    -- Add start_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'review_cycles' 
        AND column_name = 'start_date'
    ) THEN
        ALTER TABLE review_cycles 
        ADD COLUMN start_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    -- Add end_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'review_cycles' 
        AND column_name = 'end_date'
    ) THEN
        ALTER TABLE review_cycles 
        ADD COLUMN end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days');
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'review_cycles' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE review_cycles 
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'review_cycles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE review_cycles 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- ============================================================================
-- STEP 3: UPDATE EXISTING RECORDS WITH DEFAULT VALUES
-- ============================================================================

-- Update any existing records that might have NULL values
UPDATE assessments 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE assessments 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

UPDATE assessments 
SET self_assessment_status = 'not_started' 
WHERE self_assessment_status IS NULL;

UPDATE assessments 
SET manager_review_status = 'pending' 
WHERE manager_review_status IS NULL;

-- Update existing review_cycles records
UPDATE review_cycles 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE review_cycles 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

UPDATE review_cycles 
SET status = 'active' 
WHERE status IS NULL;

-- Link assessments to active review cycles if cycle_id is NULL
UPDATE assessments 
SET cycle_id = (
    SELECT id FROM review_cycles 
    WHERE status = 'active' 
    ORDER BY created_at DESC 
    LIMIT 1
)
WHERE cycle_id IS NULL;

-- ============================================================================
-- STEP 4: ADD INDEXES FOR BETTER PERFORMANCE
-- ============================================================================

-- Add indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_assessments_employee_id ON assessments(employee_id);
CREATE INDEX IF NOT EXISTS idx_assessments_cycle_id ON assessments(cycle_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(self_assessment_status, manager_review_status);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_assessments_updated_at ON assessments(updated_at);

CREATE INDEX IF NOT EXISTS idx_review_cycles_status ON review_cycles(status);
CREATE INDEX IF NOT EXISTS idx_review_cycles_dates ON review_cycles(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_review_cycles_created_at ON review_cycles(created_at);

-- ============================================================================
-- STEP 5: ENABLE RLS AND CREATE POLICIES
-- ============================================================================

-- Enable RLS on assessments table
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_cycles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS assessments_select_own ON assessments;
DROP POLICY IF EXISTS assessments_insert_own ON assessments;
DROP POLICY IF EXISTS assessments_update_own ON assessments;

DROP POLICY IF EXISTS review_cycles_select_all ON review_cycles;
DROP POLICY IF EXISTS review_cycles_insert_admin ON review_cycles;
DROP POLICY IF EXISTS review_cycles_update_admin ON review_cycles;

-- Create RLS policies for assessments
CREATE POLICY assessments_select_own ON assessments 
FOR SELECT TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    employee_id IN (
        SELECT e.id FROM employees e
        WHERE e.manager_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
        )
    )
    OR
    EXISTS (
        SELECT 1 FROM employees 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    )
);

CREATE POLICY assessments_insert_own ON assessments 
FOR INSERT TO authenticated 
WITH CHECK (
    employee_id IN (
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

CREATE POLICY assessments_update_own ON assessments 
FOR UPDATE TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    employee_id IN (
        SELECT e.id FROM employees e
        WHERE e.manager_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
        )
    )
    OR
    EXISTS (
        SELECT 1 FROM employees 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    )
);

-- Create RLS policies for review_cycles
CREATE POLICY review_cycles_select_all ON review_cycles 
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY review_cycles_insert_admin ON review_cycles 
FOR INSERT TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM employees 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    )
);

CREATE POLICY review_cycles_update_admin ON review_cycles 
FOR UPDATE TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM employees 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    )
);

-- ============================================================================
-- STEP 6: CREATE OR UPDATE TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;
CREATE TRIGGER update_assessments_updated_at 
    BEFORE UPDATE ON assessments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_review_cycles_updated_at ON review_cycles;
CREATE TRIGGER update_review_cycles_updated_at 
    BEFORE UPDATE ON review_cycles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

SELECT '✅ Assessments and review_cycles table structure fixed successfully with proper data types!' as status;