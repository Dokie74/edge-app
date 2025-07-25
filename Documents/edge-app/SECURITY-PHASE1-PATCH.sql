-- SECURITY PHASE 1 PATCH - Fix missing function references
-- Run this to fix the get_my_role function error

-- ============================================================================
-- STEP 1: DROP ALL CONFLICTING FUNCTIONS (IGNORE ERRORS IF NOT EXIST)
-- ============================================================================

-- Drop all variations that might exist
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_role_by_email() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.check_user_permission(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_session() CASCADE;

-- ============================================================================
-- STEP 2: CREATE SECURE ROLE MANAGEMENT FUNCTIONS
-- ============================================================================

-- Create secure role function - server-side only
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_record employees%ROWTYPE;
    result JSON;
BEGIN
    -- Get employee record based on authenticated user
    SELECT * INTO user_record
    FROM employees 
    WHERE user_id = auth.uid() 
    AND is_active = true;
    
    -- If no record found, check by email as fallback
    IF NOT FOUND AND auth.email() IS NOT NULL THEN
        SELECT * INTO user_record
        FROM employees 
        WHERE LOWER(email) = LOWER(auth.email())
        AND is_active = true;
    END IF;
    
    -- If still no record found, return unauthorized
    IF NOT FOUND THEN
        RETURN json_build_object(
            'authorized', false,
            'role', null,
            'error', 'User not found or inactive'
        );
    END IF;
    
    -- Return secure user info
    RETURN json_build_object(
        'authorized', true,
        'role', user_record.role,
        'employee_id', user_record.id,
        'name', user_record.name,
        'permissions', CASE 
            WHEN user_record.role = 'admin' THEN json_build_array('read', 'write', 'admin', 'manage_users', 'manage_cycles')
            WHEN user_record.role = 'manager' THEN json_build_array('read', 'write', 'manage_team')
            ELSE json_build_array('read', 'write')
        END
    );
END;
$$;

-- Create role checking function for specific operations
CREATE OR REPLACE FUNCTION public.check_user_permission(required_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
    has_permission BOOLEAN := false;
BEGIN
    -- Get user role
    SELECT role INTO user_role
    FROM employees 
    WHERE user_id = auth.uid() 
    AND is_active = true;
    
    -- Fallback - check by email
    IF user_role IS NULL AND auth.email() IS NOT NULL THEN
        SELECT role INTO user_role
        FROM employees 
        WHERE LOWER(email) = LOWER(auth.email())
        AND is_active = true;
    END IF;
    
    -- Check permissions based on role
    CASE required_permission
        WHEN 'admin' THEN
            has_permission := (user_role = 'admin');
        WHEN 'manage_users' THEN
            has_permission := (user_role = 'admin');
        WHEN 'manage_cycles' THEN
            has_permission := (user_role = 'admin');
        WHEN 'manage_team' THEN
            has_permission := (user_role IN ('admin', 'manager'));
        WHEN 'write' THEN
            has_permission := (user_role IN ('admin', 'manager', 'employee'));
        WHEN 'read' THEN
            has_permission := (user_role IN ('admin', 'manager', 'employee'));
        ELSE
            has_permission := false;
    END CASE;
    
    RETURN has_permission;
END;
$$;

-- ============================================================================
-- STEP 3: CREATE LEGACY COMPATIBILITY FUNCTION
-- ============================================================================

-- Create get_my_role for backward compatibility
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Try to get role by user_id first
    SELECT role INTO user_role
    FROM employees 
    WHERE user_id = auth.uid() 
    AND is_active = true;
    
    -- Fallback - check by email
    IF user_role IS NULL AND auth.email() IS NOT NULL THEN
        SELECT role INTO user_role
        FROM employees 
        WHERE LOWER(email) = LOWER(auth.email())
        AND is_active = true;
    END IF;
    
    -- Return role or default to employee
    RETURN COALESCE(user_role, 'employee');
END;
$$;

-- ============================================================================
-- STEP 4: SECURE SESSION VALIDATION
-- ============================================================================

-- Function to validate user session and get safe user data
CREATE OR REPLACE FUNCTION public.get_current_user_session()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_record employees%ROWTYPE;
    session_data JSON;
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL AND auth.email() IS NULL THEN
        RETURN json_build_object(
            'authenticated', false,
            'error', 'No valid session'
        );
    END IF;
    
    -- Get employee record by user_id first
    SELECT * INTO user_record
    FROM employees 
    WHERE user_id = auth.uid() 
    AND is_active = true;
    
    -- Fallback - try by email
    IF NOT FOUND AND auth.email() IS NOT NULL THEN
        SELECT * INTO user_record
        FROM employees 
        WHERE LOWER(email) = LOWER(auth.email())
        AND is_active = true;
    END IF;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'authenticated', false,
            'error', 'User record not found'
        );
    END IF;
    
    -- Return safe session data (no sensitive info)
    RETURN json_build_object(
        'authenticated', true,
        'user_id', user_record.id,
        'name', user_record.name,
        'role', user_record.role,
        'email', user_record.email,
        'job_title', user_record.job_title,
        'session_valid', true
    );
END;
$$;

-- ============================================================================
-- STEP 5: UPDATE EXISTING FUNCTIONS WITH SECURITY CHECKS
-- ============================================================================

-- Update create_simple_review_cycle with proper security
DROP FUNCTION IF EXISTS public.create_simple_review_cycle(TEXT, DATE, DATE);

CREATE OR REPLACE FUNCTION public.create_simple_review_cycle(
    p_name TEXT,
    p_start_date DATE,
    p_end_date DATE
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cycle_id BIGINT;
BEGIN
    -- Security check using new function
    IF NOT check_user_permission('admin') THEN
        RETURN json_build_object('error', 'Unauthorized: Admin access required');
    END IF;
    
    -- Input validation
    IF p_name IS NULL OR LENGTH(TRIM(p_name)) = 0 THEN
        RETURN json_build_object('error', 'Review cycle name is required');
    END IF;
    
    IF p_start_date IS NULL OR p_end_date IS NULL THEN
        RETURN json_build_object('error', 'Start date and end date are required');
    END IF;
    
    IF p_start_date >= p_end_date THEN
        RETURN json_build_object('error', 'End date must be after start date');
    END IF;
    
    -- Create review cycle
    INSERT INTO review_cycles (name, start_date, end_date, status)
    VALUES (TRIM(p_name), p_start_date, p_end_date, 'upcoming')
    RETURNING id INTO v_cycle_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Review cycle created successfully',
        'cycle_id', v_cycle_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Database error occurred');
END;
$$;

-- Update create_employee with proper security
DROP FUNCTION IF EXISTS public.create_employee(TEXT, TEXT, TEXT, TEXT, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.create_employee(
    p_name TEXT,
    p_email TEXT,
    p_job_title TEXT,
    p_role TEXT,
    p_manager_id UUID DEFAULT NULL,
    p_temp_password TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_employee_id UUID;
BEGIN
    -- Security check
    IF NOT check_user_permission('manage_users') THEN
        RETURN json_build_object('error', 'Unauthorized: User management access required');
    END IF;
    
    -- Input validation and sanitization
    IF p_name IS NULL OR LENGTH(TRIM(p_name)) = 0 THEN
        RETURN json_build_object('error', 'Employee name is required');
    END IF;
    
    IF p_email IS NULL OR LENGTH(TRIM(p_email)) = 0 THEN
        RETURN json_build_object('error', 'Email is required');
    END IF;
    
    -- Validate email format
    IF p_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
        RETURN json_build_object('error', 'Invalid email format');
    END IF;
    
    -- Validate role
    IF p_role NOT IN ('employee', 'manager', 'admin') THEN
        RETURN json_build_object('error', 'Invalid role specified');
    END IF;
    
    -- Check for duplicate email
    IF EXISTS (SELECT 1 FROM employees WHERE LOWER(email) = LOWER(TRIM(p_email))) THEN
        RETURN json_build_object('error', 'Email already exists');
    END IF;
    
    -- Validate manager exists if specified
    IF p_manager_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM employees WHERE id = p_manager_id AND is_active = true) THEN
            RETURN json_build_object('error', 'Selected manager does not exist');
        END IF;
    END IF;
    
    -- Insert employee
    INSERT INTO employees (name, email, job_title, role, manager_id, is_active)
    VALUES (
        TRIM(p_name), 
        LOWER(TRIM(p_email)), 
        TRIM(p_job_title), 
        p_role, 
        p_manager_id, 
        true
    )
    RETURNING id INTO v_employee_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Employee created successfully',
        'employee_id', v_employee_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Database error occurred');
END;
$$;

-- ============================================================================
-- STEP 6: CREATE AUDIT LOGGING
-- ============================================================================

-- Create audit table for security events
CREATE TABLE IF NOT EXISTS public.security_audit (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    employee_id UUID REFERENCES employees(id),
    action TEXT NOT NULL,
    resource TEXT,
    success BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
DROP POLICY IF EXISTS security_audit_admin_read ON public.security_audit;
CREATE POLICY security_audit_admin_read ON public.security_audit
FOR SELECT TO authenticated
USING (check_user_permission('admin'));

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_action TEXT,
    p_resource TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT true
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_employee_id UUID;
BEGIN
    -- Get employee ID for current user
    SELECT id INTO v_employee_id
    FROM employees 
    WHERE user_id = auth.uid() OR (auth.email() IS NOT NULL AND LOWER(email) = LOWER(auth.email()));
    
    -- Insert audit record
    INSERT INTO security_audit (user_id, employee_id, action, resource, success)
    VALUES (auth.uid(), v_employee_id, p_action, p_resource, p_success);
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail if audit logging fails
        NULL;
END;
$$;

-- ============================================================================
-- STEP 7: GRANT PERMISSIONS TO ALL SECURE FUNCTIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.get_current_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_permission TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_session TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_simple_review_cycle TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_employee TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event TO authenticated;

-- ============================================================================
-- STEP 8: TEST THE FUNCTIONS
-- ============================================================================

SELECT 'Testing security functions...' as status;

-- Test role function
SELECT 'get_my_role test:' as test, get_my_role() as result;

-- Test permission function
SELECT 'check_user_permission test:' as test, check_user_permission('read') as result;

-- Test session function
SELECT 'get_current_user_session test:' as test, 
       (get_current_user_session()::json->>'authenticated')::boolean as authenticated;

SELECT '✅ Security Phase 1 Patch completed successfully!' as final_status;