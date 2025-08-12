-- Lucerne International Database Setup
-- Run this in your Lucerne Supabase project SQL Editor

-- Step 1: Create core tables (run this first if they don't exist)
-- Based on your existing schema structure

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin', 'super_admin', 'system_admin')),
    department TEXT,
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    tenant_id TEXT DEFAULT 'lucerne',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review cycles table
CREATE TABLE IF NOT EXISTS review_cycles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    tenant_id TEXT DEFAULT 'lucerne',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    review_cycle_id UUID REFERENCES review_cycles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'reviewed')),
    self_assessment JSONB DEFAULT '{}'::jsonb,
    manager_assessment JSONB DEFAULT '{}'::jsonb,
    tenant_id TEXT DEFAULT 'lucerne',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, review_cycle_id)
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    due_date DATE,
    tenant_id TEXT DEFAULT 'lucerne',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    giver_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'positive', 'constructive', '360')),
    tenant_id TEXT DEFAULT 'lucerne',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    is_read BOOLEAN DEFAULT false,
    tenant_id TEXT DEFAULT 'lucerne',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants table for multi-tenant management
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Insert Lucerne tenant
INSERT INTO tenants (id, name, domain) 
VALUES ('lucerne', 'Lucerne International', 'lucerneintl.com')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "tenant_isolation_employees" ON employees
    FOR ALL USING (
        tenant_id = 'lucerne'
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_assessments" ON assessments
    FOR ALL USING (
        tenant_id = 'lucerne'
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_review_cycles" ON review_cycles
    FOR ALL USING (
        tenant_id = 'lucerne'
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_goals" ON goals
    FOR ALL USING (
        tenant_id = 'lucerne'
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_feedback" ON feedback
    FOR ALL USING (
        tenant_id = 'lucerne'
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

CREATE POLICY "tenant_isolation_notifications" ON notifications
    FOR ALL USING (
        tenant_id = 'lucerne'
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

-- Tenants policy - only super admins
CREATE POLICY "tenants_admin_only" ON tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('super_admin', 'system_admin')
        )
    );

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant_id ON assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_review_cycles_tenant_id ON review_cycles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_goals_tenant_id ON goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tenant_id ON feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);

-- Create your admin user
INSERT INTO employees (
    email, first_name, last_name, role, 
    is_active, tenant_id, created_at, updated_at
) VALUES (
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

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;