-- ================================================================
-- LUCERNE CLIENT DATABASE SETUP - PART 3
-- Row Level Security Policies
-- Apply AFTER lucerne-client-schema.sql and lucerne-client-functions.sql
-- ================================================================

-- ================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ================================================================

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_health_pulse_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- EMPLOYEES TABLE POLICIES
-- ================================================================

-- Basic employee access policies
CREATE POLICY "employees_select_own_and_team" 
ON public.employees FOR SELECT 
TO authenticated 
USING (
    user_id = auth.uid()  -- Own record
    OR id IN (  -- Direct reports if manager
        SELECT e.id FROM public.employees e 
        WHERE e.manager_id IN (
            SELECT id FROM public.employees 
            WHERE user_id = auth.uid() AND is_active = true
        )
    )
    OR EXISTS (  -- Admin access
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin') 
        AND is_active = true
    )
);

-- Admin write policies (from migration 20250808000002)
CREATE POLICY "admin_insert_employees" 
ON public.employees FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
);

CREATE POLICY "admin_update_employees" 
ON public.employees FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
);

-- ================================================================
-- ASSESSMENTS TABLE POLICIES
-- ================================================================

CREATE POLICY "assessments_select_own_and_managed" 
ON public.assessments FOR SELECT 
TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM public.employees 
        WHERE user_id = auth.uid() AND is_active = true
    )  -- Own assessments
    OR employee_id IN (  -- Managed team assessments
        SELECT e.id FROM public.employees e 
        WHERE e.manager_id IN (
            SELECT id FROM public.employees 
            WHERE user_id = auth.uid() AND is_active = true
        )
    )
    OR EXISTS (  -- Admin access
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin') 
        AND is_active = true
    )
);

CREATE POLICY "admin_insert_assessments" 
ON public.assessments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
);

CREATE POLICY "admin_update_assessments" 
ON public.assessments FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
);

-- ================================================================
-- REVIEW CYCLES TABLE POLICIES
-- ================================================================

CREATE POLICY "review_cycles_select_all" 
ON public.review_cycles FOR SELECT 
TO authenticated 
USING (true);  -- Everyone can view active review cycles

CREATE POLICY "admin_insert_review_cycles" 
ON public.review_cycles FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
);

CREATE POLICY "admin_update_review_cycles" 
ON public.review_cycles FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees me 
        WHERE me.user_id = auth.uid() AND me.role = 'admin' AND me.is_active = true
    )
);

-- ================================================================
-- OTHER TABLES BASIC POLICIES
-- ================================================================

-- Development plans
CREATE POLICY "development_plans_select_own_and_managed" 
ON public.development_plans FOR SELECT 
TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM public.employees 
        WHERE user_id = auth.uid() AND is_active = true
    )
    OR employee_id IN (
        SELECT e.id FROM public.employees e 
        WHERE e.manager_id IN (
            SELECT id FROM public.employees 
            WHERE user_id = auth.uid() AND is_active = true
        )
    )
    OR EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true
    )
);

-- Goals
CREATE POLICY "goals_select_own_and_managed" 
ON public.goals FOR SELECT 
TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM public.employees 
        WHERE user_id = auth.uid() AND is_active = true
    )
    OR employee_id IN (
        SELECT e.id FROM public.employees e 
        WHERE e.manager_id IN (
            SELECT id FROM public.employees 
            WHERE user_id = auth.uid() AND is_active = true
        )
    )
    OR EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true
    )
);

-- Kudos
CREATE POLICY "kudos_select_all" 
ON public.kudos FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "kudos_insert_authenticated" 
ON public.kudos FOR INSERT 
TO authenticated 
WITH CHECK (
    from_employee_id IN (
        SELECT id FROM public.employees 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Feedback
CREATE POLICY "feedback_select_all" 
ON public.feedback FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "feedback_insert_authenticated" 
ON public.feedback FOR INSERT 
TO authenticated 
WITH CHECK (
    from_employee_id IN (
        SELECT id FROM public.employees 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Notifications
CREATE POLICY "notifications_select_own" 
ON public.notifications FOR SELECT 
TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM public.employees 
        WHERE user_id = auth.uid() AND is_active = true
    )
    OR EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true
    )
);

-- Pulse questions
CREATE POLICY "pulse_questions_select_active" 
ON public.pulse_questions FOR SELECT 
TO authenticated 
USING (is_active = true);

-- Pulse responses
CREATE POLICY "pulse_responses_select_own_and_managed" 
ON public.team_health_pulse_responses FOR SELECT 
TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM public.employees 
        WHERE user_id = auth.uid() AND is_active = true
    )
    OR employee_id IN (
        SELECT e.id FROM public.employees e 
        WHERE e.manager_id IN (
            SELECT id FROM public.employees 
            WHERE user_id = auth.uid() AND is_active = true
        )
    )
    OR EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true
    )
);

-- Departments (from migration)
CREATE POLICY "departments_select_all" 
ON public.departments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only admins can modify departments" 
ON public.departments 
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE employees.user_id = auth.uid() AND employees.role = 'admin'
    )
);

-- Employee departments
CREATE POLICY "employee_departments_select_own" 
ON public.employee_departments FOR SELECT 
TO authenticated 
USING (
    employee_id IN (
        SELECT employees.id FROM public.employees
        WHERE employees.user_id = auth.uid() AND employees.is_active = true
    ) 
    OR employee_id IN (
        SELECT e.id FROM public.employees e
        WHERE e.manager_id IN (
            SELECT employees.id FROM public.employees
            WHERE employees.user_id = auth.uid() AND employees.is_active = true
        )
    ) 
    OR EXISTS (
        SELECT 1 FROM public.employees
        WHERE employees.user_id = auth.uid() AND employees.role = 'admin' AND employees.is_active = true
    )
);

-- Tenants (admin only)
CREATE POLICY "tenants_admin_only" 
ON public.tenants FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'system_admin')
    )
);

-- ================================================================
-- TENANT ISOLATION POLICIES
-- ================================================================

-- Add tenant isolation to all main tables
CREATE POLICY "tenant_isolation_employees" 
ON public.employees FOR ALL 
USING (
    tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
    OR EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'system_admin')
    )
);

CREATE POLICY "tenant_isolation_assessments" 
ON public.assessments FOR ALL 
USING (
    tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
    OR EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'system_admin')
    )
);

CREATE POLICY "tenant_isolation_review_cycles" 
ON public.review_cycles FOR ALL 
USING (
    tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
    OR EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'system_admin')
    )
);

-- Add tenant indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON public.employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant_id ON public.assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_review_cycles_tenant_id ON public.review_cycles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_goals_tenant_id ON public.goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tenant_id ON public.feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON public.notifications(tenant_id);

SELECT 'RLS policies created successfully' as status;