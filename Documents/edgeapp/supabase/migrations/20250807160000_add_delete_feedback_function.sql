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