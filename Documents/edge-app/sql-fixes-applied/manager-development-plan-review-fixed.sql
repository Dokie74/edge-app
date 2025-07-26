-- Manager Development Plan Review System - FIXED VERSION
-- This resolves PostgreSQL syntax errors and adds missing dashboard functions

-- ============================================================================
-- STEP 1: CREATE DEVELOPMENT PLANS TABLE AND FUNCTIONS - FIXED SYNTAX
-- ============================================================================

-- Ensure development_plans table exists with all required columns
CREATE TABLE IF NOT EXISTS development_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    goals TEXT NOT NULL,
    objectives TEXT,
    skills_to_develop TEXT,
    resources_needed TEXT,
    success_metrics TEXT,
    target_completion_date DATE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed')),
    manager_feedback TEXT,
    manager_rating INTEGER CHECK (manager_rating >= 1 AND manager_rating <= 5),
    submission_date TIMESTAMPTZ,
    review_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_development_plans_employee_id ON development_plans(employee_id);
CREATE INDEX IF NOT EXISTS idx_development_plans_manager_id ON development_plans(manager_id);
CREATE INDEX IF NOT EXISTS idx_development_plans_status ON development_plans(status);
CREATE INDEX IF NOT EXISTS idx_development_plans_created_at ON development_plans(created_at);

-- ============================================================================
-- STEP 2: CREATE DEVELOPMENT PLAN FUNCTIONS - FIXED POSTGRESQL SYNTAX
-- ============================================================================

-- Function to submit development plan - FIXED
CREATE OR REPLACE FUNCTION public.submit_development_plan(
    p_goals TEXT,
    p_objectives TEXT DEFAULT NULL,
    p_skills_to_develop TEXT DEFAULT NULL,
    p_resources_needed TEXT DEFAULT NULL,
    p_success_metrics TEXT DEFAULT NULL,
    p_target_completion_date DATE DEFAULT NULL,
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
    v_manager_id UUID;
    v_plan_id UUID;
BEGIN
    -- Get current user's employee ID and manager
    SELECT e.id, e.manager_id INTO v_current_employee_id, v_manager_id
    FROM employees e 
    WHERE e.user_id = auth.uid() AND e.is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Insert development plan
    INSERT INTO development_plans (
        employee_id,
        manager_id,
        goals,
        objectives,
        skills_to_develop,
        resources_needed,
        success_metrics,
        target_completion_date,
        status,
        submission_date,
        created_at,
        updated_at
    ) VALUES (
        v_current_employee_id,
        v_manager_id,
        p_goals,
        p_objectives,
        p_skills_to_develop,
        p_resources_needed,
        p_success_metrics,
        p_target_completion_date,
        'submitted',
        NOW(),
        NOW(),
        NOW()
    ) RETURNING id INTO v_plan_id;
    
    -- Create notification for manager if exists
    IF v_manager_id IS NOT NULL THEN
        BEGIN
            PERFORM create_notification(
                v_manager_id,
                v_current_employee_id,
                'development_plan_submitted',
                'New Development Plan Submitted',
                'A team member has submitted a development plan for your review.'
            );
        EXCEPTION
            WHEN undefined_function THEN
                NULL; -- Ignore if notification function doesn't exist
        END;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Development plan submitted successfully',
        'plan_id', v_plan_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to submit development plan: ' || SQLERRM);
END;
$$;

-- Function to get development plans for review - FIXED SYNTAX
CREATE OR REPLACE FUNCTION public.get_development_plans_for_review()
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
    
    IF v_current_employee_id IS NULL THEN
        RETURN '[]'::json;
    END IF;
    
    -- Get development plans for review based on role
    IF v_employee_role = 'admin' THEN
        -- Admin can see all plans
        SELECT json_agg(
            json_build_object(
                'id', dp.id,
                'employee_id', dp.employee_id,
                'employee_name', e.name,
                'employee_email', e.email,
                'manager_id', dp.manager_id,
                'manager_name', m.name,
                'goals', dp.goals,
                'objectives', dp.objectives,
                'skills_to_develop', dp.skills_to_develop,
                'resources_needed', dp.resources_needed,
                'success_metrics', dp.success_metrics,
                'target_completion_date', dp.target_completion_date,
                'status', dp.status,
                'manager_feedback', dp.manager_feedback,
                'manager_rating', dp.manager_rating,
                'submission_date', dp.submission_date,
                'review_date', dp.review_date,
                'created_at', dp.created_at,
                'updated_at', dp.updated_at
            ) ORDER BY dp.created_at DESC
        ) INTO result
        FROM development_plans dp
        JOIN employees e ON dp.employee_id = e.id
        LEFT JOIN employees m ON dp.manager_id = m.id
        WHERE dp.status IN ('submitted', 'under_review');
        
    ELSE
        -- Manager can see plans for their direct reports
        SELECT json_agg(
            json_build_object(
                'id', dp.id,
                'employee_id', dp.employee_id,
                'employee_name', e.name,
                'employee_email', e.email,
                'manager_id', dp.manager_id,
                'manager_name', m.name,
                'goals', dp.goals,
                'objectives', dp.objectives,
                'skills_to_develop', dp.skills_to_develop,
                'resources_needed', dp.resources_needed,
                'success_metrics', dp.success_metrics,
                'target_completion_date', dp.target_completion_date,
                'status', dp.status,
                'manager_feedback', dp.manager_feedback,
                'manager_rating', dp.manager_rating,
                'submission_date', dp.submission_date,
                'review_date', dp.review_date,
                'created_at', dp.created_at,
                'updated_at', dp.updated_at
            ) ORDER BY dp.created_at DESC
        ) INTO result
        FROM development_plans dp
        JOIN employees e ON dp.employee_id = e.id
        LEFT JOIN employees m ON dp.manager_id = m.id
        WHERE dp.manager_id = v_current_employee_id 
        AND dp.status IN ('submitted', 'under_review');
    END IF;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Function to review development plan - FIXED POSTGRESQL SYNTAX ERROR
CREATE OR REPLACE FUNCTION public.review_development_plan(
    p_plan_id UUID,
    p_status TEXT,
    p_feedback TEXT DEFAULT NULL,
    p_rating INTEGER DEFAULT NULL,
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
    v_plan_record development_plans%ROWTYPE;
    v_employee_name TEXT;
BEGIN
    -- Get current user's employee ID and role
    SELECT e.id, e.role INTO v_current_employee_id, v_employee_role
    FROM employees e 
    WHERE e.user_id = auth.uid() AND e.is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Get development plan record - FIXED: Use separate SELECT statement
    SELECT * INTO v_plan_record
    FROM development_plans 
    WHERE id = p_plan_id;
    
    IF v_plan_record.id IS NULL THEN
        RETURN json_build_object('error', 'Development plan not found');
    END IF;
    
    -- Check permissions
    IF v_employee_role != 'admin' AND v_plan_record.manager_id != v_current_employee_id THEN
        RETURN json_build_object('error', 'Access denied: You can only review plans for your direct reports');
    END IF;
    
    -- Validate status
    IF p_status NOT IN ('approved', 'rejected', 'under_review') THEN
        RETURN json_build_object('error', 'Invalid status. Must be: approved, rejected, or under_review');
    END IF;
    
    -- Update development plan
    UPDATE development_plans 
    SET 
        status = p_status,
        manager_feedback = p_feedback,
        manager_rating = p_rating,
        review_date = NOW(),
        updated_at = NOW()
    WHERE id = p_plan_id;
    
    -- Get employee name for notification - FIXED: Use separate SELECT statement
    SELECT name INTO v_employee_name
    FROM employees 
    WHERE id = v_plan_record.employee_id;
    
    -- Create notification for employee
    BEGIN
        PERFORM create_notification(
            v_plan_record.employee_id,
            v_current_employee_id,
            'development_plan_reviewed',
            'Development Plan ' || INITCAP(p_status),
            'Your development plan has been ' || p_status || 
            CASE WHEN p_feedback IS NOT NULL THEN '. Manager feedback: ' || p_feedback ELSE '.' END
        );
    EXCEPTION
        WHEN undefined_function THEN
            NULL; -- Ignore if notification function doesn't exist
    END;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Development plan reviewed successfully',
        'plan_id', p_plan_id,
        'status', p_status
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to review development plan: ' || SQLERRM);
END;
$$;

-- Function to get employee's development plans
CREATE OR REPLACE FUNCTION public.get_my_development_plans()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
    result JSON;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_current_employee_id
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN '[]'::json;
    END IF;
    
    -- Get development plans for current employee
    SELECT json_agg(
        json_build_object(
            'id', dp.id,
            'goals', dp.goals,
            'objectives', dp.objectives,
            'skills_to_develop', dp.skills_to_develop,
            'resources_needed', dp.resources_needed,
            'success_metrics', dp.success_metrics,
            'target_completion_date', dp.target_completion_date,
            'status', dp.status,
            'manager_feedback', dp.manager_feedback,
            'manager_rating', dp.manager_rating,
            'submission_date', dp.submission_date,
            'review_date', dp.review_date,
            'created_at', dp.created_at,
            'updated_at', dp.updated_at,
            'manager_name', m.name
        ) ORDER BY dp.created_at DESC
    ) INTO result
    FROM development_plans dp
    LEFT JOIN employees m ON dp.manager_id = m.id
    WHERE dp.employee_id = v_current_employee_id;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;

-- ============================================================================
-- STEP 3: CREATE DASHBOARD STATISTICS FUNCTIONS - MISSING FUNCTIONS ADDED
-- ============================================================================

-- Admin Dashboard Stats Function
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
    
    -- Build comprehensive admin statistics
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
        ),
        'pending_manager_reviews', (
            SELECT COUNT(*) 
            FROM assessments a
            JOIN review_cycles rc ON a.cycle_id = rc.id
            WHERE rc.status = 'active' 
            AND a.manager_review_status = 'pending'
            AND a.self_assessment_status = 'completed'
        ),
        'completed_manager_reviews', (
            SELECT COUNT(*) 
            FROM assessments a
            JOIN review_cycles rc ON a.cycle_id = rc.id
            WHERE rc.status = 'active' 
            AND a.manager_review_status = 'completed'
        ),
        'development_plans_submitted', (
            SELECT COUNT(*) FROM development_plans 
            WHERE status = 'submitted'
        ),
        'development_plans_under_review', (
            SELECT COUNT(*) FROM development_plans 
            WHERE status = 'under_review'
        ),
        'development_plans_approved', (
            SELECT COUNT(*) FROM development_plans 
            WHERE status = 'approved'
        ),
        'recent_activity', (
            SELECT json_agg(
                json_build_object(
                    'type', 'assessment_completion',
                    'employee_name', e.name,
                    'cycle_name', rc.name,
                    'completed_at', a.updated_at
                )
                ORDER BY a.updated_at DESC
            )
            FROM assessments a
            JOIN employees e ON a.employee_id = e.id
            JOIN review_cycles rc ON a.cycle_id = rc.id
            WHERE a.self_assessment_status = 'completed'
            AND a.updated_at >= NOW() - INTERVAL '7 days'
            LIMIT 10
        )
    ) INTO result;
    
    RETURN COALESCE(result, '{}'::json);
END;
$$;

-- Manager Dashboard Stats Function
CREATE OR REPLACE FUNCTION public.get_manager_dashboard_stats()
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
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Build manager-specific statistics
    SELECT json_build_object(
        'team_members', (
            SELECT COUNT(*) FROM employees 
            WHERE manager_id = v_current_employee_id AND is_active = true
        ),
        'pending_reviews', (
            SELECT COUNT(*) 
            FROM assessments a
            JOIN employees e ON a.employee_id = e.id
            JOIN review_cycles rc ON a.cycle_id = rc.id
            WHERE e.manager_id = v_current_employee_id
            AND rc.status = 'active'
            AND a.manager_review_status = 'pending'
            AND a.self_assessment_status = 'completed'
        ),
        'completed_reviews', (
            SELECT COUNT(*) 
            FROM assessments a
            JOIN employees e ON a.employee_id = e.id
            JOIN review_cycles rc ON a.cycle_id = rc.id
            WHERE e.manager_id = v_current_employee_id
            AND rc.status = 'active'
            AND a.manager_review_status = 'completed'
        ),
        'development_plans_to_review', (
            SELECT COUNT(*) FROM development_plans 
            WHERE manager_id = v_current_employee_id 
            AND status = 'submitted'
        ),
        'development_plans_reviewed', (
            SELECT COUNT(*) FROM development_plans 
            WHERE manager_id = v_current_employee_id 
            AND status IN ('approved', 'rejected')
        ),
        'team_performance', (
            SELECT json_agg(
                json_build_object(
                    'employee_name', e.name,
                    'assessment_status', a.self_assessment_status,
                    'manager_review_status', a.manager_review_status,
                    'last_updated', a.updated_at
                )
                ORDER BY e.name
            )
            FROM employees e
            LEFT JOIN assessments a ON e.id = a.employee_id
            LEFT JOIN review_cycles rc ON a.cycle_id = rc.id AND rc.status = 'active'
            WHERE e.manager_id = v_current_employee_id AND e.is_active = true
        )
    ) INTO result;
    
    RETURN COALESCE(result, '{}'::json);
END;
$$;

-- Employee Dashboard Stats Function
CREATE OR REPLACE FUNCTION public.get_employee_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
    result JSON;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_current_employee_id
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Build employee-specific statistics
    SELECT json_build_object(
        'pending_assessments', (
            SELECT COUNT(*) 
            FROM assessments a
            JOIN review_cycles rc ON a.cycle_id = rc.id
            WHERE a.employee_id = v_current_employee_id
            AND rc.status = 'active'
            AND a.self_assessment_status = 'not_started'
        ),
        'completed_assessments', (
            SELECT COUNT(*) 
            FROM assessments a
            JOIN review_cycles rc ON a.cycle_id = rc.id
            WHERE a.employee_id = v_current_employee_id
            AND rc.status = 'active'
            AND a.self_assessment_status = 'completed'
        ),
        'awaiting_manager_review', (
            SELECT COUNT(*) 
            FROM assessments a
            JOIN review_cycles rc ON a.cycle_id = rc.id
            WHERE a.employee_id = v_current_employee_id
            AND rc.status = 'active'
            AND a.self_assessment_status = 'completed'
            AND a.manager_review_status = 'pending'
        ),
        'development_plans_draft', (
            SELECT COUNT(*) FROM development_plans 
            WHERE employee_id = v_current_employee_id 
            AND status = 'draft'
        ),
        'development_plans_submitted', (
            SELECT COUNT(*) FROM development_plans 
            WHERE employee_id = v_current_employee_id 
            AND status = 'submitted'
        ),
        'development_plans_approved', (
            SELECT COUNT(*) FROM development_plans 
            WHERE employee_id = v_current_employee_id 
            AND status = 'approved'
        ),
        'recent_feedback', (
            SELECT json_agg(
                json_build_object(
                    'type', 'assessment_review',
                    'cycle_name', rc.name,
                    'status', a.manager_review_status,
                    'reviewed_at', a.updated_at
                )
                ORDER BY a.updated_at DESC
            )
            FROM assessments a
            JOIN review_cycles rc ON a.cycle_id = rc.id
            WHERE a.employee_id = v_current_employee_id
            AND a.manager_review_status = 'completed'
            AND a.updated_at >= NOW() - INTERVAL '30 days'
            LIMIT 5
        )
    ) INTO result;
    
    RETURN COALESCE(result, '{}'::json);
END;
$$;

-- ============================================================================
-- STEP 4: GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.submit_development_plan(TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_development_plans_for_review() TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_development_plan(UUID, TEXT, TEXT, INTEGER, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_development_plans() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_manager_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_employee_dashboard_stats() TO authenticated;

-- ============================================================================
-- STEP 5: UPDATE RLS POLICIES
-- ============================================================================

-- Enable RLS on development_plans table
ALTER TABLE development_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS development_plans_select_own ON development_plans;
DROP POLICY IF EXISTS development_plans_insert_own ON development_plans;
DROP POLICY IF EXISTS development_plans_update_own ON development_plans;

-- Create RLS policies for development_plans
CREATE POLICY development_plans_select_own ON development_plans 
FOR SELECT TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    manager_id IN (
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

CREATE POLICY development_plans_insert_own ON development_plans 
FOR INSERT TO authenticated 
WITH CHECK (
    employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY development_plans_update_own ON development_plans 
FOR UPDATE TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    manager_id IN (
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

SELECT '✅ Manager Development Plan Review system with fixed PostgreSQL syntax and dashboard functions created successfully!' as status;