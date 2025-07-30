-- SIMPLE FIX: Development plan function without error logging
-- Baby step approach - minimal, safe implementation

-- Drop conflicting functions
DROP FUNCTION IF EXISTS public.submit_development_plan(p_goals text, p_objectives text, p_skills_to_develop text, p_resources_needed text, p_success_metrics text, p_target_completion_date date, _csrf_token text, _nonce text, _timestamp text);
DROP FUNCTION IF EXISTS public.submit_development_plan(p_title text, p_description text, p_goals text, p_skills_to_develop text, p_timeline text);
DROP FUNCTION IF EXISTS public.submit_development_plan(p_title text, p_description text, p_goals jsonb, p_skills_to_develop jsonb, p_timeline text);

-- Create simple, working function
CREATE OR REPLACE FUNCTION public.submit_development_plan(
    p_title text,
    p_description text DEFAULT ''::text,
    p_goals text DEFAULT '[]'::text,
    p_skills_to_develop text DEFAULT '[]'::text,
    p_timeline text DEFAULT ''::text
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_employee_id uuid;
    v_parsed_goals jsonb;
    v_parsed_skills jsonb;
    v_plan_id uuid;
BEGIN
    -- Get authenticated user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN json_build_object('error', 'User not authenticated');
    END IF;

    -- Get employee record
    SELECT id INTO v_employee_id 
    FROM employees 
    WHERE user_id = v_user_id;
    
    IF v_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;

    -- Validate required fields
    IF p_title IS NULL OR trim(p_title) = '' THEN
        RETURN json_build_object('error', 'Title is required');
    END IF;

    -- Parse JSON strings safely
    BEGIN
        v_parsed_goals := p_goals::jsonb;
    EXCEPTION WHEN OTHERS THEN
        v_parsed_goals := '[]'::jsonb;
    END;

    BEGIN
        v_parsed_skills := p_skills_to_develop::jsonb;
    EXCEPTION WHEN OTHERS THEN
        v_parsed_skills := '[]'::jsonb;
    END;

    -- Validate goals array
    IF jsonb_array_length(v_parsed_goals) = 0 THEN
        RETURN json_build_object('error', 'At least one goal is required');
    END IF;

    -- Generate new plan ID
    v_plan_id := gen_random_uuid();

    -- Insert development plan
    INSERT INTO development_plans (
        id,
        employee_id,
        title,
        description,
        goals,
        skills_to_develop,
        timeline,
        status,
        created_at,
        updated_at
    ) VALUES (
        v_plan_id,
        v_employee_id,
        trim(p_title),
        COALESCE(trim(p_description), ''),
        v_parsed_goals,
        v_parsed_skills,
        COALESCE(trim(p_timeline), ''),
        'submitted',
        now(),
        now()
    );

    -- Return success
    RETURN json_build_object(
        'success', true,
        'plan_id', v_plan_id,
        'message', 'Development plan submitted successfully'
    );

EXCEPTION WHEN OTHERS THEN
    -- Simple error return without logging
    RETURN json_build_object(
        'error', 'Failed to submit development plan: ' || SQLERRM
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.submit_development_plan(text, text, text, text, text) TO authenticated;