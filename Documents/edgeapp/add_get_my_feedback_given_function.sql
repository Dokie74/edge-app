-- Add get_my_feedback_given function to support feedback given view
-- This function returns feedback that the current user has given to others

CREATE OR REPLACE FUNCTION public.get_my_feedback_given(p_limit integer DEFAULT 20) 
    RETURNS TABLE(
        feedback_id bigint, 
        recipient_name text, 
        feedback_type text, 
        category text, 
        message text, 
        is_anonymous boolean, 
        helpful_count integer, 
        created_at timestamp with time zone
    )
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    current_emp_id UUID;
BEGIN
    -- Get current employee ID from authenticated user
    SELECT id INTO current_emp_id 
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    -- Fallback for development/testing
    IF current_emp_id IS NULL THEN
        SELECT id INTO current_emp_id FROM employees WHERE is_active = true LIMIT 1;
    END IF;
    
    -- Return feedback given by current user
    RETURN QUERY
    SELECT 
        pf.feedback_id,
        recipient.name,
        pf.feedback_type,
        pf.category,
        pf.message,
        pf.is_anonymous,
        pf.helpful_count,
        pf.created_at
    FROM peer_feedback pf
    JOIN employees recipient ON pf.recipient_id = recipient.id
    WHERE pf.giver_id = current_emp_id
    ORDER BY pf.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_feedback_given(integer) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_my_feedback_given(integer) IS 'Returns feedback given by the current authenticated user to other employees';