-- Migration: Lucerne International Tenant Setup
-- Description: Add multi-tenant support with RLS policies for client isolation
-- Client: Lucerne International (@lucerneintl.com)
-- Date: 2025-08-09

-- Add tenant_id column to all main tables if not exists
ALTER TABLE IF EXISTS employees 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'lucerne';

ALTER TABLE IF EXISTS assessments 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'lucerne';

ALTER TABLE IF EXISTS review_cycles 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'lucerne';

ALTER TABLE IF EXISTS goals 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'lucerne';

ALTER TABLE IF EXISTS feedback 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'lucerne';

ALTER TABLE IF EXISTS notifications 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'lucerne';

-- Create tenants table for managing client organizations
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Insert Lucerne as first tenant
INSERT INTO tenants (id, name, domain) 
VALUES ('lucerne', 'Lucerne International', 'lucerneintl.com')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "tenant_isolation_employees" ON employees;
DROP POLICY IF EXISTS "tenant_isolation_assessments" ON assessments;
DROP POLICY IF EXISTS "tenant_isolation_review_cycles" ON review_cycles;
DROP POLICY IF EXISTS "tenant_isolation_goals" ON goals;
DROP POLICY IF EXISTS "tenant_isolation_feedback" ON feedback;
DROP POLICY IF EXISTS "tenant_isolation_notifications" ON notifications;

-- Create RLS policies for tenant isolation
CREATE POLICY "tenant_isolation_employees" ON employees
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_assessments" ON assessments
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_review_cycles" ON review_cycles
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_goals" ON goals
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_feedback" ON feedback
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_notifications" ON notifications
    FOR ALL USING (
        tenant_id = COALESCE(current_setting('app.tenant_id', true), 'lucerne')
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

-- Tenants table policy - only super admins can manage tenants
CREATE POLICY "tenants_admin_only" ON tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

-- Create function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM set_config('app.tenant_id', tenant_name, true);
END;
$$;

-- Create function to get current tenant
CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN COALESCE(current_setting('app.tenant_id', true), 'lucerne');
END;
$$;

-- Update existing data to have lucerne tenant_id
UPDATE employees SET tenant_id = 'lucerne' WHERE tenant_id IS NULL;
UPDATE assessments SET tenant_id = 'lucerne' WHERE tenant_id IS NULL;
UPDATE review_cycles SET tenant_id = 'lucerne' WHERE tenant_id IS NULL;
UPDATE goals SET tenant_id = 'lucerne' WHERE tenant_id IS NULL;
UPDATE feedback SET tenant_id = 'lucerne' WHERE tenant_id IS NULL;
UPDATE notifications SET tenant_id = 'lucerne' WHERE tenant_id IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant_id ON assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_review_cycles_tenant_id ON review_cycles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_goals_tenant_id ON goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tenant_id ON feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);

-- Create admin user for Lucerne (David Okonoski)
INSERT INTO employees (
    id, email, first_name, last_name, role, 
    is_active, tenant_id, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'dokonoski@lucerneintl.com',
    'David',
    'Okonoski', 
    'super_admin',
    true,
    'lucerne',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    tenant_id = 'lucerne',
    is_active = true,
    updated_at = NOW();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON TABLE tenants IS 'Multi-tenant configuration table';
COMMENT ON FUNCTION set_tenant_context IS 'Sets the current tenant context for RLS policies';
COMMENT ON FUNCTION get_current_tenant IS 'Returns the current tenant ID from context';