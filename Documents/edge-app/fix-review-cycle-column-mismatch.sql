-- Fix Review Cycle Column Mismatch Issue
-- The error shows "review_cycle_id" but our function uses "cycle_id"

-- ============================================================================
-- STEP 1: CHECK ASSESSMENTS TABLE STRUCTURE AND FIX COLUMN NAMING
-- ============================================================================

-- First, let's see what columns actually exist in the assessments table
DO $$
DECLARE
    has_cycle_id BOOLEAN := false;
    has_review_cycle_id BOOLEAN := false;
BEGIN
    -- Check if cycle_id column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name = 'cycle_id'
    ) INTO has_cycle_id;
    
    -- Check if review_cycle_id column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name = 'review_cycle_id'
    ) INTO has_review_cycle_id;
    
    RAISE NOTICE 'assessments.cycle_id exists: %', has_cycle_id;
    RAISE NOTICE 'assessments.review_cycle_id exists: %', has_review_cycle_id;
    
    -- If review_cycle_id exists but cycle_id doesn't, add cycle_id as an alias or rename
    IF has_review_cycle_id AND NOT has_cycle_id THEN
        -- Add cycle_id column that references the same data
        ALTER TABLE assessments ADD COLUMN cycle_id BIGINT;
        
        -- Copy data from review_cycle_id to cycle_id
        UPDATE assessments SET cycle_id = review_cycle_id;
        
        -- Add foreign key constraint
        ALTER TABLE assessments ADD CONSTRAINT assessments_cycle_id_fkey 
        FOREIGN KEY (cycle_id) REFERENCES review_cycles(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added cycle_id column and copied data from review_cycle_id';
    END IF;
    
    -- If neither exists, add cycle_id
    IF NOT has_cycle_id AND NOT has_review_cycle_id THEN
        -- Get the data type of review_cycles.id
        DECLARE
            review_cycles_id_type TEXT;
        BEGIN
            SELECT data_type INTO review_cycles_id_type
            FROM information_schema.columns 
            WHERE table_name = 'review_cycles' 
            AND column_name = 'id';
            
            IF review_cycles_id_type = 'bigint' THEN
                ALTER TABLE assessments ADD COLUMN cycle_id BIGINT 
                REFERENCES review_cycles(id) ON DELETE CASCADE;
            ELSE
                ALTER TABLE assessments ADD COLUMN cycle_id INTEGER 
                REFERENCES review_cycles(id) ON DELETE CASCADE;
            END IF;
            
            RAISE NOTICE 'Added cycle_id column with type %', review_cycles_id_type;
        END;
    END IF;
END $$;

-- ============================================================================
-- STEP 2: CREATE FIXED REVIEW CYCLE ACTIVATION FUNCTION
-- ============================================================================

-- Drop existing function and create corrected version
DROP FUNCTION IF EXISTS public.activate_review_cycle_with_assessments(TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.activate_review_cycle_with_assessments(
    p_cycle_id TEXT,
    _csrf_token TEXT DEFAULT NULL,
    _nonce TEXT DEFAULT NULL,
    _timestamp TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
    v_employee_role TEXT;
    v_cycle_record review_cycles%ROWTYPE;
    v_assessment_count INTEGER := 0;
    v_employee_record RECORD;
    v_assessment_id UUID;
    v_actual_cycle_id BIGINT;
    v_cycle_column_name TEXT;
BEGIN
    -- Convert string parameter to BIGINT
    BEGIN
        v_actual_cycle_id := p_cycle_id::BIGINT;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object('error', 'Invalid cycle ID format: ' || p_cycle_id);
    END;
    
    -- Get current user's employee ID and role
    SELECT id, role INTO v_current_employee_id, v_employee_role
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Check if user is admin
    IF v_employee_role != 'admin' THEN
        RETURN json_build_object('error', 'Access denied: Admin privileges required');
    END IF;
    
    -- Get and validate the review cycle
    SELECT * INTO v_cycle_record
    FROM review_cycles 
    WHERE id = v_actual_cycle_id;
    
    IF v_cycle_record.id IS NULL THEN
        RETURN json_build_object('error', 'Review cycle not found');
    END IF;
    
    -- Check if cycle is in a valid state for activation
    IF v_cycle_record.status = 'active' THEN
        RETURN json_build_object('error', 'Review cycle is already active');
    END IF;
    
    IF v_cycle_record.status = 'closed' THEN
        RETURN json_build_object('error', 'Cannot activate a closed review cycle');
    END IF;
    
    -- Update review cycle status to active
    UPDATE review_cycles 
    SET 
        status = 'active',
        updated_at = NOW()
    WHERE id = v_actual_cycle_id;
    
    -- Determine which column name to use for cycle reference
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'assessments' 
            AND column_name = 'cycle_id'
        ) THEN 'cycle_id'
        ELSE 'review_cycle_id'
    END INTO v_cycle_column_name;
    
    -- Create assessments for all active employees using dynamic SQL to handle column name
    FOR v_employee_record IN 
        SELECT id, name, email, manager_id
        FROM employees 
        WHERE is_active = true
    LOOP
        -- Use dynamic SQL to handle different column names
        IF v_cycle_column_name = 'cycle_id' THEN
            INSERT INTO assessments (
                employee_id,
                cycle_id,
                self_assessment_status,
                manager_review_status,
                due_date,
                created_at,
                updated_at
            ) VALUES (
                v_employee_record.id,
                v_actual_cycle_id,
                'not_started',
                'pending',
                v_cycle_record.end_date,
                NOW(),
                NOW()
            ) RETURNING id INTO v_assessment_id;
        ELSE
            INSERT INTO assessments (
                employee_id,
                review_cycle_id,
                self_assessment_status,
                manager_review_status,
                due_date,
                created_at,
                updated_at
            ) VALUES (
                v_employee_record.id,
                v_actual_cycle_id,
                'not_started',
                'pending',
                v_cycle_record.end_date,
                NOW(),
                NOW()
            ) RETURNING id INTO v_assessment_id;
        END IF;
        
        v_assessment_count := v_assessment_count + 1;
        
        -- Create notification for employee about new review cycle
        BEGIN
            PERFORM create_notification(
                v_employee_record.id,
                v_current_employee_id,
                'review_cycle_opened',
                'New Review Cycle Started',
                'A new review cycle "' || v_cycle_record.name || '" has been activated. Please complete your self-assessment by ' || v_cycle_record.end_date::DATE
            );
        EXCEPTION
            WHEN undefined_function THEN
                NULL; -- Ignore if notification function doesn't exist
        END;
        
        -- Create notification for manager if employee has one
        IF v_employee_record.manager_id IS NOT NULL THEN
            BEGIN
                PERFORM create_notification(
                    v_employee_record.manager_id,
                    v_current_employee_id,
                    'review_cycle_opened',
                    'New Review Cycle - Team Member Assessment',
                    'Review cycle "' || v_cycle_record.name || '" activated. Your team member ' || v_employee_record.name || ' will need manager review.'
                );
            EXCEPTION
                WHEN undefined_function THEN
                    NULL; -- Ignore if notification function doesn't exist
            END;
        END IF;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Review cycle activated successfully',
        'cycle_id', v_actual_cycle_id,
        'cycle_name', v_cycle_record.name,
        'assessments_created', v_assessment_count,
        'status', 'active'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to activate review cycle: ' || SQLERRM);
END;
$$;

-- ============================================================================
-- STEP 3: UPDATE DASHBOARD FUNCTIONS TO HANDLE BOTH COLUMN NAMES
-- ============================================================================

-- Update admin dashboard stats function to handle both column names
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
    v_employee_role TEXT;
    result JSON;
    v_cycle_column TEXT;
BEGIN
    -- Get current user's employee ID and role
    SELECT e.id, e.role INTO v_current_employee_id, v_employee_role
    FROM employees e 
    WHERE e.user_id = auth.uid() AND e.is_active = true;
    
    IF v_current_employee_id IS NULL OR v_employee_role != 'admin' THEN
        RETURN json_build_object('error', 'Access denied: Admin privileges required');
    END IF;
    
    -- Determine which column name to use
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'assessments' 
            AND column_name = 'cycle_id'
        ) THEN 'cycle_id'
        ELSE 'review_cycle_id'
    END INTO v_cycle_column;
    
    -- Build comprehensive admin statistics using dynamic column name
    IF v_cycle_column = 'cycle_id' THEN
        SELECT json_build_object(
            'total_employees', (SELECT COUNT(*) FROM employees WHERE is_active = true),
            'total_managers', (SELECT COUNT(*) FROM employees WHERE role = 'manager' AND is_active = true),
            'active_review_cycles', (SELECT COUNT(*) FROM review_cycles WHERE status = 'active'),
            'pending_assessments', (
                SELECT COUNT(*) 
                FROM assessments a
                JOIN review_cycles rc ON a.cycle_id = rc.id
                WHERE rc.status = 'active' 
                AND a.self_assessment_status = 'not_started'
            ),
            'completed_assessments', (
                SELECT COUNT(*) 
                FROM assessments a
                JOIN review_cycles rc ON a.cycle_id = rc.id
                WHERE rc.status = 'active' 
                AND a.self_assessment_status = 'completed'
            )
        ) INTO result;
    ELSE
        SELECT json_build_object(
            'total_employees', (SELECT COUNT(*) FROM employees WHERE is_active = true),
            'total_managers', (SELECT COUNT(*) FROM employees WHERE role = 'manager' AND is_active = true),
            'active_review_cycles', (SELECT COUNT(*) FROM review_cycles WHERE status = 'active'),
            'pending_assessments', (
                SELECT COUNT(*) 
                FROM assessments a
                JOIN review_cycles rc ON a.review_cycle_id = rc.id
                WHERE rc.status = 'active' 
                AND a.self_assessment_status = 'not_started'
            ),
            'completed_assessments', (
                SELECT COUNT(*) 
                FROM assessments a
                JOIN review_cycles rc ON a.review_cycle_id = rc.id
                WHERE rc.status = 'active' 
                AND a.self_assessment_status = 'completed'
            )
        ) INTO result;
    END IF;
    
    RETURN COALESCE(result, '{}'::json);
END;
$$;

-- ============================================================================
-- STEP 4: GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.activate_review_cycle_with_assessments(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;

SELECT '✅ Review cycle column mismatch issue fixed!' as status;