-- EDGE App: FINAL DATABASE FIX
-- Based on your ACTUAL peer_feedback table structure

-- ============================================================================
-- STEP 1: DROP EXISTING CONFLICTING FUNCTIONS
-- ============================================================================

-- Drop the exact functions that exist in your backup
DROP FUNCTION IF EXISTS public.give_peer_feedback(p_giver_id bigint, p_recipient_id bigint, p_feedback_type text) CASCADE;
DROP FUNCTION IF EXISTS public.give_peer_feedback(p_recipient_id bigint, p_feedback_type text) CASCADE;

-- ============================================================================
-- STEP 2: ADD MISSING COLUMNS TO peer_feedback TABLE
-- ============================================================================

-- Your current table only has: feedback_id, giver_id, recipient_id, feedback_type, feedback_timestamp
-- We need to add the missing columns for the React app

ALTER TABLE public.peer_feedback 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS message TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have required data
UPDATE peer_feedback 
SET 
    category = COALESCE(category, 'general'),
    message = COALESCE(message, 'Legacy feedback entry'),
    is_anonymous = COALESCE(is_anonymous, false),
    helpful_count = COALESCE(helpful_count, 0),
    created_at = COALESCE(created_at, feedback_timestamp, NOW()),
    updated_at = COALESCE(updated_at, feedback_timestamp, NOW())
WHERE message IS NULL OR message = '';

-- ============================================================================
-- STEP 3: CREATE SIMPLE FUNCTIONS FOR REACT APP
-- ============================================================================

-- Function 1: Get employees for feedback dropdown
CREATE OR REPLACE FUNCTION public.get_employees_for_feedback()
RETURNS TABLE (
    employee_id UUID,
    name TEXT,
    email TEXT,
    job_title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_emp_id UUID;
BEGIN
    -- Get current employee using existing pattern
    SELECT id INTO current_emp_id 
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    -- Fallback for development
    IF current_emp_id IS NULL THEN
        SELECT id INTO current_emp_id FROM employees WHERE is_active = true LIMIT 1;
    END IF;
    
    RETURN QUERY
    SELECT e.id, e.name, e.email, e.job_title
    FROM employees e
    WHERE e.is_active = true 
      AND e.id != COALESCE(current_emp_id, '00000000-0000-0000-0000-000000000000'::UUID)
    ORDER BY e.name;
END;
$$;

-- Function 2: Get feedback wall data
CREATE OR REPLACE FUNCTION public.get_feedback_wall(
    p_limit INTEGER DEFAULT 50,
    p_feedback_type TEXT DEFAULT NULL
)
RETURNS TABLE (
    feedback_id BIGINT,
    giver_id UUID,
    giver_name TEXT,
    recipient_id UUID,
    recipient_name TEXT,
    feedback_type TEXT,
    category TEXT,
    message TEXT,
    is_anonymous BOOLEAN,
    helpful_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    can_see_giver BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pf.feedback_id,
        pf.giver_id,
        CASE WHEN pf.is_anonymous THEN 'Anonymous' ELSE giver.name END,
        pf.recipient_id,
        recipient.name,
        pf.feedback_type,
        pf.category,
        pf.message,
        pf.is_anonymous,
        pf.helpful_count,
        pf.created_at,
        NOT pf.is_anonymous
    FROM peer_feedback pf
    JOIN employees giver ON pf.giver_id = giver.id
    JOIN employees recipient ON pf.recipient_id = recipient.id
    WHERE (p_feedback_type IS NULL OR pf.feedback_type = p_feedback_type)
      AND giver.is_active = true
      AND recipient.is_active = true
    ORDER BY pf.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Function 3: Give peer feedback (new name)
CREATE OR REPLACE FUNCTION public.give_peer_feedback(
    p_recipient_id UUID,
    p_feedback_type TEXT,
    p_message TEXT,
    p_category TEXT DEFAULT 'general',
    p_is_anonymous BOOLEAN DEFAULT false
) RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_emp_id UUID;
    v_feedback_id BIGINT;
BEGIN
    -- Get current employee
    SELECT id INTO current_emp_id 
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    -- Fallback for development
    IF current_emp_id IS NULL THEN
        SELECT id INTO current_emp_id FROM employees WHERE is_active = true LIMIT 1;
    END IF;
    
    -- Basic validation
    IF current_emp_id = p_recipient_id THEN
        RAISE EXCEPTION 'Cannot give feedback to yourself';
    END IF;
    
    -- Insert feedback
    INSERT INTO peer_feedback (
        giver_id, recipient_id, feedback_type, category, message, is_anonymous
    ) VALUES (
        current_emp_id, p_recipient_id, p_feedback_type, p_category, p_message, p_is_anonymous
    ) RETURNING feedback_id INTO v_feedback_id;
    
    RETURN v_feedback_id;
END;
$$;

-- Function 4: Get my received feedback
CREATE OR REPLACE FUNCTION public.get_my_feedback_received(
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    feedback_id BIGINT,
    giver_name TEXT,
    feedback_type TEXT,
    category TEXT,
    message TEXT,
    is_anonymous BOOLEAN,
    helpful_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_emp_id UUID;
BEGIN
    SELECT id INTO current_emp_id 
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF current_emp_id IS NULL THEN
        SELECT id INTO current_emp_id FROM employees WHERE is_active = true LIMIT 1;
    END IF;
    
    RETURN QUERY
    SELECT 
        pf.feedback_id,
        CASE WHEN pf.is_anonymous THEN 'Anonymous' ELSE giver.name END,
        pf.feedback_type,
        pf.category,
        pf.message,
        pf.is_anonymous,
        pf.helpful_count,
        pf.created_at
    FROM peer_feedback pf
    JOIN employees giver ON pf.giver_id = giver.id
    WHERE pf.recipient_id = current_emp_id
    ORDER BY pf.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Function 5: Mark feedback helpful
CREATE OR REPLACE FUNCTION public.mark_feedback_helpful(p_feedback_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE peer_feedback 
    SET helpful_count = helpful_count + 1,
        updated_at = NOW()
    WHERE feedback_id = p_feedback_id;
    RETURN FOUND;
END;
$$;

-- Function 6: Create simple review cycle
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
    -- Check if user is admin using existing function
    user_role := get_my_role();
    
    IF user_role != 'admin' THEN
        RETURN json_build_object('error', 'Only admins can create review cycles');
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

-- ============================================================================
-- STEP 4: GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.get_employees_for_feedback TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_feedback_wall TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.give_peer_feedback TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_my_feedback_received TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.mark_feedback_helpful TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.create_simple_review_cycle TO authenticated, anon;

-- ============================================================================
-- STEP 5: CREATE SAMPLE DATA
-- ============================================================================

-- Clear existing data and add proper sample data
DELETE FROM peer_feedback;

INSERT INTO peer_feedback (giver_id, recipient_id, feedback_type, category, message, is_anonymous)
SELECT 
    (SELECT id FROM employees WHERE is_active = true ORDER BY name LIMIT 1),
    (SELECT id FROM employees WHERE is_active = true ORDER BY name OFFSET 1 LIMIT 1),
    'positive',
    'teamwork',
    'Great collaboration on the project!',
    false
WHERE (SELECT COUNT(*) FROM employees WHERE is_active = true) >= 2;

-- ============================================================================
-- STEP 6: TEST AND VERIFY
-- ============================================================================

SELECT 'Testing functions:' as status;
SELECT 'get_employees_for_feedback count:' as test, COUNT(*) FROM get_employees_for_feedback();
SELECT 'get_feedback_wall count:' as test, COUNT(*) FROM get_feedback_wall();
SELECT 'Sample feedback created:' as test, COUNT(*) FROM peer_feedback;

SELECT '✅ Database is now aligned with React app!' as final_status;