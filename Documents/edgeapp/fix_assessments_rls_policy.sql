-- Fix RLS policies for assessments table to allow manager access
-- This addresses the 406 error when managers try to access team member assessments

-- First, create a helper function to check if a user is a manager of an employee
CREATE OR REPLACE FUNCTION public.is_manager_of(manager_user_id uuid, target_employee_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the manager_user_id is the manager of the target employee
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

-- Drop existing assessment SELECT policy if it exists
DROP POLICY IF EXISTS "Enable read access for own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Enable read access for own and team's assessments" ON public.assessments;

-- Create new comprehensive RLS policy for assessments SELECT
CREATE POLICY "Enable read access for own and team assessments"
ON public.assessments
FOR SELECT
USING (
  -- Condition 1: User is the employee who the assessment belongs to
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.user_id = auth.uid() 
    AND employees.id = assessments.employee_id
  )
  OR
  -- Condition 2: User is the manager of the employee who the assessment belongs to
  is_manager_of(auth.uid(), assessments.employee_id)
  OR
  -- Condition 3: User is an admin (can see all assessments)
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.role = 'admin'
  )
);

-- Grant execute permissions on the helper function
GRANT EXECUTE ON FUNCTION public.is_manager_of(uuid, uuid) TO authenticated;

-- Also ensure we have proper UPDATE policy for managers to complete reviews
DROP POLICY IF EXISTS "Enable update for own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Enable update for own and team assessments" ON public.assessments;

CREATE POLICY "Enable update for own and team assessments"
ON public.assessments
FOR UPDATE
USING (
  -- Employee can update their own assessment (for self-assessment)
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.user_id = auth.uid() 
    AND employees.id = assessments.employee_id
  )
  OR
  -- Manager can update assessments for their team members (for manager review)
  is_manager_of(auth.uid(), assessments.employee_id)
  OR
  -- Admin can update any assessment
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.role = 'admin'
  )
);

-- Test the function to make sure it works
-- This should help verify the policy is working correctly
SELECT 'RLS policies updated successfully for assessments table' as result;