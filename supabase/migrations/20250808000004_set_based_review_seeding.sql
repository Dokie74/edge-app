-- Migration: Replace row-loop seeding with set-based operations
-- Description: Create scalable, idempotent review cycle seeding functions
-- Issue: Current seeding may use inefficient row-by-row loops instead of set operations

-- Function: Seed self-assessments for all active employees in a review cycle
CREATE OR REPLACE FUNCTION seed_self_assessments(p_review_cycle_id UUID)
RETURNS TABLE(
    employees_processed INTEGER,
    assessments_created INTEGER,
    assessments_existing INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_employees INTEGER;
    new_assessments INTEGER;
    existing_assessments INTEGER;
BEGIN
    -- Count total active employees
    SELECT COUNT(*) INTO total_employees
    FROM employees 
    WHERE is_active = true;
    
    -- Set-based insert with conflict handling
    INSERT INTO assessments (employee_id, review_cycle_id, status, created_at)
    SELECT 
        e.id,
        p_review_cycle_id,
        'draft',
        now()
    FROM employees e
    WHERE e.is_active = true
    ON CONFLICT (employee_id, review_cycle_id) DO NOTHING;
    
    -- Count what was actually inserted
    GET DIAGNOSTICS new_assessments = ROW_COUNT;
    
    -- Calculate existing assessments
    existing_assessments := total_employees - new_assessments;
    
    -- Log the operation
    RAISE NOTICE 'Seeded % assessments for review cycle %, % already existed', 
        new_assessments, p_review_cycle_id, existing_assessments;
    
    -- Return summary
    RETURN QUERY SELECT total_employees, new_assessments, existing_assessments;
END;
$$;

-- Function: Combined seeding for review cycle assessments
CREATE OR REPLACE FUNCTION seed_review_cycle_assessments(p_review_cycle_id UUID)
RETURNS TABLE(
    cycle_name TEXT,
    total_employees INTEGER,
    assessments_created INTEGER,
    assessments_existing INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cycle_name TEXT;
    seed_result RECORD;
BEGIN
    -- Verify review cycle exists and get name
    SELECT name INTO v_cycle_name
    FROM review_cycles
    WHERE id = p_review_cycle_id;
    
    IF v_cycle_name IS NULL THEN
        RAISE EXCEPTION 'Review cycle % not found', p_review_cycle_id;
    END IF;
    
    -- Seed assessments using the simpler function
    SELECT * INTO seed_result
    FROM seed_self_assessments(p_review_cycle_id);
    
    -- Return comprehensive summary
    RETURN QUERY SELECT 
        v_cycle_name,
        seed_result.employees_processed,
        seed_result.assessments_created,
        seed_result.assessments_existing;
END;
$$;

-- Grant execute permissions to authenticated users (admins will use this via RLS)
GRANT EXECUTE ON FUNCTION seed_self_assessments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION seed_review_cycle_assessments(UUID) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION seed_self_assessments(UUID) IS 
'Set-based seeding of assessments for all active employees. Idempotent via ON CONFLICT.';

COMMENT ON FUNCTION seed_review_cycle_assessments(UUID) IS 
'Complete seeding function for review cycle assessments. Returns detailed summary.';

-- Safe verification without testing (avoids UUID casting issues)
DO $$
DECLARE
    cycle_count INTEGER;
BEGIN
    -- Count existing review cycles
    SELECT COUNT(*) INTO cycle_count FROM review_cycles;
    
    IF cycle_count > 0 THEN
        RAISE NOTICE 'Functions created successfully. Found % review cycles available for seeding.', cycle_count;
        RAISE NOTICE 'To test: SELECT * FROM seed_review_cycle_assessments(''your-cycle-id-here'');';
    ELSE
        RAISE NOTICE 'Functions created successfully. No review cycles found - create one to test seeding.';
    END IF;
    
    RAISE NOTICE 'Migration completed: Set-based review seeding functions are ready for use.';
END $$;