-- Manager Playbook Database Setup - Consolidated
-- Run this entire script in your Supabase SQL Editor

-- ============================================================================
-- STEP 1: CREATE MANAGER_NOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.manager_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    priority TEXT DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure valid categories and priorities
    CONSTRAINT valid_category CHECK (category IN ('general', 'performance', 'development', 'personal', 'goals')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_manager_notes_manager_id ON manager_notes(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_notes_employee_id ON manager_notes(employee_id);
CREATE INDEX IF NOT EXISTS idx_manager_notes_created_at ON manager_notes(created_at DESC);

-- ============================================================================
-- STEP 2: CREATE FUNCTION TO GET MANAGER'S EMPLOYEES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_manager_employees()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
    result JSON;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_current_employee_id
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN '[]'::json;
    END IF;
    
    -- Check if user is manager or admin
    IF NOT EXISTS (
        SELECT 1 FROM employees 
        WHERE id = v_current_employee_id 
        AND role IN ('manager', 'admin')
    ) THEN
        RETURN '[]'::json;    END IF;
    
    -- Get all employees under this manager
    SELECT json_agg(employee_data) INTO result
    FROM (
        SELECT json_build_object(
            'employee_id', e.id,
            'name', e.name,
            'email', e.email,
            'job_title', COALESCE(e.job_title, ''),
            'role', e.role,
            'is_active', e.is_active,
            'notes_count', COALESCE(note_count.count, 0)
        ) as employee_data
        FROM employees e
        LEFT JOIN (
            SELECT employee_id, COUNT(*) as count
            FROM manager_notes
            WHERE manager_id = v_current_employee_id
            GROUP BY employee_id
        ) note_count ON e.id = note_count.employee_id
        WHERE e.manager_id = v_current_employee_id
        AND e.is_active = true
        ORDER BY e.name
    ) ordered_employees;
    
    RETURN COALESCE(result, '[]'::json);
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to get manager employees: %', SQLERRM;
END;
$$;

-- ============================================================================
-- STEP 3: CREATE FUNCTION TO GET EMPLOYEE NOTES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_employee_notes(p_employee_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
    result JSON;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_current_employee_id
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN '[]'::json;
    END IF;
    
    -- Verify the employee belongs to this manager or user is admin
    IF NOT EXISTS (
        SELECT 1 FROM employees e
        WHERE e.id = p_employee_id
        AND (e.manager_id = v_current_employee_id OR 
             EXISTS (SELECT 1 FROM employees WHERE id = v_current_employee_id AND role = 'admin'))
    ) THEN
        RETURN json_build_object('error', 'Unauthorized: You can only view notes for your direct reports');
    END IF;
    
    -- Get all notes for this employee by this manager
    SELECT json_agg(note_data) INTO result
    FROM (
        SELECT json_build_object(
            'id', mn.id,
            'title', mn.title,
            'content', mn.content,
            'category', mn.category,
            'priority', mn.priority,
            'created_at', mn.created_at,
            'updated_at', mn.updated_at,
            'employee_id', mn.employee_id,
            'employee_name', e.name
        ) as note_data
        FROM manager_notes mn
        JOIN employees e ON mn.employee_id = e.id
        WHERE mn.manager_id = v_current_employee_id
        AND mn.employee_id = p_employee_id
        ORDER BY mn.created_at DESC
    ) ordered_notes;
    
    RETURN COALESCE(result, '[]'::json);
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to get employee notes: %', SQLERRM;
END;
$$;

-- ============================================================================
-- STEP 4: CREATE FUNCTION TO SAVE MANAGER NOTE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.save_manager_note(
    p_employee_id UUID,
    p_title TEXT,
    p_content TEXT,
    p_category TEXT DEFAULT 'general',
    p_priority TEXT DEFAULT 'medium'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
    v_note_id UUID;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_current_employee_id
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Verify the employee belongs to this manager or user is admin
    IF NOT EXISTS (
        SELECT 1 FROM employees e
        WHERE e.id = p_employee_id
        AND (e.manager_id = v_current_employee_id OR 
             EXISTS (SELECT 1 FROM employees WHERE id = v_current_employee_id AND role = 'admin'))
    ) THEN
        RETURN json_build_object('error', 'Unauthorized: You can only add notes for your direct reports');
    END IF;
    
    -- Validate inputs
    IF p_title IS NULL OR TRIM(p_title) = '' THEN
        RETURN json_build_object('error', 'Note title is required');
    END IF;
    
    IF p_content IS NULL OR TRIM(p_content) = '' THEN
        RETURN json_build_object('error', 'Note content is required');
    END IF;
    
    IF p_category NOT IN ('general', 'performance', 'development', 'personal', 'goals') THEN
        RETURN json_build_object('error', 'Invalid category');
    END IF;
    
    IF p_priority NOT IN ('low', 'medium', 'high', 'urgent') THEN
        RETURN json_build_object('error', 'Invalid priority');
    END IF;
    
    -- Insert the note
    INSERT INTO manager_notes (
        manager_id,
        employee_id,
        title,
        content,
        category,
        priority,
        created_at,
        updated_at
    ) VALUES (
        v_current_employee_id,
        p_employee_id,
        TRIM(p_title),
        TRIM(p_content),
        p_category,
        p_priority,
        NOW(),
        NOW()
    ) RETURNING id INTO v_note_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Note saved successfully',
        'note_id', v_note_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to save note: ' || SQLERRM);
END;
$$;

-- ============================================================================
-- STEP 5: CREATE FUNCTION TO UPDATE MANAGER NOTE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_manager_note(
    p_note_id UUID,
    p_title TEXT,
    p_content TEXT,
    p_category TEXT DEFAULT 'general',
    p_priority TEXT DEFAULT 'medium'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_current_employee_id
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Verify the note belongs to this manager
    IF NOT EXISTS (
        SELECT 1 FROM manager_notes 
        WHERE id = p_note_id AND manager_id = v_current_employee_id
    ) THEN
        RETURN json_build_object('error', 'Note not found or unauthorized');
    END IF;
    
    -- Validate inputs
    IF p_title IS NULL OR TRIM(p_title) = '' THEN
        RETURN json_build_object('error', 'Note title is required');
    END IF;
    
    IF p_content IS NULL OR TRIM(p_content) = '' THEN
        RETURN json_build_object('error', 'Note content is required');
    END IF;
    
    -- Update the note
    UPDATE manager_notes SET
        title = TRIM(p_title),
        content = TRIM(p_content),
        category = p_category,
        priority = p_priority,
        updated_at = NOW()
    WHERE id = p_note_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Note updated successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to update note: ' || SQLERRM);
END;
$$;

-- ============================================================================
-- STEP 6: CREATE FUNCTION TO DELETE MANAGER NOTE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.delete_manager_note(p_note_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_employee_id UUID;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_current_employee_id
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Verify the note belongs to this manager
    IF NOT EXISTS (
        SELECT 1 FROM manager_notes 
        WHERE id = p_note_id AND manager_id = v_current_employee_id
    ) THEN
        RETURN json_build_object('error', 'Note not found or unauthorized');
    END IF;
    
    -- Delete the note
    DELETE FROM manager_notes WHERE id = p_note_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Note deleted successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to delete note: ' || SQLERRM);
END;
$$;

-- ============================================================================
-- STEP 7: GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON manager_notes TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_manager_employees() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_employee_notes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_manager_note(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_manager_note(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_manager_note(UUID) TO authenticated;

-- ============================================================================
-- STEP 8: CREATE ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE manager_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Managers can only see their own notes
CREATE POLICY manager_notes_own_access ON manager_notes
    FOR ALL USING (
        manager_id IN (
            SELECT id FROM employees 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

SELECT '✅ Manager Playbook database setup complete!' as status;