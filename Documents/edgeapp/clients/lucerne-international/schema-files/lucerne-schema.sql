-- ================================================================
-- LUCERNE CLIENT DATABASE CLEAN SETUP
-- Drops existing objects and recreates complete schema
-- Apply this to: wvggehrxhnuvlxpaghft.supabase.co
-- Date: August 11, 2025
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- DROP ALL EXISTING OBJECTS (CLEAN SLATE)
-- ================================================================

-- Drop all tables in dependency order (cascading will handle relationships)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.kudos CASCADE;
DROP TABLE IF EXISTS public.team_health_pulse_responses CASCADE;
DROP TABLE IF EXISTS public.pulse_questions CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.development_plans CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;
DROP TABLE IF EXISTS public.review_cycles CASCADE;
DROP TABLE IF EXISTS public.employee_departments CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- Drop sequences
DROP SEQUENCE IF EXISTS public.departments_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.employee_departments_id_seq CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.delete_feedback(bigint) CASCADE;
DROP FUNCTION IF EXISTS public.get_pending_admin_approvals() CASCADE;
DROP FUNCTION IF EXISTS public.seed_self_assessments(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.set_tenant_context(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_current_tenant() CASCADE;
DROP FUNCTION IF EXISTS public.set_config(text, text, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_assessments() CASCADE;

-- ================================================================
-- CREATE CLEAN SCHEMA
-- ================================================================

-- Create departments table
CREATE TABLE public.departments (
    id integer NOT NULL,
    name text NOT NULL,
    code text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true
);

-- Create sequence for departments
CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Set sequence ownership and default
ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;
ALTER TABLE public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);

-- Add primary key constraint
ALTER TABLE public.departments ADD CONSTRAINT departments_pkey PRIMARY KEY (id);

-- Create tenants table
CREATE TABLE public.tenants (
    id text PRIMARY KEY,
    name text NOT NULL,
    domain text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    settings jsonb DEFAULT '{}'::jsonb
);

-- Employees table (with multi-tenant and user_id support)
CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    name text GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    role text DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin', 'super_admin', 'system_admin')),
    department text,
    manager_id uuid,
    hire_date date,
    is_active boolean DEFAULT true,
    tenant_id text DEFAULT 'lucerne',
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add foreign key constraints for employees
ALTER TABLE public.employees ADD CONSTRAINT fk_employees_manager_id FOREIGN KEY (manager_id) REFERENCES public.employees(id);
ALTER TABLE public.employees ADD CONSTRAINT fk_employees_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Create employee_departments table
CREATE TABLE public.employee_departments (
    id integer NOT NULL,
    employee_id uuid,
    department_id integer,
    created_at timestamp with time zone DEFAULT now(),
    is_primary boolean DEFAULT false,
    assigned_by uuid
);

-- Create sequence for employee_departments
CREATE SEQUENCE public.employee_departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Set sequence ownership and default
ALTER SEQUENCE public.employee_departments_id_seq OWNED BY public.employee_departments.id;
ALTER TABLE public.employee_departments ALTER COLUMN id SET DEFAULT nextval('public.employee_departments_id_seq'::regclass);

-- Add constraints for employee_departments
ALTER TABLE public.employee_departments ADD CONSTRAINT employee_departments_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_departments ADD CONSTRAINT fk_employee_departments_employee_id FOREIGN KEY (employee_id) REFERENCES public.employees(id);
ALTER TABLE public.employee_departments ADD CONSTRAINT fk_employee_departments_department_id FOREIGN KEY (department_id) REFERENCES public.departments(id);

-- Review cycles table
CREATE TABLE public.review_cycles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Assessments table
CREATE TABLE public.assessments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid,
    review_cycle_id uuid,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'reviewed')),
    self_assessment_status text DEFAULT 'draft',
    manager_performance_rating text,
    manager_summary_comments text,
    manager_reviewed_at timestamp with time zone,
    due_date date,
    self_assessment jsonb DEFAULT '{}'::jsonb,
    manager_assessment jsonb DEFAULT '{}'::jsonb,
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(employee_id, review_cycle_id)
);

-- Add foreign key constraints for assessments
ALTER TABLE public.assessments ADD CONSTRAINT fk_assessments_employee_id FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
ALTER TABLE public.assessments ADD CONSTRAINT fk_assessments_review_cycle_id FOREIGN KEY (review_cycle_id) REFERENCES public.review_cycles(id) ON DELETE CASCADE;

-- Development plans table
CREATE TABLE public.development_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid,
    title text NOT NULL,
    description text,
    goals jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.development_plans ADD CONSTRAINT fk_development_plans_employee_id FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

-- Goals table
CREATE TABLE public.goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid,
    title text NOT NULL,
    description text,
    due_date date,
    status text DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'deferred')),
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.goals ADD CONSTRAINT fk_goals_employee_id FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

-- Pulse questions table
CREATE TABLE public.pulse_questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text text NOT NULL,
    category text,
    is_active boolean DEFAULT true,
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now()
);

-- Team health pulse responses table  
CREATE TABLE public.team_health_pulse_responses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid,
    question_id uuid,
    response_value integer CHECK (response_value BETWEEN 1 AND 5),
    submitted_at timestamp with time zone DEFAULT now(),
    tenant_id text DEFAULT 'lucerne'
);

ALTER TABLE public.team_health_pulse_responses ADD CONSTRAINT fk_pulse_responses_employee_id FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
ALTER TABLE public.team_health_pulse_responses ADD CONSTRAINT fk_pulse_responses_question_id FOREIGN KEY (question_id) REFERENCES public.pulse_questions(id) ON DELETE CASCADE;

-- Kudos table
CREATE TABLE public.kudos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    from_employee_id uuid,
    to_employee_id uuid,
    message text NOT NULL,
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.kudos ADD CONSTRAINT fk_kudos_from_employee_id FOREIGN KEY (from_employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
ALTER TABLE public.kudos ADD CONSTRAINT fk_kudos_to_employee_id FOREIGN KEY (to_employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

-- Feedback table
CREATE TABLE public.feedback (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    from_employee_id uuid,
    to_employee_id uuid,
    message text NOT NULL,
    is_anonymous boolean DEFAULT false,
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.feedback ADD CONSTRAINT fk_feedback_from_employee_id FOREIGN KEY (from_employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
ALTER TABLE public.feedback ADD CONSTRAINT fk_feedback_to_employee_id FOREIGN KEY (to_employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

-- Notifications table
CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid,
    title text NOT NULL,
    message text,
    type text DEFAULT 'info',
    is_read boolean DEFAULT false,
    tenant_id text DEFAULT 'lucerne',
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notifications ADD CONSTRAINT fk_notifications_employee_id FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

-- ================================================================
-- INSERT INITIAL DATA
-- ================================================================

-- Insert Lucerne as tenant
INSERT INTO tenants (id, name, domain) 
VALUES ('lucerne', 'Lucerne International', 'lucerneintl.com');

-- Insert department data
SELECT setval('public.departments_id_seq', 30);

INSERT INTO public.departments (id, name, code, description, created_at, updated_at, is_active) VALUES
(11, 'Accounting', 'ACC', 'Financial operations and accounting', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(12, 'Purchasing', 'PUR', 'Procurement and vendor management', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(13, 'Engineering', 'ENG', 'Product development and engineering', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(14, 'Executive', 'EXE', 'Executive leadership and strategy', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(15, 'Quality', 'QUA', 'Quality assurance and control', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(16, 'Production', 'PRO', 'Manufacturing and production', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(17, 'Machining', 'MAC', 'Machining operations', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(18, 'Program Management', 'PGM', 'Program and project management', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(19, 'Sales', 'SAL', 'Sales and customer relations', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true),
(20, 'General', 'GEN', 'General/Unassigned employees', '2025-07-30 13:03:31.66752+00', '2025-07-30 13:03:31.66752+00', true);

SELECT setval('public.employee_departments_id_seq', 15);

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
);

SELECT 'Clean schema created successfully - Ready for functions and policies' as status;