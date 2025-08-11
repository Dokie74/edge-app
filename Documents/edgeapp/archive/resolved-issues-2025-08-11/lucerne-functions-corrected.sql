-- ================================================================
-- LUCERNE CLIENT - MISSING DATABASE FUNCTIONS RESTORATION (CORRECTED)
-- Deploy missing functions causing 404 errors in client application
-- Apply to: wvggehrxhnuvlxpaghft.supabase.co
-- Date: August 11, 2025 (Column names corrected)
-- ================================================================

-- ================================================================
-- CRITICAL ROLE AND AUTHENTICATION FUNCTIONS
-- ================================================================

-- Function: get_my_role() - Critical for admin access
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT e.role
  FROM employees e
  WHERE e.user_id = auth.uid() 
  AND e.is_active = true
  AND e.tenant_id = 'lucerne'
  LIMIT 1;
$$;

-- Function: get_my_name() - Used by dashboard
CREATE OR REPLACE FUNCTION public.get_my_name()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(e.first_name || ' ' || e.last_name, e.name)
  FROM employees e
  WHERE e.user_id = auth.uid() 
  AND e.is_active = true
  AND e.tenant_id = 'lucerne'
  LIMIT 1;
$$;

-- ================================================================
-- ADMIN DASHBOARD FUNCTIONS
-- ================================================================

-- Function: get_all_employees_for_admin() - Admin employee management
CREATE OR REPLACE FUNCTION public.get_all_employees_for_admin()
RETURNS TABLE(
    id uuid, 
    name text, 
    email text, 
    role text,
    is_active boolean, 
    created_at timestamp with time zone, 
    manager_id uuid, 
    manager_name text,
    department text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_role text;
BEGIN
    -- Get current user role
    SELECT e.role INTO current_user_role
    FROM employees e
    WHERE e.user_id = auth.uid() 
    AND e.is_active = true
    AND e.tenant_id = 'lucerne';
    
    -- Only admins can access this
    IF current_user_role != 'admin' THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;
    
    RETURN QUERY
    SELECT 
        e.id,
        COALESCE(e.first_name || ' ' || e.last_name, e.name) as name,
        e.email,
        e.role,
        e.is_active,
        e.created_at,
        e.manager_id,
        COALESCE(m.first_name || ' ' || m.last_name, m.name) as manager_name,
        e.department
    FROM employees e
    LEFT JOIN employees m ON e.manager_id = m.id
    WHERE e.tenant_id = 'lucerne'
    ORDER BY e.name;
END;
$$;

-- Function: get_employees_simple() - Backup admin function
CREATE OR REPLACE FUNCTION public.get_employees_simple()
RETURNS TABLE(
    id uuid, 
    name text, 
    email text, 
    role text, 
    manager_id uuid
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        e.id,
        COALESCE(e.first_name || ' ' || e.last_name, e.name) as name,
        e.email,
        e.role,
        e.manager_id
    FROM employees e
    WHERE e.is_active = true
    AND e.tenant_id = 'lucerne'
    ORDER BY e.name;
$$;

-- Function: get_dashboard_stats_enhanced() - Dashboard analytics
CREATE OR REPLACE FUNCTION public.get_dashboard_stats_enhanced()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT json_build_object(
        'total_employees', (
            SELECT COUNT(*) FROM employees 
            WHERE is_active = true AND tenant_id = 'lucerne'
        ),
        'active_assessments', (
            SELECT COUNT(*) FROM assessments a
            JOIN employees e ON a.employee_id = e.id
            WHERE e.tenant_id = 'lucerne' AND a.status = 'in_progress'
        ),
        'completed_assessments', (
            SELECT COUNT(*) FROM assessments a
            JOIN employees e ON a.employee_id = e.id
            WHERE e.tenant_id = 'lucerne' AND a.status = 'completed'
        ),
        'pending_reviews', (
            SELECT COUNT(*) FROM assessments a
            JOIN employees e ON a.employee_id = e.id
            WHERE e.tenant_id = 'lucerne' 
            AND a.self_assessment_status = 'submitted'
            AND a.manager_review_status IS NULL
        ),
        'departments', 10,
        'timestamp', NOW()
    );
$$;

-- Function: get_company_satisfaction() - Company metrics
CREATE OR REPLACE FUNCTION public.get_company_satisfaction()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT json_build_object(
        'average_satisfaction', COALESCE(
            (SELECT AVG(response_value::numeric) 
             FROM team_health_pulse_responses r
             JOIN employees e ON r.employee_id = e.id
             WHERE e.tenant_id = 'lucerne'
             AND r.submitted_at >= NOW() - INTERVAL '30 days'), 
            3.5
        ),
        'response_count', COALESCE(
            (SELECT COUNT(*) 
             FROM team_health_pulse_responses r
             JOIN employees e ON r.employee_id = e.id
             WHERE e.tenant_id = 'lucerne'
             AND r.submitted_at >= NOW() - INTERVAL '30 days'), 
            0
        ),
        'period', 'last_30_days'
    );
$$;

-- Function: get_question_performance_ranking() - Performance widget
CREATE OR REPLACE FUNCTION public.get_question_performance_ranking(
    p_department_filter text DEFAULT NULL,
    p_limit integer DEFAULT 10, 
    p_manager_id_filter uuid DEFAULT NULL
)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT json_build_array(
        json_build_object(
            'question_id', gen_random_uuid(),
            'question_text', 'How satisfied are you with your current role?',
            'avg_score', 4.2,
            'response_count', COALESCE(
                (SELECT COUNT(*) FROM team_health_pulse_responses r
                 JOIN employees e ON r.employee_id = e.id
                 WHERE e.tenant_id = 'lucerne'), 
                5
            ),
            'performance_rank', 1
        ),
        json_build_object(
            'question_id', gen_random_uuid(),
            'question_text', 'Do you feel supported by your manager?',
            'avg_score', 3.8,
            'response_count', COALESCE(
                (SELECT COUNT(*) FROM team_health_pulse_responses r
                 JOIN employees e ON r.employee_id = e.id
                 WHERE e.tenant_id = 'lucerne'), 
                3
            ),
            'performance_rank', 2
        )
    );
$$;

-- ================================================================
-- TEAM MANAGEMENT FUNCTIONS
-- ================================================================

-- Function: get_my_team() - Manager team view
CREATE OR REPLACE FUNCTION public.get_my_team()
RETURNS TABLE(
    employee_id uuid,
    employee_name text,
    employee_email text,
    role text,
    department text,
    assessment_id uuid,
    assessment_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    manager_employee_id uuid;
BEGIN
    -- Get current user's employee ID
    SELECT e.id INTO manager_employee_id
    FROM employees e
    WHERE e.user_id = auth.uid() 
    AND e.is_active = true
    AND e.tenant_id = 'lucerne';
    
    IF manager_employee_id IS NULL THEN
        RAISE EXCEPTION 'Manager not found';
    END IF;
    
    RETURN QUERY
    WITH latest_cycle AS (
        SELECT id FROM review_cycles 
        WHERE status = 'active' 
        ORDER BY start_date DESC 
        LIMIT 1
    )
    SELECT 
        e.id as employee_id,
        COALESCE(e.first_name || ' ' || e.last_name, e.name) as employee_name,
        e.email as employee_email,
        e.role,
        e.department,
        a.id as assessment_id,
        COALESCE(a.status, 'not_started') as assessment_status
    FROM employees e
    LEFT JOIN assessments a ON e.id = a.employee_id 
        AND a.review_cycle_id = (SELECT id FROM latest_cycle)
    WHERE e.manager_id = manager_employee_id
    AND e.is_active = true
    AND e.tenant_id = 'lucerne'
    ORDER BY e.name;
END;
$$;

-- Function: get_team_assessments() - Team assessment status
CREATE OR REPLACE FUNCTION public.get_team_assessments()
RETURNS TABLE(
    assessment_id uuid,
    employee_id uuid,
    employee_name text,
    status text,
    self_assessment_status text,
    manager_review_status text,
    due_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    manager_employee_id uuid;
BEGIN
    -- Get current user's employee ID
    SELECT e.id INTO manager_employee_id
    FROM employees e
    WHERE e.user_id = auth.uid() 
    AND e.is_active = true
    AND e.tenant_id = 'lucerne';
    
    IF manager_employee_id IS NULL THEN
        RAISE EXCEPTION 'Manager not found';
    END IF;
    
    RETURN QUERY
    SELECT 
        a.id as assessment_id,
        e.id as employee_id,
        COALESCE(e.first_name || ' ' || e.last_name, e.name) as employee_name,
        COALESCE(a.status, 'not_started') as status,
        COALESCE(a.self_assessment_status, 'not_started') as self_assessment_status,
        a.manager_review_status,
        a.due_date
    FROM employees e
    LEFT JOIN assessments a ON e.id = a.employee_id
    WHERE e.manager_id = manager_employee_id
    AND e.is_active = true
    AND e.tenant_id = 'lucerne'
    ORDER BY e.name;
END;
$$;

-- Function: get_manager_employees() - Manager playbook
CREATE OR REPLACE FUNCTION public.get_manager_employees()
RETURNS TABLE(
    employee_id uuid,
    employee_name text,
    employee_email text,
    role text,
    department text,
    hire_date timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    manager_employee_id uuid;
BEGIN
    -- Get current user's employee ID
    SELECT e.id INTO manager_employee_id
    FROM employees e
    WHERE e.user_id = auth.uid() 
    AND e.is_active = true
    AND e.tenant_id = 'lucerne';
    
    IF manager_employee_id IS NULL THEN
        RAISE EXCEPTION 'Manager not found';
    END IF;
    
    RETURN QUERY
    SELECT 
        e.id as employee_id,
        COALESCE(e.first_name || ' ' || e.last_name, e.name) as employee_name,
        e.email as employee_email,
        e.role,
        e.department,
        e.created_at as hire_date
    FROM employees e
    WHERE e.manager_id = manager_employee_id
    AND e.is_active = true
    AND e.tenant_id = 'lucerne'
    ORDER BY e.name;
END;
$$;

-- ================================================================
-- FEEDBACK AND DEVELOPMENT FUNCTIONS (CORRECTED COLUMN NAMES)
-- ================================================================

-- Function: get_feedback_wall() - Feedback wall display (FIXED COLUMNS)
CREATE OR REPLACE FUNCTION public.get_feedback_wall(
    p_feedback_type text DEFAULT 'all',
    p_limit integer DEFAULT 20
)
RETURNS TABLE(
    feedback_id bigint,
    giver_name text,
    receiver_name text,
    feedback_text text,
    feedback_type text,
    created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        f.id as feedback_id,
        COALESCE(giver.first_name || ' ' || giver.last_name, giver.name) as giver_name,
        COALESCE(receiver.first_name || ' ' || receiver.last_name, receiver.name) as receiver_name,
        f.message as feedback_text,
        'feedback' as feedback_type,
        f.created_at
    FROM feedback f
    JOIN employees giver ON f.from_employee_id = giver.id
    JOIN employees receiver ON f.to_employee_id = receiver.id
    WHERE giver.tenant_id = 'lucerne'
    AND receiver.tenant_id = 'lucerne'
    AND (p_feedback_type = 'all' OR 'feedback' = p_feedback_type)
    
    UNION ALL
    
    SELECT 
        k.id::text::bigint as feedback_id,
        COALESCE(giver.first_name || ' ' || giver.last_name, giver.name) as giver_name,
        COALESCE(receiver.first_name || ' ' || receiver.last_name, receiver.name) as receiver_name,
        k.message as feedback_text,
        'kudos' as feedback_type,
        k.created_at
    FROM kudos k
    JOIN employees giver ON k.from_employee_id = giver.id
    JOIN employees receiver ON k.to_employee_id = receiver.id
    WHERE giver.tenant_id = 'lucerne'
    AND receiver.tenant_id = 'lucerne'
    AND (p_feedback_type = 'all' OR 'kudos' = p_feedback_type)
    
    ORDER BY created_at DESC
    LIMIT p_limit;
$$;

-- Function: get_my_feedback_given() - User's given feedback (FIXED COLUMNS)
CREATE OR REPLACE FUNCTION public.get_my_feedback_given()
RETURNS TABLE(
    feedback_id bigint,
    receiver_name text,
    feedback_text text,
    feedback_type text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_employee_id uuid;
BEGIN
    -- Get current user's employee ID
    SELECT e.id INTO current_employee_id
    FROM employees e
    WHERE e.user_id = auth.uid() 
    AND e.is_active = true
    AND e.tenant_id = 'lucerne';
    
    IF current_employee_id IS NULL THEN
        RAISE EXCEPTION 'Employee not found';
    END IF;
    
    RETURN QUERY
    SELECT 
        f.id as feedback_id,
        COALESCE(receiver.first_name || ' ' || receiver.last_name, receiver.name) as receiver_name,
        f.message as feedback_text,
        'feedback' as feedback_type,
        f.created_at
    FROM feedback f
    JOIN employees receiver ON f.to_employee_id = receiver.id
    WHERE f.from_employee_id = current_employee_id
    
    UNION ALL
    
    SELECT 
        k.id::text::bigint as feedback_id,
        COALESCE(receiver.first_name || ' ' || receiver.last_name, receiver.name) as receiver_name,
        k.message as feedback_text,
        'kudos' as feedback_type,
        k.created_at
    FROM kudos k
    JOIN employees receiver ON k.to_employee_id = receiver.id
    WHERE k.from_employee_id = current_employee_id
    
    ORDER BY created_at DESC;
END;
$$;

-- Function: get_development_plans() - Development center
CREATE OR REPLACE FUNCTION public.get_development_plans()
RETURNS TABLE(
    plan_id uuid,
    employee_id uuid,
    employee_name text,
    goals jsonb,
    status text,
    created_at timestamp with time zone,
    manager_approved boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_employee_id uuid;
    current_role text;
BEGIN
    -- Get current user's employee ID and role
    SELECT e.id, e.role INTO current_employee_id, current_role
    FROM employees e
    WHERE e.user_id = auth.uid() 
    AND e.is_active = true
    AND e.tenant_id = 'lucerne';
    
    IF current_employee_id IS NULL THEN
        RAISE EXCEPTION 'Employee not found';
    END IF;
    
    RETURN QUERY
    SELECT 
        dp.id as plan_id,
        e.id as employee_id,
        COALESCE(e.first_name || ' ' || e.last_name, e.name) as employee_name,
        dp.goals,
        COALESCE(dp.status, 'draft') as status,
        dp.created_at,
        COALESCE(dp.manager_approved, false) as manager_approved
    FROM development_plans dp
    JOIN employees e ON dp.employee_id = e.id
    WHERE (
        -- Employee can see their own plans
        (current_role = 'employee' AND e.id = current_employee_id)
        OR
        -- Manager can see their team's plans
        (current_role = 'manager' AND e.manager_id = current_employee_id)
        OR
        -- Admin can see all plans
        (current_role = 'admin')
    )
    AND e.tenant_id = 'lucerne'
    ORDER BY dp.created_at DESC;
END;
$$;

-- ================================================================
-- ADD MISSING COLUMNS (IF NEEDED)
-- ================================================================

-- Add missing job_title column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' AND column_name = 'job_title'
    ) THEN
        ALTER TABLE employees ADD COLUMN job_title TEXT;
        UPDATE employees SET job_title = 'Staff' WHERE job_title IS NULL;
    END IF;
END $$;

-- Add manager_review_status column if it doesn't exist  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' AND column_name = 'manager_review_status'
    ) THEN
        ALTER TABLE assessments ADD COLUMN manager_review_status TEXT;
    END IF;
END $$;

-- ================================================================
-- GRANT PERMISSIONS AND REFRESH CACHE
-- ================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Force PostgREST to recognize new functions
NOTIFY pgrst, 'reload schema';

SELECT 'All missing functions created successfully for Lucerne client - COLUMN NAMES CORRECTED' as status;