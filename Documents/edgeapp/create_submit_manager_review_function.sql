-- Create submit_manager_review function to handle manager review submission
-- This will update the assessment with manager feedback and set proper status

CREATE OR REPLACE FUNCTION public.submit_manager_review(
    p_assessment_id uuid,
    p_feedback jsonb
) RETURNS jsonb AS $$
DECLARE
    v_assessment assessments%ROWTYPE;
    v_manager_employee_id uuid;
    v_manager_has_manager boolean := false;
    v_next_status text := 'manager_complete';
BEGIN
    -- Get the current assessment
    SELECT * INTO v_assessment
    FROM assessments 
    WHERE id = p_assessment_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Assessment not found');
    END IF;

    -- Get the manager's employee record to check if they have a manager
    SELECT e.id, (e.manager_id IS NOT NULL) 
    INTO v_manager_employee_id, v_manager_has_manager
    FROM employees e
    WHERE e.user_id = auth.uid();

    -- If manager has a manager (like Manager1 reporting to Admin), 
    -- set status to pending_admin_approval instead of manager_complete
    IF v_manager_has_manager THEN
        v_next_status := 'pending_admin_approval';
    END IF;

    -- Update the assessment with manager feedback and new status
    UPDATE assessments 
    SET 
        -- Core manager feedback fields
        manager_performance_rating = COALESCE((p_feedback->>'manager_performance_rating')::text, manager_performance_rating),
        manager_summary_comments = COALESCE(p_feedback->>'manager_summary_comments', manager_summary_comments),
        manager_development_plan = COALESCE(p_feedback->>'manager_development_plan', manager_development_plan),
        manager_action_items = COALESCE(p_feedback->>'manager_action_items', manager_action_items),
        
        -- Core values feedback
        manager_passionate_feedback = COALESCE(p_feedback->>'manager_passionate_feedback', manager_passionate_feedback),
        manager_driven_feedback = COALESCE(p_feedback->>'manager_driven_feedback', manager_driven_feedback),
        manager_resilient_feedback = COALESCE(p_feedback->>'manager_resilient_feedback', manager_resilient_feedback),
        manager_responsive_feedback = COALESCE(p_feedback->>'manager_responsive_feedback', manager_responsive_feedback),
        
        -- GWC manager assessments
        manager_gwc_gets_it = COALESCE((p_feedback->>'manager_gwc_gets_it')::boolean, manager_gwc_gets_it),
        manager_gwc_gets_it_feedback = COALESCE(p_feedback->>'manager_gwc_gets_it_feedback', manager_gwc_gets_it_feedback),
        manager_gwc_wants_it = COALESCE((p_feedback->>'manager_gwc_wants_it')::boolean, manager_gwc_wants_it),
        manager_gwc_wants_it_feedback = COALESCE(p_feedback->>'manager_gwc_wants_it_feedback', manager_gwc_wants_it_feedback),
        manager_gwc_capacity = COALESCE((p_feedback->>'manager_gwc_capacity')::boolean, manager_gwc_capacity),
        manager_gwc_capacity_feedback = COALESCE(p_feedback->>'manager_gwc_capacity_feedback', manager_gwc_capacity_feedback),
        
        -- Strengths and improvements feedback
        manager_strengths_feedback = COALESCE(p_feedback->>'manager_strengths_feedback', manager_strengths_feedback),
        manager_improvements_feedback = COALESCE(p_feedback->>'manager_improvements_feedback', manager_improvements_feedback),
        
        -- Status and timestamps
        manager_review_status = v_next_status,
        self_assessment_status = v_next_status,
        manager_reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_assessment_id;

    -- Log the action
    INSERT INTO activity_log (
        employee_id,
        action_type,
        description,
        created_at
    ) VALUES (
        v_manager_employee_id,
        'manager_review_submitted',
        'Manager completed review for assessment ' || p_assessment_id::text || 
        CASE WHEN v_manager_has_manager THEN ' - sent to admin for approval' ELSE ' - completed' END,
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true, 
        'status', v_next_status,
        'requires_admin_approval', v_manager_has_manager
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.submit_manager_review(uuid, jsonb) TO authenticated;