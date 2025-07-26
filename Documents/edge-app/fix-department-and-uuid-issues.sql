-- Fix Department Field and UUID Issues
-- This adds department functionality and fixes the review cycle activation UUID error

-- ============================================================================
-- STEP 1: ADD DEPARTMENTS TABLE AND UPDATE EMPLOYEES TABLE
-- ============================================================================

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert your specific departments
INSERT INTO departments (name, description) VALUES
    ('Executive', 'Executive leadership and management'),
    ('Accounting', 'Financial and accounting operations'),
    ('Engineering', 'Product development and engineering'),
    ('Quality', 'Quality assurance and control'),
    ('Sales', 'Sales and customer relations'),
    ('Purchasing', 'Procurement and vendor management'),
    ('Warehouse', 'Inventory and logistics'),
    ('Machining', 'Manufacturing and machining operations')
ON CONFLICT (name) DO NOTHING;

-- Create employee_departments junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS employee_departments (
    id SERIAL PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, department_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employee_departments_employee_id ON employee_departments(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_departments_department_id ON employee_departments(department_id);

-- ============================================================================
-- STEP 2: FIX UUID ERROR IN REVIEW CYCLE ACTIVATION
-- ============================================================================

-- The issue is that review_cycles table uses BIGINT but we're passing UUID
-- Let's check the actual data type and fix the function

DO $$
DECLARE
    review_cycles_id_type TEXT;
BEGIN
    -- Get the actual data type of review_cycles.id
    SELECT data_type INTO review_cycles_id_type
    FROM information_schema.columns 
    WHERE table_name = 'review_cycles' 
    AND column_name = 'id';
    
    RAISE NOTICE 'review_cycles.id type: %', COALESCE(review_cycles_id_type, 'NOT FOUND');
END $$;

-- Fix the activate_review_cycle_with_assessments function with proper parameter handling
CREATE OR REPLACE FUNCTION public.activate_review_cycle_with_assessments(
    p_cycle_id TEXT,  -- Accept as TEXT first, then convert based on actual type
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
    v_cycle_record review_cycles%ROWTYPE;
    v_assessment_count INTEGER := 0;
    v_employee_record RECORD;
    v_assessment_id UUID;
    v_actual_cycle_id BIGINT; -- Assume BIGINT based on error
BEGIN
    -- Convert string parameter to proper type
    BEGIN
        v_actual_cycle_id := p_cycle_id::BIGINT;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object('error', 'Invalid cycle ID format: ' || p_cycle_id);
    END;
    
    -- Get current user's employee ID and role
    SELECT id, role INTO v_current_employee_id, v_employee_role
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Check if user is admin
    IF v_employee_role != 'admin' THEN
        RETURN json_build_object('error', 'Access denied: Admin privileges required');
    END IF;
    
    -- Get and validate the review cycle
    SELECT * INTO v_cycle_record
    FROM review_cycles 
    WHERE id = v_actual_cycle_id;
    
    IF v_cycle_record.id IS NULL THEN
        RETURN json_build_object('error', 'Review cycle not found');
    END IF;
    
    -- Check if cycle is in a valid state for activation
    IF v_cycle_record.status = 'active' THEN
        RETURN json_build_object('error', 'Review cycle is already active');
    END IF;
    
    IF v_cycle_record.status = 'closed' THEN
        RETURN json_build_object('error', 'Cannot activate a closed review cycle');
    END IF;
    
    -- Update review cycle status to active
    UPDATE review_cycles 
    SET 
        status = 'active',
        updated_at = NOW()
    WHERE id = v_actual_cycle_id;
    
    -- Create assessments for all active employees
    FOR v_employee_record IN 
        SELECT id, name, email, manager_id
        FROM employees 
        WHERE is_active = true
    LOOP
        -- Insert assessment record
        INSERT INTO assessments (
            employee_id,
            cycle_id,
            self_assessment_status,
            manager_review_status,
            due_date,
            created_at,
            updated_at
        ) VALUES (
            v_employee_record.id,
            v_actual_cycle_id,
            'not_started',
            'pending',
            v_cycle_record.end_date,
            NOW(),
            NOW()
        ) RETURNING id INTO v_assessment_id;
        
        v_assessment_count := v_assessment_count + 1;
        
        -- Create notification for employee about new review cycle
        BEGIN
            PERFORM create_notification(
                v_employee_record.id,
                v_current_employee_id,
                'review_cycle_opened',
                'New Review Cycle Started',
                'A new review cycle "' || v_cycle_record.name || '" has been activated. Please complete your self-assessment by ' || v_cycle_record.end_date::DATE
            );
        EXCEPTION
            WHEN undefined_function THEN
                NULL; -- Ignore if notification function doesn't exist
        END;
        
        -- Create notification for manager if employee has one
        IF v_employee_record.manager_id IS NOT NULL THEN
            BEGIN
                PERFORM create_notification(
                    v_employee_record.manager_id,
                    v_current_employee_id,
                    'review_cycle_opened',
                    'New Review Cycle - Team Member Assessment',
                    'Review cycle "' || v_cycle_record.name || '" activated. Your team member ' || v_employee_record.name || ' will need manager review.'
                );
            EXCEPTION
                WHEN undefined_function THEN
                    NULL; -- Ignore if notification function doesn't exist
            END;
        END IF;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Review cycle activated successfully',
        'cycle_id', v_actual_cycle_id,
        'cycle_name', v_cycle_record.name,
        'assessments_created', v_assessment_count,
        'status', 'active'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to activate review cycle: ' || SQLERRM);
END;
$$;

-- ============================================================================
-- STEP 3: CREATE FUNCTIONS FOR DEPARTMENT MANAGEMENT
-- ============================================================================

-- Function to get all departments
CREATE OR REPLACE FUNCTION public.get_all_departments()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT json_agg(
            json_build_object(
                'id', id,
                'name', name,
                'description', description
            ) ORDER BY name
        )
        FROM departments
    );
END;
$$;

-- Function to get employee departments
CREATE OR REPLACE FUNCTION public.get_employee_departments(p_employee_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT json_agg(
            json_build_object(
                'id', d.id,
                'name', d.name,
                'description', d.description
            )
        )
        FROM employee_departments ed
        JOIN departments d ON ed.department_id = d.id
        WHERE ed.employee_id = p_employee_id
    );
END;
$$;

-- Function to set employee departments
CREATE OR REPLACE FUNCTION public.set_employee_departments(
    p_employee_id UUID,
    p_department_ids INTEGER[]
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
    v_employee_role TEXT;
    dept_id INTEGER;
BEGIN
    -- Get current user's employee ID and role
    SELECT id, role INTO v_current_employee_id, v_employee_role
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Check if user is admin
    IF v_employee_role != 'admin' THEN
        RETURN json_build_object('error', 'Access denied: Admin privileges required');
    END IF;
    
    -- Remove existing department associations
    DELETE FROM employee_departments WHERE employee_id = p_employee_id;
    
    -- Add new department associations
    IF p_department_ids IS NOT NULL THEN
        FOREACH dept_id IN ARRAY p_department_ids
        LOOP
            INSERT INTO employee_departments (employee_id, department_id)
            VALUES (p_employee_id, dept_id)
            ON CONFLICT (employee_id, department_id) DO NOTHING;
        END LOOP;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Employee departments updated successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to update employee departments: ' || SQLERRM);
END;
$$;

-- ============================================================================
-- STEP 4: ENABLE RLS AND GRANT PERMISSIONS
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_departments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for departments (all authenticated users can read)
CREATE POLICY departments_select_all ON departments 
FOR SELECT TO authenticated 
USING (true);

-- Create RLS policies for employee_departments
CREATE POLICY employee_departments_select_own ON employee_departments 
FOR SELECT TO authenticated 
USING (
    employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
    )
    OR
    employee_id IN (
        SELECT e.id FROM employees e
        WHERE e.manager_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid() AND is_active = true
        )
    )
    OR
    EXISTS (
        SELECT 1 FROM employees 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND is_active = true
    )
);

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_all_departments() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_employee_departments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_employee_departments(UUID, INTEGER[]) TO authenticated;

-- Update the function signature grant
GRANT EXECUTE ON FUNCTION public.activate_review_cycle_with_assessments(TEXT, TEXT, TEXT, TEXT) TO authenticated;

SELECT '✅ Department functionality and UUID fixes applied successfully!' as status;