-- Fix Function Signature Conflict and Department Issues
-- This resolves the activate_review_cycle_with_assessments function conflict

-- ============================================================================
-- STEP 1: DROP CONFLICTING FUNCTIONS AND CREATE SINGLE CORRECT VERSION
-- ============================================================================

-- Drop all existing versions of the function to avoid conflicts
DROP FUNCTION IF EXISTS public.activate_review_cycle_with_assessments(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.activate_review_cycle_with_assessments(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.activate_review_cycle_with_assessments(BIGINT, TEXT, TEXT, TEXT);

-- Create the correct function with proper parameter handling
CREATE OR REPLACE FUNCTION public.activate_review_cycle_with_assessments(
    p_cycle_id TEXT,  -- Accept as TEXT and convert internally
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
    v_actual_cycle_id BIGINT; -- Convert to BIGINT for database
BEGIN
    -- Convert string parameter to BIGINT (based on your database structure)
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
    FOR v_employee_record IN 
        SELECT id, name, email, manager_id
        FROM employees 
        WHERE is_active = true
    LOOP
        -- Insert assessment record
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
-- STEP 2: CREATE FUNCTION TO GET EMPLOYEE WITH DEPARTMENTS FOR EDITING
-- ============================================================================

-- Function to get employee details including departments for editing
CREATE OR REPLACE FUNCTION public.get_employee_with_departments(p_employee_id UUID)
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
    
    -- Get employee details with departments
    SELECT json_build_object(
        'employee', json_build_object(
            'id', e.id,
            'name', e.name,
            'email', e.email,
            'job_title', e.job_title,
            'role', e.role,
            'manager_id', e.manager_id,
            'is_active', e.is_active,
            'created_at', e.created_at,
            'updated_at', e.updated_at
        ),
        'departments', COALESCE(
            (SELECT json_agg(d.id)
             FROM employee_departments ed
             JOIN departments d ON ed.department_id = d.id
             WHERE ed.employee_id = e.id),
            '[]'::json
        ),
        'department_names', COALESCE(
            (SELECT json_agg(d.name)
             FROM employee_departments ed
             JOIN departments d ON ed.department_id = d.id
             WHERE ed.employee_id = e.id),
            '[]'::json
        )
    ) INTO result
    FROM employees e
    WHERE e.id = p_employee_id;
    
    IF result IS NULL THEN
        RETURN json_build_object('error', 'Employee not found');
    END IF;
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to get employee details: ' || SQLERRM);
END;
$$;

-- ============================================================================
-- STEP 3: GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions for the new function signature
GRANT EXECUTE ON FUNCTION public.activate_review_cycle_with_assessments(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_employee_with_departments(UUID) TO authenticated;

SELECT '✅ Function conflicts resolved and employee departments support added!' as status;