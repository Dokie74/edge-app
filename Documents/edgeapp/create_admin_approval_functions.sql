-- Admin approval functions for manager reviews

-- Function to get assessments pending admin approval
CREATE OR REPLACE FUNCTION public.get_pending_admin_approvals()
RETURNS TABLE (
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
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
DECLARE
    v_user_role text;
    v_current_employee_id uuid;
BEGIN
    -- Get current user's role and employee ID
    SELECT role INTO v_user_role FROM auth.users WHERE id = auth.uid();
    
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

-- Function to approve a manager review (Admin action)
CREATE OR REPLACE FUNCTION public.approve_manager_review(
    p_assessment_id bigint,
    p_admin_notes text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
    v_user_role text;
    v_assessment_record assessments%ROWTYPE;
    v_admin_employee_id uuid;
BEGIN
    -- Get current user's role
    SELECT role INTO v_user_role FROM auth.users WHERE id = auth.uid();
    
    -- Only admins can approve manager reviews
    IF v_user_role != 'admin' THEN
        RETURN jsonb_build_object('error', 'Access denied: Admin role required');
    END IF;

    -- Get the assessment record
    SELECT * INTO v_assessment_record
    FROM assessments 
    WHERE id = p_assessment_id AND self_assessment_status = 'pending_admin_approval';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Assessment not found or not pending admin approval');
    END IF;

    -- Get admin's employee ID for logging
    SELECT e.id INTO v_admin_employee_id
    FROM employees e
    WHERE e.user_id = auth.uid();

    -- Approve the review - change status to manager_complete
    UPDATE assessments 
    SET 
        self_assessment_status = 'manager_complete',
        manager_review_status = 'completed',
        admin_approval_notes = p_admin_notes,
        admin_approved_at = NOW(),
        admin_approved_by = v_admin_employee_id,
        updated_at = NOW()
    WHERE id = p_assessment_id;

    -- Log the approval
    INSERT INTO activity_log (
        employee_id,
        action_type,
        description,
        created_at
    ) VALUES (
        v_admin_employee_id,
        'admin_approval_granted',
        'Admin approved manager review for assessment ' || p_assessment_id::text ||
        CASE WHEN p_admin_notes IS NOT NULL THEN ' with notes: ' || p_admin_notes ELSE '' END,
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Manager review approved successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to request revisions to a manager review (Admin action)
CREATE OR REPLACE FUNCTION public.request_manager_review_revision(
    p_assessment_id bigint,
    p_revision_notes text
) RETURNS jsonb AS $$
DECLARE
    v_user_role text;
    v_assessment_record assessments%ROWTYPE; 
    v_admin_employee_id uuid;
    v_manager_employee_id uuid;
BEGIN
    -- Get current user's role
    SELECT role INTO v_user_role FROM auth.users WHERE id = auth.uid();
    
    -- Only admins can request revisions
    IF v_user_role != 'admin' THEN
        RETURN jsonb_build_object('error', 'Access denied: Admin role required');
    END IF;

    -- Get the assessment record
    SELECT * INTO v_assessment_record
    FROM assessments a
    WHERE a.id = p_assessment_id AND a.self_assessment_status = 'pending_admin_approval';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Assessment not found or not pending admin approval');
    END IF;

    -- Get the manager employee ID
    SELECT e.manager_id INTO v_manager_employee_id
    FROM employees e
    WHERE e.id = v_assessment_record.employee_id;

    -- Get admin's employee ID for logging
    SELECT e.id INTO v_admin_employee_id
    FROM employees e
    WHERE e.user_id = auth.uid();

    -- Send back to manager for revision
    UPDATE assessments 
    SET 
        self_assessment_status = 'employee_complete',  -- Back to manager review state
        manager_review_status = 'pending',             -- Manager needs to revise
        admin_revision_notes = p_revision_notes,
        admin_revision_requested_at = NOW(),
        admin_revision_requested_by = v_admin_employee_id,
        updated_at = NOW()
    WHERE id = p_assessment_id;

    -- Log the revision request
    INSERT INTO activity_log (
        employee_id,
        action_type,
        description,
        created_at
    ) VALUES (
        v_admin_employee_id,
        'admin_revision_requested',
        'Admin requested revision of manager review for assessment ' || p_assessment_id::text || 
        ' - Notes: ' || p_revision_notes,
        NOW()
    );

    -- Also log for the manager
    INSERT INTO activity_log (
        employee_id,
        action_type,
        description,
        created_at
    ) VALUES (
        v_manager_employee_id,
        'manager_revision_requested',
        'Admin requested revision of your review for assessment ' || p_assessment_id::text,
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Revision requested successfully - manager will be notified'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_pending_admin_approvals() TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_manager_review(bigint, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_manager_review_revision(bigint, text) TO authenticated;