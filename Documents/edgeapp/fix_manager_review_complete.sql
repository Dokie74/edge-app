-- Complete fix for manager review issues
-- Addresses: 1) Ambiguous column references, 2) Permission denied for auth.users table

-- ========= FIX 1: CREATE SECURE USER ROLE CHECK FUNCTION =========
-- This function can safely access auth.users table with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT raw_app_meta_data->>'role'
    FROM auth.users
    WHERE id = p_user_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

-- ========= FIX 2: CORRECT THE MANAGER CHECK FUNCTION =========
-- Fix ambiguous column references by using explicit table aliases
CREATE OR REPLACE FUNCTION public.is_manager_of(manager_user_id uuid, target_employee_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM employees e1  -- manager's employee record
    JOIN employees e2  -- target employee record
    ON e1.id = e2.manager_id
    WHERE e1.user_id = manager_user_id 
    AND e2.id = target_employee_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_manager_of(uuid, uuid) TO authenticated;

-- ========= FIX 3: CORRECTED GET ASSESSMENT FUNCTION =========
-- Fix ambiguous column references and use secure role checking
CREATE OR REPLACE FUNCTION public.get_assessment_for_manager_review(
    p_assessment_id bigint
) RETURNS TABLE (
    id bigint,
    employee_id uuid,
    employee_name text,
    employee_email text,
    employee_job_title text,
    review_cycle_id bigint,
    cycle_name text,
    cycle_status text,
    due_date date,
    self_assessment_status text,
    manager_review_status text,
    self_assessment_data jsonb,
    manager_review_data jsonb,
    value_passionate_examples text,
    value_driven_examples text,
    value_resilient_examples text,
    value_responsive_examples text,
    gwc_gets_it boolean,
    gwc_gets_it_feedback text,
    gwc_wants_it boolean,
    gwc_wants_it_feedback text,
    gwc_capacity boolean,
    gwc_capacity_feedback text,
    manager_performance_rating text,
    manager_summary_comments text,
    employee_submitted_at timestamp with time zone,
    manager_reviewed_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    v_current_user_id uuid;
    v_manager_employee_id uuid;
    v_assessment_employee_manager_id uuid;
BEGIN
    -- Get the current user's ID
    v_current_user_id := auth.uid();
    
    -- Get the current user's employee record
    SELECT e.id INTO v_manager_employee_id
    FROM employees e 
    WHERE e.user_id = v_current_user_id;
    
    IF v_manager_employee_id IS NULL THEN
        RAISE EXCEPTION 'Manager employee record not found';
    END IF;
    
    -- Get the manager_id of the employee whose assessment we're trying to access
    SELECT emp.manager_id INTO v_assessment_employee_manager_id
    FROM assessments a
    JOIN employees emp ON a.employee_id = emp.id
    WHERE a.id = p_assessment_id;
    
    -- Check if the current user is the manager of the employee being assessed
    -- or if they are an admin
    IF v_assessment_employee_manager_id != v_manager_employee_id THEN
        -- Check if user is admin using secure function
        IF get_user_role(v_current_user_id) != 'admin' THEN
            RAISE EXCEPTION 'Access denied: You can only review assessments for your direct reports';
        END IF;
    END IF;
    
    -- Return the assessment data with employee and cycle information
    -- Use explicit table aliases to avoid ambiguous column references
    RETURN QUERY
    SELECT 
        a.id,
        a.employee_id,
        e.name as employee_name,
        e.email as employee_email,
        e.job_title as employee_job_title,
        a.review_cycle_id,
        rc.name as cycle_name,
        rc.status as cycle_status,
        a.due_date,
        a.self_assessment_status,
        a.manager_review_status,
        a.self_assessment_data,
        a.manager_review_data,
        a.value_passionate_examples,
        a.value_driven_examples,
        a.value_resilient_examples,
        a.value_responsive_examples,
        a.gwc_gets_it,
        a.gwc_gets_it_feedback,
        a.gwc_wants_it,
        a.gwc_wants_it_feedback,
        a.gwc_capacity,
        a.gwc_capacity_feedback,
        a.manager_performance_rating,
        a.manager_summary_comments,
        a.employee_submitted_at,
        a.manager_reviewed_at,
        a.created_at,
        a.updated_at
    FROM assessments a
    JOIN employees e ON a.employee_id = e.id
    JOIN review_cycles rc ON a.review_cycle_id = rc.id
    WHERE a.id = p_assessment_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_assessment_for_manager_review(bigint) TO authenticated;

-- ========= FIX 4: UPDATE RLS POLICIES TO USE SECURE FUNCTIONS =========

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Enable read access for own and team's assessments" ON public.assessments;
DROP POLICY IF EXISTS "Enable read access for own and team assessments" ON public.assessments;
DROP POLICY IF EXISTS "Enable update for own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Enable update for own and team assessments" ON public.assessments;

-- Create corrected SELECT policy using secure functions
CREATE POLICY "Enable read access for own and team assessments"
ON public.assessments
FOR SELECT
USING (
  -- User is the employee being assessed
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.user_id = auth.uid() 
    AND employees.id = assessments.employee_id
  )
  OR
  -- User is the manager of the employee being assessed
  is_manager_of(auth.uid(), assessments.employee_id)
  OR
  -- User is an admin (using secure function)
  get_user_role(auth.uid()) = 'admin'
);

-- Create corrected UPDATE policy using secure functions
CREATE POLICY "Enable update for own and team assessments"
ON public.assessments
FOR UPDATE
USING (
  -- User is the employee being assessed (for self-assessments)
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.user_id = auth.uid() 
    AND employees.id = assessments.employee_id
  )
  OR
  -- User is the manager of the employee being assessed (for manager reviews)
  is_manager_of(auth.uid(), assessments.employee_id)
  OR
  -- User is an admin
  get_user_role(auth.uid()) = 'admin'
);

-- Verify everything is working
SELECT 'All manager review functions and policies updated successfully!' as result;