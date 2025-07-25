--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP POLICY IF EXISTS review_cycles_manager_read ON public.review_cycles;
DROP POLICY IF EXISTS review_cycles_admin_access ON public.review_cycles;
DROP POLICY IF EXISTS kudos_public_read ON public.kudos;
DROP POLICY IF EXISTS kudos_own_insert ON public.kudos;
DROP POLICY IF EXISTS feedback_assessment_access ON public.assessment_feedback;
DROP POLICY IF EXISTS employees_own_update ON public.employees;
DROP POLICY IF EXISTS employees_own_record ON public.employees;
DROP POLICY IF EXISTS employees_admin_all_access ON public.employees;
DROP POLICY IF EXISTS company_rocks_read ON public.company_rocks;
DROP POLICY IF EXISTS company_rocks_admin ON public.company_rocks;
DROP POLICY IF EXISTS assessments_manager_team ON public.assessments;
DROP POLICY IF EXISTS assessments_employee_own ON public.assessments;
DROP POLICY IF EXISTS assessments_admin_access ON public.assessments;
DROP POLICY IF EXISTS assessment_scorecard_metrics_all_policy ON public.assessment_scorecard_metrics;
DROP POLICY IF EXISTS assessment_scorecard_metrics_access ON public.assessment_scorecard_metrics;
DROP POLICY IF EXISTS assessment_rocks_all_policy ON public.assessment_rocks;
DROP POLICY IF EXISTS assessment_rocks_access ON public.assessment_rocks;
ALTER TABLE IF EXISTS ONLY public.kudos DROP CONSTRAINT IF EXISTS kudos_receiver_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kudos DROP CONSTRAINT IF EXISTS kudos_giver_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_rocks DROP CONSTRAINT IF EXISTS company_rocks_review_cycle_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assessments DROP CONSTRAINT IF EXISTS assessments_review_cycle_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assessments DROP CONSTRAINT IF EXISTS assessments_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assessment_scorecard_metrics DROP CONSTRAINT IF EXISTS assessment_scorecard_metrics_assessment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assessment_rocks DROP CONSTRAINT IF EXISTS assessment_rocks_assessment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assessment_feedback DROP CONSTRAINT IF EXISTS assessment_feedback_given_by_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assessment_feedback DROP CONSTRAINT IF EXISTS assessment_feedback_assessment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_cycles DROP CONSTRAINT IF EXISTS review_cycles_pkey;
ALTER TABLE IF EXISTS ONLY public.kudos DROP CONSTRAINT IF EXISTS kudos_pkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_user_id_key;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_pkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_email_key;
ALTER TABLE IF EXISTS ONLY public.company_rocks DROP CONSTRAINT IF EXISTS company_rocks_pkey;
ALTER TABLE IF EXISTS ONLY public.assessments DROP CONSTRAINT IF EXISTS assessments_pkey;
ALTER TABLE IF EXISTS ONLY public.assessment_scorecard_metrics DROP CONSTRAINT IF EXISTS assessment_scorecard_metrics_pkey;
ALTER TABLE IF EXISTS ONLY public.assessment_rocks DROP CONSTRAINT IF EXISTS assessment_rocks_pkey;
ALTER TABLE IF EXISTS ONLY public.assessment_feedback DROP CONSTRAINT IF EXISTS assessment_feedback_pkey;
DROP TABLE IF EXISTS public.review_cycles;
DROP TABLE IF EXISTS public.kudos;
DROP TABLE IF EXISTS public.employees;
DROP TABLE IF EXISTS public.company_rocks;
DROP TABLE IF EXISTS public.assessments;
DROP TABLE IF EXISTS public.assessment_scorecard_metrics;
DROP TABLE IF EXISTS public.assessment_rocks;
DROP TABLE IF EXISTS public.assessment_feedback;
DROP FUNCTION IF EXISTS public.update_assessment_field(p_assessment_id bigint, p_field_name text, p_field_value text);
DROP FUNCTION IF EXISTS public.submit_self_assessment(p_assessment_id bigint);
DROP FUNCTION IF EXISTS public.start_review_cycle_for_my_team(cycle_id_to_start bigint);
DROP FUNCTION IF EXISTS public.link_current_user_to_employee();
DROP FUNCTION IF EXISTS public.give_kudo(p_receiver_id uuid, p_core_value text, p_comment text);
DROP FUNCTION IF EXISTS public.get_team_status();
DROP FUNCTION IF EXISTS public.get_my_role();
DROP FUNCTION IF EXISTS public.get_my_name();
DROP FUNCTION IF EXISTS public.get_my_assessments();
DROP FUNCTION IF EXISTS public.get_kudos_wall();
DROP FUNCTION IF EXISTS public.get_assessment_feedback(p_assessment_id bigint);
DROP FUNCTION IF EXISTS public.get_assessment_details(p_assessment_id bigint);
DROP FUNCTION IF EXISTS public.get_all_review_cycles_for_admin();
DROP FUNCTION IF EXISTS public.get_all_employees_simple();
DROP FUNCTION IF EXISTS public.get_all_employees_for_admin();
DROP FUNCTION IF EXISTS public.get_all_employees();
DROP FUNCTION IF EXISTS public.debug_auth_uid();
DROP FUNCTION IF EXISTS public.create_simple_review_cycle(p_name text, p_start_date date, p_end_date date);
DROP FUNCTION IF EXISTS public.add_assessment_feedback(p_assessment_id bigint, p_feedback text);
DROP FUNCTION IF EXISTS public.activate_review_cycle(p_cycle_id bigint);
DROP SCHEMA IF EXISTS public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: activate_review_cycle(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.activate_review_cycle(p_cycle_id bigint) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Only admins can activate cycles
  IF (SELECT get_my_role()) != 'admin' THEN
    RETURN json_build_object('error', 'Only admins can activate review cycles');
  END IF;
  
  UPDATE review_cycles 
  SET status = 'active' 
  WHERE id = p_cycle_id AND status = 'upcoming';
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Cycle not found or already active');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Cycle activated successfully');
END;
$$;


--
-- Name: add_assessment_feedback(bigint, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_assessment_feedback(p_assessment_id bigint, p_feedback text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  feedback_giver_id uuid;
BEGIN
  -- Get the current user's employee ID
  SELECT id INTO feedback_giver_id 
  FROM employees 
  WHERE user_id = auth.uid() AND is_active = true;
  
  IF feedback_giver_id IS NULL THEN
    RETURN json_build_object('error', 'Employee record not found');
  END IF;
  
  -- Insert the feedback
  INSERT INTO assessment_feedback (assessment_id, given_by_id, feedback)
  VALUES (p_assessment_id, feedback_giver_id, p_feedback);
  
  RETURN json_build_object(
    'success', true,
    'message', 'Feedback added successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', 'Failed to add feedback: ' || SQLERRM);
END;
$$;


--
-- Name: create_simple_review_cycle(text, date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_simple_review_cycle(p_name text, p_start_date date, p_end_date date) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  new_cycle_id BIGINT;
BEGIN
  -- Only admins can create cycles
  IF (SELECT get_my_role()) != 'admin' THEN
    RETURN json_build_object('error', 'Only admins can create review cycles');
  END IF;
  
  INSERT INTO review_cycles (name, start_date, end_date, status)
  VALUES (p_name, p_start_date, p_end_date, 'upcoming')
  RETURNING id INTO new_cycle_id;
  
  RETURN json_build_object(
    'success', true,
    'cycle_id', new_cycle_id,
    'message', 'Review cycle created successfully'
  );
END;
$$;


--
-- Name: debug_auth_uid(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.debug_auth_uid() RETURNS TABLE(current_uid uuid, current_email text)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT auth.uid() as current_uid, auth.email() as current_email;
$$;


--
-- Name: get_all_employees(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_employees() RETURNS TABLE(id uuid, name text, email text, job_title text)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT e.id, e.name, e.email, e.job_title
  FROM employees e
  WHERE e.is_active = true
  ORDER BY e.name;
$$;


--
-- Name: get_all_employees_for_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_employees_for_admin() RETURNS TABLE(id uuid, name text, email text, job_title text, is_active boolean, created_at timestamp with time zone, manager_id uuid, manager_name text)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  -- Only allow admins to call this
  SELECT 
    e.id,
    e.name,
    e.email,
    e.job_title,
    e.is_active,
    e.created_at,
    e.manager_id,
    m.name as manager_name
  FROM employees e
  LEFT JOIN employees m ON e.manager_id = m.id
  WHERE auth.email() = 'admin@lucerne.com'  -- Security check
  ORDER BY e.name;
$$;


--
-- Name: get_all_employees_simple(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_employees_simple() RETURNS TABLE(id uuid, name text, email text, job_title text, manager_id uuid)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT e.id, e.name, e.email, e.job_title, e.manager_id
  FROM employees e
  WHERE e.is_active = true
  ORDER BY e.name;
$$;


--
-- Name: get_all_review_cycles_for_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_review_cycles_for_admin() RETURNS TABLE(id bigint, name text, status text, start_date date, end_date date, created_at timestamp with time zone)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  -- Only allow admins to call this
  SELECT 
    rc.id,
    rc.name,
    rc.status,
    rc.start_date,
    rc.end_date,
    rc.created_at
  FROM review_cycles rc
  WHERE auth.email() = 'admin@lucerne.com'  -- Security check
  ORDER BY rc.created_at DESC;
$$;


--
-- Name: get_assessment_details(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_assessment_details(p_assessment_id bigint) RETURNS TABLE(assessment_id bigint, employee_name text, review_cycle_name text, status text, self_assessment_status text, employee_strengths text, employee_improvements text, value_passionate_examples text, value_driven_examples text, value_resilient_examples text, value_responsive_examples text, gwc_gets_it boolean, gwc_gets_it_feedback text, gwc_wants_it boolean, gwc_wants_it_feedback text, gwc_capacity boolean, gwc_capacity_feedback text, manager_summary_comments text, manager_development_plan text, is_manager_view boolean, can_edit_self_assessment boolean, rocks jsonb, scorecard_metrics jsonb)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT
    a.id,
    e.name,
    rc.name,
    a.status,
    COALESCE(a.self_assessment_status, 'not_started'),
    a.employee_strengths,
    a.employee_improvements,
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
    a.manager_summary_comments,
    a.manager_development_plan,
    -- Check if current user is the manager of this employee or admin
    (EXISTS(
      SELECT 1 FROM employees mgr 
      WHERE mgr.user_id = auth.uid() 
      AND mgr.id = e.manager_id
    ) OR auth.email() = 'admin@lucerne.com') as is_manager_view,
    -- Can edit if employee and not yet submitted, or if manager/admin
    (
      (e.user_id = auth.uid() AND COALESCE(a.self_assessment_status, 'not_started') IN ('not_started', 'in_progress'))
      OR 
      (EXISTS(SELECT 1 FROM employees mgr WHERE mgr.user_id = auth.uid() AND mgr.id = e.manager_id))
      OR 
      auth.email() = 'admin@lucerne.com'
    ) as can_edit_self_assessment,
    -- Get rocks as JSON
    COALESCE(
      (SELECT json_agg(json_build_object(
        'id', ar.id,
        'description', ar.description,
        'status', ar.status,
        'feedback', ar.feedback
      )) FROM assessment_rocks ar WHERE ar.assessment_id = a.id),
      '[]'::json
    ) as rocks,
    -- Get scorecard metrics as JSON
    COALESCE(
      (SELECT json_agg(json_build_object(
        'id', asm.id,
        'metric_name', asm.metric_name,
        'target', asm.target,
        'actual', asm.actual,
        'status', asm.status
      )) FROM assessment_scorecard_metrics asm WHERE asm.assessment_id = a.id),
      '[]'::json
    ) as scorecard_metrics
  FROM assessments a
  JOIN employees e ON e.id = a.employee_id
  JOIN review_cycles rc ON rc.id = a.review_cycle_id
  WHERE a.id = p_assessment_id
    AND (
      -- Employee can see their own assessment
      e.user_id = auth.uid()
      -- Manager can see their team's assessments
      OR e.manager_id = (SELECT id FROM employees WHERE user_id = auth.uid())
      -- Admin can see all
      OR auth.email() = 'admin@lucerne.com'
    );
$$;


--
-- Name: get_assessment_feedback(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_assessment_feedback(p_assessment_id bigint) RETURNS TABLE(feedback_id bigint, feedback text, given_by_name text, created_at timestamp with time zone, is_author boolean)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT 
    af.id,
    af.feedback,
    e.name,
    af.created_at,
    af.given_by_id = (SELECT id FROM employees WHERE user_id = auth.uid())
  FROM assessment_feedback af
  JOIN employees e ON e.id = af.given_by_id
  WHERE af.assessment_id = p_assessment_id
    AND e.is_active = true
  ORDER BY af.created_at ASC;
$$;


--
-- Name: get_kudos_wall(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_kudos_wall() RETURNS TABLE(kudo_id bigint, giver_name text, recipient_name text, core_value text, message text, created_at timestamp with time zone)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT 
    k.id,
    giver.name,
    receiver.name,
    k.core_value,
    k.message,
    k.created_at
  FROM kudos k
  JOIN employees giver ON giver.id = k.giver_id
  JOIN employees receiver ON receiver.id = k.receiver_id
  WHERE giver.is_active = true AND receiver.is_active = true
  ORDER BY k.created_at DESC
  LIMIT 50;
$$;


--
-- Name: get_my_assessments(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_assessments() RETURNS TABLE(assessment_id bigint, cycle_name text, status text, self_assessment_status text, created_at timestamp with time zone)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT 
    a.id,
    rc.name,
    a.status,
    COALESCE(a.self_assessment_status, 'not_started'),
    a.created_at
  FROM assessments a
  JOIN review_cycles rc ON rc.id = a.review_cycle_id
  WHERE a.employee_id = (SELECT id FROM employees WHERE user_id = auth.uid())
  ORDER BY a.created_at DESC;
$$;


--
-- Name: get_my_name(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_name() RETURNS text
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT 
    CASE 
      WHEN auth.email() = 'admin@lucerne.com' THEN 'Admin'
      WHEN auth.email() = 'manager@lucerne.com' THEN 'Manager'
      WHEN auth.email() = 'employee1@lucerne.com' THEN 'Employee 1'
      -- For others, try to get from database with explicit query (no RLS issues with SECURITY DEFINER)
      ELSE COALESCE(
        (SELECT name FROM employees WHERE user_id = auth.uid() LIMIT 1),
        split_part(auth.email(), '@', 1)
      )
    END;
$$;


--
-- Name: get_my_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_role() RETURNS text
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT 
    CASE 
      -- Direct email-based admin check (no table queries)
      WHEN auth.email() = 'admin@lucerne.com' THEN 'admin'
      WHEN auth.email() LIKE '%admin%' THEN 'admin'
      -- For now, determine manager vs employee based on email patterns
      -- We'll make this smarter once we're stable
      WHEN auth.email() = 'manager@lucerne.com' THEN 'manager'
      WHEN auth.email() LIKE '%manager%' THEN 'manager'
      -- Default to employee for everyone else
      ELSE 'employee'
    END;
$$;


--
-- Name: get_team_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_team_status() RETURNS TABLE(employee_id uuid, employee_name text, job_title text, assessment_id bigint, assessment_status text)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  WITH latest_cycle AS (
    SELECT id FROM public.review_cycles WHERE status = 'active' ORDER BY start_date DESC LIMIT 1
  )
  SELECT
    e.id,
    e.name,
    e.job_title,
    a.id,
    a.status
  FROM employees e
  LEFT JOIN assessments a ON e.id = a.employee_id AND a.review_cycle_id = (SELECT id FROM latest_cycle)
  WHERE e.manager_id = (SELECT id FROM employees WHERE user_id = auth.uid());
$$;


--
-- Name: give_kudo(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.give_kudo(p_receiver_id uuid, p_core_value text, p_comment text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  giver_id uuid;
BEGIN
  -- Get the giver's employee ID
  SELECT id INTO giver_id 
  FROM employees 
  WHERE user_id = auth.uid() AND is_active = true;
  
  IF giver_id IS NULL THEN
    RETURN json_build_object('error', 'Employee record not found');
  END IF;
  
  -- Check if receiver exists and is active
  IF NOT EXISTS(SELECT 1 FROM employees WHERE id = p_receiver_id AND is_active = true) THEN
    RETURN json_build_object('error', 'Recipient not found or inactive');
  END IF;
  
  -- Insert the kudo
  INSERT INTO kudos (giver_id, receiver_id, core_value, message)
  VALUES (giver_id, p_receiver_id, p_core_value, p_comment);
  
  RETURN json_build_object(
    'success', true,
    'message', 'Kudo sent successfully!'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', 'Failed to send kudo: ' || SQLERRM);
END;
$$;


--
-- Name: link_current_user_to_employee(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.link_current_user_to_employee() RETURNS text
    LANGUAGE sql SECURITY DEFINER
    AS $$
  UPDATE employees 
  SET user_id = auth.uid()
  WHERE email = auth.email() AND user_id IS NULL;
  
  SELECT 'User linked successfully' as result;
$$;


--
-- Name: start_review_cycle_for_my_team(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.start_review_cycle_for_my_team(cycle_id_to_start bigint) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  manager_employee_id UUID;
  cycle_exists BOOLEAN;
  assessments_created INTEGER := 0;
BEGIN
  -- Get the manager's employee ID
  SELECT id INTO manager_employee_id 
  FROM employees 
  WHERE user_id = auth.uid() AND is_active = true;
  
  IF manager_employee_id IS NULL THEN
    RETURN json_build_object('error', 'Manager not found');
  END IF;
  
  -- Check if cycle exists and is active
  SELECT EXISTS(
    SELECT 1 FROM review_cycles 
    WHERE id = cycle_id_to_start AND status = 'active'
  ) INTO cycle_exists;
  
  IF NOT cycle_exists THEN
    RETURN json_build_object('error', 'Review cycle not found or not active');
  END IF;
  
  -- Create assessments for all direct reports
  INSERT INTO assessments (employee_id, review_cycle_id, status)
  SELECT e.id, cycle_id_to_start, 'not_started'
  FROM employees e
  WHERE e.manager_id = manager_employee_id 
    AND e.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM assessments a 
      WHERE a.employee_id = e.id AND a.review_cycle_id = cycle_id_to_start
    );
  
  GET DIAGNOSTICS assessments_created = ROW_COUNT;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Review cycle started successfully',
    'assessments_created', assessments_created
  );
END;
$$;


--
-- Name: submit_self_assessment(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.submit_self_assessment(p_assessment_id bigint) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  user_employee_id uuid;
  assessment_employee_id uuid;
  required_fields_complete boolean;
BEGIN
  -- Get current user's employee ID
  SELECT id INTO user_employee_id 
  FROM employees 
  WHERE user_id = auth.uid() AND is_active = true;
  
  IF user_employee_id IS NULL THEN
    RETURN json_build_object('error', 'Employee record not found');
  END IF;
  
  -- Verify this is the employee's own assessment
  SELECT employee_id INTO assessment_employee_id
  FROM assessments 
  WHERE id = p_assessment_id;
  
  IF assessment_employee_id != user_employee_id THEN
    RETURN json_build_object('error', 'Can only submit your own assessment');
  END IF;
  
  -- Check if required fields are completed
  SELECT (
    employee_strengths IS NOT NULL AND employee_strengths != '' AND
    employee_improvements IS NOT NULL AND employee_improvements != '' AND
    value_passionate_examples IS NOT NULL AND value_passionate_examples != '' AND
    value_driven_examples IS NOT NULL AND value_driven_examples != '' AND
    value_resilient_examples IS NOT NULL AND value_resilient_examples != '' AND
    value_responsive_examples IS NOT NULL AND value_responsive_examples != ''
  )
  INTO required_fields_complete
  FROM assessments 
  WHERE id = p_assessment_id;
  
  IF NOT required_fields_complete THEN
    RETURN json_build_object('error', 'Please complete all required sections before submitting');
  END IF;
  
  -- Update status and timestamp
  UPDATE assessments 
  SET 
    self_assessment_status = 'employee_complete',
    employee_submitted_at = now()
  WHERE id = p_assessment_id;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Self-assessment submitted successfully! Your manager has been notified.'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', 'Submission failed: ' || SQLERRM);
END;
$$;


--
-- Name: update_assessment_field(bigint, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_assessment_field(p_assessment_id bigint, p_field_name text, p_field_value text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  user_employee_id uuid;
  assessment_employee_id uuid;
  current_status text;
BEGIN
  -- Get current user's employee ID
  SELECT id INTO user_employee_id 
  FROM employees 
  WHERE user_id = auth.uid() AND is_active = true;
  
  IF user_employee_id IS NULL THEN
    RETURN json_build_object('error', 'Employee record not found');
  END IF;
  
  -- Get assessment details and verify permissions
  SELECT 
    a.employee_id,
    COALESCE(a.self_assessment_status, 'not_started')
  INTO assessment_employee_id, current_status
  FROM assessments a
  WHERE a.id = p_assessment_id;
  
  -- Check if user can edit this assessment
  IF assessment_employee_id != user_employee_id 
     AND NOT EXISTS(SELECT 1 FROM employees WHERE id = assessment_employee_id AND manager_id = user_employee_id)
     AND auth.email() != 'admin@lucerne.com' THEN
    RETURN json_build_object('error', 'Permission denied');
  END IF;
  
  -- Update the field (using dynamic SQL safely for specific allowed fields)
  IF p_field_name = 'employee_strengths' THEN
    UPDATE assessments SET employee_strengths = p_field_value WHERE id = p_assessment_id;
  ELSIF p_field_name = 'employee_improvements' THEN
    UPDATE assessments SET employee_improvements = p_field_value WHERE id = p_assessment_id;
  ELSIF p_field_name = 'value_passionate_examples' THEN
    UPDATE assessments SET value_passionate_examples = p_field_value WHERE id = p_assessment_id;
  ELSIF p_field_name = 'value_driven_examples' THEN
    UPDATE assessments SET value_driven_examples = p_field_value WHERE id = p_assessment_id;
  ELSIF p_field_name = 'value_resilient_examples' THEN
    UPDATE assessments SET value_resilient_examples = p_field_value WHERE id = p_assessment_id;
  ELSIF p_field_name = 'value_responsive_examples' THEN
    UPDATE assessments SET value_responsive_examples = p_field_value WHERE id = p_assessment_id;
  ELSE
    RETURN json_build_object('error', 'Invalid field name');
  END IF;
  
  -- Update status to in_progress if it was not_started and this is employee editing
  IF current_status = 'not_started' AND assessment_employee_id = user_employee_id THEN
    UPDATE assessments 
    SET self_assessment_status = 'in_progress' 
    WHERE id = p_assessment_id;
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Field updated successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', 'Update failed: ' || SQLERRM);
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assessment_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_feedback (
    id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    given_by_id uuid NOT NULL,
    feedback text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: assessment_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.assessment_feedback ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.assessment_feedback_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assessment_rocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_rocks (
    id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    description text NOT NULL,
    status text NOT NULL,
    feedback text
);


--
-- Name: assessment_rocks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.assessment_rocks ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.assessment_rocks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assessment_scorecard_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_scorecard_metrics (
    id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    metric_name text NOT NULL,
    target text,
    actual text,
    status text
);


--
-- Name: assessment_scorecard_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.assessment_scorecard_metrics ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.assessment_scorecard_metrics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessments (
    id bigint NOT NULL,
    employee_id uuid NOT NULL,
    review_cycle_id bigint NOT NULL,
    status text DEFAULT 'not_started'::text NOT NULL,
    value_passionate_rating smallint,
    value_passionate_examples text,
    value_driven_rating smallint,
    value_driven_examples text,
    value_resilient_rating smallint,
    value_resilient_examples text,
    value_responsive_rating smallint,
    value_responsive_examples text,
    gwc_gets_it boolean,
    gwc_gets_it_feedback text,
    gwc_wants_it boolean,
    gwc_wants_it_feedback text,
    gwc_capacity boolean,
    gwc_capacity_feedback text,
    employee_strengths text,
    employee_improvements text,
    manager_summary_comments text,
    manager_development_plan text,
    submitted_by_employee_at timestamp with time zone,
    finalized_by_manager_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    self_assessment_status text DEFAULT 'not_started'::text,
    employee_submitted_at timestamp with time zone,
    manager_reviewed_at timestamp with time zone
);


--
-- Name: assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.assessments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: company_rocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_rocks (
    id bigint NOT NULL,
    review_cycle_id bigint NOT NULL,
    description text NOT NULL,
    owner_name text,
    target_date date,
    status text DEFAULT 'not_started'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: company_rocks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.company_rocks ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.company_rocks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    name text NOT NULL,
    email text NOT NULL,
    job_title text,
    manager_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: kudos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kudos (
    id bigint NOT NULL,
    giver_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    core_value text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: kudos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.kudos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.kudos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: review_cycles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_cycles (
    id bigint NOT NULL,
    name text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status text DEFAULT 'upcoming'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    cycle_type text DEFAULT 'quarterly'::text,
    description text
);


--
-- Name: review_cycles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.review_cycles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.review_cycles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: assessment_feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assessment_feedback (id, assessment_id, given_by_id, feedback, created_at) FROM stdin;
\.


--
-- Data for Name: assessment_rocks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assessment_rocks (id, assessment_id, description, status, feedback) FROM stdin;
\.


--
-- Data for Name: assessment_scorecard_metrics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assessment_scorecard_metrics (id, assessment_id, metric_name, target, actual, status) FROM stdin;
\.


--
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assessments (id, employee_id, review_cycle_id, status, value_passionate_rating, value_passionate_examples, value_driven_rating, value_driven_examples, value_resilient_rating, value_resilient_examples, value_responsive_rating, value_responsive_examples, gwc_gets_it, gwc_gets_it_feedback, gwc_wants_it, gwc_wants_it_feedback, gwc_capacity, gwc_capacity_feedback, employee_strengths, employee_improvements, manager_summary_comments, manager_development_plan, submitted_by_employee_at, finalized_by_manager_at, created_at, self_assessment_status, employee_submitted_at, manager_reviewed_at) FROM stdin;
\.


--
-- Data for Name: company_rocks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_rocks (id, review_cycle_id, description, owner_name, target_date, status, created_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, user_id, name, email, job_title, manager_id, is_active, created_at) FROM stdin;
e956be35-33d7-4870-97b3-63eaae4a690d	15dd4da0-2c94-452c-9213-5598a9e6c548	Employee 1	employee1@lucerne.com	\N	3cdb0da7-4808-4a1f-8e10-02208cfa0c33	t	2025-07-23 20:33:55.130244+00
3cdb0da7-4808-4a1f-8e10-02208cfa0c33	3c22d17f-efac-4b8f-9d6f-59af18f92331	Manager	manager@lucerne.com	\N	\N	t	2025-07-23 20:32:54.398754+00
270a21d0-bd05-4a7a-93bb-6abefa1e61a7	cd31bc16-c8c0-4a99-a35a-872928d5f763	Admin	admin@lucerne.com	Admin	\N	t	2025-07-24 03:15:54.139185+00
10d1c13c-ea48-45c1-8420-a616f0c314ec	\N	Test Employee	test@lucerne.com	Developer	270a21d0-bd05-4a7a-93bb-6abefa1e61a7	t	2025-07-24 03:41:52.798721+00
3542443c-6cd4-48ba-af2f-0bd3b4243c37	\N	John Doe	john@lucerne.com	Developer	\N	t	2025-07-24 03:47:07.323624+00
da01f7e9-e2f6-43b2-b350-affc7c661751	\N	Jane Smith	jane@lucerne.com	Designer	\N	t	2025-07-24 03:47:07.323624+00
\.


--
-- Data for Name: kudos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.kudos (id, giver_id, receiver_id, core_value, message, created_at) FROM stdin;
1	270a21d0-bd05-4a7a-93bb-6abefa1e61a7	e956be35-33d7-4870-97b3-63eaae4a690d	Passionate about our purpose	Great test	2025-07-24 18:31:42.402507+00
\.


--
-- Data for Name: review_cycles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review_cycles (id, name, start_date, end_date, status, created_at, cycle_type, description) FROM stdin;
\.


--
-- Name: assessment_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.assessment_feedback_id_seq', 1, false);


--
-- Name: assessment_rocks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.assessment_rocks_id_seq', 1, false);


--
-- Name: assessment_scorecard_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.assessment_scorecard_metrics_id_seq', 1, false);


--
-- Name: assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.assessments_id_seq', 1, false);


--
-- Name: company_rocks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.company_rocks_id_seq', 1, false);


--
-- Name: kudos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.kudos_id_seq', 1, true);


--
-- Name: review_cycles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.review_cycles_id_seq', 1, false);


--
-- Name: assessment_feedback assessment_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_feedback
    ADD CONSTRAINT assessment_feedback_pkey PRIMARY KEY (id);


--
-- Name: assessment_rocks assessment_rocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_rocks
    ADD CONSTRAINT assessment_rocks_pkey PRIMARY KEY (id);


--
-- Name: assessment_scorecard_metrics assessment_scorecard_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_scorecard_metrics
    ADD CONSTRAINT assessment_scorecard_metrics_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: company_rocks company_rocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_rocks
    ADD CONSTRAINT company_rocks_pkey PRIMARY KEY (id);


--
-- Name: employees employees_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_email_key UNIQUE (email);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: employees employees_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_key UNIQUE (user_id);


--
-- Name: kudos kudos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudos
    ADD CONSTRAINT kudos_pkey PRIMARY KEY (id);


--
-- Name: review_cycles review_cycles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_cycles
    ADD CONSTRAINT review_cycles_pkey PRIMARY KEY (id);


--
-- Name: assessment_feedback assessment_feedback_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_feedback
    ADD CONSTRAINT assessment_feedback_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessment_feedback assessment_feedback_given_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_feedback
    ADD CONSTRAINT assessment_feedback_given_by_id_fkey FOREIGN KEY (given_by_id) REFERENCES public.employees(id);


--
-- Name: assessment_rocks assessment_rocks_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_rocks
    ADD CONSTRAINT assessment_rocks_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);


--
-- Name: assessment_scorecard_metrics assessment_scorecard_metrics_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_scorecard_metrics
    ADD CONSTRAINT assessment_scorecard_metrics_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);


--
-- Name: assessments assessments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: assessments assessments_review_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_review_cycle_id_fkey FOREIGN KEY (review_cycle_id) REFERENCES public.review_cycles(id);


--
-- Name: company_rocks company_rocks_review_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_rocks
    ADD CONSTRAINT company_rocks_review_cycle_id_fkey FOREIGN KEY (review_cycle_id) REFERENCES public.review_cycles(id) ON DELETE CASCADE;


--
-- Name: employees employees_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(id);


--
-- Name: kudos kudos_giver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudos
    ADD CONSTRAINT kudos_giver_id_fkey FOREIGN KEY (giver_id) REFERENCES public.employees(id);


--
-- Name: kudos kudos_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudos
    ADD CONSTRAINT kudos_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.employees(id);


--
-- Name: assessment_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_rocks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_rocks ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_rocks assessment_rocks_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY assessment_rocks_access ON public.assessment_rocks TO authenticated USING ((assessment_id IN ( SELECT a.id
   FROM public.assessments a
  WHERE ((auth.email() = 'admin@lucerne.com'::text) OR (a.employee_id IN ( SELECT employees.id
           FROM public.employees
          WHERE (employees.user_id = auth.uid()))) OR (a.employee_id IN ( SELECT employees.id
           FROM public.employees
          WHERE (employees.manager_id IN ( SELECT employees_1.id
                   FROM public.employees employees_1
                  WHERE (employees_1.user_id = auth.uid()))))))))) WITH CHECK ((assessment_id IN ( SELECT a.id
   FROM public.assessments a
  WHERE ((auth.email() = 'admin@lucerne.com'::text) OR (a.employee_id IN ( SELECT employees.id
           FROM public.employees
          WHERE (employees.user_id = auth.uid()))) OR (a.employee_id IN ( SELECT employees.id
           FROM public.employees
          WHERE (employees.manager_id IN ( SELECT employees_1.id
                   FROM public.employees employees_1
                  WHERE (employees_1.user_id = auth.uid())))))))));


--
-- Name: assessment_rocks assessment_rocks_all_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY assessment_rocks_all_policy ON public.assessment_rocks USING ((assessment_id IN ( SELECT assessments.id
   FROM public.assessments
  WHERE ((auth.email() = 'admin@lucerne.com'::text) OR (assessments.employee_id = ( SELECT employees.id
           FROM public.employees
          WHERE (employees.user_id = auth.uid())
         LIMIT 1)) OR (assessments.employee_id IN ( SELECT employees.id
           FROM public.employees
          WHERE (employees.manager_id = ( SELECT employees_1.id
                   FROM public.employees employees_1
                  WHERE (employees_1.user_id = auth.uid())
                 LIMIT 1))))))));


--
-- Name: assessment_scorecard_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_scorecard_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_scorecard_metrics assessment_scorecard_metrics_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY assessment_scorecard_metrics_access ON public.assessment_scorecard_metrics TO authenticated USING ((assessment_id IN ( SELECT a.id
   FROM public.assessments a
  WHERE ((auth.email() = 'admin@lucerne.com'::text) OR (a.employee_id IN ( SELECT employees.id
           FROM public.employees
          WHERE (employees.user_id = auth.uid()))) OR (a.employee_id IN ( SELECT employees.id
           FROM public.employees
          WHERE (employees.manager_id IN ( SELECT employees_1.id
                   FROM public.employees employees_1
                  WHERE (employees_1.user_id = auth.uid()))))))))) WITH CHECK ((assessment_id IN ( SELECT a.id
   FROM public.assessments a
  WHERE ((auth.email() = 'admin@lucerne.com'::text) OR (a.employee_id IN ( SELECT employees.id
           FROM public.employees
          WHERE (employees.user_id = auth.uid()))) OR (a.employee_id IN ( SELECT employees.id
           FROM public.employees
          WHERE (employees.manager_id IN ( SELECT employees_1.id
                   FROM public.employees employees_1
                  WHERE (employees_1.user_id = auth.uid())))))))));


--
-- Name: assessment_scorecard_metrics assessment_scorecard_metrics_all_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY assessment_scorecard_metrics_all_policy ON public.assessment_scorecard_metrics USING ((assessment_id IN ( SELECT assessments.id
   FROM public.assessments
  WHERE ((auth.email() = 'admin@lucerne.com'::text) OR (assessments.employee_id = ( SELECT employees.id
           FROM public.employees
          WHERE (employees.user_id = auth.uid())
         LIMIT 1)) OR (assessments.employee_id IN ( SELECT employees.id
           FROM public.employees
          WHERE (employees.manager_id = ( SELECT employees_1.id
                   FROM public.employees employees_1
                  WHERE (employees_1.user_id = auth.uid())
                 LIMIT 1))))))));


--
-- Name: assessments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

--
-- Name: assessments assessments_admin_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY assessments_admin_access ON public.assessments TO authenticated USING ((auth.email() = 'admin@lucerne.com'::text)) WITH CHECK ((auth.email() = 'admin@lucerne.com'::text));


--
-- Name: assessments assessments_employee_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY assessments_employee_own ON public.assessments TO authenticated USING ((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE (employees.user_id = auth.uid())))) WITH CHECK ((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE (employees.user_id = auth.uid()))));


--
-- Name: assessments assessments_manager_team; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY assessments_manager_team ON public.assessments TO authenticated USING ((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE (employees.manager_id IN ( SELECT employees_1.id
           FROM public.employees employees_1
          WHERE (employees_1.user_id = auth.uid())))))) WITH CHECK ((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE (employees.manager_id IN ( SELECT employees_1.id
           FROM public.employees employees_1
          WHERE (employees_1.user_id = auth.uid()))))));


--
-- Name: company_rocks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_rocks ENABLE ROW LEVEL SECURITY;

--
-- Name: company_rocks company_rocks_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY company_rocks_admin ON public.company_rocks TO authenticated USING ((auth.email() = 'admin@lucerne.com'::text)) WITH CHECK ((auth.email() = 'admin@lucerne.com'::text));


--
-- Name: company_rocks company_rocks_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY company_rocks_read ON public.company_rocks FOR SELECT TO authenticated USING (true);


--
-- Name: employees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

--
-- Name: employees employees_admin_all_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY employees_admin_all_access ON public.employees TO authenticated USING ((auth.email() = 'admin@lucerne.com'::text)) WITH CHECK ((auth.email() = 'admin@lucerne.com'::text));


--
-- Name: employees employees_own_record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY employees_own_record ON public.employees FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: employees employees_own_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY employees_own_update ON public.employees FOR UPDATE TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: assessment_feedback feedback_assessment_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY feedback_assessment_access ON public.assessment_feedback TO authenticated USING ((assessment_id IN ( SELECT a.id
   FROM public.assessments a
  WHERE ((auth.email() = 'admin@lucerne.com'::text) OR (a.employee_id = ( SELECT employees.id
           FROM public.employees
          WHERE (employees.user_id = auth.uid()))) OR (a.employee_id IN ( SELECT employees.id
           FROM public.employees
          WHERE (employees.manager_id = ( SELECT employees_1.id
                   FROM public.employees employees_1
                  WHERE (employees_1.user_id = auth.uid()))))))))) WITH CHECK ((assessment_id IN ( SELECT a.id
   FROM public.assessments a
  WHERE ((auth.email() = 'admin@lucerne.com'::text) OR (a.employee_id = ( SELECT employees.id
           FROM public.employees
          WHERE (employees.user_id = auth.uid()))) OR (a.employee_id IN ( SELECT employees.id
           FROM public.employees
          WHERE (employees.manager_id = ( SELECT employees_1.id
                   FROM public.employees employees_1
                  WHERE (employees_1.user_id = auth.uid())))))))));


--
-- Name: kudos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;

--
-- Name: kudos kudos_own_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY kudos_own_insert ON public.kudos FOR INSERT TO authenticated WITH CHECK ((giver_id = ( SELECT employees.id
   FROM public.employees
  WHERE (employees.user_id = auth.uid()))));


--
-- Name: kudos kudos_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY kudos_public_read ON public.kudos FOR SELECT TO authenticated USING (true);


--
-- Name: review_cycles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.review_cycles ENABLE ROW LEVEL SECURITY;

--
-- Name: review_cycles review_cycles_admin_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY review_cycles_admin_access ON public.review_cycles TO authenticated USING ((auth.email() = 'admin@lucerne.com'::text)) WITH CHECK ((auth.email() = 'admin@lucerne.com'::text));


--
-- Name: review_cycles review_cycles_manager_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY review_cycles_manager_read ON public.review_cycles FOR SELECT TO authenticated USING (((status = ANY (ARRAY['active'::text, 'upcoming'::text])) AND (EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.id IN ( SELECT DISTINCT employees_1.manager_id
           FROM public.employees employees_1
          WHERE (employees_1.manager_id IS NOT NULL))))))));


--
-- PostgreSQL database dump complete
--

