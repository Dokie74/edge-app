-- ================================================================
-- LUCERNE CLIENT DATABASE SETUP - PART 2
-- Functions, Policies, and RLS Setup
-- Apply AFTER lucerne-client-schema.sql
-- ================================================================

-- ================================================================
-- MIGRATION 3: Delete feedback function (20250807160000)
-- ================================================================

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

-- ================================================================
-- MIGRATION 4: Unique user_id constraint (20250808000001)
-- ================================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_user_id 
ON public.employees(user_id) 
WHERE user_id IS NOT NULL;

-- ================================================================
-- MIGRATION 5: Performance indexes (20250808000003)
-- ================================================================

CREATE INDEX IF NOT EXISTS ix_employees_manager_active 
ON public.employees(manager_id) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS ix_assessments_employee_cycle 
ON public.assessments(employee_id, review_cycle_id);

CREATE INDEX IF NOT EXISTS ix_employees_user_id_active
ON public.employees(user_id)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS ix_employees_role_active
ON public.employees(role)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS ix_kudos_created
ON public.kudos(created_at DESC);

CREATE INDEX IF NOT EXISTS ix_pulse_responses_employee_date
ON public.team_health_pulse_responses(employee_id, submitted_at);

CREATE INDEX IF NOT EXISTS ix_development_plans_employee
ON public.development_plans(employee_id);

CREATE INDEX IF NOT EXISTS ix_assessments_status
ON public.assessments(status);

-- ================================================================
-- MIGRATION 6: Set-based review seeding (20250808000004)
-- ================================================================

CREATE OR REPLACE FUNCTION seed_self_assessments(p_review_cycle_id UUID)
RETURNS TABLE(
    employees_processed INTEGER,
    assessments_created INTEGER,
    assessments_existing INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_employees INTEGER;
    new_assessments INTEGER;
    existing_assessments INTEGER;
BEGIN
    -- Count total active employees
    SELECT COUNT(*) INTO total_employees
    FROM employees 
    WHERE is_active = true;
    
    -- Set-based insert with conflict handling
    INSERT INTO assessments (employee_id, review_cycle_id, status, created_at)
    SELECT 
        e.id,
        p_review_cycle_id,
        'draft',
        now()
    FROM employees e
    WHERE e.is_active = true
    ON CONFLICT (employee_id, review_cycle_id) DO NOTHING;
    
    -- Count what was actually inserted
    GET DIAGNOSTICS new_assessments = ROW_COUNT;
    
    -- Calculate existing assessments
    existing_assessments := total_employees - new_assessments;
    
    -- Return summary
    RETURN QUERY SELECT total_employees, new_assessments, existing_assessments;
END;
$$;

-- ================================================================
-- MIGRATION 7: Multi-tenant setup (20250809000001)  
-- ================================================================

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Insert Lucerne as tenant
INSERT INTO tenants (id, name, domain) 
VALUES ('lucerne', 'Lucerne International', 'lucerneintl.com')
ON CONFLICT (id) DO NOTHING;

-- Tenant context functions
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM set_config('app.tenant_id', tenant_name, true);
END;
$$;

CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN COALESCE(current_setting('app.tenant_id', true), 'lucerne');
END;
$$;

-- ================================================================
-- CRITICAL MISSING FUNCTIONS FROM YOUR APP
-- ================================================================

-- Function: set_config (used by your app)
CREATE OR REPLACE FUNCTION public.set_config(setting_name text, new_value text, is_local boolean DEFAULT false)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM set_config(setting_name, new_value, is_local);
    RETURN new_value;
END;
$$;

-- Function: get_my_assessments (used by your app)
CREATE OR REPLACE FUNCTION public.get_my_assessments()
RETURNS TABLE(
    id uuid,
    review_cycle_name text,
    status text,
    due_date date,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        rc.name as review_cycle_name,
        a.status,
        a.due_date,
        a.created_at
    FROM assessments a
    JOIN review_cycles rc ON a.review_cycle_id = rc.id
    JOIN employees e ON a.employee_id = e.id
    WHERE e.user_id = auth.uid()
    AND e.is_active = true
    ORDER BY a.created_at DESC;
END;
$$;

-- Function: get_pending_admin_approvals (from migrations)
CREATE OR REPLACE FUNCTION public.get_pending_admin_approvals() 
RETURNS TABLE(
    assessment_id uuid, 
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
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_user_role text;
    v_current_employee_id uuid;
BEGIN
    -- Get current user's role from employees table
    SELECT role INTO v_user_role 
    FROM public.employees 
    WHERE user_id = auth.uid() 
    AND is_active = true;
    
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
    JOIN employees m ON e.manager_id = m.id
    JOIN review_cycles rc ON a.review_cycle_id = rc.id
    WHERE a.self_assessment_status = 'pending_admin_approval'
    AND rc.status = 'active'
    ORDER BY a.manager_reviewed_at DESC;
END;
$$;

-- Create admin user for Lucerne
INSERT INTO employees (
    id, email, first_name, last_name, role, 
    is_active, tenant_id, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'dokonoski@lucerneintl.com',
    'David',
    'Okonoski', 
    'admin',
    true,
    'lucerne',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    tenant_id = 'lucerne',
    is_active = true,
    updated_at = NOW();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

SELECT 'Functions and admin user created successfully' as status;