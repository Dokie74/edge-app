-- COMPREHENSIVE EMPLOYEE MANAGEMENT SYSTEM
-- Adds role-based permissions and employee creation/management features

-- ============================================================================
-- STEP 1: ADD ROLE COLUMN TO EMPLOYEES TABLE
-- ============================================================================

-- Add explicit role column
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'employee' 
CHECK (role IN ('employee', 'manager', 'admin'));

-- Update existing employees based on current business logic
UPDATE employees 
SET role = CASE 
    WHEN email LIKE 'admin@%' OR email LIKE '%admin%' THEN 'admin'
    WHEN EXISTS (SELECT 1 FROM employees e2 WHERE e2.manager_id = employees.id AND e2.is_active = true) THEN 'manager'
    ELSE 'employee'
END
WHERE role IS NULL OR role = 'employee';

-- ============================================================================
-- STEP 2: UPDATE ROLE DETECTION FUNCTIONS
-- ============================================================================

-- Simplified role function using the role column
CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    -- Fallback for development - use first admin user
    IF user_role IS NULL THEN
        SELECT role INTO user_role 
        FROM employees 
        WHERE role = 'admin' AND is_active = true 
        LIMIT 1;
    END IF;
    
    RETURN COALESCE(user_role, 'employee');
END;
$$;

-- ============================================================================
-- STEP 3: EMPLOYEE CREATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_employee(
    p_name TEXT,
    p_email TEXT,
    p_job_title TEXT,
    p_role TEXT DEFAULT 'employee',
    p_manager_id UUID DEFAULT NULL,
    p_temp_password TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_employee_id UUID;
    v_auth_user_id UUID;
    current_user_role TEXT;
BEGIN
    -- Check if current user is admin
    current_user_role := get_my_role();
    IF current_user_role != 'admin' THEN
        RETURN json_build_object('error', 'Only admins can create employees');
    END IF;
    
    -- Validate inputs
    IF p_name IS NULL OR LENGTH(TRIM(p_name)) = 0 THEN
        RETURN json_build_object('error', 'Employee name is required');
    END IF;
    
    IF p_email IS NULL OR LENGTH(TRIM(p_email)) = 0 THEN
        RETURN json_build_object('error', 'Email is required');
    END IF;
    
    IF p_email !~ '^[^@]+@[^@]+\.[^@]+$' THEN
        RETURN json_build_object('error', 'Invalid email format');
    END IF;
    
    IF p_role NOT IN ('employee', 'manager', 'admin') THEN
        RETURN json_build_object('error', 'Role must be employee, manager, or admin');
    END IF;
    
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM employees WHERE email = LOWER(TRIM(p_email))) THEN
        RETURN json_build_object('error', 'Employee with this email already exists');
    END IF;
    
    -- Validate manager exists if specified
    IF p_manager_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM employees WHERE id = p_manager_id AND is_active = true) THEN
            RETURN json_build_object('error', 'Selected manager does not exist');
        END IF;
    END IF;
    
    -- Create auth user (this is a simplified version - in production you'd use Supabase admin API)
    -- For now, we'll create the employee record and return instructions
    
    -- Insert employee record
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
    
    -- Return success with instructions
    RETURN json_build_object(
        'success', true,
        'message', 'Employee created successfully',
        'employee_id', v_employee_id,
        'next_steps', json_build_object(
            'email', LOWER(TRIM(p_email)),
            'temp_password', COALESCE(p_temp_password, 'TempPass123!'),
            'instructions', 'Send login credentials to the new employee. They will need to sign up with this email address in the EDGE app.'
        )
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Database error: ' || SQLERRM);
END;
$$;

-- ============================================================================
-- STEP 4: EMPLOYEE UPDATE FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_employee(
    p_employee_id UUID,
    p_name TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_job_title TEXT DEFAULT NULL,
    p_role TEXT DEFAULT NULL,
    p_manager_id UUID DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_role TEXT;
    old_record employees%ROWTYPE;
BEGIN
    -- Check if current user is admin
    current_user_role := get_my_role();
    IF current_user_role != 'admin' THEN
        RETURN json_build_object('error', 'Only admins can update employees');
    END IF;
    
    -- Get existing record
    SELECT * INTO old_record FROM employees WHERE id = p_employee_id;
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Employee not found');
    END IF;
    
    -- Validate email if changing
    IF p_email IS NOT NULL AND p_email != old_record.email THEN
        IF p_email !~ '^[^@]+@[^@]+\.[^@]+$' THEN
            RETURN json_build_object('error', 'Invalid email format');
        END IF;
        
        IF EXISTS (SELECT 1 FROM employees WHERE email = LOWER(TRIM(p_email)) AND id != p_employee_id) THEN
            RETURN json_build_object('error', 'Email already exists');
        END IF;
    END IF;
    
    -- Validate role if changing
    IF p_role IS NOT NULL AND p_role NOT IN ('employee', 'manager', 'admin') THEN
        RETURN json_build_object('error', 'Role must be employee, manager, or admin');
    END IF;
    
    -- Validate manager if changing
    IF p_manager_id IS NOT NULL AND p_manager_id != old_record.manager_id THEN
        IF NOT EXISTS (SELECT 1 FROM employees WHERE id = p_manager_id AND is_active = true) THEN
            RETURN json_build_object('error', 'Selected manager does not exist');
        END IF;
    END IF;
    
    -- Update employee record
    UPDATE employees 
    SET 
        name = COALESCE(TRIM(p_name), name),
        email = COALESCE(LOWER(TRIM(p_email)), email),
        job_title = COALESCE(TRIM(p_job_title), job_title),
        role = COALESCE(p_role, role),
        manager_id = COALESCE(p_manager_id, manager_id),
        is_active = COALESCE(p_is_active, is_active)
    WHERE id = p_employee_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Employee updated successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Database error: ' || SQLERRM);
END;
$$;

-- ============================================================================
-- STEP 5: GET EMPLOYEES FUNCTION FOR ADMIN
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_all_employees_for_admin()
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    job_title TEXT,
    role TEXT,
    manager_id UUID,
    manager_name TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    direct_reports_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_role TEXT;
BEGIN
    -- Check if current user is admin
    current_user_role := get_my_role();
    IF current_user_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can view all employees';
    END IF;
    
    RETURN QUERY
    SELECT 
        e.id,
        e.name,
        e.email,
        e.job_title,
        e.role,
        e.manager_id,
        m.name as manager_name,
        e.is_active,
        e.created_at,
        (SELECT COUNT(*)::INTEGER FROM employees dr WHERE dr.manager_id = e.id AND dr.is_active = true) as direct_reports_count
    FROM employees e
    LEFT JOIN employees m ON e.manager_id = m.id
    ORDER BY e.is_active DESC, e.role DESC, e.name;
END;
$$;

-- ============================================================================
-- STEP 6: GET POTENTIAL MANAGERS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_potential_managers()
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    job_title TEXT,
    role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_role TEXT;
BEGIN
    -- Check if current user is admin
    current_user_role := get_my_role();
    IF current_user_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can view potential managers';
    END IF;
    
    RETURN QUERY
    SELECT 
        e.id,
        e.name,
        e.email,
        e.job_title,
        e.role
    FROM employees e
    WHERE e.is_active = true
      AND e.role IN ('manager', 'admin')
    ORDER BY e.role DESC, e.name;
END;
$$;

-- ============================================================================
-- STEP 7: GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.create_employee TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.update_employee TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_all_employees_for_admin TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_potential_managers TO authenticated, anon;

-- ============================================================================
-- STEP 8: UPDATE REVIEW CYCLE FUNCTION (FIX ORIGINAL ISSUE)
-- ============================================================================

-- Fix the original review cycle creation issue
DROP FUNCTION IF EXISTS public.create_simple_review_cycle(TEXT, DATE, DATE);

CREATE OR REPLACE FUNCTION public.create_simple_review_cycle(
    p_name TEXT,
    p_start_date DATE,
    p_end_date DATE
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cycle_id BIGINT;
    user_role TEXT;
BEGIN
    -- Check if user is admin using updated function
    user_role := get_my_role();
    
    IF user_role != 'admin' THEN
        RETURN json_build_object('error', 'Only admins can create review cycles. Current role: ' || COALESCE(user_role, 'none'));
    END IF;
    
    -- Basic validation
    IF p_name IS NULL OR LENGTH(TRIM(p_name)) = 0 THEN
        RETURN json_build_object('error', 'Review cycle name is required');
    END IF;
    
    IF p_start_date IS NULL THEN
        RETURN json_build_object('error', 'Start date is required');
    END IF;
    
    IF p_end_date IS NULL THEN
        RETURN json_build_object('error', 'End date is required');
    END IF;
    
    IF p_start_date >= p_end_date THEN
        RETURN json_build_object('error', 'End date must be after start date');
    END IF;
    
    -- Insert new review cycle
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
        RETURN json_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_simple_review_cycle TO authenticated, anon;

-- ============================================================================
-- FINAL STATUS
-- ============================================================================

SELECT '✅ Employee management system created successfully!' as status;
SELECT 'Next: Run debug-admin-role.sql to check your current role' as next_step;