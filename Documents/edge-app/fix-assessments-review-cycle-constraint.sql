-- Fix Assessments Table Review Cycle Constraint Issue
-- The assessments table has BOTH review_cycle_id (NOT NULL) and cycle_id (nullable)
-- The function is inserting into cycle_id but constraint expects review_cycle_id

-- ============================================================================
-- STEP 1: DIAGNOSE CURRENT ASSESSMENTS TABLE STRUCTURE
-- ============================================================================

DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '=== CURRENT ASSESSMENTS TABLE STRUCTURE ===';
    
    -- Show columns related to cycle references
    FOR rec IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name IN ('cycle_id', 'review_cycle_id')
        ORDER BY column_name
    LOOP
        RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
            rec.column_name, rec.data_type, rec.is_nullable, COALESCE(rec.column_default, 'NULL');
    END LOOP;
    
    -- Show constraints on these columns
    FOR rec IN
        SELECT conname, contype, 
               pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = 'public.assessments'::regclass
        AND (conname LIKE '%cycle%' OR conname LIKE '%review%')
    LOOP
        RAISE NOTICE 'Constraint: %, Type: %, Definition: %', 
            rec.conname, rec.contype, rec.definition;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 2: CREATE CORRECTED ACTIVATION FUNCTION
-- ============================================================================

-- Drop existing conflicting functions
DROP FUNCTION IF EXISTS public.activate_review_cycle_with_assessments(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.activate_review_cycle_with_assessments(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.activate_review_cycle_with_assessments(BIGINT, TEXT, TEXT, TEXT);

-- Create the corrected function that uses review_cycle_id (the NOT NULL column)
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
    v_assessment_id BIGINT;
    v_actual_cycle_id BIGINT;
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
    
    -- Create assessments for all active employees
    -- Using review_cycle_id (NOT NULL) instead of cycle_id (nullable)
    FOR v_employee_record IN 
        SELECT id, name, email, manager_id
        FROM employees 
        WHERE is_active = true
    LOOP
        -- Insert assessment record using review_cycle_id
        INSERT INTO assessments (
            employee_id,
            review_cycle_id,  -- This is the NOT NULL column that needs the value
            cycle_id,         -- Also set this for backward compatibility
            status,
            self_assessment_status,
            manager_review_status,
            due_date,
            created_at,
            updated_at
        ) VALUES (
            v_employee_record.id,
            v_actual_cycle_id,  -- review_cycle_id (NOT NULL)
            v_actual_cycle_id,  -- cycle_id (nullable, for compatibility)
            'not_started',
            'not_started',
            'pending',
            v_cycle_record.end_date,
            NOW(),
            NOW()
        ) RETURNING id INTO v_assessment_id;
        
        v_assessment_count := v_assessment_count + 1;
        
        -- Create notification for employee about new review cycle
        BEGIN
            INSERT INTO notifications (
                recipient_id,
                sender_id,
                type,
                title,
                message,
                created_at
            ) VALUES (
                v_employee_record.id,
                v_current_employee_id,
                'review_cycle_opened',
                'New Review Cycle Started',
                'A new review cycle "' || v_cycle_record.name || '" has been activated. Please complete your self-assessment by ' || v_cycle_record.end_date::DATE,
                NOW()
            );
        EXCEPTION
            WHEN OTHERS THEN
                NULL; -- Ignore notification errors
        END;
        
        -- Create notification for manager if employee has one
        IF v_employee_record.manager_id IS NOT NULL THEN
            BEGIN
                INSERT INTO notifications (
                    recipient_id,
                    sender_id,
                    type,
                    title,
                    message,
                    created_at
                ) VALUES (
                    v_employee_record.manager_id,
                    v_current_employee_id,
                    'review_cycle_opened',
                    'New Review Cycle - Team Member Assessment',
                    'Review cycle "' || v_cycle_record.name || '" activated. Your team member ' || v_employee_record.name || ' will need manager review.',
                    NOW()
                );
            EXCEPTION
                WHEN OTHERS THEN
                    NULL; -- Ignore notification errors
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
-- STEP 3: UPDATE DASHBOARD FUNCTIONS TO USE CORRECT COLUMN
-- ============================================================================

-- Update admin dashboard to use review_cycle_id consistently
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
    v_employee_role TEXT;
    result JSON;
BEGIN
    -- Get current user's employee ID and role
    SELECT e.id, e.role INTO v_current_employee_id, v_employee_role
    FROM employees e 
    WHERE e.user_id = auth.uid() AND e.is_active = true;
    
    IF v_current_employee_id IS NULL OR v_employee_role != 'admin' THEN
        RETURN json_build_object('error', 'Access denied: Admin privileges required');
    END IF;
    
    -- Build comprehensive admin statistics using review_cycle_id
    SELECT json_build_object(
        'total_employees', (SELECT COUNT(*) FROM employees WHERE is_active = true),
        'total_managers', (SELECT COUNT(*) FROM employees WHERE role = 'manager' AND is_active = true),
        'active_review_cycles', (SELECT COUNT(*) FROM review_cycles WHERE status = 'active'),
        'pending_assessments', (
            SELECT COUNT(*) 
            FROM assessments a
            JOIN review_cycles rc ON a.review_cycle_id = rc.id
            WHERE rc.status = 'active' 
            AND (a.self_assessment_status = 'not_started' OR a.status = 'not_started')
        ),
        'completed_assessments', (
            SELECT COUNT(*) 
            FROM assessments a
            JOIN review_cycles rc ON a.review_cycle_id = rc.id
            WHERE rc.status = 'active' 
            AND (a.self_assessment_status = 'completed' OR a.status = 'completed')
        )
    ) INTO result;
    
    RETURN COALESCE(result, '{}'::json);
END;
$$;

-- ============================================================================
-- STEP 4: CLEANUP AND VERIFICATION
-- ============================================================================

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.activate_review_cycle_with_assessments(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;

-- Verification query to show the fix
DO $$
DECLARE
    cycle_count INTEGER;
    review_cycle_count INTEGER;
BEGIN
    -- Check if assessments table has proper columns
    SELECT COUNT(*) INTO cycle_count
    FROM information_schema.columns 
    WHERE table_name = 'assessments' AND column_name = 'cycle_id';
    
    SELECT COUNT(*) INTO review_cycle_count
    FROM information_schema.columns 
    WHERE table_name = 'assessments' AND column_name = 'review_cycle_id';
    
    RAISE NOTICE '=== VERIFICATION RESULTS ===';
    RAISE NOTICE 'assessments.cycle_id column exists: %', CASE WHEN cycle_count > 0 THEN 'YES' ELSE 'NO' END;
    RAISE NOTICE 'assessments.review_cycle_id column exists: %', CASE WHEN review_cycle_count > 0 THEN 'YES' ELSE 'NO' END;
    RAISE NOTICE 'Function now uses review_cycle_id (NOT NULL) for assessments';
    RAISE NOTICE 'Backward compatibility maintained by also setting cycle_id';
END $$;

SELECT '✅ Review cycle activation fixed to use review_cycle_id (NOT NULL column)!' as status;