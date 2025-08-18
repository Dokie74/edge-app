-- Admin Team Health Analytics Function
-- Creates a secure RPC function for admins to get team health data
-- This bypasses RLS policies for authorized admin users

-- Drop function if it exists
DROP FUNCTION IF EXISTS get_team_health_analytics();

-- Create secure function for team health analytics
CREATE OR REPLACE FUNCTION get_team_health_analytics()
RETURNS TABLE (
    response_value jsonb,
    category text,
    employee_id uuid,
    submitted_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS policies when executed
AS $$
BEGIN
    -- First, ensure the caller is an admin
    IF NOT EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'ACCESS DENIED: Only admins can access team health analytics';
    END IF;

    -- If they are an admin, return team health data from all employees
    RETURN QUERY
    SELECT
        thpr.response_value,
        pq.category,
        thpr.employee_id,
        thpr.submitted_at
    FROM
        public.team_health_pulse_responses AS thpr
    JOIN
        public.pulse_questions AS pq ON thpr.question_id = pq.question_id
    WHERE
        pq.is_active = true
    ORDER BY
        thpr.submitted_at DESC;
END;
$$;

-- Grant execute permission to authenticated users (admin check is inside function)
GRANT EXECUTE ON FUNCTION get_team_health_analytics() TO authenticated;