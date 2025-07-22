

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."activate_review_cycle"("p_cycle_id" bigint) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_user_role text;
    cycle_status text;
    cycle_name text;
    result json;
BEGIN
    -- Check if user is admin
    SELECT role INTO current_user_role
    FROM public.employees
    WHERE user_id = auth.uid();

    IF current_user_role != 'admin' THEN
        RAISE EXCEPTION 'Only administrators can activate review cycles';
    END IF;

    -- Get current cycle info
    SELECT status, name INTO cycle_status, cycle_name
    FROM public.review_cycles
    WHERE id = p_cycle_id;

    IF cycle_status IS NULL THEN
        RAISE EXCEPTION 'Review cycle not found';
    END IF;

    IF cycle_status = 'active' THEN
        RAISE EXCEPTION 'Review cycle is already active';
    END IF;

    -- Activate the cycle
    UPDATE public.review_cycles
    SET status = 'active'
    WHERE id = p_cycle_id;

    -- Return success info
    SELECT json_build_object(
        'success', true,
        'cycle_id', p_cycle_id,
        'cycle_name', cycle_name,
        'message', 'Review cycle activated successfully. Managers can now start reviews.'
    ) INTO result;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."activate_review_cycle"("p_cycle_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_assessment_feedback"("p_assessment_id" bigint, "p_comment_text" "text") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_user_id uuid;
    author_employee_id uuid;
    assessment_status text;
    new_feedback_id bigint;
BEGIN
    current_user_id := auth.uid();

    -- Get the author's employee ID
    SELECT id INTO author_employee_id 
    FROM public.employees 
    WHERE user_id = current_user_id;

    -- Check authorization
    SELECT a.status INTO assessment_status
    FROM public.assessments a
    JOIN public.employees e ON a.employee_id = e.id
    LEFT JOIN public.employees m ON e.manager_id = m.id
    WHERE a.id = p_assessment_id 
    AND (e.user_id = current_user_id OR m.user_id = current_user_id);

    -- Validate inputs and authorization
    IF author_employee_id IS NULL THEN
        RAISE EXCEPTION 'Author not found';
    END IF;

    IF assessment_status IS NULL THEN
        RAISE EXCEPTION 'Not authorized to add feedback to this assessment';
    END IF;

    -- Insert the feedback using existing schema field names
    INSERT INTO public.assessment_feedback (
        assessment_id, 
        author_id,  -- Using existing schema field
        comment_text, 
        created_at
    ) VALUES (
        p_assessment_id, 
        author_employee_id, 
        p_comment_text, 
        NOW()
    ) RETURNING id INTO new_feedback_id;

    RETURN new_feedback_id;
END;
$$;


ALTER FUNCTION "public"."add_assessment_feedback"("p_assessment_id" bigint, "p_comment_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_review_cycle"("p_cycle_id" bigint) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_user_role text;
    cycle_name text;
    total_assessments bigint;
    completed_assessments bigint;
    result json;
BEGIN
    -- Check if user is admin
    SELECT role INTO current_user_role
    FROM public.employees
    WHERE user_id = auth.uid();

    IF current_user_role != 'admin' THEN
        RAISE EXCEPTION 'Only administrators can complete review cycles';
    END IF;

    -- Get cycle info and statistics
    SELECT 
        rc.name,
        COALESCE((SELECT COUNT(*) FROM public.assessments a WHERE a.review_cycle_id = rc.id), 0),
        COALESCE((SELECT COUNT(*) FROM public.assessments a WHERE a.review_cycle_id = rc.id AND a.status = 'finalized'), 0)
    INTO cycle_name, total_assessments, completed_assessments
    FROM public.review_cycles rc
    WHERE rc.id = p_cycle_id;

    IF cycle_name IS NULL THEN
        RAISE EXCEPTION 'Review cycle not found';
    END IF;

    -- Complete the cycle
    UPDATE public.review_cycles
    SET status = 'completed'
    WHERE id = p_cycle_id;

    -- Return completion info
    SELECT json_build_object(
        'success', true,
        'cycle_id', p_cycle_id,
        'cycle_name', cycle_name,
        'total_assessments', total_assessments,
        'completed_assessments', completed_assessments,
        'completion_rate', CASE 
            WHEN total_assessments > 0 THEN ROUND((completed_assessments::decimal / total_assessments::decimal) * 100, 1)
            ELSE 0 
        END,
        'message', 'Review cycle completed successfully.'
    ) INTO result;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."complete_review_cycle"("p_cycle_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_review_cycle_with_rocks"("p_cycle_name" "text", "p_start_date" "date", "p_end_date" "date", "p_cycle_type" "text" DEFAULT 'quarterly'::"text", "p_rocks" json DEFAULT '[]'::json) RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    new_cycle_id bigint;
    rock_item json;
    current_user_role text;
BEGIN
    -- Check if user is admin
    SELECT role INTO current_user_role
    FROM public.employees
    WHERE user_id = auth.uid();

    IF current_user_role != 'admin' THEN
        RAISE EXCEPTION 'Only administrators can create review cycles';
    END IF;

    -- Validate dates
    IF p_start_date >= p_end_date THEN
        RAISE EXCEPTION 'Start date must be before end date';
    END IF;

    -- Create the review cycle
    INSERT INTO public.review_cycles (
        name,
        start_date,
        end_date,
        status,
        created_at
    ) VALUES (
        p_cycle_name,
        p_start_date,
        p_end_date,
        'upcoming',
        NOW()
    ) RETURNING id INTO new_cycle_id;

    -- Add company rocks if provided
    IF json_array_length(p_rocks) > 0 THEN
        FOR rock_item IN SELECT * FROM json_array_elements(p_rocks)
        LOOP
            INSERT INTO public.company_rocks (
                review_cycle_id,
                description,
                owner_name,
                target_date,
                status
            ) VALUES (
                new_cycle_id,
                rock_item->>'description',
                rock_item->>'owner_name',
                COALESCE((rock_item->>'target_date')::date, p_end_date),
                COALESCE(rock_item->>'status', 'not_started')
            );
        END LOOP;
    END IF;

    RETURN new_cycle_id;
END;
$$;


ALTER FUNCTION "public"."create_review_cycle_with_rocks"("p_cycle_name" "text", "p_start_date" "date", "p_end_date" "date", "p_cycle_type" "text", "p_rocks" json) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_development_goal"("p_goal_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_employee_id uuid;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_employee_id FROM public.employees WHERE id = auth.uid();

    IF v_employee_id IS NULL THEN
        RAISE EXCEPTION 'Employee record not found';
    END IF;

    -- Delete the goal if it belongs to the user
    DELETE FROM public.employee_development_goals
    WHERE 
        id = p_goal_id 
        AND employee_id = v_employee_id;

    -- Return true if a row was deleted, false otherwise
    RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."delete_development_goal"("p_goal_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_employees"() RETURNS TABLE("id" "uuid", "name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.name
    FROM 
        public.employees e
    WHERE 
        e.is_active = true
    ORDER BY 
        e.name;
END;
$$;


ALTER FUNCTION "public"."get_all_employees"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_employees_with_managers"() RETURNS TABLE("employee_id" "uuid", "employee_name" "text", "email" "text", "job_title" "text", "manager_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id AS employee_id,
        e.name AS employee_name,
        e.email,
        COALESCE(e.job_title, '') AS job_title,
        COALESCE(m.name, 'No Manager') AS manager_name
    FROM 
        public.employees e
    LEFT JOIN 
        public.employees m ON e.manager_id = m.id
    WHERE 
        e.is_active = true
    ORDER BY 
        e.name;
END;
$$;


ALTER FUNCTION "public"."get_all_employees_with_managers"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_my_assessments"() RETURNS TABLE("assessment_id" bigint, "review_cycle_name" "text", "status" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id as assessment_id,
        rc.name as review_cycle_name,
        a.status
    FROM
        public.assessments a
    JOIN
        public.review_cycles rc ON a.review_cycle_id = rc.id
    WHERE
        a.employee_id = (SELECT id FROM public.employees WHERE user_id = auth.uid())
    ORDER BY
        rc.start_date DESC;
END;
$$;


ALTER FUNCTION "public"."get_all_my_assessments"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_review_cycles_with_details"() RETURNS TABLE("cycle_id" bigint, "cycle_name" "text", "start_date" "date", "end_date" "date", "status" "text", "created_at" timestamp with time zone, "assessment_count" bigint, "completed_assessments" bigint, "rocks_count" bigint, "cycle_type" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_user_role text;
BEGIN
    -- Check if user is admin or manager
    SELECT role INTO current_user_role
    FROM public.employees
    WHERE user_id = auth.uid();

    IF current_user_role NOT IN ('admin', 'manager') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        rc.id AS cycle_id,
        rc.name AS cycle_name,
        rc.start_date,
        rc.end_date,
        rc.status,
        COALESCE(rc.created_at, now()) AS created_at,
        COALESCE(
            (SELECT COUNT(*) FROM public.assessments a WHERE a.review_cycle_id = rc.id),
            0
        ) AS assessment_count,
        COALESCE(
            (SELECT COUNT(*) FROM public.assessments a WHERE a.review_cycle_id = rc.id AND a.status = 'finalized'),
            0
        ) AS completed_assessments,
        COALESCE(
            (SELECT COUNT(*) FROM public.company_rocks cr WHERE cr.review_cycle_id = rc.id),
            0
        ) AS rocks_count,
        CASE 
            WHEN rc.name ILIKE '%annual%' THEN 'annual'
            ELSE 'quarterly'
        END AS cycle_type
    FROM 
        public.review_cycles rc
    ORDER BY 
        rc.start_date DESC;
END;
$$;


ALTER FUNCTION "public"."get_all_review_cycles_with_details"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_assessment_details"("p_assessment_id" bigint) RETURNS TABLE("assessment_id" bigint, "employee_id" "uuid", "employee_name" "text", "review_cycle_name" "text", "status" "text", "is_manager_view" boolean, "employee_strengths" "text", "employee_improvements" "text", "manager_summary_comments" "text", "manager_development_plan" "text", "submitted_by_employee_at" timestamp with time zone, "finalized_by_manager_at" timestamp with time zone, "core_value_responses" json, "gwc_responses" json, "rocks" json, "scorecard_metrics" json)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_current_user_id uuid := auth.uid();
    v_current_employee_id uuid;
    v_assessment_employee_id uuid;
    v_manager_id uuid;
BEGIN
    -- Get the employee ID for the current user
    SELECT id INTO v_current_employee_id FROM public.employees WHERE user_id = v_current_user_id;

    -- Get the employee ID and their manager for the requested assessment
    SELECT a.employee_id, e.manager_id
    INTO v_assessment_employee_id, v_manager_id
    FROM public.assessments a
    JOIN public.employees e ON a.employee_id = e.id
    WHERE a.id = p_assessment_id;

    -- Security Check: Ensure the user has permission to view this assessment
    IF NOT (
        v_current_employee_id = v_assessment_employee_id OR -- It's their own assessment
        v_current_employee_id = v_manager_id OR -- They are the manager
        (SELECT get_my_role()) = 'admin' -- They are an admin
    ) THEN
        RAISE EXCEPTION 'Permission denied to view this assessment.';
    END IF;

    RETURN QUERY
    SELECT
        a.id,
        a.employee_id,
        e.name,
        rc.name,
        a.status,
        (v_current_employee_id = v_manager_id OR (SELECT get_my_role()) = 'admin'),
        a.employee_strengths,
        a.employee_improvements,
        a.manager_summary_comments,
        a.manager_development_plan,
        a.submitted_by_employee_at,
        a.finalized_by_manager_at,
        -- Aggregate core value responses into a JSON array
        (SELECT json_agg(json_build_object(
            'core_value_id', cvr.core_value_id,
            'name', cv.name,
            'employee_examples', cvr.employee_examples
        ))
         FROM public.assessment_core_value_responses cvr
         JOIN public.core_values cv ON cvr.core_value_id = cv.id
         WHERE cvr.assessment_id = a.id),
        -- Aggregate GWC responses into a JSON array
        (SELECT json_agg(json_build_object(
            'gwc_metric_id', gwr.gwc_metric_id,
            'name', gm.name,
            'manager_response', gwr.manager_response,
            'manager_feedback', gwr.manager_feedback
        ))
         FROM public.assessment_gwc_responses gwr
         JOIN public.gwc_metrics gm ON gwr.gwc_metric_id = gm.id
         WHERE gwr.assessment_id = a.id),
        -- Aggregate rocks into a JSON array
        (SELECT json_agg(ar.*) FROM public.assessment_rocks ar WHERE ar.assessment_id = a.id),
        -- Aggregate scorecard metrics into a JSON array
        (SELECT json_agg(asm.*) FROM public.assessment_scorecard_metrics asm WHERE asm.assessment_id = a.id)
    FROM
        public.assessments a
    JOIN
        public.employees e ON a.employee_id = e.id
    JOIN
        public.review_cycles rc ON a.review_cycle_id = rc.id
    WHERE
        a.id = p_assessment_id;
END;
$$;


ALTER FUNCTION "public"."get_assessment_details"("p_assessment_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_assessment_feedback"("p_assessment_id" bigint) RETURNS TABLE("id" bigint, "author_name" "text", "comment_text" "text", "is_author" boolean, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_user_id uuid;
    current_employee_id uuid;
    is_authorized boolean;
BEGIN
    current_user_id := auth.uid();
    
    -- Get current user's employee ID
    SELECT e.id INTO current_employee_id
    FROM public.employees e 
    WHERE e.user_id = current_user_id;

    -- Check authorization
    SELECT EXISTS (
        SELECT 1 
        FROM public.assessments a
        JOIN public.employees e ON a.employee_id = e.id
        LEFT JOIN public.employees m ON e.manager_id = m.id
        WHERE a.id = p_assessment_id 
        AND (e.user_id = current_user_id OR m.user_id = current_user_id)
    ) INTO is_authorized;

    IF NOT is_authorized THEN
        RAISE EXCEPTION 'Not authorized to view this assessment''s feedback';
    END IF;

    RETURN QUERY
    SELECT 
        af.id,
        e.name AS author_name,
        af.comment_text,
        (af.author_id = current_employee_id) AS is_author,
        af.created_at
    FROM 
        public.assessment_feedback af
    JOIN 
        public.employees e ON af.author_id = e.id
    WHERE 
        af.assessment_id = p_assessment_id
    ORDER BY 
        af.created_at ASC;
END;
$$;


ALTER FUNCTION "public"."get_assessment_feedback"("p_assessment_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_company_rocks"("p_cycle_id" bigint) RETURNS TABLE("rock_id" bigint, "description" "text", "owner_name" "text", "target_date" "date", "status" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_user_role text;
BEGIN
    -- Check if user has access
    SELECT role INTO current_user_role
    FROM public.employees
    WHERE user_id = auth.uid();

    IF current_user_role NOT IN ('admin', 'manager') THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        cr.id AS rock_id,
        cr.description,
        cr.owner_name,
        cr.target_date,
        cr.status,
        cr.created_at
    FROM 
        public.company_rocks cr
    WHERE 
        cr.review_cycle_id = p_cycle_id
    ORDER BY 
        cr.created_at;
END;
$$;


ALTER FUNCTION "public"."get_company_rocks"("p_cycle_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_development_messages"() RETURNS TABLE("message_id" bigint, "from_name" "text", "to_name" "text", "subject" "text", "message" "text", "message_type" "text", "read_at" timestamp with time zone, "created_at" timestamp with time zone, "is_from_me" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_employee_id uuid;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_employee_id FROM public.employees WHERE id = auth.uid();

    RETURN QUERY
    SELECT 
        m.id AS message_id,
        from_emp.name AS from_name,
        to_emp.name AS to_name,
        m.subject,
        m.message,
        m.message_type,
        m.read_at,
        m.created_at,
        (m.from_employee_id = v_employee_id) AS is_from_me
    FROM 
        public.manager_employee_messages m
        INNER JOIN public.employees from_emp ON m.from_employee_id = from_emp.id
        INNER JOIN public.employees to_emp ON m.to_employee_id = to_emp.id
    WHERE 
        m.from_employee_id = v_employee_id OR m.to_employee_id = v_employee_id
    ORDER BY 
        m.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_development_messages"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_employee_profile"() RETURNS TABLE("employee_id" "uuid", "name" "text", "email" "text", "job_title" "text", "start_date" "date", "manager_name" "text", "department" "text", "role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id AS employee_id,
        e.name,
        e.email,
        e.job_title,
        e.start_date,
        m.name AS manager_name,
        e.department,
        e.role
    FROM 
        public.employees e
        LEFT JOIN public.employees m ON e.manager_id = m.id
    WHERE 
        e.id = auth.uid();
END;
$$;


ALTER FUNCTION "public"."get_employee_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_kudos_wall"() RETURNS TABLE("id" bigint, "giver_name" "text", "receiver_name" "text", "comment" "text", "core_value" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        k.id,
        g.name as giver_name,    -- Using existing schema field
        r.name as receiver_name, -- Using existing schema field
        k.comment,
        k.core_value,
        k.created_at
    FROM 
        public.kudos k
    JOIN 
        public.employees g ON k.giver_id = g.id
    JOIN 
        public.employees r ON k.receiver_id = r.id
    ORDER BY 
        k.created_at DESC
    LIMIT 100;
END;
$$;


ALTER FUNCTION "public"."get_kudos_wall"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_assessments"() RETURNS TABLE("assessment_id" bigint, "cycle_name" "text", "status" "text", "self_assessment_status" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_employee_id bigint;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_employee_id
    FROM public.employees
    WHERE user_id = auth.uid();

    RETURN QUERY
    SELECT 
        a.id AS assessment_id,
        rc.name AS cycle_name,
        a.status,
        a.self_assessment_status,
        a.created_at,
        a.updated_at
    FROM 
        public.assessments a
        INNER JOIN public.review_cycles rc ON a.review_cycle_id = rc.id
    WHERE 
        a.employee_id = v_employee_id
    ORDER BY 
        a.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_my_assessments"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_assessments"("dummy_param" integer DEFAULT 0) RETURNS TABLE("assessment_id" bigint, "review_cycle_name" "text", "review_cycle_status" "text", "assessment_status" "text", "submitted_at" timestamp with time zone)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT
    a.id AS assessment_id,
    rc.name AS review_cycle_name,
    rc.status AS review_cycle_status,
    a.status AS assessment_status,
    a.submitted_by_employee_at AS submitted_at
  FROM
    public.assessments a
  JOIN
    public.employees e ON a.employee_id = e.id
  JOIN
    public.review_cycles rc ON a.review_cycle_id = rc.id
  WHERE
    e.user_id = auth.uid()
  ORDER BY
    rc.start_date DESC;
$$;


ALTER FUNCTION "public"."get_my_assessments"("dummy_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_development_goals"() RETURNS TABLE("goal_id" bigint, "goal_type" "text", "title" "text", "description" "text", "target_date" "date", "status" "text", "priority" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id AS goal_id,
        g.goal_type,
        g.title,
        g.description,
        g.target_date,
        g.status,
        g.priority,
        g.created_at,
        g.updated_at
    FROM 
        public.employee_development_goals g
    WHERE 
        g.employee_id = auth.uid()
    ORDER BY 
        g.priority DESC, g.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_my_development_goals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_name"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_full_name text;
BEGIN
    SELECT 
        COALESCE(e.name, 'Unknown User') 
    INTO 
        user_full_name
    FROM 
        public.employees e
    WHERE 
        e.user_id = auth.uid();

    IF user_full_name IS NULL THEN
        user_full_name := 'Unknown User';
    END IF;

    RETURN user_full_name;
END;
$$;


ALTER FUNCTION "public"."get_my_name"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_profile"() RETURNS TABLE("full_name" "text", "email" "text", "job_title" "text", "manager_name" "text", "start_date" timestamp with time zone, "department" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.name AS full_name,
        e.email,
        e.job_title,
        COALESCE(m.name, 'No Manager') AS manager_name,
        e.created_at AS start_date,
        COALESCE(e.role, 'employee') AS department
    FROM 
        public.employees e
    LEFT JOIN 
        public.employees m ON e.manager_id = m.id
    WHERE 
        e.user_id = auth.uid();
END;
$$;


ALTER FUNCTION "public"."get_my_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_role text;
BEGIN
    SELECT 
        COALESCE(e.role, 'employee') 
    INTO 
        user_role
    FROM 
        public.employees e
    WHERE 
        e.user_id = auth.uid();

    IF user_role IS NULL THEN
        user_role := 'employee';
    END IF;

    RETURN user_role;
END;
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_team"() RETURNS TABLE("id" "uuid", "name" "text", "email" "text", "job_title" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select
    e.id,
    e.name,
    e.email,
    e.job_title
  from
    employees e
  where
    e.manager_id = (select id from employees where user_id = auth.uid());
$$;


ALTER FUNCTION "public"."get_my_team"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_training_requests"() RETURNS TABLE("request_id" bigint, "request_type" "text", "title" "text", "description" "text", "provider" "text", "estimated_cost" numeric, "preferred_date" "date", "business_justification" "text", "status" "text", "manager_notes" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tr.id AS request_id,
        tr.request_type,
        tr.title,
        tr.description,
        tr.provider,
        tr.estimated_cost,
        tr.preferred_date,
        tr.business_justification,
        tr.status,
        tr.manager_notes,
        tr.created_at
    FROM 
        public.training_requests tr
    WHERE 
        tr.employee_id = auth.uid()
    ORDER BY 
        tr.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_my_training_requests"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_team_development_goals"() RETURNS TABLE("goal_id" bigint, "employee_id" "uuid", "employee_name" "text", "goal_type" "text", "title" "text", "description" "text", "target_date" "date", "status" "text", "priority" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "days_until_target" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_user_role text;
    v_manager_id uuid;
BEGIN
    -- Get current user info
    SELECT id, role INTO v_manager_id, current_user_role
    FROM public.employees
    WHERE id = auth.uid();

    IF current_user_role NOT IN ('manager', 'admin') THEN
        RAISE EXCEPTION 'Access denied. Only managers and admins can view team development goals.';
    END IF;

    RETURN QUERY
    SELECT 
        g.id AS goal_id,
        g.employee_id,
        e.name AS employee_name,
        g.goal_type,
        g.title,
        g.description,
        g.target_date,
        g.status,
        g.priority,
        g.created_at,
        g.updated_at,
        CASE 
            WHEN g.target_date IS NOT NULL 
            THEN (g.target_date - CURRENT_DATE)::integer
            ELSE NULL 
        END AS days_until_target
    FROM 
        public.employee_development_goals g
        INNER JOIN public.employees e ON g.employee_id = e.id
    WHERE 
        (current_user_role = 'admin' OR e.manager_id = v_manager_id)
        AND g.status = 'active'
    ORDER BY 
        e.name, 
        CASE g.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
        g.target_date ASC NULLS LAST;
END;
$$;


ALTER FUNCTION "public"."get_team_development_goals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_team_development_messages"() RETURNS TABLE("message_id" bigint, "from_employee_id" "uuid", "to_employee_id" "uuid", "from_name" "text", "to_name" "text", "subject" "text", "message" "text", "message_type" "text", "read_at" timestamp with time zone, "created_at" timestamp with time zone, "is_from_me" boolean, "requires_response" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_user_role text;
    v_manager_id uuid;
BEGIN
    -- Get current user info
    SELECT id, role INTO v_manager_id, current_user_role
    FROM public.employees
    WHERE id = auth.uid();

    IF current_user_role NOT IN ('manager', 'admin') THEN
        RAISE EXCEPTION 'Access denied. Only managers and admins can view team messages.';
    END IF;

    RETURN QUERY
    SELECT 
        m.id AS message_id,
        m.from_employee_id,
        m.to_employee_id,
        from_emp.name AS from_name,
        to_emp.name AS to_name,
        m.subject,
        m.message,
        m.message_type,
        m.read_at,
        m.created_at,
        (m.from_employee_id = v_manager_id) AS is_from_me,
        (m.to_employee_id = v_manager_id AND m.read_at IS NULL) AS requires_response
    FROM 
        public.manager_employee_messages m
        INNER JOIN public.employees from_emp ON m.from_employee_id = from_emp.id
        INNER JOIN public.employees to_emp ON m.to_employee_id = to_emp.id
    WHERE 
        (current_user_role = 'admin') OR
        (m.from_employee_id = v_manager_id OR m.to_employee_id = v_manager_id) OR
        (from_emp.manager_id = v_manager_id OR to_emp.manager_id = v_manager_id)
    ORDER BY 
        CASE WHEN m.to_employee_id = v_manager_id AND m.read_at IS NULL THEN 0 ELSE 1 END,
        m.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_team_development_messages"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_team_development_summary"() RETURNS TABLE("total_team_members" integer, "active_goals" integer, "pending_training_requests" integer, "unread_messages" integer, "upcoming_goal_deadlines" integer, "total_training_budget_requested" numeric, "team_development_score" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_user_role text;
    v_manager_id uuid;
BEGIN
    -- Get current user info
    SELECT id, role INTO v_manager_id, current_user_role
    FROM public.employees
    WHERE id = auth.uid();

    IF current_user_role NOT IN ('manager', 'admin') THEN
        RAISE EXCEPTION 'Access denied. Only managers and admins can view team summary.';
    END IF;

    RETURN QUERY
    SELECT 
        -- Total team members
        (SELECT COUNT(*)::integer 
         FROM public.employees e 
         WHERE (current_user_role = 'admin' OR e.manager_id = v_manager_id)) AS total_team_members,
        
        -- Active development goals
        (SELECT COUNT(*)::integer 
         FROM public.employee_development_goals g
         INNER JOIN public.employees e ON g.employee_id = e.id
         WHERE (current_user_role = 'admin' OR e.manager_id = v_manager_id)
         AND g.status = 'active') AS active_goals,
        
        -- Pending training requests
        (SELECT COUNT(*)::integer 
         FROM public.training_requests tr
         INNER JOIN public.employees e ON tr.employee_id = e.id
         WHERE (current_user_role = 'admin' OR e.manager_id = v_manager_id)
         AND tr.status = 'requested') AS pending_training_requests,
        
        -- Unread messages
        (SELECT COUNT(*)::integer 
         FROM public.manager_employee_messages m
         INNER JOIN public.employees e ON m.from_employee_id = e.id
         WHERE m.to_employee_id = v_manager_id 
         AND m.read_at IS NULL) AS unread_messages,
        
        -- Goals with deadlines in next 30 days
        (SELECT COUNT(*)::integer 
         FROM public.employee_development_goals g
         INNER JOIN public.employees e ON g.employee_id = e.id
         WHERE (current_user_role = 'admin' OR e.manager_id = v_manager_id)
         AND g.status = 'active'
         AND g.target_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') AS upcoming_goal_deadlines,
        
        -- Total training budget requested
        (SELECT COALESCE(SUM(tr.estimated_cost), 0)
         FROM public.training_requests tr
         INNER JOIN public.employees e ON tr.employee_id = e.id
         WHERE (current_user_role = 'admin' OR e.manager_id = v_manager_id)
         AND tr.status IN ('requested', 'approved')
         AND tr.created_at >= DATE_TRUNC('year', CURRENT_DATE)) AS total_training_budget_requested,
        
        -- Team development score (goals per employee * 10)
        (SELECT CASE 
            WHEN COUNT(DISTINCT e.id) > 0 
            THEN LEAST(10.0, (COUNT(g.id)::decimal / COUNT(DISTINCT e.id)::decimal) * 2.5)
            ELSE 0.0 
         END
         FROM public.employees e
         LEFT JOIN public.employee_development_goals g ON e.id = g.employee_id AND g.status = 'active'
         WHERE (current_user_role = 'admin' OR e.manager_id = v_manager_id)) AS team_development_score;
END;
$$;


ALTER FUNCTION "public"."get_team_development_summary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_team_status"() RETURNS TABLE("employee_id" "uuid", "employee_name" "text", "job_title" "text", "assessment_status" "text", "assessment_id" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    manager_employee_id uuid;
BEGIN
    -- Get the current user's employee ID
    SELECT id INTO manager_employee_id 
    FROM public.employees 
    WHERE user_id = auth.uid();

    -- Validate manager exists
    IF manager_employee_id IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    RETURN QUERY
    SELECT 
        e.id AS employee_id,
        e.name AS employee_name,  -- Using existing schema field
        e.job_title,
        COALESCE(a.status, 'not_started') AS assessment_status,
        a.id AS assessment_id
    FROM 
        public.employees e
    LEFT JOIN 
        public.assessments a ON e.id = a.employee_id
        AND a.review_cycle_id = (
            SELECT id FROM public.review_cycles 
            WHERE status = 'active' 
            ORDER BY start_date DESC 
            LIMIT 1
        )
    WHERE 
        e.manager_id = manager_employee_id
    ORDER BY 
        e.name;
END;
$$;


ALTER FUNCTION "public"."get_team_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_team_training_requests"() RETURNS TABLE("request_id" bigint, "employee_id" "uuid", "employee_name" "text", "request_type" "text", "title" "text", "description" "text", "provider" "text", "estimated_cost" numeric, "preferred_date" "date", "business_justification" "text", "status" "text", "manager_notes" "text", "created_at" timestamp with time zone, "days_since_request" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_user_role text;
    v_manager_id uuid;
BEGIN
    -- Get current user info
    SELECT id, role INTO v_manager_id, current_user_role
    FROM public.employees
    WHERE id = auth.uid();

    IF current_user_role NOT IN ('manager', 'admin') THEN
        RAISE EXCEPTION 'Access denied. Only managers and admins can view team training requests.';
    END IF;

    RETURN QUERY
    SELECT 
        tr.id AS request_id,
        tr.employee_id,
        e.name AS employee_name,
        tr.request_type,
        tr.title,
        tr.description,
        tr.provider,
        tr.estimated_cost,
        tr.preferred_date,
        tr.business_justification,
        tr.status,
        tr.manager_notes,
        tr.created_at,
        (CURRENT_DATE - tr.created_at::date)::integer AS days_since_request
    FROM 
        public.training_requests tr
        INNER JOIN public.employees e ON tr.employee_id = e.id
    WHERE 
        (current_user_role = 'admin' OR e.manager_id = v_manager_id)
    ORDER BY 
        CASE tr.status 
            WHEN 'requested' THEN 1 
            WHEN 'approved' THEN 2 
            WHEN 'denied' THEN 3 
            ELSE 4 
        END,
        tr.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_team_training_requests"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."give_kudo"("p_receiver_id" "uuid", "p_core_value" "text", "p_comment" "text") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    giver_employee_id uuid;
    receiver_employee_id uuid;
    new_kudo_id bigint;
BEGIN
    -- Get the giver's employee ID
    SELECT id INTO giver_employee_id 
    FROM public.employees 
    WHERE user_id = auth.uid();

    -- The receiver ID should be the employee ID directly
    receiver_employee_id := p_receiver_id;

    -- Validate inputs
    IF giver_employee_id IS NULL THEN
        RAISE EXCEPTION 'Giver not found';
    END IF;

    -- Verify receiver exists
    IF NOT EXISTS (SELECT 1 FROM public.employees WHERE id = receiver_employee_id) THEN
        RAISE EXCEPTION 'Receiver not found';
    END IF;

    -- Insert the kudo using schema field names
    INSERT INTO public.kudos (
        giver_id, 
        receiver_id, 
        core_value,
        comment,
        created_at
    ) VALUES (
        giver_employee_id, 
        receiver_employee_id, 
        p_core_value,
        p_comment,
        NOW()
    ) RETURNING id INTO new_kudo_id;

    RETURN new_kudo_id;
END;
$$;


ALTER FUNCTION "public"."give_kudo"("p_receiver_id" "uuid", "p_core_value" "text", "p_comment" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reply_to_development_message"("p_original_message_id" bigint, "p_subject" "text", "p_message" "text", "p_message_type" "text" DEFAULT 'development'::"text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_user_role text;
    v_manager_id uuid;
    v_manager_name text;
    v_original_from_id uuid;
    v_original_to_id uuid;
    v_recipient_id uuid;
    v_message_id bigint;
    result json;
BEGIN
    -- Get current user info
    SELECT id, role, name INTO v_manager_id, current_user_role, v_manager_name
    FROM public.employees
    WHERE id = auth.uid();

    IF current_user_role NOT IN ('manager', 'admin') THEN
        RAISE EXCEPTION 'Access denied. Only managers and admins can reply to messages.';
    END IF;

    -- Get original message details
    SELECT from_employee_id, to_employee_id 
    INTO v_original_from_id, v_original_to_id
    FROM public.manager_employee_messages
    WHERE id = p_original_message_id;

    IF v_original_from_id IS NULL THEN
        RAISE EXCEPTION 'Original message not found.';
    END IF;

    -- Determine recipient (reply to sender)
    IF v_original_from_id = v_manager_id THEN
        v_recipient_id := v_original_to_id;
    ELSE
        v_recipient_id := v_original_from_id;
    END IF;

    -- Mark original message as read
    UPDATE public.manager_employee_messages
    SET read_at = CASE WHEN read_at IS NULL THEN now() ELSE read_at END
    WHERE id = p_original_message_id AND to_employee_id = v_manager_id;

    -- Insert reply
    INSERT INTO public.manager_employee_messages (
        from_employee_id,
        to_employee_id,
        subject,
        message,
        message_type
    ) VALUES (
        v_manager_id,
        v_recipient_id,
        p_subject,
        p_message,
        p_message_type
    ) RETURNING id INTO v_message_id;

    SELECT json_build_object(
        'success', true,
        'message_id', v_message_id,
        'message', 'Reply sent successfully.'
    ) INTO result;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."reply_to_development_message"("p_original_message_id" bigint, "p_subject" "text", "p_message" "text", "p_message_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_message_to_manager"("p_subject" "text", "p_message" "text", "p_message_type" "text" DEFAULT 'development'::"text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_employee_id uuid;
    v_manager_id uuid;
    v_employee_name text;
    v_message_id bigint;
    result json;
BEGIN
    -- Get current user's employee info
    SELECT id, name, manager_id INTO v_employee_id, v_employee_name, v_manager_id
    FROM public.employees
    WHERE id = auth.uid();

    IF v_employee_id IS NULL THEN
        RAISE EXCEPTION 'Employee record not found';
    END IF;

    IF v_manager_id IS NULL THEN
        RAISE EXCEPTION 'No manager assigned to send message to';
    END IF;

    -- Validate required fields
    IF p_subject IS NULL OR trim(p_subject) = '' THEN
        RAISE EXCEPTION 'Message subject is required';
    END IF;

    IF p_message IS NULL OR trim(p_message) = '' THEN
        RAISE EXCEPTION 'Message content is required';
    END IF;

    -- Insert the message
    INSERT INTO public.manager_employee_messages (
        from_employee_id,
        to_employee_id,
        subject,
        message,
        message_type
    ) VALUES (
        v_employee_id,
        v_manager_id,
        p_subject,
        p_message,
        p_message_type
    ) RETURNING id INTO v_message_id;

    SELECT json_build_object(
        'success', true,
        'message_id', v_message_id,
        'message', 'Message sent successfully to your manager.'
    ) INTO result;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."send_message_to_manager"("p_subject" "text", "p_message" "text", "p_message_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."start_review_cycle_for_my_team"("cycle_id_to_start" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  manager_employee_id uuid;
  team_member record;
begin
  -- Get the employee.id of the currently authenticated user (the manager)
  select id into manager_employee_id from public.employees where user_id = auth.uid();

  -- Check if the manager exists
  if manager_employee_id is null then
    raise exception 'Manager not found for the current user.';
  end if;

  -- Loop through each direct report of the manager
  for team_member in
    select id from public.employees where manager_id = manager_employee_id
  loop
    -- Insert a new assessment for each team member for the specified cycle
    insert into public.assessments (employee_id, review_cycle_id, status)
    values (team_member.id, cycle_id_to_start, 'not_started');
  end loop;

  -- Optional: Update the status of the review cycle itself to 'active'
  update public.review_cycles
  set status = 'active'
  where id = cycle_id_to_start;

end;
$$;


ALTER FUNCTION "public"."start_review_cycle_for_my_team"("cycle_id_to_start" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_manager_review"("p_assessment_id" bigint) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_user_role text;
    v_manager_id uuid;
    v_manager_name text;
    v_employee_id uuid;
    v_employee_name text;
    v_assessment_employee_id uuid;
    result json;
BEGIN
    -- Get current user info
    SELECT id, role, name INTO v_manager_id, current_user_role, v_manager_name
    FROM public.employees
    WHERE id = auth.uid();

    IF current_user_role NOT IN ('manager', 'admin') THEN
        RAISE EXCEPTION 'Access denied. Only managers and admins can submit manager reviews.';
    END IF;

    -- Get assessment details
    SELECT employee_id INTO v_assessment_employee_id
    FROM public.assessments
    WHERE id = p_assessment_id;

    IF v_assessment_employee_id IS NULL THEN
        RAISE EXCEPTION 'Assessment not found.';
    END IF;

    -- Get employee info
    SELECT name, manager_id INTO v_employee_name, v_employee_id
    FROM public.employees
    WHERE id = v_assessment_employee_id;

    -- Check if manager has authority (unless admin)
    IF current_user_role != 'admin' AND v_employee_id != v_manager_id THEN
        RAISE EXCEPTION 'Access denied. You can only submit reviews for your direct reports.';
    END IF;

    -- Update assessment status to finalized
    UPDATE public.assessments
    SET 
        status = 'finalized',
        self_assessment_status = 'finalized',
        manager_review_submitted_at = now(),
        updated_at = now()
    WHERE 
        id = p_assessment_id;

    -- Send notification to employee
    INSERT INTO public.manager_employee_messages (
        from_employee_id,
        to_employee_id,
        subject,
        message,
        message_type
    ) VALUES (
        v_manager_id,
        v_assessment_employee_id,
        'Performance Review Completed',
        'Your performance review has been completed by ' || v_manager_name || '. Please check your assessment to view the feedback.',
        'development'
    );

    SELECT json_build_object(
        'success', true,
        'message', 'Manager review submitted successfully and ' || v_employee_name || ' has been notified.',
        'assessment_id', p_assessment_id,
        'status', 'finalized'
    ) INTO result;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."submit_manager_review"("p_assessment_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_self_assessment"("p_assessment_id" bigint) RETURNS json
    LANGUAGE "plpgsql"
    AS $$DECLARE
    v_employee_id uuid;
    v_assessment_status text;
    result json;
BEGIN
    -- Get the employee ID for the currently authenticated user
    SELECT id INTO v_employee_id
    FROM public.employees
    WHERE user_id = auth.uid();

    -- Security Check: Verify that the assessment exists and belongs to this employee
    SELECT self_assessment_status INTO v_assessment_status
    FROM public.assessments
    WHERE id = p_assessment_id AND employee_id = v_employee_id;

    -- If no assessment is found, or it doesn't belong to them, raise an error
    IF v_assessment_status IS NULL THEN
        RAISE EXCEPTION 'Assessment not found or permission denied.';
    END IF;

    -- Check if the assessment is in a state that allows submission
    IF v_assessment_status NOT IN ('not_started', 'in_progress') THEN
        RAISE EXCEPTION 'This assessment has already been submitted or is not in a submittable state.';
    END IF;

    -- Update the assessment status
    UPDATE public.assessments
    SET
        self_assessment_status = 'employee_complete',
        self_assessment_submitted_at = now(),
        updated_at = now()
    WHERE id = p_assessment_id;

    -- FUTURE STEP: Add a notification to the manager here (e.g., in manager_employee_messages)

    -- Return a success message
    SELECT json_build_object(
        'success', true,
        'message', 'Self-assessment submitted successfully. Your manager has been notified.',
        'assessment_id', p_assessment_id,
        'new_status', 'employee_complete'
    ) INTO result;

    RETURN result;
END;$$;


ALTER FUNCTION "public"."submit_self_assessment"("p_assessment_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_training_request"("p_request_type" "text", "p_title" "text", "p_description" "text" DEFAULT NULL::"text", "p_provider" "text" DEFAULT NULL::"text", "p_estimated_cost" numeric DEFAULT NULL::numeric, "p_preferred_date" "date" DEFAULT NULL::"date", "p_business_justification" "text" DEFAULT NULL::"text") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_employee_id uuid;
    v_request_id bigint;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_employee_id FROM public.employees WHERE id = auth.uid();

    IF v_employee_id IS NULL THEN
        RAISE EXCEPTION 'Employee record not found';
    END IF;

    -- Validate required fields
    IF p_title IS NULL OR trim(p_title) = '' THEN
        RAISE EXCEPTION 'Training title is required';
    END IF;

    INSERT INTO public.training_requests (
        employee_id, request_type, title, description, provider, 
        estimated_cost, preferred_date, business_justification
    ) VALUES (
        v_employee_id, p_request_type, p_title, p_description, p_provider,
        p_estimated_cost, p_preferred_date, p_business_justification
    ) RETURNING id INTO v_request_id;

    RETURN v_request_id;
END;
$$;


ALTER FUNCTION "public"."submit_training_request"("p_request_type" "text", "p_title" "text", "p_description" "text", "p_provider" "text", "p_estimated_cost" numeric, "p_preferred_date" "date", "p_business_justification" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_my_development_goals"("p_career_goals" "text", "p_development_interests" "text", "p_training_requests" "text", "p_stretch_goals" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    employee_id uuid;
BEGIN
    -- Get employee ID
    SELECT id INTO employee_id
    FROM public.employees
    WHERE user_id = auth.uid();

    IF employee_id IS NULL THEN
        RAISE EXCEPTION 'Employee not found';
    END IF;

    -- Ensure columns exist
    BEGIN
        ALTER TABLE public.employees 
        ADD COLUMN IF NOT EXISTS career_goals text,
        ADD COLUMN IF NOT EXISTS development_interests text,
        ADD COLUMN IF NOT EXISTS training_requests text,
        ADD COLUMN IF NOT EXISTS stretch_goals text,
        ADD COLUMN IF NOT EXISTS goals_updated_at timestamp with time zone;
    EXCEPTION WHEN OTHERS THEN
        -- Columns might already exist, continue
    END;

    -- Update employee goals
    UPDATE public.employees
    SET 
        career_goals = p_career_goals,
        development_interests = p_development_interests,
        training_requests = p_training_requests,
        stretch_goals = p_stretch_goals,
        goals_updated_at = NOW()
    WHERE id = employee_id;

    RETURN true;
END;
$$;


ALTER FUNCTION "public"."update_my_development_goals"("p_career_goals" "text", "p_development_interests" "text", "p_training_requests" "text", "p_stretch_goals" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_training_request_status"("p_request_id" bigint, "p_status" "text", "p_manager_notes" "text" DEFAULT NULL::"text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_user_role text;
    v_manager_id uuid;
    v_manager_name text;
    v_employee_id uuid;
    v_employee_name text;
    v_training_title text;
    v_request_employee_id uuid;
    result json;
BEGIN
    -- Get current user info
    SELECT id, role, name INTO v_manager_id, current_user_role, v_manager_name
    FROM public.employees
    WHERE id = auth.uid();

    IF current_user_role NOT IN ('manager', 'admin') THEN
        RAISE EXCEPTION 'Access denied. Only managers and admins can update training requests.';
    END IF;

    -- Validate status
    IF p_status NOT IN ('requested', 'approved', 'denied', 'completed') THEN
        RAISE EXCEPTION 'Invalid status. Must be: requested, approved, denied, or completed.';
    END IF;

    -- Get the request details
    SELECT tr.employee_id, tr.title, e.name
    INTO v_request_employee_id, v_training_title, v_employee_name
    FROM public.training_requests tr
    INNER JOIN public.employees e ON tr.employee_id = e.id
    WHERE tr.id = p_request_id;

    IF v_request_employee_id IS NULL THEN
        RAISE EXCEPTION 'Training request not found.';
    END IF;

    -- Check if manager has authority over this employee (unless admin)
    IF current_user_role != 'admin' THEN
        SELECT manager_id INTO v_employee_id
        FROM public.employees
        WHERE id = v_request_employee_id;

        IF v_employee_id != v_manager_id THEN
            RAISE EXCEPTION 'Access denied. You can only update requests from your direct reports.';
        END IF;
    END IF;

    -- Update the request
    UPDATE public.training_requests
    SET 
        status = p_status,
        manager_notes = COALESCE(p_manager_notes, manager_notes),
        approved_by = CASE WHEN p_status = 'approved' THEN v_manager_id ELSE approved_by END,
        approved_at = CASE WHEN p_status = 'approved' THEN now() ELSE approved_at END,
        updated_at = now()
    WHERE 
        id = p_request_id;

    -- Send notification to employee
    INSERT INTO public.manager_employee_messages (
        from_employee_id,
        to_employee_id,
        subject,
        message,
        message_type
    ) VALUES (
        v_manager_id,
        v_request_employee_id,
        'Training Request ' || UPPER(LEFT(p_status, 1)) || SUBSTRING(p_status, 2),
        'Your training request "' || v_training_title || '" has been ' || p_status || '.' || 
        CASE WHEN p_manager_notes IS NOT NULL THEN ' Manager notes: ' || p_manager_notes ELSE '' END,
        'training_request'
    );

    SELECT json_build_object(
        'success', true,
        'request_id', p_request_id,
        'new_status', p_status,
        'employee_name', v_employee_name,
        'training_title', v_training_title,
        'message', 'Training request updated successfully and ' || v_employee_name || ' has been notified.'
    ) INTO result;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."update_training_request_status"("p_request_id" bigint, "p_status" "text", "p_manager_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_assessment_rock"("p_id" bigint, "p_assessment_id" bigint, "p_description" "text", "p_status" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF p_id IS NULL THEN
        -- Insert new rock
        INSERT INTO public.assessment_rocks (assessment_id, description, status)
        VALUES (p_assessment_id, p_description, p_status);
    ELSE
        -- Update existing rock
        UPDATE public.assessment_rocks
        SET
            description = p_description,
            status = p_status
        WHERE
            id = p_id
            -- Security check: ensure user owns the parent assessment
            AND assessment_id = (
                SELECT id FROM public.assessments
                WHERE id = p_assessment_id
                AND employee_id = (SELECT id FROM public.employees WHERE user_id = auth.uid())
            );
    END IF;
END;
$$;


ALTER FUNCTION "public"."upsert_assessment_rock"("p_id" bigint, "p_assessment_id" bigint, "p_description" "text", "p_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_assessment_scorecard"("p_id" bigint, "p_assessment_id" bigint, "p_metric_name" "text", "p_target" "text", "p_actual" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF p_id IS NULL THEN
        INSERT INTO public.assessment_scorecard_metrics (assessment_id, metric_name, target, actual)
        VALUES (p_assessment_id, p_metric_name, p_target, p_actual);
    ELSE
        UPDATE public.assessment_scorecard_metrics
        SET
            metric_name = p_metric_name,
            target = p_target,
            actual = p_actual
        WHERE
            id = p_id
            AND assessment_id = (
                SELECT id FROM public.assessments
                WHERE id = p_assessment_id
                AND employee_id = (SELECT id FROM public.employees WHERE user_id = auth.uid())
            );
    END IF;
END;
$$;


ALTER FUNCTION "public"."upsert_assessment_scorecard"("p_id" bigint, "p_assessment_id" bigint, "p_metric_name" "text", "p_target" "text", "p_actual" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_development_goal"("p_goal_id" bigint DEFAULT NULL::bigint, "p_goal_type" "text" DEFAULT 'skill_development'::"text", "p_title" "text" DEFAULT ''::"text", "p_description" "text" DEFAULT NULL::"text", "p_target_date" "date" DEFAULT NULL::"date", "p_status" "text" DEFAULT 'active'::"text", "p_priority" "text" DEFAULT 'medium'::"text") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_employee_id uuid;
    v_goal_id bigint;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_employee_id FROM public.employees WHERE id = auth.uid();

    IF v_employee_id IS NULL THEN
        RAISE EXCEPTION 'Employee record not found';
    END IF;

    -- Validate required fields
    IF p_title IS NULL OR trim(p_title) = '' THEN
        RAISE EXCEPTION 'Goal title is required';
    END IF;

    IF p_goal_id IS NULL THEN
        -- Insert new goal
        INSERT INTO public.employee_development_goals (
            employee_id, goal_type, title, description, target_date, status, priority
        ) VALUES (
            v_employee_id, p_goal_type, p_title, p_description, p_target_date, p_status, p_priority
        ) RETURNING id INTO v_goal_id;
    ELSE
        -- Update existing goal
        UPDATE public.employee_development_goals
        SET 
            goal_type = p_goal_type,
            title = p_title,
            description = p_description,
            target_date = p_target_date,
            status = p_status,
            priority = p_priority,
            updated_at = now()
        WHERE 
            id = p_goal_id 
            AND employee_id = v_employee_id
        RETURNING id INTO v_goal_id;

        IF v_goal_id IS NULL THEN
            RAISE EXCEPTION 'Goal not found or access denied';
        END IF;
    END IF;

    RETURN v_goal_id;
END;
$$;


ALTER FUNCTION "public"."upsert_development_goal"("p_goal_id" bigint, "p_goal_type" "text", "p_title" "text", "p_description" "text", "p_target_date" "date", "p_status" "text", "p_priority" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."assessment_core_value_responses" (
    "id" bigint NOT NULL,
    "assessment_id" bigint NOT NULL,
    "core_value_id" integer NOT NULL,
    "employee_examples" "text",
    "manager_rating" smallint
);


ALTER TABLE "public"."assessment_core_value_responses" OWNER TO "postgres";


ALTER TABLE "public"."assessment_core_value_responses" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."assessment_core_value_responses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."assessment_feedback" (
    "id" bigint NOT NULL,
    "assessment_id" bigint NOT NULL,
    "author_id" "uuid" NOT NULL,
    "comment_text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "assessment_feedback_comment_text_check" CHECK (("char_length"("comment_text") > 0))
);


ALTER TABLE "public"."assessment_feedback" OWNER TO "postgres";


ALTER TABLE "public"."assessment_feedback" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."assessment_feedback_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."assessment_gwc_responses" (
    "id" bigint NOT NULL,
    "assessment_id" bigint NOT NULL,
    "gwc_metric_id" integer NOT NULL,
    "manager_response" boolean,
    "manager_feedback" "text"
);


ALTER TABLE "public"."assessment_gwc_responses" OWNER TO "postgres";


ALTER TABLE "public"."assessment_gwc_responses" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."assessment_gwc_responses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."assessment_rocks" (
    "id" bigint NOT NULL,
    "assessment_id" bigint NOT NULL,
    "description" "text" NOT NULL,
    "status" "text" NOT NULL,
    "feedback" "text"
);


ALTER TABLE "public"."assessment_rocks" OWNER TO "postgres";


ALTER TABLE "public"."assessment_rocks" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."assessment_rocks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."assessment_scorecard_metrics" (
    "id" bigint NOT NULL,
    "assessment_id" bigint NOT NULL,
    "metric_name" "text" NOT NULL,
    "target" "text",
    "actual" "text",
    "status" "text"
);


ALTER TABLE "public"."assessment_scorecard_metrics" OWNER TO "postgres";


ALTER TABLE "public"."assessment_scorecard_metrics" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."assessment_scorecard_metrics_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."assessments" (
    "id" bigint NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "review_cycle_id" bigint NOT NULL,
    "status" "text" DEFAULT 'not_started'::"text" NOT NULL,
    "employee_strengths" "text",
    "employee_improvements" "text",
    "manager_summary_comments" "text",
    "manager_development_plan" "text",
    "submitted_by_employee_at" timestamp with time zone,
    "finalized_by_manager_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "self_assessment_status" "text" DEFAULT 'not_started'::"text",
    "self_assessment_submitted_at" timestamp with time zone,
    CONSTRAINT "assessments_self_assessment_status_check" CHECK (("self_assessment_status" = ANY (ARRAY['not_started'::"text", 'in_progress'::"text", 'employee_complete'::"text", 'manager_complete'::"text", 'finalized'::"text"])))
);


ALTER TABLE "public"."assessments" OWNER TO "postgres";


ALTER TABLE "public"."assessments" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."assessments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."company_rocks" (
    "id" bigint NOT NULL,
    "review_cycle_id" bigint NOT NULL,
    "description" "text" NOT NULL,
    "owner_name" "text",
    "target_date" "date",
    "status" "text" DEFAULT 'not_started'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."company_rocks" OWNER TO "postgres";


ALTER TABLE "public"."company_rocks" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."company_rocks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."core_values" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "public"."core_values" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."core_values_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."core_values_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."core_values_id_seq" OWNED BY "public"."core_values"."id";



CREATE TABLE IF NOT EXISTS "public"."employee_development_goals" (
    "id" bigint NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "goal_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "target_date" "date",
    "status" "text" DEFAULT 'active'::"text",
    "priority" "text" DEFAULT 'medium'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "employee_development_goals_goal_type_check" CHECK (("goal_type" = ANY (ARRAY['career_aspiration'::"text", 'skill_development'::"text", 'stretch_goal'::"text"]))),
    CONSTRAINT "employee_development_goals_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "employee_development_goals_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'completed'::"text", 'on_hold'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."employee_development_goals" OWNER TO "postgres";


ALTER TABLE "public"."employee_development_goals" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."employee_development_goals_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "job_title" "text",
    "manager_id" "uuid",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "role" "text" DEFAULT 'employee'::"text",
    "career_goals" "text",
    "development_interests" "text",
    "training_requests" "text",
    "stretch_goals" "text",
    "goals_updated_at" timestamp with time zone
);


ALTER TABLE "public"."employees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gwc_metrics" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "public"."gwc_metrics" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."gwc_metrics_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."gwc_metrics_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."gwc_metrics_id_seq" OWNED BY "public"."gwc_metrics"."id";



CREATE TABLE IF NOT EXISTS "public"."kudos" (
    "id" bigint NOT NULL,
    "giver_id" "uuid" NOT NULL,
    "receiver_id" "uuid" NOT NULL,
    "core_value" "text" NOT NULL,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."kudos" OWNER TO "postgres";


ALTER TABLE "public"."kudos" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."kudos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."manager_employee_messages" (
    "id" bigint NOT NULL,
    "from_employee_id" "uuid" NOT NULL,
    "to_employee_id" "uuid" NOT NULL,
    "subject" "text" NOT NULL,
    "message" "text" NOT NULL,
    "message_type" "text" DEFAULT 'development'::"text",
    "read_at" timestamp with time zone,
    "replied_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "manager_employee_messages_message_type_check" CHECK (("message_type" = ANY (ARRAY['development'::"text", 'goal_update'::"text", 'training_request'::"text", 'general'::"text"])))
);


ALTER TABLE "public"."manager_employee_messages" OWNER TO "postgres";


ALTER TABLE "public"."manager_employee_messages" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."manager_employee_messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."review_cycles" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "status" "text" DEFAULT 'upcoming'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."review_cycles" OWNER TO "postgres";


ALTER TABLE "public"."review_cycles" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."review_cycles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."training_requests" (
    "id" bigint NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "request_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "provider" "text",
    "estimated_cost" numeric(10,2),
    "preferred_date" "date",
    "business_justification" "text",
    "status" "text" DEFAULT 'requested'::"text",
    "manager_notes" "text",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "training_requests_request_type_check" CHECK (("request_type" = ANY (ARRAY['course'::"text", 'certification'::"text", 'conference'::"text", 'workshop'::"text", 'mentoring'::"text"]))),
    CONSTRAINT "training_requests_status_check" CHECK (("status" = ANY (ARRAY['requested'::"text", 'approved'::"text", 'denied'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."training_requests" OWNER TO "postgres";


ALTER TABLE "public"."training_requests" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."training_requests_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."core_values" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."core_values_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."gwc_metrics" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."gwc_metrics_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."assessment_core_value_responses"
    ADD CONSTRAINT "assessment_core_value_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessment_feedback"
    ADD CONSTRAINT "assessment_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessment_gwc_responses"
    ADD CONSTRAINT "assessment_gwc_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessment_rocks"
    ADD CONSTRAINT "assessment_rocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessment_scorecard_metrics"
    ADD CONSTRAINT "assessment_scorecard_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_rocks"
    ADD CONSTRAINT "company_rocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."core_values"
    ADD CONSTRAINT "core_values_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."core_values"
    ADD CONSTRAINT "core_values_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_development_goals"
    ADD CONSTRAINT "employee_development_goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."gwc_metrics"
    ADD CONSTRAINT "gwc_metrics_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."gwc_metrics"
    ADD CONSTRAINT "gwc_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kudos"
    ADD CONSTRAINT "kudos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."manager_employee_messages"
    ADD CONSTRAINT "manager_employee_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."review_cycles"
    ADD CONSTRAINT "review_cycles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_requests"
    ADD CONSTRAINT "training_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessment_core_value_responses"
    ADD CONSTRAINT "uq_assessment_core_value" UNIQUE ("assessment_id", "core_value_id");



ALTER TABLE ONLY "public"."assessment_gwc_responses"
    ADD CONSTRAINT "uq_assessment_gwc" UNIQUE ("assessment_id", "gwc_metric_id");



CREATE INDEX "idx_assessment_core_value_responses_assessment_id" ON "public"."assessment_core_value_responses" USING "btree" ("assessment_id");



CREATE INDEX "idx_assessment_feedback_assessment_id" ON "public"."assessment_feedback" USING "btree" ("assessment_id");



CREATE INDEX "idx_assessment_gwc_responses_assessment_id" ON "public"."assessment_gwc_responses" USING "btree" ("assessment_id");



CREATE INDEX "idx_assessments_employee_id" ON "public"."assessments" USING "btree" ("employee_id");



CREATE INDEX "idx_assessments_review_cycle_id" ON "public"."assessments" USING "btree" ("review_cycle_id");



CREATE INDEX "idx_assessments_self_status" ON "public"."assessments" USING "btree" ("employee_id", "self_assessment_status");



CREATE INDEX "idx_assessments_status" ON "public"."assessments" USING "btree" ("status");



CREATE INDEX "idx_development_goals_employee" ON "public"."employee_development_goals" USING "btree" ("employee_id", "status");



CREATE INDEX "idx_employees_manager_id" ON "public"."employees" USING "btree" ("manager_id");



CREATE INDEX "idx_goals_manager_status" ON "public"."employee_development_goals" USING "btree" ("status") WHERE ("status" = 'active'::"text");



CREATE INDEX "idx_kudos_receiver_id" ON "public"."kudos" USING "btree" ("receiver_id");



CREATE INDEX "idx_messages_from_employee" ON "public"."manager_employee_messages" USING "btree" ("from_employee_id");



CREATE INDEX "idx_messages_to_employee" ON "public"."manager_employee_messages" USING "btree" ("to_employee_id", "read_at");



CREATE INDEX "idx_messages_unread" ON "public"."manager_employee_messages" USING "btree" ("to_employee_id", "read_at") WHERE ("read_at" IS NULL);



CREATE INDEX "idx_review_cycles_status" ON "public"."review_cycles" USING "btree" ("status");



CREATE INDEX "idx_training_requests_employee" ON "public"."training_requests" USING "btree" ("employee_id", "status");



CREATE INDEX "idx_training_status_date" ON "public"."training_requests" USING "btree" ("status", "created_at");



ALTER TABLE ONLY "public"."assessment_core_value_responses"
    ADD CONSTRAINT "assessment_core_value_responses_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assessment_core_value_responses"
    ADD CONSTRAINT "assessment_core_value_responses_core_value_id_fkey" FOREIGN KEY ("core_value_id") REFERENCES "public"."core_values"("id");



ALTER TABLE ONLY "public"."assessment_feedback"
    ADD CONSTRAINT "assessment_feedback_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assessment_feedback"
    ADD CONSTRAINT "assessment_feedback_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assessment_gwc_responses"
    ADD CONSTRAINT "assessment_gwc_responses_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assessment_gwc_responses"
    ADD CONSTRAINT "assessment_gwc_responses_gwc_metric_id_fkey" FOREIGN KEY ("gwc_metric_id") REFERENCES "public"."gwc_metrics"("id");



ALTER TABLE ONLY "public"."assessment_rocks"
    ADD CONSTRAINT "assessment_rocks_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assessment_scorecard_metrics"
    ADD CONSTRAINT "assessment_scorecard_metrics_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_review_cycle_id_fkey" FOREIGN KEY ("review_cycle_id") REFERENCES "public"."review_cycles"("id");



ALTER TABLE ONLY "public"."company_rocks"
    ADD CONSTRAINT "company_rocks_review_cycle_id_fkey" FOREIGN KEY ("review_cycle_id") REFERENCES "public"."review_cycles"("id");



ALTER TABLE ONLY "public"."employee_development_goals"
    ADD CONSTRAINT "employee_development_goals_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."kudos"
    ADD CONSTRAINT "kudos_giver_id_fkey" FOREIGN KEY ("giver_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."kudos"
    ADD CONSTRAINT "kudos_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."manager_employee_messages"
    ADD CONSTRAINT "manager_employee_messages_from_employee_id_fkey" FOREIGN KEY ("from_employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."manager_employee_messages"
    ADD CONSTRAINT "manager_employee_messages_to_employee_id_fkey" FOREIGN KEY ("to_employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."training_requests"
    ADD CONSTRAINT "training_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."training_requests"
    ADD CONSTRAINT "training_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id");



CREATE POLICY "Admins can manage company rocks" ON "public"."company_rocks" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."user_id" = "auth"."uid"()) AND ("employees"."role" = 'admin'::"text")))));



CREATE POLICY "Allow all users to view kudos" ON "public"."kudos" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated read access on review_cycles" ON "public"."review_cycles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow employee to insert feedback on their own assessment" ON "public"."assessment_feedback" FOR INSERT WITH CHECK ((("author_id" = ( SELECT "employees"."id"
   FROM "public"."employees"
  WHERE ("employees"."user_id" = "auth"."uid"()))) AND ("auth"."uid"() = ( SELECT "employees"."user_id"
   FROM "public"."employees"
  WHERE ("employees"."id" = ( SELECT "assessments"."employee_id"
           FROM "public"."assessments"
          WHERE ("assessments"."id" = "assessment_feedback"."assessment_id")))))));



CREATE POLICY "Allow employee to view feedback on their own assessment" ON "public"."assessment_feedback" FOR SELECT USING (("auth"."uid"() = ( SELECT "employees"."user_id"
   FROM "public"."employees"
  WHERE ("employees"."id" = ( SELECT "assessments"."employee_id"
           FROM "public"."assessments"
          WHERE ("assessments"."id" = "assessment_feedback"."assessment_id"))))));



CREATE POLICY "Allow individual read access on assessments" ON "public"."assessments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "assessments"."employee_id") AND ("employees"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow individual read access on employees" ON "public"."employees" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow manager read access on assessments" ON "public"."assessments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "assessments"."employee_id") AND ("employees"."manager_id" = ( SELECT "employees_1"."id"
           FROM "public"."employees" "employees_1"
          WHERE ("employees_1"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Allow manager to view feedback on team's assessments" ON "public"."assessment_feedback" FOR SELECT USING (("auth"."uid"() IN ( SELECT "e_manager"."user_id"
   FROM (("public"."assessments" "a"
     JOIN "public"."employees" "e_subject" ON (("a"."employee_id" = "e_subject"."id")))
     JOIN "public"."employees" "e_manager" ON (("e_subject"."manager_id" = "e_manager"."id")))
  WHERE ("a"."id" = "assessment_feedback"."assessment_id"))));



CREATE POLICY "Allow users to give kudos" ON "public"."kudos" FOR INSERT WITH CHECK (("giver_id" = ( SELECT "employees"."id"
   FROM "public"."employees"
  WHERE ("employees"."user_id" = "auth"."uid"()))));



CREATE POLICY "Employees can update their own assessments." ON "public"."assessments" FOR UPDATE USING ((( SELECT "employees"."user_id"
   FROM "public"."employees"
  WHERE ("employees"."id" = "assessments"."employee_id")) = "auth"."uid"()));



CREATE POLICY "Employees can view their own assessments." ON "public"."assessments" FOR SELECT USING ((( SELECT "employees"."user_id"
   FROM "public"."employees"
  WHERE ("employees"."id" = "assessments"."employee_id")) = "auth"."uid"()));



CREATE POLICY "Managers and admins can view company rocks" ON "public"."company_rocks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."user_id" = "auth"."uid"()) AND ("employees"."role" = ANY (ARRAY['manager'::"text", 'admin'::"text"]))))));



CREATE POLICY "Users can create training requests" ON "public"."training_requests" FOR INSERT WITH CHECK (("employee_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own development goals" ON "public"."employee_development_goals" USING (("employee_id" = "auth"."uid"()));



CREATE POLICY "Users can send messages" ON "public"."manager_employee_messages" FOR INSERT WITH CHECK (("from_employee_id" = "auth"."uid"()));



CREATE POLICY "Users can update own training requests" ON "public"."training_requests" FOR UPDATE USING ((("employee_id" = "auth"."uid"()) OR (("employee_id" IN ( SELECT "e"."id"
   FROM "public"."employees" "e"
  WHERE ("e"."manager_id" = "auth"."uid"()))) AND (EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."role" = ANY (ARRAY['manager'::"text", 'admin'::"text"]))))))));



CREATE POLICY "Users can view messages" ON "public"."manager_employee_messages" FOR SELECT USING ((("from_employee_id" = "auth"."uid"()) OR ("to_employee_id" = "auth"."uid"())));



CREATE POLICY "Users can view own development goals" ON "public"."employee_development_goals" FOR SELECT USING ((("employee_id" = "auth"."uid"()) OR ("employee_id" IN ( SELECT "e"."id"
   FROM "public"."employees" "e"
  WHERE ("e"."manager_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can view training requests" ON "public"."training_requests" FOR SELECT USING ((("employee_id" = "auth"."uid"()) OR ("employee_id" IN ( SELECT "e"."id"
   FROM "public"."employees" "e"
  WHERE ("e"."manager_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."role" = 'admin'::"text"))))));



ALTER TABLE "public"."assessment_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assessment_rocks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assessment_scorecard_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_rocks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_development_goals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kudos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."manager_employee_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."review_cycles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."training_requests" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."activate_review_cycle"("p_cycle_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."activate_review_cycle"("p_cycle_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."activate_review_cycle"("p_cycle_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."add_assessment_feedback"("p_assessment_id" bigint, "p_comment_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_assessment_feedback"("p_assessment_id" bigint, "p_comment_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_assessment_feedback"("p_assessment_id" bigint, "p_comment_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_review_cycle"("p_cycle_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."complete_review_cycle"("p_cycle_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_review_cycle"("p_cycle_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_review_cycle_with_rocks"("p_cycle_name" "text", "p_start_date" "date", "p_end_date" "date", "p_cycle_type" "text", "p_rocks" json) TO "anon";
GRANT ALL ON FUNCTION "public"."create_review_cycle_with_rocks"("p_cycle_name" "text", "p_start_date" "date", "p_end_date" "date", "p_cycle_type" "text", "p_rocks" json) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_review_cycle_with_rocks"("p_cycle_name" "text", "p_start_date" "date", "p_end_date" "date", "p_cycle_type" "text", "p_rocks" json) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_development_goal"("p_goal_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."delete_development_goal"("p_goal_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_development_goal"("p_goal_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_employees"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_employees"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_employees"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_employees_with_managers"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_employees_with_managers"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_employees_with_managers"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_my_assessments"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_my_assessments"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_my_assessments"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_review_cycles_with_details"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_review_cycles_with_details"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_review_cycles_with_details"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_assessment_details"("p_assessment_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_assessment_details"("p_assessment_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_assessment_details"("p_assessment_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_assessment_feedback"("p_assessment_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_assessment_feedback"("p_assessment_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_assessment_feedback"("p_assessment_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_company_rocks"("p_cycle_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_company_rocks"("p_cycle_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_company_rocks"("p_cycle_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_development_messages"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_development_messages"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_development_messages"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_employee_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_employee_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_employee_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_kudos_wall"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_kudos_wall"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_kudos_wall"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_assessments"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_assessments"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_assessments"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_assessments"("dummy_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_assessments"("dummy_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_assessments"("dummy_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_development_goals"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_development_goals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_development_goals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_name"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_name"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_name"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_team"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_team"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_team"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_training_requests"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_training_requests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_training_requests"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_team_development_goals"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_team_development_goals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_team_development_goals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_team_development_messages"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_team_development_messages"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_team_development_messages"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_team_development_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_team_development_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_team_development_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_team_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_team_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_team_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_team_training_requests"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_team_training_requests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_team_training_requests"() TO "service_role";



GRANT ALL ON FUNCTION "public"."give_kudo"("p_receiver_id" "uuid", "p_core_value" "text", "p_comment" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."give_kudo"("p_receiver_id" "uuid", "p_core_value" "text", "p_comment" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."give_kudo"("p_receiver_id" "uuid", "p_core_value" "text", "p_comment" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."reply_to_development_message"("p_original_message_id" bigint, "p_subject" "text", "p_message" "text", "p_message_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."reply_to_development_message"("p_original_message_id" bigint, "p_subject" "text", "p_message" "text", "p_message_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reply_to_development_message"("p_original_message_id" bigint, "p_subject" "text", "p_message" "text", "p_message_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."send_message_to_manager"("p_subject" "text", "p_message" "text", "p_message_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."send_message_to_manager"("p_subject" "text", "p_message" "text", "p_message_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_message_to_manager"("p_subject" "text", "p_message" "text", "p_message_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."start_review_cycle_for_my_team"("cycle_id_to_start" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."start_review_cycle_for_my_team"("cycle_id_to_start" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."start_review_cycle_for_my_team"("cycle_id_to_start" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_manager_review"("p_assessment_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."submit_manager_review"("p_assessment_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_manager_review"("p_assessment_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_self_assessment"("p_assessment_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."submit_self_assessment"("p_assessment_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_self_assessment"("p_assessment_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_training_request"("p_request_type" "text", "p_title" "text", "p_description" "text", "p_provider" "text", "p_estimated_cost" numeric, "p_preferred_date" "date", "p_business_justification" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_training_request"("p_request_type" "text", "p_title" "text", "p_description" "text", "p_provider" "text", "p_estimated_cost" numeric, "p_preferred_date" "date", "p_business_justification" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_training_request"("p_request_type" "text", "p_title" "text", "p_description" "text", "p_provider" "text", "p_estimated_cost" numeric, "p_preferred_date" "date", "p_business_justification" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_my_development_goals"("p_career_goals" "text", "p_development_interests" "text", "p_training_requests" "text", "p_stretch_goals" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_my_development_goals"("p_career_goals" "text", "p_development_interests" "text", "p_training_requests" "text", "p_stretch_goals" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_my_development_goals"("p_career_goals" "text", "p_development_interests" "text", "p_training_requests" "text", "p_stretch_goals" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_training_request_status"("p_request_id" bigint, "p_status" "text", "p_manager_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_training_request_status"("p_request_id" bigint, "p_status" "text", "p_manager_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_training_request_status"("p_request_id" bigint, "p_status" "text", "p_manager_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_assessment_rock"("p_id" bigint, "p_assessment_id" bigint, "p_description" "text", "p_status" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_assessment_rock"("p_id" bigint, "p_assessment_id" bigint, "p_description" "text", "p_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_assessment_rock"("p_id" bigint, "p_assessment_id" bigint, "p_description" "text", "p_status" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_assessment_scorecard"("p_id" bigint, "p_assessment_id" bigint, "p_metric_name" "text", "p_target" "text", "p_actual" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_assessment_scorecard"("p_id" bigint, "p_assessment_id" bigint, "p_metric_name" "text", "p_target" "text", "p_actual" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_assessment_scorecard"("p_id" bigint, "p_assessment_id" bigint, "p_metric_name" "text", "p_target" "text", "p_actual" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_development_goal"("p_goal_id" bigint, "p_goal_type" "text", "p_title" "text", "p_description" "text", "p_target_date" "date", "p_status" "text", "p_priority" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_development_goal"("p_goal_id" bigint, "p_goal_type" "text", "p_title" "text", "p_description" "text", "p_target_date" "date", "p_status" "text", "p_priority" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_development_goal"("p_goal_id" bigint, "p_goal_type" "text", "p_title" "text", "p_description" "text", "p_target_date" "date", "p_status" "text", "p_priority" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."assessment_core_value_responses" TO "anon";
GRANT ALL ON TABLE "public"."assessment_core_value_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."assessment_core_value_responses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."assessment_core_value_responses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."assessment_core_value_responses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."assessment_core_value_responses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."assessment_feedback" TO "anon";
GRANT ALL ON TABLE "public"."assessment_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."assessment_feedback" TO "service_role";



GRANT ALL ON SEQUENCE "public"."assessment_feedback_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."assessment_feedback_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."assessment_feedback_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."assessment_gwc_responses" TO "anon";
GRANT ALL ON TABLE "public"."assessment_gwc_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."assessment_gwc_responses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."assessment_gwc_responses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."assessment_gwc_responses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."assessment_gwc_responses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."assessment_rocks" TO "anon";
GRANT ALL ON TABLE "public"."assessment_rocks" TO "authenticated";
GRANT ALL ON TABLE "public"."assessment_rocks" TO "service_role";



GRANT ALL ON SEQUENCE "public"."assessment_rocks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."assessment_rocks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."assessment_rocks_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."assessment_scorecard_metrics" TO "anon";
GRANT ALL ON TABLE "public"."assessment_scorecard_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."assessment_scorecard_metrics" TO "service_role";



GRANT ALL ON SEQUENCE "public"."assessment_scorecard_metrics_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."assessment_scorecard_metrics_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."assessment_scorecard_metrics_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."assessments" TO "anon";
GRANT ALL ON TABLE "public"."assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."assessments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."assessments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."assessments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."assessments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."company_rocks" TO "anon";
GRANT ALL ON TABLE "public"."company_rocks" TO "authenticated";
GRANT ALL ON TABLE "public"."company_rocks" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_rocks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_rocks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_rocks_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."core_values" TO "anon";
GRANT ALL ON TABLE "public"."core_values" TO "authenticated";
GRANT ALL ON TABLE "public"."core_values" TO "service_role";



GRANT ALL ON SEQUENCE "public"."core_values_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."core_values_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."core_values_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."employee_development_goals" TO "anon";
GRANT ALL ON TABLE "public"."employee_development_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_development_goals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."employee_development_goals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."employee_development_goals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."employee_development_goals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";



GRANT ALL ON TABLE "public"."gwc_metrics" TO "anon";
GRANT ALL ON TABLE "public"."gwc_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."gwc_metrics" TO "service_role";



GRANT ALL ON SEQUENCE "public"."gwc_metrics_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."gwc_metrics_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."gwc_metrics_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."kudos" TO "anon";
GRANT ALL ON TABLE "public"."kudos" TO "authenticated";
GRANT ALL ON TABLE "public"."kudos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."kudos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."kudos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."kudos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."manager_employee_messages" TO "anon";
GRANT ALL ON TABLE "public"."manager_employee_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."manager_employee_messages" TO "service_role";



GRANT ALL ON SEQUENCE "public"."manager_employee_messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."manager_employee_messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."manager_employee_messages_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."review_cycles" TO "anon";
GRANT ALL ON TABLE "public"."review_cycles" TO "authenticated";
GRANT ALL ON TABLE "public"."review_cycles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."review_cycles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."review_cycles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."review_cycles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."training_requests" TO "anon";
GRANT ALL ON TABLE "public"."training_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."training_requests" TO "service_role";



GRANT ALL ON SEQUENCE "public"."training_requests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."training_requests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."training_requests_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
