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

DROP POLICY IF EXISTS security_audit_admin_read ON public.security_audit;
DROP POLICY IF EXISTS review_cycles_update_admin ON public.review_cycles;
DROP POLICY IF EXISTS review_cycles_select_all ON public.review_cycles;
DROP POLICY IF EXISTS review_cycles_manager_read ON public.review_cycles;
DROP POLICY IF EXISTS review_cycles_insert_admin ON public.review_cycles;
DROP POLICY IF EXISTS review_cycles_admin_access ON public.review_cycles;
DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
DROP POLICY IF EXISTS notifications_own_access ON public.notifications;
DROP POLICY IF EXISTS notifications_insert_own ON public.notifications;
DROP POLICY IF EXISTS messages_participant_access ON public.manager_employee_messages;
DROP POLICY IF EXISTS messages_admin_access ON public.manager_employee_messages;
DROP POLICY IF EXISTS manager_notes_own_access ON public.manager_notes;
DROP POLICY IF EXISTS kudos_public_read ON public.kudos;
DROP POLICY IF EXISTS kudos_own_insert ON public.kudos;
DROP POLICY IF EXISTS feedback_assessment_access ON public.assessment_feedback;
DROP POLICY IF EXISTS employees_own_update ON public.employees;
DROP POLICY IF EXISTS employees_own_record ON public.employees;
DROP POLICY IF EXISTS employees_admin_all_access ON public.employees;
DROP POLICY IF EXISTS employee_goals_own_access ON public.employee_development_goals;
DROP POLICY IF EXISTS employee_goals_manager_access ON public.employee_development_goals;
DROP POLICY IF EXISTS employee_goals_admin_access ON public.employee_development_goals;
DROP POLICY IF EXISTS employee_departments_select_own ON public.employee_departments;
DROP POLICY IF EXISTS development_plans_update_own ON public.development_plans;
DROP POLICY IF EXISTS development_plans_select_own ON public.development_plans;
DROP POLICY IF EXISTS development_plans_insert_own ON public.development_plans;
DROP POLICY IF EXISTS development_plans_access ON public.development_plans;
DROP POLICY IF EXISTS departments_select_all ON public.departments;
DROP POLICY IF EXISTS company_rocks_read ON public.company_rocks;
DROP POLICY IF EXISTS company_rocks_admin ON public.company_rocks;
DROP POLICY IF EXISTS assessments_update_own ON public.assessments;
DROP POLICY IF EXISTS assessments_select_own ON public.assessments;
DROP POLICY IF EXISTS assessments_manager_team ON public.assessments;
DROP POLICY IF EXISTS assessments_insert_own ON public.assessments;
DROP POLICY IF EXISTS assessments_employee_own ON public.assessments;
DROP POLICY IF EXISTS assessments_admin_access ON public.assessments;
DROP POLICY IF EXISTS assessment_scorecard_metrics_all_policy ON public.assessment_scorecard_metrics;
DROP POLICY IF EXISTS assessment_scorecard_metrics_access ON public.assessment_scorecard_metrics;
DROP POLICY IF EXISTS assessment_rocks_all_policy ON public.assessment_rocks;
DROP POLICY IF EXISTS assessment_rocks_access ON public.assessment_rocks;
DROP POLICY IF EXISTS "Users can view own pulse responses" ON public.team_health_pulse_responses;
DROP POLICY IF EXISTS "Users can view own alerts" ON public.team_health_alerts;
DROP POLICY IF EXISTS "Users can view department assignments" ON public.employee_departments;
DROP POLICY IF EXISTS "Users can insert own pulse responses" ON public.team_health_pulse_responses;
DROP POLICY IF EXISTS "Only admins can modify departments" ON public.departments;
DROP POLICY IF EXISTS "Only admins can modify department assignments" ON public.employee_departments;
DROP POLICY IF EXISTS "Managers can view team pulse responses" ON public.team_health_pulse_responses;
DROP POLICY IF EXISTS "Managers can manage team alerts" ON public.team_health_alerts;
DROP POLICY IF EXISTS "Everyone can view departments" ON public.departments;
DROP POLICY IF EXISTS "Everyone can view active pulse questions" ON public.pulse_questions;
DROP POLICY IF EXISTS "Enable update for own and team assessments" ON public.assessments;
DROP POLICY IF EXISTS "Enable read access for own and team assessments" ON public.assessments;
DROP POLICY IF EXISTS "Admins can view all pulse responses" ON public.team_health_pulse_responses;
DROP POLICY IF EXISTS "Admins can manage pulse questions" ON public.pulse_questions;
DROP POLICY IF EXISTS "Admins can manage all alerts" ON public.team_health_alerts;
ALTER TABLE IF EXISTS ONLY public.training_requests DROP CONSTRAINT IF EXISTS training_requests_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_health_pulse_responses DROP CONSTRAINT IF EXISTS team_health_pulse_responses_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_health_pulse_responses DROP CONSTRAINT IF EXISTS team_health_pulse_responses_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_health_pulse_responses DROP CONSTRAINT IF EXISTS team_health_pulse_responses_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_health_alerts DROP CONSTRAINT IF EXISTS team_health_alerts_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_health_alerts DROP CONSTRAINT IF EXISTS team_health_alerts_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_health_alerts DROP CONSTRAINT IF EXISTS team_health_alerts_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_health_alerts DROP CONSTRAINT IF EXISTS team_health_alerts_acknowledged_by_fkey;
ALTER TABLE IF EXISTS ONLY public.security_audit DROP CONSTRAINT IF EXISTS security_audit_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.security_audit DROP CONSTRAINT IF EXISTS security_audit_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pulse_questions DROP CONSTRAINT IF EXISTS pulse_questions_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.peer_feedback DROP CONSTRAINT IF EXISTS peer_feedback_recipient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.peer_feedback DROP CONSTRAINT IF EXISTS peer_feedback_giver_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_sender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_recipient_id_fkey;
ALTER TABLE IF EXISTS ONLY public.manager_notes DROP CONSTRAINT IF EXISTS manager_notes_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.manager_notes DROP CONSTRAINT IF EXISTS manager_notes_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.manager_employee_messages DROP CONSTRAINT IF EXISTS manager_employee_messages_to_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.manager_employee_messages DROP CONSTRAINT IF EXISTS manager_employee_messages_from_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kudos DROP CONSTRAINT IF EXISTS kudos_receiver_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kudos DROP CONSTRAINT IF EXISTS kudos_giver_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assessments DROP CONSTRAINT IF EXISTS fk_admin_revision_requested_by;
ALTER TABLE IF EXISTS ONLY public.assessments DROP CONSTRAINT IF EXISTS fk_admin_approved_by;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_development_goals DROP CONSTRAINT IF EXISTS employee_development_goals_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_departments DROP CONSTRAINT IF EXISTS employee_departments_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_departments DROP CONSTRAINT IF EXISTS employee_departments_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_departments DROP CONSTRAINT IF EXISTS employee_departments_assigned_by_fkey;
ALTER TABLE IF EXISTS ONLY public.development_plans DROP CONSTRAINT IF EXISTS development_plans_manager_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.development_plans DROP CONSTRAINT IF EXISTS development_plans_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.development_plans DROP CONSTRAINT IF EXISTS development_plans_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_rocks DROP CONSTRAINT IF EXISTS company_rocks_review_cycle_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assessments DROP CONSTRAINT IF EXISTS assessments_review_cycle_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assessments DROP CONSTRAINT IF EXISTS assessments_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assessment_scorecard_metrics DROP CONSTRAINT IF EXISTS assessment_scorecard_metrics_assessment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assessment_rocks DROP CONSTRAINT IF EXISTS assessment_rocks_assessment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assessment_feedback DROP CONSTRAINT IF EXISTS assessment_feedback_given_by_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assessment_feedback DROP CONSTRAINT IF EXISTS assessment_feedback_assessment_id_fkey;
DROP TRIGGER IF EXISTS update_review_cycles_updated_at ON public.review_cycles;
DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
DROP TRIGGER IF EXISTS update_assessments_updated_at ON public.assessments;
DROP TRIGGER IF EXISTS trigger_create_pulse_alert ON public.team_health_pulse_responses;
DROP TRIGGER IF EXISTS trg_manager_review_completed ON public.assessments;
DROP TRIGGER IF EXISTS trg_assessment_submitted ON public.assessments;
DROP INDEX IF EXISTS public.idx_training_requests_status;
DROP INDEX IF EXISTS public.idx_training_requests_employee;
DROP INDEX IF EXISTS public.idx_review_cycles_status;
DROP INDEX IF EXISTS public.idx_review_cycles_dates;
DROP INDEX IF EXISTS public.idx_review_cycles_created_at;
DROP INDEX IF EXISTS public.idx_pulse_responses_user_id;
DROP INDEX IF EXISTS public.idx_pulse_responses_timestamp;
DROP INDEX IF EXISTS public.idx_pulse_responses_manager_dept;
DROP INDEX IF EXISTS public.idx_pulse_responses_employee_id;
DROP INDEX IF EXISTS public.idx_pulse_responses_department;
DROP INDEX IF EXISTS public.idx_pulse_responses_category;
DROP INDEX IF EXISTS public.idx_pulse_questions_sort_order;
DROP INDEX IF EXISTS public.idx_pulse_questions_category;
DROP INDEX IF EXISTS public.idx_pulse_questions_active;
DROP INDEX IF EXISTS public.idx_notifications_unread;
DROP INDEX IF EXISTS public.idx_notifications_type;
DROP INDEX IF EXISTS public.idx_notifications_recipient_id;
DROP INDEX IF EXISTS public.idx_notifications_read_at;
DROP INDEX IF EXISTS public.idx_notifications_created_at;
DROP INDEX IF EXISTS public.idx_messages_to_employee;
DROP INDEX IF EXISTS public.idx_messages_from_employee;
DROP INDEX IF EXISTS public.idx_manager_notes_manager_id;
DROP INDEX IF EXISTS public.idx_manager_notes_employee_id;
DROP INDEX IF EXISTS public.idx_manager_notes_created_at;
DROP INDEX IF EXISTS public.idx_employees_department;
DROP INDEX IF EXISTS public.idx_employee_primary_department;
DROP INDEX IF EXISTS public.idx_employee_departments_primary;
DROP INDEX IF EXISTS public.idx_employee_departments_employee_id;
DROP INDEX IF EXISTS public.idx_employee_departments_department_id;
DROP INDEX IF EXISTS public.idx_development_plans_status;
DROP INDEX IF EXISTS public.idx_development_plans_manager_id;
DROP INDEX IF EXISTS public.idx_development_plans_employee_id;
DROP INDEX IF EXISTS public.idx_development_plans_created_at;
DROP INDEX IF EXISTS public.idx_development_goals_status;
DROP INDEX IF EXISTS public.idx_development_goals_employee;
DROP INDEX IF EXISTS public.idx_assessments_updated_at;
DROP INDEX IF EXISTS public.idx_assessments_status;
DROP INDEX IF EXISTS public.idx_assessments_employee_id;
DROP INDEX IF EXISTS public.idx_assessments_created_at;
DROP INDEX IF EXISTS public.idx_alerts_severity;
DROP INDEX IF EXISTS public.idx_alerts_manager_id;
DROP INDEX IF EXISTS public.idx_alerts_department;
DROP INDEX IF EXISTS public.idx_alerts_created_at;
DROP INDEX IF EXISTS public.idx_alerts_acknowledged;
ALTER TABLE IF EXISTS ONLY public.training_requests DROP CONSTRAINT IF EXISTS training_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.team_health_pulse_responses DROP CONSTRAINT IF EXISTS team_health_pulse_responses_pkey;
ALTER TABLE IF EXISTS ONLY public.team_health_alerts DROP CONSTRAINT IF EXISTS team_health_alerts_pkey;
ALTER TABLE IF EXISTS ONLY public.security_audit DROP CONSTRAINT IF EXISTS security_audit_pkey;
ALTER TABLE IF EXISTS ONLY public.review_cycles DROP CONSTRAINT IF EXISTS review_cycles_pkey;
ALTER TABLE IF EXISTS ONLY public.pulse_questions DROP CONSTRAINT IF EXISTS pulse_questions_question_id_key;
ALTER TABLE IF EXISTS ONLY public.pulse_questions DROP CONSTRAINT IF EXISTS pulse_questions_pkey;
ALTER TABLE IF EXISTS ONLY public.peer_feedback DROP CONSTRAINT IF EXISTS peer_feedback_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.manager_notes DROP CONSTRAINT IF EXISTS manager_notes_pkey;
ALTER TABLE IF EXISTS ONLY public.manager_employee_messages DROP CONSTRAINT IF EXISTS manager_employee_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.kudos DROP CONSTRAINT IF EXISTS kudos_pkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_user_id_key;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_pkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_email_key;
ALTER TABLE IF EXISTS ONLY public.employee_development_goals DROP CONSTRAINT IF EXISTS employee_development_goals_pkey;
ALTER TABLE IF EXISTS ONLY public.employee_departments DROP CONSTRAINT IF EXISTS employee_departments_pkey;
ALTER TABLE IF EXISTS ONLY public.employee_departments DROP CONSTRAINT IF EXISTS employee_departments_employee_id_department_id_key;
ALTER TABLE IF EXISTS ONLY public.development_plans DROP CONSTRAINT IF EXISTS development_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_name_key;
ALTER TABLE IF EXISTS ONLY public.company_rocks DROP CONSTRAINT IF EXISTS company_rocks_pkey;
ALTER TABLE IF EXISTS ONLY public.assessments DROP CONSTRAINT IF EXISTS assessments_pkey;
ALTER TABLE IF EXISTS ONLY public.assessment_scorecard_metrics DROP CONSTRAINT IF EXISTS assessment_scorecard_metrics_pkey;
ALTER TABLE IF EXISTS ONLY public.assessment_rocks DROP CONSTRAINT IF EXISTS assessment_rocks_pkey;
ALTER TABLE IF EXISTS ONLY public.assessment_feedback DROP CONSTRAINT IF EXISTS assessment_feedback_pkey;
ALTER TABLE IF EXISTS public.security_audit ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.peer_feedback ALTER COLUMN feedback_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employee_departments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.departments ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.training_requests;
DROP TABLE IF EXISTS public.team_health_pulse_responses;
DROP TABLE IF EXISTS public.team_health_alerts;
DROP SEQUENCE IF EXISTS public.security_audit_id_seq;
DROP TABLE IF EXISTS public.security_audit;
DROP TABLE IF EXISTS public.review_cycles;
DROP TABLE IF EXISTS public.pulse_questions;
DROP SEQUENCE IF EXISTS public.peer_feedback_feedback_id_seq;
DROP TABLE IF EXISTS public.peer_feedback;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.manager_notes;
DROP TABLE IF EXISTS public.manager_employee_messages;
DROP TABLE IF EXISTS public.kudos;
DROP TABLE IF EXISTS public.employees;
DROP TABLE IF EXISTS public.employee_development_goals;
DROP SEQUENCE IF EXISTS public.employee_departments_id_seq;
DROP TABLE IF EXISTS public.employee_departments;
DROP TABLE IF EXISTS public.development_plans;
DROP SEQUENCE IF EXISTS public.departments_id_seq;
DROP TABLE IF EXISTS public.departments;
DROP TABLE IF EXISTS public.company_rocks;
DROP TABLE IF EXISTS public.assessments;
DROP TABLE IF EXISTS public.assessment_scorecard_metrics;
DROP TABLE IF EXISTS public.assessment_rocks;
DROP TABLE IF EXISTS public.assessment_feedback;
DROP FUNCTION IF EXISTS public.upsert_development_goal(p_goal_id uuid, p_goal_type text, p_title text, p_description text, p_target_date date, p_priority text, p_status text);
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.update_manager_note(p_note_id uuid, p_title text, p_content text, p_category text, p_priority text);
DROP FUNCTION IF EXISTS public.update_employee_departments(p_employee_id uuid, p_department_ids integer[], p_primary_department_id integer, p_assigned_by uuid);
DROP FUNCTION IF EXISTS public.update_employee(p_employee_id uuid, p_name text, p_email text, p_job_title text, p_role text, p_manager_id uuid, p_is_active boolean);
DROP FUNCTION IF EXISTS public.update_assessment_field(p_assessment_id bigint, p_field_name text, p_field_value text);
DROP FUNCTION IF EXISTS public.update_assessment(p_assessment_id bigint, p_updates jsonb);
DROP FUNCTION IF EXISTS public.test_get_assessment_details(p_assessment_id bigint);
DROP FUNCTION IF EXISTS public.submit_training_request(p_request_type text, p_title text, p_description text, p_provider text, p_estimated_cost numeric, p_preferred_date date, p_business_justification text);
DROP FUNCTION IF EXISTS public.submit_self_assessment(p_assessment_id bigint);
DROP FUNCTION IF EXISTS public.submit_manager_review(p_assessment_id uuid, p_feedback jsonb);
DROP FUNCTION IF EXISTS public.submit_manager_review(p_assessment_id bigint, p_feedback jsonb);
DROP FUNCTION IF EXISTS public.submit_development_plan(p_title text, p_description text, p_goals text, p_skills_to_develop text, p_timeline text);
DROP FUNCTION IF EXISTS public.start_review_cycle_for_my_team(cycle_id_to_start bigint);
DROP FUNCTION IF EXISTS public.set_employee_departments(p_employee_id uuid, p_department_ids integer[]);
DROP FUNCTION IF EXISTS public.save_manager_note(p_employee_id uuid, p_title text, p_content text, p_category text, p_priority text);
DROP FUNCTION IF EXISTS public.review_development_plan(p_plan_id uuid, p_status text, p_feedback text, p_rating integer, _csrf_token text, _nonce text, _timestamp text);
DROP FUNCTION IF EXISTS public.review_development_plan(p_plan_id uuid, p_status text, p_manager_feedback text);
DROP FUNCTION IF EXISTS public.request_manager_review_revision(p_assessment_id bigint, p_revision_notes text);
DROP FUNCTION IF EXISTS public.notify_manager_assessment_submitted();
DROP FUNCTION IF EXISTS public.notify_employee_manager_review_completed();
DROP FUNCTION IF EXISTS public.mark_notification_read(p_notification_id uuid);
DROP FUNCTION IF EXISTS public.mark_feedback_helpful(p_feedback_id bigint);
DROP FUNCTION IF EXISTS public.log_security_event(p_action text, p_resource text, p_success boolean);
DROP FUNCTION IF EXISTS public.link_employee_to_auth_user(p_employee_id uuid, p_auth_user_id uuid);
DROP FUNCTION IF EXISTS public.link_current_user_to_employee();
DROP FUNCTION IF EXISTS public.link_auth_user_to_employee(p_employee_id uuid, p_auth_user_id uuid);
DROP FUNCTION IF EXISTS public.is_manager_of(manager_user_id uuid, target_employee_id uuid);
DROP FUNCTION IF EXISTS public.give_peer_feedback(p_recipient_id uuid, p_feedback_type text, p_message text, p_category text, p_is_anonymous boolean);
DROP FUNCTION IF EXISTS public.give_kudo(p_receiver_id uuid, p_core_value text, p_comment text);
DROP FUNCTION IF EXISTS public.get_user_role(p_user_id uuid);
DROP FUNCTION IF EXISTS public.get_user_notifications();
DROP FUNCTION IF EXISTS public.get_unread_notification_count();
DROP FUNCTION IF EXISTS public.get_team_status();
DROP FUNCTION IF EXISTS public.get_team_assessments();
DROP FUNCTION IF EXISTS public.get_review_cycle_details(p_cycle_id bigint);
DROP FUNCTION IF EXISTS public.get_question_statistics(question_id_param text, department_filter text, days_back integer);
DROP FUNCTION IF EXISTS public.get_question_performance_ranking(department_filter text, manager_id_filter uuid, days_back integer);
DROP FUNCTION IF EXISTS public.get_potential_managers();
DROP FUNCTION IF EXISTS public.get_pending_admin_approvals();
DROP FUNCTION IF EXISTS public.get_my_training_requests();
DROP FUNCTION IF EXISTS public.get_my_team();
DROP FUNCTION IF EXISTS public.get_my_role();
DROP FUNCTION IF EXISTS public.get_my_name();
DROP FUNCTION IF EXISTS public.get_my_feedback_received(p_limit integer);
DROP FUNCTION IF EXISTS public.get_my_feedback_given(p_limit integer);
DROP FUNCTION IF EXISTS public.get_my_development_plans();
DROP FUNCTION IF EXISTS public.get_my_development_goals();
DROP FUNCTION IF EXISTS public.get_my_assessments();
DROP FUNCTION IF EXISTS public.get_manager_employees();
DROP FUNCTION IF EXISTS public.get_kudos_wall();
DROP FUNCTION IF EXISTS public.get_feedback_wall(p_limit integer, p_feedback_type text);
DROP FUNCTION IF EXISTS public.get_employees_simple();
DROP FUNCTION IF EXISTS public.get_employees_for_feedback();
DROP FUNCTION IF EXISTS public.get_employee_with_departments(p_employee_id uuid);
DROP FUNCTION IF EXISTS public.get_employee_profile();
DROP FUNCTION IF EXISTS public.get_employee_primary_department(emp_id uuid);
DROP FUNCTION IF EXISTS public.get_employee_notes(p_employee_id uuid);
DROP FUNCTION IF EXISTS public.get_employee_departments(p_employee_id uuid);
DROP FUNCTION IF EXISTS public.get_development_plans_for_review();
DROP FUNCTION IF EXISTS public.get_development_plans();
DROP FUNCTION IF EXISTS public.get_department_satisfaction(dept_name text, days_back integer);
DROP FUNCTION IF EXISTS public.get_dashboard_stats(p_role text);
DROP FUNCTION IF EXISTS public.get_current_user_session();
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.get_current_employee_id();
DROP FUNCTION IF EXISTS public.get_company_satisfaction(days_back integer);
DROP FUNCTION IF EXISTS public.get_assessment_for_manager_review(p_assessment_id bigint);
DROP FUNCTION IF EXISTS public.get_assessment_feedback(p_assessment_id bigint);
DROP FUNCTION IF EXISTS public.get_assessment_details(p_assessment_id bigint);
DROP FUNCTION IF EXISTS public.get_all_review_cycles_for_admin();
DROP FUNCTION IF EXISTS public.get_all_employees_simple();
DROP FUNCTION IF EXISTS public.get_all_employees_for_admin();
DROP FUNCTION IF EXISTS public.get_all_employees();
DROP FUNCTION IF EXISTS public.get_all_departments();
DROP FUNCTION IF EXISTS public.get_active_review_cycles_with_status();
DROP FUNCTION IF EXISTS public.delete_manager_note(p_note_id uuid);
DROP FUNCTION IF EXISTS public.debug_auth_uid();
DROP FUNCTION IF EXISTS public.deactivate_pulse_question(question_id_param text);
DROP FUNCTION IF EXISTS public.create_simple_review_cycle(p_name text, p_start_date date, p_end_date date);
DROP FUNCTION IF EXISTS public.create_pulse_alert();
DROP FUNCTION IF EXISTS public.create_notification(p_recipient_id uuid, p_sender_id uuid, p_type text, p_title text, p_message text, p_data jsonb);
DROP FUNCTION IF EXISTS public.create_notification(p_recipient_id uuid, p_sender_id uuid, p_type text, p_title text, p_message text, p_data json);
DROP FUNCTION IF EXISTS public.create_employee_with_temp_password(p_name text, p_email text, p_job_title text, p_role text, p_manager_id uuid, p_temp_password text);
DROP FUNCTION IF EXISTS public.create_employee(p_name text, p_email text, p_job_title text, p_role text, p_manager_id uuid, p_temp_password text);
DROP FUNCTION IF EXISTS public.close_review_cycle(_csrf_token text, _nonce text, _timestamp bigint, p_cycle_id text);
DROP FUNCTION IF EXISTS public.close_review_cycle(p_cycle_id bigint);
DROP FUNCTION IF EXISTS public.check_user_permission(required_permission text);
DROP FUNCTION IF EXISTS public.auto_link_new_employees();
DROP FUNCTION IF EXISTS public.assign_primary_department(emp_id uuid, dept_id integer, assigned_by_id uuid);
DROP FUNCTION IF EXISTS public.approve_manager_review(p_assessment_id bigint, p_admin_notes text);
DROP FUNCTION IF EXISTS public.add_pulse_question(question_id_param text, question_text_param text, category_param text, type_param text, options_param jsonb);
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

CREATE FUNCTION public.activate_review_cycle(p_cycle_id bigint) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_assessment_count INT := 0;
    v_cycle_name TEXT;
BEGIN
    -- Ensure the user is an admin
    IF (SELECT role FROM public.employees WHERE user_id = auth.uid() AND is_active = true) != 'admin' THEN
        RETURN '{"error": "Permission denied: Admin access required"}'::jsonb;
    END IF;

    -- Check if cycle exists
    SELECT name INTO v_cycle_name FROM public.review_cycles WHERE id = p_cycle_id;
    IF v_cycle_name IS NULL THEN
        RETURN '{"error": "Review cycle not found"}'::jsonb;
    END IF;

    -- Activate the cycle
    UPDATE public.review_cycles SET status = 'active' WHERE id = p_cycle_id;

    -- Create assessments for all active employees who don't already have one for this cycle
    INSERT INTO public.assessments (employee_id, review_cycle_id, self_assessment_status, manager_review_status, employee_acknowledgment, created_at, updated_at)
    SELECT 
        id, 
        p_cycle_id, 
        'not_started', 
        'pending',
        false,
        NOW(),
        NOW()
    FROM public.employees
    WHERE is_active = true AND id NOT IN (
        SELECT employee_id FROM public.assessments WHERE review_cycle_id = p_cycle_id
    );

    -- Get the count of newly created assessments
    GET DIAGNOSTICS v_assessment_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Review cycle activated successfully',
        'cycle_name', v_cycle_name,
        'assessments_created', v_assessment_count
    );
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
-- Name: add_pulse_question(text, text, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_pulse_question(question_id_param text, question_text_param text, category_param text, type_param text DEFAULT 'scale'::text, options_param jsonb DEFAULT NULL::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    admin_check BOOLEAN;
    new_id UUID;
    next_sort_order INTEGER;
BEGIN
    -- Check if user is admin
    SELECT EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() AND role = 'admin'
    ) INTO admin_check;
    
    IF NOT admin_check THEN
        RAISE EXCEPTION 'Only administrators can add questions';
    END IF;
    
    -- Get next sort order
    SELECT COALESCE(MAX(sort_order), 0) + 1 
    FROM public.pulse_questions 
    INTO next_sort_order;
    
    -- Insert new question
    INSERT INTO public.pulse_questions (
        question_id, question_text, category, type, options, sort_order, created_by
    ) VALUES (
        question_id_param, 
        question_text_param, 
        category_param, 
        type_param, 
        options_param,
        next_sort_order,
        (SELECT id FROM public.employees WHERE user_id = auth.uid())
    ) RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$;


--
-- Name: FUNCTION add_pulse_question(question_id_param text, question_text_param text, category_param text, type_param text, options_param jsonb); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.add_pulse_question(question_id_param text, question_text_param text, category_param text, type_param text, options_param jsonb) IS 'Add a new pulse question (admin only)';


--
-- Name: approve_manager_review(bigint, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.approve_manager_review(p_assessment_id bigint, p_admin_notes text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_user_role text;
    v_assessment_record assessments%ROWTYPE;
    v_admin_employee_id uuid;
BEGIN
    -- Get current user's role
    SELECT role INTO v_user_role FROM auth.users WHERE id = auth.uid();
    
    -- Only admins can approve manager reviews
    IF v_user_role != 'admin' THEN
        RETURN jsonb_build_object('error', 'Access denied: Admin role required');
    END IF;

    -- Get the assessment record
    SELECT * INTO v_assessment_record
    FROM assessments 
    WHERE id = p_assessment_id AND self_assessment_status = 'pending_admin_approval';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Assessment not found or not pending admin approval');
    END IF;

    -- Get admin's employee ID for logging
    SELECT e.id INTO v_admin_employee_id
    FROM employees e
    WHERE e.user_id = auth.uid();

    -- Approve the review - change status to manager_complete
    UPDATE assessments 
    SET 
        self_assessment_status = 'manager_complete',
        manager_review_status = 'completed',
        admin_approval_notes = p_admin_notes,
        admin_approved_at = NOW(),
        admin_approved_by = v_admin_employee_id,
        updated_at = NOW()
    WHERE id = p_assessment_id;

    -- Log the approval
    INSERT INTO activity_log (
        employee_id,
        action_type,
        description,
        created_at
    ) VALUES (
        v_admin_employee_id,
        'admin_approval_granted',
        'Admin approved manager review for assessment ' || p_assessment_id::text ||
        CASE WHEN p_admin_notes IS NOT NULL THEN ' with notes: ' || p_admin_notes ELSE '' END,
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Manager review approved successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$;


--
-- Name: assign_primary_department(uuid, integer, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assign_primary_department(emp_id uuid, dept_id integer, assigned_by_id uuid DEFAULT NULL::uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Remove existing primary department
    UPDATE public.employee_departments 
    SET is_primary = false 
    WHERE employee_id = emp_id AND is_primary = true;
    
    -- Insert or update the new primary department
    INSERT INTO public.employee_departments (employee_id, department_id, is_primary, assigned_by)
    VALUES (emp_id, dept_id, true, assigned_by_id)
    ON CONFLICT (employee_id, department_id) 
    DO UPDATE SET is_primary = true, assigned_by = assigned_by_id;
    
    -- Update the backward compatibility column
    UPDATE public.employees 
    SET department = (SELECT name FROM public.departments WHERE id = dept_id)
    WHERE id = emp_id;
    
    RETURN true;
END;
$$;


--
-- Name: FUNCTION assign_primary_department(emp_id uuid, dept_id integer, assigned_by_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.assign_primary_department(emp_id uuid, dept_id integer, assigned_by_id uuid) IS 'Assigns a primary department to an employee';


--
-- Name: auto_link_new_employees(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_link_new_employees() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_link_count INTEGER := 0;
    v_employee_record RECORD;
    v_auth_user_id UUID;
BEGIN
    -- Only admins can run this
    IF NOT check_user_permission('admin') THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized');
    END IF;
    
    -- Find employees without linked auth accounts
    FOR v_employee_record IN
        SELECT e.id, e.email, e.name, e.temp_password
        FROM employees e
        WHERE e.is_active = true 
        AND e.user_id IS NULL
        AND e.temp_password IS NOT NULL
        ORDER BY e.created_at DESC
    LOOP
        -- Find matching auth user by email
        SELECT au.id INTO v_auth_user_id
        FROM auth.users au
        WHERE au.email = v_employee_record.email
        LIMIT 1;
        
        -- Link them if found
        IF v_auth_user_id IS NOT NULL THEN
            UPDATE employees 
            SET user_id = v_auth_user_id, updated_at = NOW()
            WHERE id = v_employee_record.id;
            
            v_link_count := v_link_count + 1;
        END IF;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Auto-linking completed',
        'accounts_linked', v_link_count
    );
END;
$$;


--
-- Name: check_user_permission(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_user_permission(required_permission text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    user_role TEXT;
    has_permission BOOLEAN := false;
BEGIN
    -- Get user role
    SELECT role INTO user_role
    FROM employees 
    WHERE user_id = auth.uid() 
    AND is_active = true;
    
    -- Fallback - check by email
    IF user_role IS NULL AND auth.email() IS NOT NULL THEN
        SELECT role INTO user_role
        FROM employees 
        WHERE LOWER(email) = LOWER(auth.email())
        AND is_active = true;
    END IF;
    
    -- Check permissions based on role
    CASE required_permission
        WHEN 'admin' THEN
            has_permission := (user_role = 'admin');
        WHEN 'manage_users' THEN
            has_permission := (user_role = 'admin');
        WHEN 'manage_cycles' THEN
            has_permission := (user_role = 'admin');
        WHEN 'manage_team' THEN
            has_permission := (user_role IN ('admin', 'manager'));
        WHEN 'write' THEN
            has_permission := (user_role IN ('admin', 'manager', 'employee'));
        WHEN 'read' THEN
            has_permission := (user_role IN ('admin', 'manager', 'employee'));
        ELSE
            has_permission := false;
    END CASE;
    
    RETURN has_permission;
END;
$$;


--
-- Name: close_review_cycle(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.close_review_cycle(p_cycle_id bigint) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_cycle_record review_cycles%ROWTYPE;
    v_assessments_count INTEGER := 0;
    v_completed_count INTEGER := 0;
BEGIN
    -- Security check
    IF NOT check_user_permission('admin') THEN
        RETURN json_build_object('error', 'Unauthorized: Admin access required');
    END IF;
    
    -- Get the review cycle
    SELECT * INTO v_cycle_record
    FROM review_cycles 
    WHERE id = p_cycle_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Review cycle not found');
    END IF;
    
    -- Check if cycle is in a valid state to close
    IF v_cycle_record.status != 'active' THEN
        RETURN json_build_object('error', 'Only active review cycles can be closed');
    END IF;
    
    -- Get count of assessments for this cycle
    SELECT 
        COUNT(*) as total_assessments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_assessments
    INTO v_assessments_count, v_completed_count
    FROM assessments 
    WHERE review_cycle_id = p_cycle_id;
    
    -- Update cycle status to completed
    UPDATE review_cycles 
    SET 
        status = 'completed',
        end_date = CURRENT_DATE
    WHERE id = p_cycle_id;
    
    -- Update any remaining assessments to closed status
    UPDATE assessments 
    SET 
        status = 'closed',
        closed_at = NOW()
    WHERE review_cycle_id = p_cycle_id 
    AND status NOT IN ('completed', 'finalized');
    
    -- Log the closure
    PERFORM log_security_event(
        'review_cycle_closed',
        'cycle_id:' || p_cycle_id::text,
        true
    );
    
    RETURN json_build_object(
        'success', true,
        'message', 'Review cycle closed successfully',
        'cycle_id', p_cycle_id,
        'cycle_name', v_cycle_record.name,
        'total_assessments', v_assessments_count,
        'completed_assessments', v_completed_count
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to close review cycle: ' || SQLERRM);
END;
$$;


--
-- Name: close_review_cycle(text, text, bigint, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.close_review_cycle(_csrf_token text, _nonce text, _timestamp bigint, p_cycle_id text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_current_employee_id UUID;
    v_employee_role TEXT;
    v_cycle_record RECORD;
    v_total_assessments INTEGER;
    v_completed_assessments INTEGER;
    v_has_updated_at BOOLEAN;
BEGIN
    -- Validate CSRF token (basic implementation)
    IF _csrf_token IS NULL OR LENGTH(_csrf_token) < 10 THEN
        RETURN json_build_object('error', 'Invalid CSRF token');
    END IF;
    
    -- Get current user's employee record
    SELECT e.id, e.role INTO v_current_employee_id, v_employee_role
    FROM employees e
    WHERE e.user_id = auth.uid() AND e.is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Check if user is admin
    IF v_employee_role != 'admin' THEN
        RETURN json_build_object('error', 'Access denied: Admin privileges required');
    END IF;
    
    -- Check if updated_at column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'review_cycles' AND column_name = 'updated_at'
    ) INTO v_has_updated_at;
    
    -- Find the review cycle
    BEGIN
        SELECT * INTO v_cycle_record
        FROM review_cycles 
        WHERE id::text = p_cycle_id 
           OR name = p_cycle_id
           OR name ILIKE '%' || p_cycle_id || '%'
        ORDER BY created_at DESC
        LIMIT 1;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object('error', 'Error finding review cycle: ' || SQLERRM);
    END;
    
    -- If not found, return error with available cycles
    IF v_cycle_record.id IS NULL THEN
        RETURN json_build_object(
            'error', 'Review cycle not found with ID: ' || p_cycle_id,
            'available_cycles', (
                SELECT json_agg(json_build_object('id', id::text, 'name', name, 'status', status))
                FROM review_cycles 
                ORDER BY created_at DESC 
                LIMIT 5
            )
        );
    END IF;
    
    -- Check if cycle is already closed
    IF v_cycle_record.status = 'closed' THEN
        RETURN json_build_object('error', 'Review cycle "' || v_cycle_record.name || '" is already closed');
    END IF;
    
    -- Get assessment statistics
    SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
    INTO v_total_assessments, v_completed_assessments
    FROM assessments 
    WHERE review_cycle_id = v_cycle_record.id;
    
    -- Close the review cycle (handle missing updated_at column gracefully)
    IF v_has_updated_at THEN
        UPDATE review_cycles 
        SET status = 'closed', updated_at = NOW()
        WHERE id = v_cycle_record.id;
    ELSE
        UPDATE review_cycles 
        SET status = 'closed'
        WHERE id = v_cycle_record.id;
    END IF;
    
    -- Log the action (handle missing function gracefully)
    BEGIN
        PERFORM log_security_event(
            'review_cycle_closed',
            'cycle_id:' || v_cycle_record.id::text || ',name:' || v_cycle_record.name,
            true
        );
    EXCEPTION
        WHEN undefined_function THEN
            -- Ignore if logging function doesn't exist
            NULL;
    END;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Review cycle closed successfully',
        'cycle_id', v_cycle_record.id::text,
        'cycle_name', v_cycle_record.name,
        'total_assessments', v_total_assessments,
        'completed_assessments', v_completed_assessments
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to close review cycle: ' || SQLERRM);
END;
$$;


--
-- Name: create_employee(text, text, text, text, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_employee(p_name text, p_email text, p_job_title text DEFAULT NULL::text, p_role text DEFAULT 'employee'::text, p_manager_id uuid DEFAULT NULL::uuid, p_temp_password text DEFAULT NULL::text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_employee_id UUID;
    v_auth_user_id UUID;
    v_signup_result JSON;
BEGIN
    -- Security check
    IF NOT check_user_permission('admin') THEN
        RETURN json_build_object('error', 'Unauthorized: Admin access required');
    END IF;
    
    -- Validate inputs
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        RETURN json_build_object('error', 'Name is required');
    END IF;
    
    IF p_email IS NULL OR TRIM(p_email) = '' THEN
        RETURN json_build_object('error', 'Email is required');
    END IF;
    
    IF p_temp_password IS NULL OR LENGTH(TRIM(p_temp_password)) < 6 THEN
        RETURN json_build_object('error', 'Password is required and must be at least 6 characters');
    END IF;
    
    -- Check if email already exists in employees table
    IF EXISTS (SELECT 1 FROM employees WHERE email = LOWER(TRIM(p_email))) THEN
        RETURN json_build_object('error', 'Email already exists');
    END IF;
    
    -- Validate role
    IF p_role NOT IN ('employee', 'manager', 'admin') THEN
        RETURN json_build_object('error', 'Invalid role. Must be employee, manager, or admin');
    END IF;
    
    -- Validate manager if provided and not null UUID
    IF p_manager_id IS NOT NULL AND p_manager_id != '00000000-0000-0000-0000-000000000000'::UUID THEN
        IF NOT EXISTS (SELECT 1 FROM employees WHERE id = p_manager_id AND is_active = true) THEN
            RETURN json_build_object('error', 'Manager not found or inactive');
        END IF;
    END IF;
    
    -- First, create the Supabase auth user using admin API
    -- Note: This requires service role key, typically done via edge function
    -- For now, we'll create the employee record and return instructions for manual auth creation
    
    -- Insert employee record
    INSERT INTO employees (
        name,
        email,
        job_title,
        role,
        manager_id,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        TRIM(p_name),
        LOWER(TRIM(p_email)),
        COALESCE(NULLIF(TRIM(p_job_title), ''), NULL),
        p_role,
        CASE WHEN p_manager_id = '00000000-0000-0000-0000-000000000000'::UUID THEN NULL ELSE p_manager_id END,
        true,
        NOW(),
        NOW()
    ) RETURNING id INTO v_employee_id;
    
    -- Log the creation
    PERFORM log_security_event(
        'employee_created',
        'employee_id:' || v_employee_id::text || ',role:' || p_role,
        true
    );
    
    -- Return success with next steps for auth user creation
    RETURN json_build_object(
        'success', true,
        'message', 'Employee created successfully',
        'employee_id', v_employee_id,
        'next_steps', json_build_object(
            'action', 'create_auth_user',
            'email', LOWER(TRIM(p_email)),
            'password', p_temp_password,
            'employee_id', v_employee_id
        )
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to create employee: ' || SQLERRM);
END;
$$;


--
-- Name: create_employee_with_temp_password(text, text, text, text, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_employee_with_temp_password(p_name text, p_email text, p_job_title text, p_role text, p_manager_id uuid DEFAULT NULL::uuid, p_temp_password text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_employee_id uuid;
    v_result jsonb;
    v_auth_user_id uuid;
BEGIN
    -- Security check
    IF NOT check_user_permission('admin') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin access required');
    END IF;
    
    -- Validate inputs
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Name is required');
    END IF;
    
    IF p_email IS NULL OR TRIM(p_email) = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Email is required');
    END IF;
    
    -- Check if email already exists in employees table
    IF EXISTS (SELECT 1 FROM employees WHERE email = LOWER(TRIM(p_email))) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Employee with this email already exists');
    END IF;
    
    -- Try to create the Supabase auth user directly in the function
    -- This uses a different approach than the admin API
    BEGIN
        -- Insert into auth.users table directly (this requires service role permissions)
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            LOWER(TRIM(p_email)),
            crypt(p_temp_password, gen_salt('bf')), -- bcrypt encryption
            NOW(), -- auto-confirm email
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            jsonb_build_object('name', p_name),
            false,
            'authenticated'
        ) RETURNING id INTO v_auth_user_id;
        
    EXCEPTION WHEN OTHERS THEN
        -- If direct auth creation fails, we'll create employee record and handle auth separately
        v_auth_user_id := NULL;
    END;
    
    -- Insert the employee record
    INSERT INTO employees (
        name, 
        email, 
        job_title, 
        role, 
        manager_id, 
        temp_password, 
        must_change_password, 
        is_active,
        user_id,
        created_at,
        updated_at
    ) VALUES (
        TRIM(p_name),
        LOWER(TRIM(p_email)), 
        COALESCE(NULLIF(TRIM(p_job_title), ''), NULL), 
        p_role, 
        CASE WHEN p_manager_id = '00000000-0000-0000-0000-000000000000'::UUID THEN NULL ELSE p_manager_id END,
        p_temp_password, 
        true, 
        true,
        v_auth_user_id,
        NOW(),
        NOW()
    ) RETURNING id INTO v_employee_id;
    
    -- Log the creation
    PERFORM log_security_event(
        'employee_created',
        'employee_id:' || v_employee_id::text || ',role:' || p_role,
        true
    );
    
    -- Return success with appropriate next steps
    IF v_auth_user_id IS NOT NULL THEN
        v_result := jsonb_build_object(
            'success', true,
            'employee_id', v_employee_id,
            'auth_user_id', v_auth_user_id,
            'message', 'Employee and auth account created successfully',
            'can_login_immediately', true
        );
    ELSE
        v_result := jsonb_build_object(
            'success', true,
            'employee_id', v_employee_id,
            'message', 'Employee created successfully. Auth account will be created separately.',
            'can_login_immediately', false,
            'next_steps', jsonb_build_object(
                'action', 'create_auth_manually',
                'email', LOWER(TRIM(p_email)),
                'password', p_temp_password
            )
        );
    END IF;
    
    RETURN v_result;
    
EXCEPTION
    WHEN unique_violation THEN
        RETURN jsonb_build_object('success', false, 'error', 'Employee with this email already exists');
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', 'Failed to create employee: ' || SQLERRM);
END;
$$;


--
-- Name: create_notification(uuid, uuid, text, text, text, json); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_notification(p_recipient_id uuid, p_sender_id uuid, p_type text, p_title text, p_message text, p_data json DEFAULT NULL::json) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    -- Insert notification
    INSERT INTO notifications (
        recipient_id,
        sender_id,
        type,
        title,
        message,
        data,
        created_at,
        updated_at
    ) VALUES (
        p_recipient_id,
        p_sender_id,
        p_type,
        p_title,
        p_message,
        COALESCE(p_data, '{}'::json),
        NOW(),
        NOW()
    ) RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;


--
-- Name: create_notification(uuid, uuid, text, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_notification(p_recipient_id uuid, p_sender_id uuid, p_type text, p_title text, p_message text, p_data jsonb DEFAULT '{}'::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (
        recipient_id,
        sender_id,
        type,
        title,
        message,
        data,
        created_at
    ) VALUES (
        p_recipient_id,
        p_sender_id,
        p_type,
        p_title,
        p_message,
        p_data,
        NOW()
    ) RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;


--
-- Name: create_pulse_alert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_pulse_alert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Create alert for responses of 1 or 2 (concerning satisfaction levels)
    IF NEW.category = 'satisfaction' AND NEW.response <= 2 THEN
        INSERT INTO public.team_health_alerts (
            user_id,
            employee_id,
            employee_name,
            manager_id,
            department,
            question_id,
            question,
            response,
            severity
        )
        SELECT 
            NEW.user_id,
            NEW.employee_id,
            COALESCE(e.name, u.email),
            NEW.manager_id,
            NEW.department,
            NEW.question_id,
            NEW.question,
            NEW.response,
            CASE WHEN NEW.response = 1 THEN 'high' ELSE 'medium' END
        FROM auth.users u
        LEFT JOIN public.employees e ON e.user_id = u.id
        WHERE u.id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: create_simple_review_cycle(text, date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_simple_review_cycle(p_name text, p_start_date date, p_end_date date) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_cycle_id BIGINT;
BEGIN
    -- Security check using new function
    IF NOT check_user_permission('admin') THEN
        RETURN json_build_object('error', 'Unauthorized: Admin access required');
    END IF;
    
    -- Input validation
    IF p_name IS NULL OR LENGTH(TRIM(p_name)) = 0 THEN
        RETURN json_build_object('error', 'Review cycle name is required');
    END IF;
    
    IF p_start_date IS NULL OR p_end_date IS NULL THEN
        RETURN json_build_object('error', 'Start date and end date are required');
    END IF;
    
    IF p_start_date >= p_end_date THEN
        RETURN json_build_object('error', 'End date must be after start date');
    END IF;
    
    -- Create review cycle
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
        RETURN json_build_object('error', 'Database error occurred');
END;
$$;


--
-- Name: deactivate_pulse_question(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.deactivate_pulse_question(question_id_param text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    admin_check BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT EXISTS (
        SELECT 1 FROM public.employees 
        WHERE user_id = auth.uid() AND role = 'admin'
    ) INTO admin_check;
    
    IF NOT admin_check THEN
        RAISE EXCEPTION 'Only administrators can deactivate questions';
    END IF;
    
    -- Deactivate the question
    UPDATE public.pulse_questions 
    SET is_active = false, updated_at = NOW()
    WHERE question_id = question_id_param;
    
    RETURN FOUND;
END;
$$;


--
-- Name: FUNCTION deactivate_pulse_question(question_id_param text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.deactivate_pulse_question(question_id_param text) IS 'Soft delete a pulse question (admin only)';


--
-- Name: debug_auth_uid(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.debug_auth_uid() RETURNS TABLE(current_uid uuid, current_email text)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT auth.uid() as current_uid, auth.email() as current_email;
$$;


--
-- Name: delete_manager_note(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_manager_note(p_note_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: get_active_review_cycles_with_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_active_review_cycles_with_status() RETURNS TABLE(cycle_id bigint, cycle_name text, start_date date, end_date date, status text, total_assessments integer, completed_assessments integer, in_progress_assessments integer, not_started_assessments integer)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rc.id,
        rc.name,
        rc.start_date,
        rc.end_date,
        rc.status,
        COUNT(a.id)::INTEGER as total_assessments,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END)::INTEGER as completed_assessments,
        COUNT(CASE WHEN a.status = 'in_progress' THEN 1 END)::INTEGER as in_progress_assessments,
        COUNT(CASE WHEN a.status = 'not_started' THEN 1 END)::INTEGER as not_started_assessments
    FROM review_cycles rc
    LEFT JOIN assessments a ON rc.id = a.review_cycle_id
    WHERE rc.status = 'active'
    GROUP BY rc.id, rc.name, rc.start_date, rc.end_date, rc.status
    ORDER BY rc.created_at DESC;
END;
$$;


--
-- Name: get_all_departments(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_departments() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
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

CREATE FUNCTION public.get_all_employees_for_admin() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    result JSON;
BEGIN
    -- Security check
    IF NOT check_user_permission('admin') THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    -- Build JSON result with proper GROUP BY handling
    SELECT json_agg(employee_data) INTO result
    FROM (
        SELECT json_build_object(
            'id', e.id,
            'name', e.name,
            'email', e.email,
            'job_title', COALESCE(e.job_title, ''),
            'role', e.role,
            'manager_id', e.manager_id,
            'manager_name', COALESCE(m.name, ''),
            'is_active', e.is_active,
            'created_at', e.created_at,
            'updated_at', e.updated_at,
            'direct_reports_count', COALESCE(dr.direct_reports_count, 0)
        ) as employee_data
        FROM employees e
        LEFT JOIN employees m ON e.manager_id = m.id
        LEFT JOIN (
            SELECT 
                manager_id, 
                COUNT(*) as direct_reports_count
            FROM employees 
            WHERE is_active = true AND manager_id IS NOT NULL
            GROUP BY manager_id
        ) dr ON e.id = dr.manager_id
        ORDER BY e.name
    ) employees_with_data;
    
    RETURN COALESCE(result, '[]'::json);
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to fetch employees: %', SQLERRM;
END;
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

CREATE FUNCTION public.get_assessment_details(p_assessment_id bigint) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_current_employee_id UUID;
    v_assessment JSONB;
    v_user_role TEXT;
BEGIN
    -- Get the employee_id and role for the currently authenticated user
    SELECT id, role INTO v_current_employee_id, v_user_role FROM public.employees WHERE user_id = auth.uid() AND is_active = true;

    IF v_current_employee_id IS NULL THEN
        RETURN '[{"error": "Employee not found for current user"}]'::jsonb;
    END IF;

    -- Get full assessment details with employee and cycle information
    SELECT jsonb_agg(assessment_data) INTO v_assessment
    FROM (
        SELECT jsonb_build_object(
            'assessment_id', a.id,
            'employee_id', a.employee_id,
            'employee_name', e.name,
            'employee_email', e.email,
            'employee_job_title', e.job_title,
            'review_cycle_id', rc.id,
            'review_cycle_name', rc.name,
            'review_cycle_status', rc.status,
            'self_assessment_status', a.self_assessment_status,
            'manager_review_status', a.manager_review_status,
            'employee_acknowledgment', COALESCE(a.employee_acknowledgment, false),
            'due_date', a.due_date,
            'created_at', a.created_at,
            'updated_at', a.updated_at,
            
            -- Employee Self-Assessment Data
            'employee_strengths', a.employee_strengths,
            'employee_improvements', a.employee_improvements,
            'value_passionate_examples', a.value_passionate_examples,
            'value_driven_examples', a.value_driven_examples,
            'value_resilient_examples', a.value_resilient_examples,
            'value_responsive_examples', a.value_responsive_examples,
            'gwc_gets_it', COALESCE(a.gwc_gets_it, false),
            'gwc_gets_it_feedback', a.gwc_gets_it_feedback,
            'gwc_wants_it', COALESCE(a.gwc_wants_it, false),
            'gwc_wants_it_feedback', a.gwc_wants_it_feedback,
            'gwc_capacity', COALESCE(a.gwc_capacity, false),
            'gwc_capacity_feedback', a.gwc_capacity_feedback,

            -- Manager Review Data
            'manager_performance_rating', a.manager_performance_rating,
            'manager_summary_comments', a.manager_summary_comments,
            'manager_core_values_feedback', a.manager_core_values_feedback,
            'manager_development_plan', a.manager_development_plan,
            'manager_action_items', a.manager_action_items,

            -- Manager Feedback for Two-Column Layout
            'manager_passionate_feedback', a.manager_passionate_feedback,
            'manager_driven_feedback', a.manager_driven_feedback,
            'manager_resilient_feedback', a.manager_resilient_feedback,
            'manager_responsive_feedback', a.manager_responsive_feedback,
            'manager_gwc_gets_it_feedback', a.manager_gwc_gets_it_feedback,
            'manager_gwc_wants_it_feedback', a.manager_gwc_wants_it_feedback,
            'manager_gwc_capacity_feedback', a.manager_gwc_capacity_feedback,
            'manager_strengths_feedback', a.manager_strengths_feedback,
            'manager_improvements_feedback', a.manager_improvements_feedback,

            -- Permission flags
            'can_edit_self_assessment', (
                (v_user_role = 'admin') OR
                (a.employee_id = v_current_employee_id AND rc.status = 'active' AND 
                 a.self_assessment_status IN ('not_started', 'in_progress'))
            ),
            'can_edit_manager_review', (
                (v_user_role = 'admin') OR
                (v_user_role = 'manager' AND e.manager_id = v_current_employee_id AND 
                 a.self_assessment_status = 'employee_complete' AND a.manager_review_status = 'pending')
            ),
            'is_manager_view', (v_user_role = 'manager' AND e.manager_id = v_current_employee_id),

            -- Rocks data (placeholder - extend if you have rocks table)
            'rocks', '[]'::jsonb
        ) as assessment_data
        FROM public.assessments a
        JOIN public.employees e ON a.employee_id = e.id
        JOIN public.review_cycles rc ON a.review_cycle_id = rc.id
        WHERE a.id = p_assessment_id
        AND (
            -- User can see their own assessments
            a.employee_id = v_current_employee_id OR
            -- Managers can see their team's assessments  
            (v_user_role = 'manager' AND e.manager_id = v_current_employee_id) OR
            -- Admins can see all assessments
            v_user_role = 'admin'
        )
    ) assessment_query;

    -- Return the assessment array (matching the expected format)
    RETURN COALESCE(v_assessment, '[]'::jsonb);
END;
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
-- Name: get_assessment_for_manager_review(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_assessment_for_manager_review(p_assessment_id bigint) RETURNS TABLE(id bigint, employee_id uuid, employee_name text, employee_email text, employee_job_title text, review_cycle_id bigint, cycle_name text, cycle_status text, due_date date, self_assessment_status text, manager_review_status text, self_assessment_data jsonb, manager_review_data jsonb, value_passionate_examples text, value_driven_examples text, value_resilient_examples text, value_responsive_examples text, gwc_gets_it boolean, gwc_gets_it_feedback text, gwc_wants_it boolean, gwc_wants_it_feedback text, gwc_capacity boolean, gwc_capacity_feedback text, manager_performance_rating text, manager_summary_comments text, employee_submitted_at timestamp with time zone, manager_reviewed_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: get_company_satisfaction(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_company_satisfaction(days_back integer DEFAULT 30) RETURNS TABLE(avg_satisfaction numeric, response_count bigint, departments_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(r.response), 2) as avg_satisfaction,
        COUNT(*) as response_count,
        COUNT(DISTINCT r.department) as departments_count
    FROM public.team_health_pulse_responses r
    WHERE 
        r.category = 'satisfaction' 
        AND r.timestamp >= NOW() - INTERVAL '1 day' * days_back;
END;
$$;


--
-- Name: FUNCTION get_company_satisfaction(days_back integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_company_satisfaction(days_back integer) IS 'Calculates company-wide satisfaction metrics';


--
-- Name: get_current_employee_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_employee_id() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_employee_id UUID;
BEGIN
    SELECT id INTO v_employee_id
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    RETURN v_employee_id;
END;
$$;


--
-- Name: get_current_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_user_role() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    user_record employees%ROWTYPE;
    result JSON;
BEGIN
    -- Get employee record based on authenticated user
    SELECT * INTO user_record
    FROM employees 
    WHERE user_id = auth.uid() 
    AND is_active = true;
    
    -- If no record found, check by email as fallback
    IF NOT FOUND AND auth.email() IS NOT NULL THEN
        SELECT * INTO user_record
        FROM employees 
        WHERE LOWER(email) = LOWER(auth.email())
        AND is_active = true;
    END IF;
    
    -- If still no record found, return unauthorized
    IF NOT FOUND THEN
        RETURN json_build_object(
            'authorized', false,
            'role', null,
            'error', 'User not found or inactive'
        );
    END IF;
    
    -- Return secure user info
    RETURN json_build_object(
        'authorized', true,
        'role', user_record.role,
        'employee_id', user_record.id,
        'name', user_record.name,
        'permissions', CASE 
            WHEN user_record.role = 'admin' THEN json_build_array('read', 'write', 'admin', 'manage_users', 'manage_cycles')
            WHEN user_record.role = 'manager' THEN json_build_array('read', 'write', 'manage_team')
            ELSE json_build_array('read', 'write')
        END
    );
END;
$$;


--
-- Name: get_current_user_session(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_user_session() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    user_record employees%ROWTYPE;
    session_data JSON;
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL AND auth.email() IS NULL THEN
        RETURN json_build_object(
            'authenticated', false,
            'error', 'No valid session'
        );
    END IF;
    
    -- Get employee record by user_id first
    SELECT * INTO user_record
    FROM employees 
    WHERE user_id = auth.uid() 
    AND is_active = true;
    
    -- Fallback - try by email
    IF NOT FOUND AND auth.email() IS NOT NULL THEN
        SELECT * INTO user_record
        FROM employees 
        WHERE LOWER(email) = LOWER(auth.email())
        AND is_active = true;
    END IF;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'authenticated', false,
            'error', 'User record not found'
        );
    END IF;
    
    -- Return safe session data (no sensitive info)
    RETURN json_build_object(
        'authenticated', true,
        'user_id', user_record.id,
        'name', user_record.name,
        'role', user_record.role,
        'email', user_record.email,
        'job_title', user_record.job_title,
        'session_valid', true
    );
END;
$$;


--
-- Name: get_dashboard_stats(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_dashboard_stats(p_role text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_current_employee_id UUID;
    v_stats JSONB;
BEGIN
    -- Get the employee_id for the currently authenticated user
    SELECT id INTO v_current_employee_id FROM public.employees WHERE user_id = auth.uid() AND is_active = true;

    IF v_current_employee_id IS NULL THEN
        RETURN '{"error": "Employee not found for current user"}'::jsonb;
    END IF;

    -- Generate stats based on the provided role
    IF p_role = 'admin' THEN
        SELECT jsonb_build_object(
            'employees', jsonb_build_object(
                'total', (SELECT COUNT(*) FROM public.employees WHERE is_active = true),
                'by_role', jsonb_build_object(
                    'admin', (SELECT COUNT(*) FROM public.employees WHERE is_active = true AND role = 'admin'),
                    'manager', (SELECT COUNT(*) FROM public.employees WHERE is_active = true AND role = 'manager'),
                    'employee', (SELECT COUNT(*) FROM public.employees WHERE is_active = true AND role = 'employee')
                )
            ),
            'review_cycles', jsonb_build_object(
                'active', (SELECT COUNT(*) FROM public.review_cycles WHERE status = 'active'),
                'total', (SELECT COUNT(*) FROM public.review_cycles)
            ),
            'assessments', jsonb_build_object(
                'pending', (
                    SELECT COUNT(*) FROM public.assessments a
                    JOIN public.review_cycles rc ON a.review_cycle_id = rc.id
                    WHERE rc.status = 'active' AND a.self_assessment_status IN ('not_started', 'in_progress')
                ),
                'completed', (
                    SELECT COUNT(*) FROM public.assessments a
                    JOIN public.review_cycles rc ON a.review_cycle_id = rc.id
                    WHERE rc.status = 'active' AND a.self_assessment_status = 'employee_complete'
                ),
                'manager_reviews_pending', (
                    SELECT COUNT(*) FROM public.assessments a
                    JOIN public.review_cycles rc ON a.review_cycle_id = rc.id
                    WHERE rc.status = 'active' AND a.self_assessment_status = 'employee_complete' AND a.manager_review_status = 'pending'
                ),
                'total', (
                    SELECT COUNT(*) FROM public.assessments a
                    JOIN public.review_cycles rc ON a.review_cycle_id = rc.id
                    WHERE rc.status = 'active'
                )
            )
        ) INTO v_stats;
        
    ELSIF p_role = 'manager' THEN
        -- FIXED: Separate subqueries to avoid GROUP BY issues
        SELECT jsonb_build_object(
            'team', jsonb_build_object(
                'total_members', (
                    SELECT COUNT(*) 
                    FROM public.employees 
                    WHERE manager_id = v_current_employee_id AND is_active = true
                ),
                'team_members', (
                    SELECT COALESCE(jsonb_agg(
                        jsonb_build_object(
                            'id', id,
                            'name', name,
                            'email', email,
                            'job_title', job_title
                        ) ORDER BY name
                    ), '[]'::jsonb)
                    FROM public.employees 
                    WHERE manager_id = v_current_employee_id AND is_active = true
                )
            ),
            'pending_reviews', (
                SELECT COUNT(*) FROM public.assessments a
                JOIN public.employees e ON a.employee_id = e.id
                JOIN public.review_cycles rc ON a.review_cycle_id = rc.id
                WHERE e.manager_id = v_current_employee_id 
                AND rc.status = 'active' 
                AND a.self_assessment_status = 'employee_complete' 
                AND a.manager_review_status = 'pending'
            ),
            'team_performance', (
                SELECT COALESCE(jsonb_agg(
                    jsonb_build_object(
                        'employee_id', e.id,
                        'employee_name', e.name,
                        'employee_job_title', e.job_title,
                        'assessment_id', a.id,
                        'cycle_name', rc.name,
                        'assessment_status', a.self_assessment_status,
                        'manager_review_status', a.manager_review_status,
                        'due_date', a.due_date
                    ) ORDER BY a.created_at DESC
                ), '[]'::jsonb)
                FROM public.assessments a
                JOIN public.employees e ON a.employee_id = e.id
                JOIN public.review_cycles rc ON a.review_cycle_id = rc.id
                WHERE e.manager_id = v_current_employee_id AND rc.status = 'active'
            ),
            'assessments', jsonb_build_object(
                'team_completion_rate', CASE 
                    WHEN (
                        SELECT COUNT(*) FROM public.assessments a 
                        JOIN public.employees e ON a.employee_id = e.id 
                        JOIN public.review_cycles rc ON a.review_cycle_id = rc.id 
                        WHERE e.manager_id = v_current_employee_id AND rc.status = 'active'
                    ) > 0 
                    THEN ROUND((
                        (SELECT COUNT(*) FROM public.assessments a 
                         JOIN public.employees e ON a.employee_id = e.id 
                         JOIN public.review_cycles rc ON a.review_cycle_id = rc.id 
                         WHERE e.manager_id = v_current_employee_id AND rc.status = 'active' 
                         AND a.self_assessment_status = 'employee_complete')::numeric / 
                        (SELECT COUNT(*) FROM public.assessments a 
                         JOIN public.employees e ON a.employee_id = e.id 
                         JOIN public.review_cycles rc ON a.review_cycle_id = rc.id 
                         WHERE e.manager_id = v_current_employee_id AND rc.status = 'active')::numeric
                    ) * 100)
                    ELSE 0 
                END
            )
        ) INTO v_stats;
        
    ELSE -- 'employee' role
        SELECT jsonb_build_object(
            'assessments', jsonb_build_object(
                'pending', (
                    SELECT COUNT(*) FROM public.assessments a
                    JOIN public.review_cycles rc ON a.review_cycle_id = rc.id
                    WHERE a.employee_id = v_current_employee_id AND rc.status = 'active' 
                    AND a.self_assessment_status IN ('not_started', 'in_progress')
                ),
                'completed', (
                    SELECT COUNT(*) FROM public.assessments a
                    JOIN public.review_cycles rc ON a.review_cycle_id = rc.id
                    WHERE a.employee_id = v_current_employee_id AND rc.status = 'active' 
                    AND a.self_assessment_status = 'employee_complete'
                ),
                'manager_reviews_completed', (
                    SELECT COUNT(*) FROM public.assessments a
                    JOIN public.review_cycles rc ON a.review_cycle_id = rc.id
                    WHERE a.employee_id = v_current_employee_id AND rc.status = 'active' 
                    AND a.manager_review_status = 'completed'
                ),
                'total', (
                    SELECT COUNT(*) FROM public.assessments a
                    JOIN public.review_cycles rc ON a.review_cycle_id = rc.id
                    WHERE a.employee_id = v_current_employee_id AND rc.status = 'active'
                )
            )
        ) INTO v_stats;
    END IF;

    RETURN v_stats;
END;
$$;


--
-- Name: get_department_satisfaction(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_department_satisfaction(dept_name text DEFAULT NULL::text, days_back integer DEFAULT 30) RETURNS TABLE(department text, avg_satisfaction numeric, response_count bigint, last_response timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(r.department, 'Unknown') as department,
        ROUND(AVG(r.response), 2) as avg_satisfaction,
        COUNT(*) as response_count,
        MAX(r.timestamp) as last_response
    FROM public.team_health_pulse_responses r
    WHERE 
        r.category = 'satisfaction' 
        AND r.timestamp >= NOW() - INTERVAL '1 day' * days_back
        AND (dept_name IS NULL OR r.department = dept_name)
    GROUP BY r.department
    ORDER BY avg_satisfaction DESC;
END;
$$;


--
-- Name: FUNCTION get_department_satisfaction(dept_name text, days_back integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_department_satisfaction(dept_name text, days_back integer) IS 'Calculates average satisfaction score by department';


--
-- Name: get_development_plans(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_development_plans() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
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
    
    -- Get development plans for current user
    SELECT json_agg(
        json_build_object(
            'id', dp.id,
            'title', dp.title,
            'description', COALESCE(dp.description, ''),
            'goals', dp.goals,
            'skills_to_develop', dp.skills_to_develop,
            'timeline', COALESCE(dp.timeline, ''),
            'status', dp.status,
            'manager_feedback', COALESCE(dp.manager_feedback, ''),
            'manager_reviewed_at', dp.manager_reviewed_at,
            'created_at', dp.created_at,
            'updated_at', dp.updated_at,
            'days_since_submission', EXTRACT(days FROM NOW() - dp.created_at)::INTEGER
        ) ORDER BY dp.created_at DESC
    ) INTO result
    FROM development_plans dp
    WHERE dp.employee_id = v_current_employee_id;
    
    RETURN COALESCE(result, '[]'::json);
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to get development plans: ' || SQLERRM);
END;
$$;


--
-- Name: get_development_plans_for_review(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_development_plans_for_review() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_current_employee_id UUID;
    v_employee_role TEXT;
    result JSON;
BEGIN
    -- Get current user's employee ID and role
    SELECT e.id, e.role INTO v_current_employee_id, v_employee_role
    FROM employees e 
    WHERE e.user_id = auth.uid() AND e.is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN '[]'::json;
    END IF;
    
    -- Get development plans for review based on role
    IF v_employee_role = 'admin' THEN
        -- Admin can see all plans
        SELECT json_agg(
            json_build_object(
                'id', dp.id,
                'employee_id', dp.employee_id,
                'employee_name', e.name,
                'employee_email', e.email,
                'manager_id', dp.manager_id,
                'manager_name', m.name,
                'goals', dp.goals,
                'objectives', dp.objectives,
                'skills_to_develop', dp.skills_to_develop,
                'resources_needed', dp.resources_needed,
                'success_metrics', dp.success_metrics,
                'target_completion_date', dp.target_completion_date,
                'status', dp.status,
                'manager_feedback', dp.manager_feedback,
                'manager_rating', dp.manager_rating,
                'submission_date', dp.submission_date,
                'review_date', dp.review_date,
                'created_at', dp.created_at,
                'updated_at', dp.updated_at
            ) ORDER BY dp.created_at DESC
        ) INTO result
        FROM development_plans dp
        JOIN employees e ON dp.employee_id = e.id
        LEFT JOIN employees m ON dp.manager_id = m.id
        WHERE dp.status IN ('submitted', 'under_review');
        
    ELSE
        -- Manager can see plans for their direct reports
        SELECT json_agg(
            json_build_object(
                'id', dp.id,
                'employee_id', dp.employee_id,
                'employee_name', e.name,
                'employee_email', e.email,
                'manager_id', dp.manager_id,
                'manager_name', m.name,
                'goals', dp.goals,
                'objectives', dp.objectives,
                'skills_to_develop', dp.skills_to_develop,
                'resources_needed', dp.resources_needed,
                'success_metrics', dp.success_metrics,
                'target_completion_date', dp.target_completion_date,
                'status', dp.status,
                'manager_feedback', dp.manager_feedback,
                'manager_rating', dp.manager_rating,
                'submission_date', dp.submission_date,
                'review_date', dp.review_date,
                'created_at', dp.created_at,
                'updated_at', dp.updated_at
            ) ORDER BY dp.created_at DESC
        ) INTO result
        FROM development_plans dp
        JOIN employees e ON dp.employee_id = e.id
        LEFT JOIN employees m ON dp.manager_id = m.id
        WHERE dp.manager_id = v_current_employee_id 
        AND dp.status IN ('submitted', 'under_review');
    END IF;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;


--
-- Name: get_employee_departments(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_employee_departments(p_employee_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: get_employee_notes(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_employee_notes(p_employee_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: get_employee_primary_department(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_employee_primary_department(emp_id uuid) RETURNS TABLE(dept_name text, dept_id integer)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT d.name, d.id
    FROM public.departments d
    JOIN public.employee_departments ed ON d.id = ed.department_id
    WHERE ed.employee_id = emp_id AND ed.is_primary = true
    LIMIT 1;
END;
$$;


--
-- Name: FUNCTION get_employee_primary_department(emp_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_employee_primary_department(emp_id uuid) IS 'Returns the primary department name and ID for an employee';


--
-- Name: get_employee_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_employee_profile() RETURNS TABLE(employee_id uuid, name text, email text, job_title text, manager_name text, created_at timestamp with time zone)
    LANGUAGE sql SECURITY DEFINER
    AS $$
    SELECT 
        e.id,
        e.name,
        e.email,
        e.job_title,
        m.name as manager_name,
        e.created_at
    FROM employees e
    LEFT JOIN employees m ON e.manager_id = m.id
    WHERE e.user_id = auth.uid();
$$;


--
-- Name: get_employee_with_departments(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_employee_with_departments(p_employee_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_current_employee_id UUID;
    v_employee_role TEXT;
    result JSON;
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
    
    -- Get employee details with departments
    SELECT json_build_object(
        'employee', json_build_object(
            'id', e.id,
            'name', e.name,
            'email', e.email,
            'job_title', e.job_title,
            'role', e.role,
            'manager_id', e.manager_id,
            'is_active', e.is_active,
            'created_at', e.created_at,
            'updated_at', e.updated_at
        ),
        'departments', COALESCE(
            (SELECT json_agg(d.id)
             FROM employee_departments ed
             JOIN departments d ON ed.department_id = d.id
             WHERE ed.employee_id = e.id),
            '[]'::json
        ),
        'department_names', COALESCE(
            (SELECT json_agg(d.name)
             FROM employee_departments ed
             JOIN departments d ON ed.department_id = d.id
             WHERE ed.employee_id = e.id),
            '[]'::json
        )
    ) INTO result
    FROM employees e
    WHERE e.id = p_employee_id;
    
    IF result IS NULL THEN
        RETURN json_build_object('error', 'Employee not found');
    END IF;
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to get employee details: ' || SQLERRM);
END;
$$;


--
-- Name: get_employees_for_feedback(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_employees_for_feedback() RETURNS TABLE(employee_id uuid, name text, email text, job_title text)
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: get_employees_simple(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_employees_simple() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    result JSON;
BEGIN
    -- Security check
    IF NOT check_user_permission('admin') THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    -- Simple query without complex joins to avoid GROUP BY issues
    SELECT json_agg(
        json_build_object(
            'id', id,
            'name', name,
            'email', email,
            'job_title', COALESCE(job_title, ''),
            'role', role,
            'manager_id', manager_id,
            'manager_name', '',  -- Will be populated by client if needed
            'is_active', is_active,
            'created_at', created_at,
            'updated_at', updated_at,
            'direct_reports_count', 0  -- Will be calculated by client if needed
        )
    ) INTO result
    FROM employees
    ORDER BY name;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;


--
-- Name: get_feedback_wall(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_feedback_wall(p_limit integer DEFAULT 50, p_feedback_type text DEFAULT NULL::text) RETURNS TABLE(feedback_id bigint, giver_id uuid, giver_name text, recipient_id uuid, recipient_name text, feedback_type text, category text, message text, is_anonymous boolean, helpful_count integer, created_at timestamp with time zone, can_see_giver boolean)
    LANGUAGE plpgsql SECURITY DEFINER
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
-- Name: get_manager_employees(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_manager_employees() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: get_my_assessments(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_assessments() RETURNS TABLE(id bigint, employee_id uuid, review_cycle_id bigint, due_date date, self_assessment_status text, manager_review_status text, self_assessment_data jsonb, manager_review_data jsonb, employee_acknowledged_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone, cycle_name text, cycle_status text, review_cycle_name text, employee_name text, manager_name text, value_passionate_examples text, value_driven_examples text, value_resilient_examples text, value_responsive_examples text, gwc_gets_it boolean, gwc_gets_it_feedback text, gwc_wants_it boolean, gwc_wants_it_feedback text, gwc_capacity boolean, gwc_capacity_feedback text, manager_performance_rating text, manager_summary_comments text, employee_submitted_at timestamp with time zone, manager_reviewed_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  BEGIN
      RETURN QUERY
      SELECT
          a.id,
          a.employee_id,
          a.review_cycle_id,
          a.due_date,
          a.self_assessment_status,
          a.manager_review_status,
          a.self_assessment_data,
          a.manager_review_data,
          a.employee_acknowledged_at,  -- This field was missing from the original function
          a.created_at,
          a.updated_at,
          rc.name as cycle_name,
          rc.status as cycle_status,
          rc.name as review_cycle_name,
          e.name as employee_name,
          m.name as manager_name,
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
          a.manager_reviewed_at
      FROM assessments a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN employees m ON e.manager_id = m.id
      JOIN review_cycles rc ON a.review_cycle_id = rc.id
      WHERE e.user_id = auth.uid()
      ORDER BY a.created_at DESC;
  END;
  $$;


--
-- Name: get_my_development_goals(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_development_goals() RETURNS TABLE(goal_id uuid, goal_type text, title text, description text, target_date date, status text, priority text, created_at timestamp with time zone, days_until_target integer)
    LANGUAGE sql SECURITY DEFINER
    AS $$
    SELECT 
        g.goal_id,
        g.goal_type,
        g.title,
        g.description,
        g.target_date,
        g.status,
        g.priority,
        g.created_at,
        CASE 
            WHEN g.target_date IS NOT NULL 
            THEN (g.target_date - CURRENT_DATE)::integer
            ELSE NULL
        END as days_until_target
    FROM employee_development_goals g
    WHERE g.employee_id = (SELECT id FROM employees WHERE user_id = auth.uid())
    ORDER BY g.created_at DESC;
$$;


--
-- Name: get_my_development_plans(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_development_plans() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
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
    
    -- Get development plans for current employee
    SELECT json_agg(
        json_build_object(
            'id', dp.id,
            'goals', dp.goals,
            'objectives', dp.objectives,
            'skills_to_develop', dp.skills_to_develop,
            'resources_needed', dp.resources_needed,
            'success_metrics', dp.success_metrics,
            'target_completion_date', dp.target_completion_date,
            'status', dp.status,
            'manager_feedback', dp.manager_feedback,
            'manager_rating', dp.manager_rating,
            'submission_date', dp.submission_date,
            'review_date', dp.review_date,
            'created_at', dp.created_at,
            'updated_at', dp.updated_at,
            'manager_name', m.name
        ) ORDER BY dp.created_at DESC
    ) INTO result
    FROM development_plans dp
    LEFT JOIN employees m ON dp.manager_id = m.id
    WHERE dp.employee_id = v_current_employee_id;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;


--
-- Name: get_my_feedback_given(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_feedback_given(p_limit integer DEFAULT 20) RETURNS TABLE(feedback_id bigint, recipient_name text, feedback_type text, category text, message text, is_anonymous boolean, helpful_count integer, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
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
          recipient.name,
          pf.feedback_type,
          pf.category,
          pf.message,
          pf.is_anonymous,
          pf.helpful_count,
          pf.created_at
      FROM peer_feedback pf
      JOIN employees recipient ON pf.recipient_id = recipient.id
      WHERE pf.giver_id = current_emp_id
      ORDER BY pf.created_at DESC
      LIMIT p_limit;
  END;
  $$;


--
-- Name: get_my_feedback_received(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_feedback_received(p_limit integer DEFAULT 20) RETURNS TABLE(feedback_id bigint, giver_name text, feedback_type text, category text, message text, is_anonymous boolean, helpful_count integer, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
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
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Try to get role by user_id first
    SELECT role INTO user_role
    FROM employees 
    WHERE user_id = auth.uid() 
    AND is_active = true;
    
    -- Fallback - check by email
    IF user_role IS NULL AND auth.email() IS NOT NULL THEN
        SELECT role INTO user_role
        FROM employees 
        WHERE LOWER(email) = LOWER(auth.email())
        AND is_active = true;
    END IF;
    
    -- Return role or default to employee
    RETURN COALESCE(user_role, 'employee');
END;
$$;


--
-- Name: get_my_team(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_team() RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_current_employee_id UUID;
    v_team JSONB;
BEGIN
    -- Get the employee_id for the currently authenticated user
    SELECT id INTO v_current_employee_id FROM public.employees WHERE user_id = auth.uid() AND is_active = true;

    IF v_current_employee_id IS NULL THEN
        RETURN '{"error": "Employee not found for current user"}'::jsonb;
    END IF;

    -- Get team members
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', id,
        'name', name,
        'email', email,
        'job_title', job_title,
        'role', role,
        'is_active', is_active,
        'created_at', created_at
    ) ORDER BY name), '[]'::jsonb) INTO v_team
    FROM public.employees
    WHERE manager_id = v_current_employee_id AND is_active = true;

    RETURN v_team;
END;
$$;


--
-- Name: get_my_training_requests(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_training_requests() RETURNS TABLE(request_id uuid, request_type text, title text, description text, provider text, estimated_cost numeric, preferred_date date, business_justification text, status text, manager_notes text, created_at timestamp with time zone, days_since_request integer)
    LANGUAGE sql SECURITY DEFINER
    AS $$
    SELECT 
        tr.request_id,
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
        (CURRENT_DATE - tr.created_at::date)::integer as days_since_request
    FROM training_requests tr
    WHERE tr.employee_id = (SELECT id FROM employees WHERE user_id = auth.uid())
    ORDER BY tr.created_at DESC;
$$;


--
-- Name: get_pending_admin_approvals(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_pending_admin_approvals() RETURNS TABLE(assessment_id bigint, employee_name text, employee_email text, manager_name text, manager_email text, review_cycle_name text, submitted_date timestamp with time zone, due_date date, manager_performance_rating text, manager_summary_comments text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_user_role text;
    v_current_employee_id uuid;
BEGIN
    -- Get current user's role and employee ID
    SELECT role INTO v_user_role FROM auth.users WHERE id = auth.uid();
    
    -- Only admins can access this function
    IF v_user_role != 'admin' THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;

    RETURN QUERY
    SELECT 
        a.id as assessment_id,
        e.name as employee_name,
        e.email as employee_email,
        m.name as manager_name,
        m.email as manager_email,
        rc.name as review_cycle_name,
        a.manager_reviewed_at as submitted_date,
        a.due_date,
        a.manager_performance_rating,
        a.manager_summary_comments
    FROM assessments a
    JOIN employees e ON a.employee_id = e.id
    JOIN employees m ON e.manager_id = m.id  -- Get the manager who submitted the review
    JOIN review_cycles rc ON a.review_cycle_id = rc.id
    WHERE a.self_assessment_status = 'pending_admin_approval'
    AND rc.status = 'active'
    ORDER BY a.manager_reviewed_at DESC;
END;
$$;


--
-- Name: get_potential_managers(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_potential_managers() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    result JSON;
    manager_count INTEGER;
BEGIN
    -- Security check
    IF NOT check_user_permission('admin') THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;
    
    -- Check if we have any potential managers
    SELECT COUNT(*) INTO manager_count
    FROM employees
    WHERE is_active = true 
    AND role IN ('manager', 'admin');
    
    -- If no managers, return empty array
    IF manager_count = 0 THEN
        RETURN '[]'::json;
    END IF;
    
    -- Build manager list (removed the problematic ORDER BY in json_agg)
    SELECT json_agg(manager_data) INTO result
    FROM (
        SELECT json_build_object(
            'id', id,
            'name', name,
            'email', email,
            'job_title', COALESCE(job_title, ''),
            'role', role
        ) as manager_data
        FROM employees
        WHERE is_active = true 
        AND role IN ('manager', 'admin')
        ORDER BY name
    ) ordered_managers;
    
    RETURN COALESCE(result, '[]'::json);
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to fetch potential managers: %', SQLERRM;
END;
$$;


--
-- Name: get_question_performance_ranking(text, uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_question_performance_ranking(department_filter text DEFAULT NULL::text, manager_id_filter uuid DEFAULT NULL::uuid, days_back integer DEFAULT 30) RETURNS TABLE(question_id text, question_text text, avg_response numeric, total_responses bigint, satisfaction_percentage numeric, performance_rank text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    WITH question_stats AS (
        SELECT 
            pq.question_id as q_id,
            pq.question_text as q_text,
            ROUND(AVG(r.response), 2) as q_avg_response,
            COUNT(r.id) as q_total_responses,
            ROUND(
                (COUNT(CASE WHEN r.response >= 4 THEN 1 END)::NUMERIC / 
                 NULLIF(COUNT(r.id), 0)) * 100, 1
            ) as q_satisfaction_percentage
        FROM public.pulse_questions pq
        LEFT JOIN public.team_health_pulse_responses r ON r.question_id = pq.question_id
            AND r.timestamp >= NOW() - INTERVAL '1 day' * days_back
            AND (department_filter IS NULL OR r.department = department_filter)
            AND (manager_id_filter IS NULL OR r.manager_id = manager_id_filter)
        WHERE pq.is_active = true
        GROUP BY pq.question_id, pq.question_text
        HAVING COUNT(r.id) >= 3 -- Only include questions with at least 3 responses
    ),
    ranked_questions AS (
        SELECT 
            q_id,
            q_text,
            q_avg_response,
            q_total_responses,
            q_satisfaction_percentage,
            ROW_NUMBER() OVER (ORDER BY q_avg_response DESC, q_satisfaction_percentage DESC) as rank_desc,
            ROW_NUMBER() OVER (ORDER BY q_avg_response ASC, q_satisfaction_percentage ASC) as rank_asc,
            COUNT(*) OVER () as total_count
        FROM question_stats
    )
    -- Get top 2 questions
    SELECT 
        q_id as question_id,
        q_text as question_text,
        q_avg_response as avg_response,
        q_total_responses as total_responses,
        q_satisfaction_percentage as satisfaction_percentage,
        'top'::TEXT as performance_rank
    FROM ranked_questions 
    WHERE rank_desc <= 2
    
    UNION ALL
    
    -- Get bottom 2 questions
    SELECT 
        q_id as question_id,
        q_text as question_text,
        q_avg_response as avg_response,
        q_total_responses as total_responses,
        q_satisfaction_percentage as satisfaction_percentage,
        'bottom'::TEXT as performance_rank
    FROM ranked_questions 
    WHERE rank_asc <= 2
    
    ORDER BY performance_rank DESC, avg_response DESC;
END;
$$;


--
-- Name: get_question_statistics(text, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_question_statistics(question_id_param text DEFAULT NULL::text, department_filter text DEFAULT NULL::text, days_back integer DEFAULT 30) RETURNS TABLE(question_id text, question_text text, category text, total_responses bigint, avg_response numeric, response_1_count bigint, response_2_count bigint, response_3_count bigint, response_4_count bigint, response_5_count bigint, satisfaction_percentage numeric, last_response timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pq.question_id as q_id,
        pq.question_text as q_text,
        pq.category as q_category,
        COUNT(r.id) as q_total_responses,
        ROUND(AVG(r.response), 2) as q_avg_response,
        COUNT(CASE WHEN r.response = 1 THEN 1 END) as q_response_1_count,
        COUNT(CASE WHEN r.response = 2 THEN 1 END) as q_response_2_count,
        COUNT(CASE WHEN r.response = 3 THEN 1 END) as q_response_3_count,
        COUNT(CASE WHEN r.response = 4 THEN 1 END) as q_response_4_count,
        COUNT(CASE WHEN r.response = 5 THEN 1 END) as q_response_5_count,
        ROUND(
            (COUNT(CASE WHEN r.response >= 4 THEN 1 END)::NUMERIC / 
             NULLIF(COUNT(r.id), 0)) * 100, 1
        ) as q_satisfaction_percentage,
        MAX(r.timestamp) as q_last_response
    FROM public.pulse_questions pq
    LEFT JOIN public.team_health_pulse_responses r ON r.question_id = pq.question_id
        AND r.timestamp >= NOW() - INTERVAL '1 day' * days_back
        AND (department_filter IS NULL OR r.department = department_filter)
    WHERE 
        pq.is_active = true
        AND (question_id_param IS NULL OR pq.question_id = question_id_param)
    GROUP BY pq.question_id, pq.question_text, pq.category, pq.sort_order
    ORDER BY pq.sort_order;
END;
$$;


--
-- Name: get_review_cycle_details(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_review_cycle_details(p_cycle_id bigint) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_cycle_record review_cycles%ROWTYPE;
    v_result JSON;
BEGIN
    -- Security check
    IF NOT check_user_permission('admin') THEN
        RETURN json_build_object('error', 'Unauthorized: Admin access required');
    END IF;
    
    -- Get the review cycle
    SELECT * INTO v_cycle_record
    FROM review_cycles 
    WHERE id = p_cycle_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Review cycle not found');
    END IF;
    
    -- Build detailed response with assessment statistics
    SELECT json_build_object(
        'cycle_id', rc.id,
        'cycle_name', rc.name,
        'status', rc.status,
        'start_date', rc.start_date,
        'end_date', rc.end_date,
        'created_at', rc.created_at,
        'total_assessments', COUNT(a.id),
        'not_started', COUNT(CASE WHEN a.status = 'not_started' THEN 1 END),
        'in_progress', COUNT(CASE WHEN a.status = 'in_progress' THEN 1 END),
        'employee_complete', COUNT(CASE WHEN a.self_assessment_status = 'employee_complete' THEN 1 END),
        'manager_complete', COUNT(CASE WHEN a.self_assessment_status = 'manager_complete' THEN 1 END),
        'completed', COUNT(CASE WHEN a.status = 'completed' THEN 1 END),
        'closed', COUNT(CASE WHEN a.status = 'closed' THEN 1 END)
    ) INTO v_result
    FROM review_cycles rc
    LEFT JOIN assessments a ON rc.id = a.review_cycle_id
    WHERE rc.id = p_cycle_id
    GROUP BY rc.id, rc.name, rc.status, rc.start_date, rc.end_date, rc.created_at;
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to get review cycle details: ' || SQLERRM);
END;
$$;


--
-- Name: get_team_assessments(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_team_assessments() RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_current_employee_id UUID;
    v_assessments JSONB;
BEGIN
    -- Get the employee_id for the currently authenticated user
    SELECT id INTO v_current_employee_id FROM public.employees WHERE user_id = auth.uid() AND is_active = true;

    IF v_current_employee_id IS NULL THEN
        RETURN '{"error": "Employee not found for current user"}'::jsonb;
    END IF;

    -- Get assessments for team members with all necessary data
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'assessment_id', a.id,
        'employee_id', e.id,
        'employee_name', e.name,
        'employee_email', e.email,
        'employee_job_title', e.job_title,
        'cycle_id', rc.id,
        'cycle_name', rc.name,
        'cycle_status', rc.status,
        'self_assessment_status', a.self_assessment_status,
        'manager_review_status', a.manager_review_status,
        'employee_acknowledgment', COALESCE(a.employee_acknowledgment, false),
        'due_date', a.due_date,
        'created_at', a.created_at,
        'updated_at', a.updated_at
    ) ORDER BY a.created_at DESC), '[]'::jsonb) INTO v_assessments
    FROM public.assessments a
    JOIN public.employees e ON a.employee_id = e.id
    JOIN public.review_cycles rc ON a.review_cycle_id = rc.id
    WHERE e.manager_id = v_current_employee_id;

    RETURN v_assessments;
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
-- Name: get_unread_notification_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_unread_notification_count() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_current_employee_id UUID;
    v_count INTEGER;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_current_employee_id
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Count unread notifications
    SELECT COUNT(*) INTO v_count
    FROM notifications 
    WHERE recipient_id = v_current_employee_id 
    AND read_at IS NULL;
    
    RETURN COALESCE(v_count, 0);
END;
$$;


--
-- Name: get_user_notifications(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_notifications() RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
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
    
    -- Get notifications for current user
    SELECT json_agg(
        json_build_object(
            'id', n.id,
            'recipient_id', n.recipient_id,
            'sender_id', n.sender_id,
            'sender_name', COALESCE(sender.name, 'System'),
            'type', n.type,
            'title', n.title,
            'message', n.message,
            'data', COALESCE(n.data, '{}'::json),
            'read_at', n.read_at,
            'is_read', (n.read_at IS NOT NULL),
            'created_at', COALESCE(n.created_at, NOW()),
            'updated_at', COALESCE(n.updated_at, NOW())
        ) ORDER BY COALESCE(n.created_at, NOW()) DESC
    ) INTO result
    FROM notifications n
    LEFT JOIN employees sender ON n.sender_id = sender.id
    WHERE n.recipient_id = v_current_employee_id;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;


--
-- Name: get_user_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_role(p_user_id uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN (
    SELECT raw_app_meta_data->>'role'
    FROM auth.users
    WHERE id = p_user_id
  );
END;
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
-- Name: give_peer_feedback(uuid, text, text, text, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.give_peer_feedback(p_recipient_id uuid, p_feedback_type text, p_message text, p_category text DEFAULT 'general'::text, p_is_anonymous boolean DEFAULT false) RETURNS bigint
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: is_manager_of(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_manager_of(manager_user_id uuid, target_employee_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: link_auth_user_to_employee(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.link_auth_user_to_employee(p_employee_id uuid, p_auth_user_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Security check
    IF NOT check_user_permission('admin') THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized: Admin access required');
    END IF;
    
    -- Update employee record with auth user ID
    UPDATE employees 
    SET user_id = p_auth_user_id, updated_at = NOW()
    WHERE id = p_employee_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Employee not found');
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Employee linked to auth user successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', 'Failed to link employee: ' || SQLERRM);
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
-- Name: link_employee_to_auth_user(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.link_employee_to_auth_user(p_employee_id uuid, p_auth_user_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Security check
    IF NOT check_user_permission('admin') THEN
        RETURN json_build_object('error', 'Unauthorized: Admin access required');
    END IF;
    
    -- Update employee record with auth user ID
    UPDATE employees 
    SET user_id = p_auth_user_id, updated_at = NOW()
    WHERE id = p_employee_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Employee not found');
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Employee linked to auth user successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to link employee: ' || SQLERRM);
END;
$$;


--
-- Name: log_security_event(text, text, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_security_event(p_action text, p_resource text DEFAULT NULL::text, p_success boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_employee_id UUID;
BEGIN
    -- Get employee ID for current user
    SELECT id INTO v_employee_id
    FROM employees 
    WHERE user_id = auth.uid() OR (auth.email() IS NOT NULL AND LOWER(email) = LOWER(auth.email()));
    
    -- Insert audit record
    INSERT INTO security_audit (user_id, employee_id, action, resource, success)
    VALUES (auth.uid(), v_employee_id, p_action, p_resource, p_success);
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail if audit logging fails
        NULL;
END;
$$;


--
-- Name: mark_feedback_helpful(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_feedback_helpful(p_feedback_id bigint) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    UPDATE peer_feedback 
    SET helpful_count = helpful_count + 1,
        updated_at = NOW()
    WHERE feedback_id = p_feedback_id;
    RETURN FOUND;
END;
$$;


--
-- Name: mark_notification_read(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_notification_read(p_notification_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_current_employee_id UUID;
    v_affected_rows INTEGER;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO v_current_employee_id
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Update notification read status
    UPDATE notifications 
    SET 
        read_at = NOW(),
        updated_at = NOW()
    WHERE id = p_notification_id 
    AND recipient_id = v_current_employee_id
    AND read_at IS NULL;
    
    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
    
    IF v_affected_rows = 0 THEN
        RETURN json_build_object('error', 'Notification not found or already read');
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Notification marked as read',
        'notification_id', p_notification_id
    );
END;
$$;


--
-- Name: notify_employee_manager_review_completed(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_employee_manager_review_completed() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_employee_name TEXT;
    v_manager_name TEXT;
    v_cycle_name TEXT;
BEGIN
    -- Only trigger when manager review status changes to completed
    IF NEW.manager_review_status = 'completed' AND 
       (OLD.manager_review_status IS NULL OR OLD.manager_review_status != 'completed') THEN
        
        -- Get employee and manager info
        SELECT e.name INTO v_employee_name
        FROM employees e
        WHERE e.id = NEW.employee_id;
        
        SELECT m.name INTO v_manager_name
        FROM employees e
        JOIN employees m ON e.manager_id = m.id
        WHERE e.id = NEW.employee_id;
        
        -- Get cycle name
        SELECT rc.name INTO v_cycle_name
        FROM review_cycles rc
        WHERE rc.id = NEW.review_cycle_id;
        
        -- Create notification for employee
        PERFORM create_notification(
            NEW.employee_id,
            (SELECT manager_id FROM employees WHERE id = NEW.employee_id),
            'manager_review_completed',
            'Your Manager Review is Complete',
            v_manager_name || ' has completed your performance review for ' || v_cycle_name || '. You can now view their feedback.',
            json_build_object(
                'assessment_id', NEW.id,
                'employee_id', NEW.employee_id,
                'cycle_id', NEW.review_cycle_id,
                'manager_name', v_manager_name,
                'cycle_name', v_cycle_name
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: notify_manager_assessment_submitted(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_manager_assessment_submitted() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_manager_id UUID;
    v_employee_name TEXT;
    v_cycle_name TEXT;
BEGIN
    -- Only trigger when status changes to submitted
    IF NEW.self_assessment_status = 'submitted' AND 
       (OLD.self_assessment_status IS NULL OR OLD.self_assessment_status != 'submitted') THEN
        
        -- Get manager and employee info
        SELECT e.manager_id, e.name INTO v_manager_id, v_employee_name
        FROM employees e
        WHERE e.id = NEW.employee_id;
        
        -- Get cycle name
        SELECT rc.name INTO v_cycle_name
        FROM review_cycles rc
        WHERE rc.id = NEW.review_cycle_id;
        
        -- Create notification for manager
        IF v_manager_id IS NOT NULL THEN
            PERFORM create_notification(
                v_manager_id,
                NEW.employee_id,
                'assessment_submitted',
                'Employee Assessment Ready for Review',
                v_employee_name || ' has completed their self-assessment for ' || v_cycle_name || ' and is ready for your review.',
                json_build_object(
                    'assessment_id', NEW.id,
                    'employee_id', NEW.employee_id,
                    'cycle_id', NEW.review_cycle_id,
                    'employee_name', v_employee_name,
                    'cycle_name', v_cycle_name
                )
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: request_manager_review_revision(bigint, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.request_manager_review_revision(p_assessment_id bigint, p_revision_notes text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_user_role text;
    v_assessment_record assessments%ROWTYPE; 
    v_admin_employee_id uuid;
    v_manager_employee_id uuid;
BEGIN
    -- Get current user's role
    SELECT role INTO v_user_role FROM auth.users WHERE id = auth.uid();
    
    -- Only admins can request revisions
    IF v_user_role != 'admin' THEN
        RETURN jsonb_build_object('error', 'Access denied: Admin role required');
    END IF;

    -- Get the assessment record
    SELECT * INTO v_assessment_record
    FROM assessments a
    WHERE a.id = p_assessment_id AND a.self_assessment_status = 'pending_admin_approval';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Assessment not found or not pending admin approval');
    END IF;

    -- Get the manager employee ID
    SELECT e.manager_id INTO v_manager_employee_id
    FROM employees e
    WHERE e.id = v_assessment_record.employee_id;

    -- Get admin's employee ID for logging
    SELECT e.id INTO v_admin_employee_id
    FROM employees e
    WHERE e.user_id = auth.uid();

    -- Send back to manager for revision
    UPDATE assessments 
    SET 
        self_assessment_status = 'employee_complete',  -- Back to manager review state
        manager_review_status = 'pending',             -- Manager needs to revise
        admin_revision_notes = p_revision_notes,
        admin_revision_requested_at = NOW(),
        admin_revision_requested_by = v_admin_employee_id,
        updated_at = NOW()
    WHERE id = p_assessment_id;

    -- Log the revision request
    INSERT INTO activity_log (
        employee_id,
        action_type,
        description,
        created_at
    ) VALUES (
        v_admin_employee_id,
        'admin_revision_requested',
        'Admin requested revision of manager review for assessment ' || p_assessment_id::text || 
        ' - Notes: ' || p_revision_notes,
        NOW()
    );

    -- Also log for the manager
    INSERT INTO activity_log (
        employee_id,
        action_type,
        description,
        created_at
    ) VALUES (
        v_manager_employee_id,
        'manager_revision_requested',
        'Admin requested revision of your review for assessment ' || p_assessment_id::text,
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Revision requested successfully - manager will be notified'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$;


--
-- Name: review_development_plan(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.review_development_plan(p_plan_id uuid, p_status text, p_manager_feedback text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_current_employee_id UUID;
    v_employee_role TEXT;
    v_employee_id UUID;
    v_employee_name TEXT;
    v_plan_title TEXT;
BEGIN
    -- Get current user's employee ID and role
    SELECT id, role INTO v_current_employee_id, v_employee_role
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Check if user is manager or admin
    IF v_employee_role NOT IN ('manager', 'admin') THEN
        RETURN json_build_object('error', 'Access denied: Manager privileges required');
    END IF;
    
    -- Validate status
    IF p_status NOT IN ('approved', 'needs_revision', 'under_review') THEN
        RETURN json_build_object('error', 'Invalid status. Must be: approved, needs_revision, or under_review');
    END IF;
    
    -- Get plan details and verify access - FIXED: Separate the SELECT statements
    SELECT dp.employee_id, dp.title INTO v_employee_id, v_plan_title
    FROM development_plans dp
    JOIN employees e ON dp.employee_id = e.id
    WHERE dp.id = p_plan_id
    AND (e.manager_id = v_current_employee_id OR v_employee_role = 'admin')
    AND e.is_active = true;
    
    IF v_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Development plan not found or access denied');
    END IF;
    
    -- Get employee name
    SELECT name INTO v_employee_name FROM employees WHERE id = v_employee_id;
    
    -- Update the development plan
    UPDATE development_plans 
    SET 
        status = p_status,
        manager_feedback = TRIM(p_manager_feedback),
        manager_reviewed_at = NOW(),
        manager_reviewed_by = v_current_employee_id,
        updated_at = NOW()
    WHERE id = p_plan_id;
    
    -- Create notification for employee (if create_notification function exists)
    BEGIN
        PERFORM create_notification(
            v_employee_id,
            v_current_employee_id,
            'development_plan_reviewed',
            'Development Plan Review Complete',
            'Your development plan "' || v_plan_title || '" has been reviewed with status: ' || p_status,
            json_build_object(
                'plan_id', p_plan_id,
                'plan_title', v_plan_title,
                'status', p_status,
                'has_feedback', (p_manager_feedback IS NOT NULL AND TRIM(p_manager_feedback) != '')
            )
        );
    EXCEPTION
        WHEN undefined_function THEN
            -- Ignore if notification function doesn't exist
            NULL;
    END;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Development plan reviewed successfully',
        'plan_id', p_plan_id,
        'status', p_status,
        'employee_name', v_employee_name
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to review development plan: ' || SQLERRM);
END;
$$;


--
-- Name: review_development_plan(uuid, text, text, integer, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.review_development_plan(p_plan_id uuid, p_status text, p_feedback text DEFAULT NULL::text, p_rating integer DEFAULT NULL::integer, _csrf_token text DEFAULT NULL::text, _nonce text DEFAULT NULL::text, _timestamp text DEFAULT NULL::text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_current_employee_id UUID;
    v_employee_role TEXT;
    v_plan_record development_plans%ROWTYPE;
    v_employee_name TEXT;
BEGIN
    -- Get current user's employee ID and role
    SELECT e.id, e.role INTO v_current_employee_id, v_employee_role
    FROM employees e 
    WHERE e.user_id = auth.uid() AND e.is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Get development plan record - FIXED: Use separate SELECT statement
    SELECT * INTO v_plan_record
    FROM development_plans 
    WHERE id = p_plan_id;
    
    IF v_plan_record.id IS NULL THEN
        RETURN json_build_object('error', 'Development plan not found');
    END IF;
    
    -- Check permissions
    IF v_employee_role != 'admin' AND v_plan_record.manager_id != v_current_employee_id THEN
        RETURN json_build_object('error', 'Access denied: You can only review plans for your direct reports');
    END IF;
    
    -- Validate status
    IF p_status NOT IN ('approved', 'rejected', 'under_review') THEN
        RETURN json_build_object('error', 'Invalid status. Must be: approved, rejected, or under_review');
    END IF;
    
    -- Update development plan
    UPDATE development_plans 
    SET 
        status = p_status,
        manager_feedback = p_feedback,
        manager_rating = p_rating,
        review_date = NOW(),
        updated_at = NOW()
    WHERE id = p_plan_id;
    
    -- Get employee name for notification - FIXED: Use separate SELECT statement
    SELECT name INTO v_employee_name
    FROM employees 
    WHERE id = v_plan_record.employee_id;
    
    -- Create notification for employee
    BEGIN
        PERFORM create_notification(
            v_plan_record.employee_id,
            v_current_employee_id,
            'development_plan_reviewed',
            'Development Plan ' || INITCAP(p_status),
            'Your development plan has been ' || p_status || 
            CASE WHEN p_feedback IS NOT NULL THEN '. Manager feedback: ' || p_feedback ELSE '.' END
        );
    EXCEPTION
        WHEN undefined_function THEN
            NULL; -- Ignore if notification function doesn't exist
    END;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Development plan reviewed successfully',
        'plan_id', p_plan_id,
        'status', p_status
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to review development plan: ' || SQLERRM);
END;
$$;


--
-- Name: save_manager_note(uuid, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.save_manager_note(p_employee_id uuid, p_title text, p_content text, p_category text DEFAULT 'general'::text, p_priority text DEFAULT 'medium'::text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: set_employee_departments(uuid, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_employee_departments(p_employee_id uuid, p_department_ids integer[]) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
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
-- Name: submit_development_plan(text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.submit_development_plan(p_title text, p_description text DEFAULT ''::text, p_goals text DEFAULT '[]'::text, p_skills_to_develop text DEFAULT '[]'::text, p_timeline text DEFAULT ''::text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: submit_manager_review(bigint, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.submit_manager_review(p_assessment_id bigint, p_feedback jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_current_employee_id UUID;
    v_user_role TEXT;
    v_assessment_employee_id UUID;
    v_can_review BOOLEAN := false;
BEGIN
    -- Get current user's role and employee ID
    SELECT id, role INTO v_current_employee_id, v_user_role 
    FROM public.employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF v_current_employee_id IS NULL THEN
        RETURN '{"error": "User not found or inactive"}'::jsonb;
    END IF;

    -- Get the assessment's employee to verify permissions
    SELECT employee_id INTO v_assessment_employee_id 
    FROM public.assessments 
    WHERE id = p_assessment_id;
    
    IF v_assessment_employee_id IS NULL THEN
        RETURN '{"error": "Assessment not found"}'::jsonb;
    END IF;

    -- Check permissions: User must be an admin or the employee's manager
    IF v_user_role = 'admin' THEN
        v_can_review := true;
    ELSIF v_user_role = 'manager' THEN
        SELECT COUNT(*) > 0 INTO v_can_review 
        FROM public.employees 
        WHERE id = v_assessment_employee_id AND manager_id = v_current_employee_id;
    END IF;

    IF NOT v_can_review THEN
        RETURN '{"error": "Permission denied to review this assessment"}'::jsonb;
    END IF;

    -- ATOMIC UPDATE: All manager feedback fields and status in one transaction
    UPDATE public.assessments
    SET
        -- Overall Performance & Summary Fields
        manager_performance_rating = COALESCE((p_feedback->>'manager_performance_rating'), manager_performance_rating),
        manager_summary_comments = COALESCE((p_feedback->>'manager_summary_comments'), manager_summary_comments),
        manager_core_values_feedback = COALESCE((p_feedback->>'manager_core_values_feedback'), manager_core_values_feedback),
        manager_development_plan = COALESCE((p_feedback->>'manager_development_plan'), manager_development_plan),
        manager_action_items = COALESCE((p_feedback->>'manager_action_items'), manager_action_items),
        
        -- Detailed Two-Column Feedback Fields
        manager_passionate_feedback = COALESCE((p_feedback->>'manager_passionate_feedback'), manager_passionate_feedback),
        manager_driven_feedback = COALESCE((p_feedback->>'manager_driven_feedback'), manager_driven_feedback),
        manager_resilient_feedback = COALESCE((p_feedback->>'manager_resilient_feedback'), manager_resilient_feedback),
        manager_responsive_feedback = COALESCE((p_feedback->>'manager_responsive_feedback'), manager_responsive_feedback),
        manager_gwc_gets_it_feedback = COALESCE((p_feedback->>'manager_gwc_gets_it_feedback'), manager_gwc_gets_it_feedback),
        manager_gwc_wants_it_feedback = COALESCE((p_feedback->>'manager_gwc_wants_it_feedback'), manager_gwc_wants_it_feedback),
        manager_gwc_capacity_feedback = COALESCE((p_feedback->>'manager_gwc_capacity_feedback'), manager_gwc_capacity_feedback),
        manager_strengths_feedback = COALESCE((p_feedback->>'manager_strengths_feedback'), manager_strengths_feedback),
        manager_improvements_feedback = COALESCE((p_feedback->>'manager_improvements_feedback'), manager_improvements_feedback),
        
        -- Update status and timestamp
        manager_review_status = 'completed',
        updated_at = NOW()
    WHERE id = p_assessment_id;

    -- Verify the update was successful
    IF NOT FOUND THEN
        RETURN '{"error": "Failed to update assessment"}'::jsonb;
    END IF;

    RETURN '{"success": true, "message": "Manager review submitted successfully"}'::jsonb;
END;
$$;


--
-- Name: submit_manager_review(uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.submit_manager_review(p_assessment_id uuid, p_feedback jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_assessment assessments%ROWTYPE;
    v_manager_employee_id uuid;
    v_manager_has_manager boolean := false;
    v_next_status text := 'manager_complete';
BEGIN
    -- Get the current assessment
    SELECT * INTO v_assessment
    FROM assessments 
    WHERE id = p_assessment_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Assessment not found');
    END IF;

    -- Get the manager's employee record to check if they have a manager
    SELECT e.id, (e.manager_id IS NOT NULL) 
    INTO v_manager_employee_id, v_manager_has_manager
    FROM employees e
    WHERE e.user_id = auth.uid();

    -- If manager has a manager (like Manager1 reporting to Admin), 
    -- set status to pending_admin_approval instead of manager_complete
    IF v_manager_has_manager THEN
        v_next_status := 'pending_admin_approval';
    END IF;

    -- Update the assessment with manager feedback and new status
    UPDATE assessments 
    SET 
        -- Core manager feedback fields
        manager_performance_rating = COALESCE((p_feedback->>'manager_performance_rating')::text, manager_performance_rating),
        manager_summary_comments = COALESCE(p_feedback->>'manager_summary_comments', manager_summary_comments),
        manager_development_plan = COALESCE(p_feedback->>'manager_development_plan', manager_development_plan),
        manager_action_items = COALESCE(p_feedback->>'manager_action_items', manager_action_items),
        
        -- Core values feedback
        manager_passionate_feedback = COALESCE(p_feedback->>'manager_passionate_feedback', manager_passionate_feedback),
        manager_driven_feedback = COALESCE(p_feedback->>'manager_driven_feedback', manager_driven_feedback),
        manager_resilient_feedback = COALESCE(p_feedback->>'manager_resilient_feedback', manager_resilient_feedback),
        manager_responsive_feedback = COALESCE(p_feedback->>'manager_responsive_feedback', manager_responsive_feedback),
        
        -- GWC manager assessments
        manager_gwc_gets_it = COALESCE((p_feedback->>'manager_gwc_gets_it')::boolean, manager_gwc_gets_it),
        manager_gwc_gets_it_feedback = COALESCE(p_feedback->>'manager_gwc_gets_it_feedback', manager_gwc_gets_it_feedback),
        manager_gwc_wants_it = COALESCE((p_feedback->>'manager_gwc_wants_it')::boolean, manager_gwc_wants_it),
        manager_gwc_wants_it_feedback = COALESCE(p_feedback->>'manager_gwc_wants_it_feedback', manager_gwc_wants_it_feedback),
        manager_gwc_capacity = COALESCE((p_feedback->>'manager_gwc_capacity')::boolean, manager_gwc_capacity),
        manager_gwc_capacity_feedback = COALESCE(p_feedback->>'manager_gwc_capacity_feedback', manager_gwc_capacity_feedback),
        
        -- Strengths and improvements feedback
        manager_strengths_feedback = COALESCE(p_feedback->>'manager_strengths_feedback', manager_strengths_feedback),
        manager_improvements_feedback = COALESCE(p_feedback->>'manager_improvements_feedback', manager_improvements_feedback),
        
        -- Status and timestamps
        manager_review_status = v_next_status,
        self_assessment_status = v_next_status,
        manager_reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_assessment_id;

    -- Log the action
    INSERT INTO activity_log (
        employee_id,
        action_type,
        description,
        created_at
    ) VALUES (
        v_manager_employee_id,
        'manager_review_submitted',
        'Manager completed review for assessment ' || p_assessment_id::text || 
        CASE WHEN v_manager_has_manager THEN ' - sent to admin for approval' ELSE ' - completed' END,
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true, 
        'status', v_next_status,
        'requires_admin_approval', v_manager_has_manager
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
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
-- Name: submit_training_request(text, text, text, text, numeric, date, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.submit_training_request(p_request_type text, p_title text, p_description text DEFAULT NULL::text, p_provider text DEFAULT NULL::text, p_estimated_cost numeric DEFAULT NULL::numeric, p_preferred_date date DEFAULT NULL::date, p_business_justification text DEFAULT ''::text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    user_employee_id uuid;
    result_request_id uuid;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO user_employee_id 
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF user_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Validate required fields
    IF p_title IS NULL OR p_title = '' THEN
        RETURN json_build_object('error', 'Training title is required');
    END IF;
    
    IF p_business_justification IS NULL OR p_business_justification = '' THEN
        RETURN json_build_object('error', 'Business justification is required');
    END IF;
    
    -- Insert training request
    INSERT INTO training_requests (
        employee_id, request_type, title, description, provider, 
        estimated_cost, preferred_date, business_justification, status
    ) VALUES (
        user_employee_id, p_request_type, p_title, p_description, p_provider,
        p_estimated_cost, p_preferred_date, p_business_justification, 'requested'
    ) RETURNING request_id INTO result_request_id;
    
    RETURN json_build_object(
        'success', true,
        'request_id', result_request_id,
        'message', 'Training request submitted successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Submission failed: ' || SQLERRM);
END;
$$;


--
-- Name: test_get_assessment_details(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.test_get_assessment_details(p_assessment_id bigint) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_assessment JSONB;
BEGIN
    -- Get full assessment details WITHOUT authentication (for testing)
    SELECT jsonb_agg(assessment_data) INTO v_assessment
    FROM (
        SELECT jsonb_build_object(
            'assessment_id', a.id,
            'employee_id', a.employee_id,
            'employee_name', e.name,
            'employee_email', e.email,
            'employee_job_title', e.job_title,
            'review_cycle_id', rc.id,
            'review_cycle_name', rc.name,
            'review_cycle_status', rc.status,
            'self_assessment_status', a.self_assessment_status,
            'manager_review_status', a.manager_review_status,
            'employee_acknowledgment', COALESCE(a.employee_acknowledgment, false),
            'due_date', a.due_date,
            'created_at', a.created_at,
            'updated_at', a.updated_at,
            
            -- Employee Self-Assessment Data
            'employee_strengths', a.employee_strengths,
            'employee_improvements', a.employee_improvements,
            'value_passionate_examples', a.value_passionate_examples,
            'value_driven_examples', a.value_driven_examples,
            'value_resilient_examples', a.value_resilient_examples,
            'value_responsive_examples', a.value_responsive_examples,
            'gwc_gets_it', COALESCE(a.gwc_gets_it, false),
            'gwc_gets_it_feedback', a.gwc_gets_it_feedback,
            'gwc_wants_it', COALESCE(a.gwc_wants_it, false),
            'gwc_wants_it_feedback', a.gwc_wants_it_feedback,
            'gwc_capacity', COALESCE(a.gwc_capacity, false),
            'gwc_capacity_feedback', a.gwc_capacity_feedback,

            -- Manager Review Data
            'manager_performance_rating', a.manager_performance_rating,
            'manager_summary_comments', a.manager_summary_comments,
            'manager_core_values_feedback', a.manager_core_values_feedback,
            'manager_development_plan', a.manager_development_plan,
            'manager_action_items', a.manager_action_items,

            -- Permission flags (set as true for testing)
            'can_edit_self_assessment', true,
            'can_edit_manager_review', true,
            'is_manager_view', false,

            -- Rocks data (placeholder)
            'rocks', '[]'::jsonb
        ) as assessment_data
        FROM public.assessments a
        JOIN public.employees e ON a.employee_id = e.id
        JOIN public.review_cycles rc ON a.review_cycle_id = rc.id
        WHERE a.id = p_assessment_id
    ) assessment_query;

    -- Return the assessment array
    RETURN COALESCE(v_assessment, '[]'::jsonb);
END;
$$;


--
-- Name: update_assessment(bigint, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_assessment(p_assessment_id bigint, p_updates jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_current_employee_id UUID;
    v_user_role TEXT;
    v_assessment_employee_id UUID;
    v_can_update BOOLEAN := false;
BEGIN
    -- Get the employee_id and role for the currently authenticated user
    SELECT id, role INTO v_current_employee_id, v_user_role FROM public.employees WHERE user_id = auth.uid() AND is_active = true;

    IF v_current_employee_id IS NULL THEN
        RETURN '{"error": "Employee not found for current user"}'::jsonb;
    END IF;

    -- Get the assessment's employee_id to check permissions
    SELECT a.employee_id INTO v_assessment_employee_id 
    FROM public.assessments a
    JOIN public.employees e ON a.employee_id = e.id
    WHERE a.id = p_assessment_id;

    IF v_assessment_employee_id IS NULL THEN
        RETURN '{"error": "Assessment not found"}'::jsonb;
    END IF;

    -- Check update permissions
    IF v_user_role = 'admin' THEN
        v_can_update := true;
    ELSIF v_assessment_employee_id = v_current_employee_id THEN
        -- Employee can update their own assessment
        v_can_update := true;
    ELSIF v_user_role = 'manager' THEN
        -- Manager can update assessments of their direct reports
        SELECT COUNT(*) > 0 INTO v_can_update
        FROM public.employees e
        WHERE e.id = v_assessment_employee_id AND e.manager_id = v_current_employee_id;
    END IF;

    IF NOT v_can_update THEN
        RETURN '{"error": "Permission denied to update this assessment"}'::jsonb;
    END IF;

    -- Build dynamic update query based on provided fields
    UPDATE public.assessments SET
        -- Employee fields
        employee_strengths = COALESCE((p_updates->>'employee_strengths'), employee_strengths),
        employee_improvements = COALESCE((p_updates->>'employee_improvements'), employee_improvements),
        value_passionate_examples = COALESCE((p_updates->>'value_passionate_examples'), value_passionate_examples),
        value_driven_examples = COALESCE((p_updates->>'value_driven_examples'), value_driven_examples),
        value_resilient_examples = COALESCE((p_updates->>'value_resilient_examples'), value_resilient_examples),
        value_responsive_examples = COALESCE((p_updates->>'value_responsive_examples'), value_responsive_examples),
        gwc_gets_it = COALESCE((p_updates->>'gwc_gets_it')::boolean, gwc_gets_it),
        gwc_gets_it_feedback = COALESCE((p_updates->>'gwc_gets_it_feedback'), gwc_gets_it_feedback),
        gwc_wants_it = COALESCE((p_updates->>'gwc_wants_it')::boolean, gwc_wants_it),
        gwc_wants_it_feedback = COALESCE((p_updates->>'gwc_wants_it_feedback'), gwc_wants_it_feedback),
        gwc_capacity = COALESCE((p_updates->>'gwc_capacity')::boolean, gwc_capacity),
        gwc_capacity_feedback = COALESCE((p_updates->>'gwc_capacity_feedback'), gwc_capacity_feedback),
        
        -- Manager fields
        manager_performance_rating = COALESCE((p_updates->>'manager_performance_rating'), manager_performance_rating),
        manager_summary_comments = COALESCE((p_updates->>'manager_summary_comments'), manager_summary_comments),
        manager_core_values_feedback = COALESCE((p_updates->>'manager_core_values_feedback'), manager_core_values_feedback),
        manager_development_plan = COALESCE((p_updates->>'manager_development_plan'), manager_development_plan),
        manager_action_items = COALESCE((p_updates->>'manager_action_items'), manager_action_items),

        -- Manager feedback fields for two-column layout
        manager_passionate_feedback = COALESCE((p_updates->>'manager_passionate_feedback'), manager_passionate_feedback),
        manager_driven_feedback = COALESCE((p_updates->>'manager_driven_feedback'), manager_driven_feedback),
        manager_resilient_feedback = COALESCE((p_updates->>'manager_resilient_feedback'), manager_resilient_feedback),
        manager_responsive_feedback = COALESCE((p_updates->>'manager_responsive_feedback'), manager_responsive_feedback),
        manager_gwc_gets_it_feedback = COALESCE((p_updates->>'manager_gwc_gets_it_feedback'), manager_gwc_gets_it_feedback),
        manager_gwc_wants_it_feedback = COALESCE((p_updates->>'manager_gwc_wants_it_feedback'), manager_gwc_wants_it_feedback),
        manager_gwc_capacity_feedback = COALESCE((p_updates->>'manager_gwc_capacity_feedback'), manager_gwc_capacity_feedback),
        manager_strengths_feedback = COALESCE((p_updates->>'manager_strengths_feedback'), manager_strengths_feedback),
        manager_improvements_feedback = COALESCE((p_updates->>'manager_improvements_feedback'), manager_improvements_feedback),
        
        -- Update timestamp
        updated_at = NOW()
    WHERE id = p_assessment_id;

    RETURN '{"success": true, "message": "Assessment updated successfully"}'::jsonb;
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


--
-- Name: update_employee(uuid, text, text, text, text, uuid, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_employee(p_employee_id uuid, p_name text DEFAULT NULL::text, p_email text DEFAULT NULL::text, p_job_title text DEFAULT NULL::text, p_role text DEFAULT NULL::text, p_manager_id uuid DEFAULT NULL::uuid, p_is_active boolean DEFAULT NULL::boolean) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_employee_record employees%ROWTYPE;
    v_changes_made BOOLEAN := FALSE;
    v_change_list TEXT := '';
BEGIN
    -- Security check
    IF NOT check_user_permission('admin') THEN
        RETURN json_build_object('error', 'Unauthorized: Admin access required');
    END IF;
    
    -- Get existing employee record
    SELECT * INTO v_employee_record
    FROM employees 
    WHERE id = p_employee_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Employee not found');
    END IF;
    
    -- Update name (simple string comparison)
    IF p_name IS NOT NULL AND TRIM(p_name) != '' THEN
        IF TRIM(p_name) != TRIM(COALESCE(v_employee_record.name, '')) THEN
            UPDATE employees SET name = TRIM(p_name) WHERE id = p_employee_id;
            v_changes_made := TRUE;
            v_change_list := v_change_list || 'name,';
        END IF;
    END IF;
    
    -- Update email (simple string comparison)
    IF p_email IS NOT NULL AND TRIM(p_email) != '' THEN
        IF TRIM(p_email) != TRIM(COALESCE(v_employee_record.email, '')) THEN
            -- Check if email is already in use by another employee
            IF EXISTS (SELECT 1 FROM employees WHERE email = TRIM(p_email) AND id != p_employee_id) THEN
                RETURN json_build_object('error', 'Email already in use by another employee');
            END IF;
            UPDATE employees SET email = TRIM(p_email) WHERE id = p_employee_id;
            v_changes_made := TRUE;
            v_change_list := v_change_list || 'email,';
        END IF;
    END IF;
    
    -- Update job title (simple string comparison)
    IF p_job_title IS NOT NULL THEN
        IF TRIM(COALESCE(p_job_title, '')) != TRIM(COALESCE(v_employee_record.job_title, '')) THEN
            UPDATE employees SET job_title = NULLIF(TRIM(p_job_title), '') WHERE id = p_employee_id;
            v_changes_made := TRUE;
            v_change_list := v_change_list || 'job_title,';
        END IF;
    END IF;
    
    -- Update role (simple string comparison)
    IF p_role IS NOT NULL AND TRIM(p_role) != '' THEN
        IF TRIM(p_role) != TRIM(COALESCE(v_employee_record.role, '')) THEN
            -- Validate role
            IF p_role NOT IN ('employee', 'manager', 'admin') THEN
                RETURN json_build_object('error', 'Invalid role. Must be employee, manager, or admin');
            END IF;
            UPDATE employees SET role = TRIM(p_role) WHERE id = p_employee_id;
            v_changes_made := TRUE;
            v_change_list := v_change_list || 'role,';
        END IF;
    END IF;
    
    -- Update manager_id (careful UUID comparison)
    IF p_manager_id IS NOT NULL THEN
        DECLARE
            v_new_manager_id UUID := NULL;
            v_manager_changed BOOLEAN := FALSE;
        BEGIN
            -- Convert empty string or special null UUID to actual NULL
            IF p_manager_id::text = '' OR p_manager_id::text = '00000000-0000-0000-0000-000000000000' THEN
                v_new_manager_id := NULL;
            ELSE
                v_new_manager_id := p_manager_id;
            END IF;
            
            -- Check if manager changed (handle NULL safely)
            IF (v_employee_record.manager_id IS NULL AND v_new_manager_id IS NOT NULL) THEN
                v_manager_changed := TRUE;
            ELSIF (v_employee_record.manager_id IS NOT NULL AND v_new_manager_id IS NULL) THEN
                v_manager_changed := TRUE;
            ELSIF (v_employee_record.manager_id IS NOT NULL AND v_new_manager_id IS NOT NULL) THEN
                IF v_employee_record.manager_id::text != v_new_manager_id::text THEN
                    v_manager_changed := TRUE;
                END IF;
            END IF;
            
            -- Apply manager change if needed
            IF v_manager_changed THEN
                -- Validate new manager if not NULL
                IF v_new_manager_id IS NOT NULL THEN
                    -- Prevent self-management
                    IF v_new_manager_id = p_employee_id THEN
                        RETURN json_build_object('error', 'Employee cannot be their own manager');
                    END IF;
                    -- Ensure manager exists and is active
                    IF NOT EXISTS (SELECT 1 FROM employees WHERE id = v_new_manager_id AND is_active = true) THEN
                        RETURN json_build_object('error', 'Manager not found or inactive');
                    END IF;
                END IF;
                
                -- Update manager
                UPDATE employees SET manager_id = v_new_manager_id WHERE id = p_employee_id;
                v_changes_made := TRUE;
                v_change_list := v_change_list || 'manager_id,';
            END IF;
        END;
    END IF;
    
    -- Update is_active (simple boolean comparison)
    IF p_is_active IS NOT NULL THEN
        IF p_is_active != COALESCE(v_employee_record.is_active, TRUE) THEN
            UPDATE employees SET is_active = p_is_active WHERE id = p_employee_id;
            v_changes_made := TRUE;
            v_change_list := v_change_list || 'is_active,';
        END IF;
    END IF;
    
    -- Update timestamp if any changes were made
    IF v_changes_made THEN
        UPDATE employees SET updated_at = NOW() WHERE id = p_employee_id;
        
        -- Log the update
        PERFORM log_security_event(
            'employee_updated',
            'employee_id:' || p_employee_id::text || ',changes:' || v_change_list,
            true
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', CASE 
            WHEN v_changes_made THEN 'Employee updated successfully'
            ELSE 'No changes detected'
        END,
        'employee_id', p_employee_id,
        'changes_made', v_changes_made,
        'changes', v_change_list
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'error', 'Failed to update employee: ' || SQLERRM,
            'sqlstate', SQLSTATE
        );
END;
$$;


--
-- Name: update_employee_departments(uuid, integer[], integer, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_employee_departments(p_employee_id uuid, p_department_ids integer[], p_primary_department_id integer, p_assigned_by uuid DEFAULT NULL::uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Remove all existing department assignments for this employee
    DELETE FROM public.employee_departments WHERE employee_id = p_employee_id;
    
    -- Add new department assignments
    IF p_department_ids IS NOT NULL AND array_length(p_department_ids, 1) > 0 THEN
        FOR i IN 1..array_length(p_department_ids, 1) LOOP
            INSERT INTO public.employee_departments (employee_id, department_id, is_primary, assigned_by)
            VALUES (
                p_employee_id, 
                p_department_ids[i], 
                p_department_ids[i] = p_primary_department_id,
                p_assigned_by
            );
        END LOOP;
    END IF;
    
    -- Update the backward compatibility column
    UPDATE public.employees 
    SET department = (SELECT name FROM public.departments WHERE id = p_primary_department_id)
    WHERE id = p_employee_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Employee departments updated successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Failed to update employee departments: ' || SQLERRM);
END;
$$;


--
-- Name: FUNCTION update_employee_departments(p_employee_id uuid, p_department_ids integer[], p_primary_department_id integer, p_assigned_by uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_employee_departments(p_employee_id uuid, p_department_ids integer[], p_primary_department_id integer, p_assigned_by uuid) IS 'Updates all department assignments for an employee';


--
-- Name: update_manager_note(uuid, text, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_manager_note(p_note_id uuid, p_title text, p_content text, p_category text DEFAULT 'general'::text, p_priority text DEFAULT 'medium'::text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
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


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


--
-- Name: upsert_development_goal(uuid, text, text, text, date, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.upsert_development_goal(p_goal_id uuid DEFAULT NULL::uuid, p_goal_type text DEFAULT 'skill_development'::text, p_title text DEFAULT ''::text, p_description text DEFAULT NULL::text, p_target_date date DEFAULT NULL::date, p_priority text DEFAULT 'medium'::text, p_status text DEFAULT 'active'::text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    user_employee_id uuid;
    result_goal_id uuid;
BEGIN
    -- Get current user's employee ID
    SELECT id INTO user_employee_id 
    FROM employees 
    WHERE user_id = auth.uid() AND is_active = true;
    
    IF user_employee_id IS NULL THEN
        RETURN json_build_object('error', 'Employee record not found');
    END IF;
    
    -- Validate required fields
    IF p_title IS NULL OR p_title = '' THEN
        RETURN json_build_object('error', 'Goal title is required');
    END IF;
    
    -- Insert or update
    IF p_goal_id IS NULL THEN
        -- Insert new goal
        INSERT INTO employee_development_goals (
            employee_id, goal_type, title, description, target_date, priority, status
        ) VALUES (
            user_employee_id, p_goal_type, p_title, p_description, p_target_date, p_priority, p_status
        ) RETURNING goal_id INTO result_goal_id;
        
        RETURN json_build_object(
            'success', true,
            'goal_id', result_goal_id,
            'message', 'Development goal created successfully'
        );
    ELSE
        -- Update existing goal (only if user owns it)
        UPDATE employee_development_goals SET
            goal_type = p_goal_type,
            title = p_title,
            description = p_description,
            target_date = p_target_date,
            priority = p_priority,
            status = p_status,
            updated_at = now()
        WHERE goal_id = p_goal_id 
        AND employee_id = user_employee_id;
        
        IF NOT FOUND THEN
            RETURN json_build_object('error', 'Goal not found or access denied');
        END IF;
        
        RETURN json_build_object(
            'success', true,
            'goal_id', p_goal_id,
            'message', 'Development goal updated successfully'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', 'Operation failed: ' || SQLERRM);
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
    manager_reviewed_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now(),
    manager_review_status text DEFAULT 'pending'::text,
    manager_feedback jsonb DEFAULT '{}'::jsonb,
    employee_notified boolean DEFAULT false,
    manager_notified boolean DEFAULT false,
    due_date date,
    self_assessment_data jsonb,
    manager_review_data jsonb,
    manager_notes text,
    overall_rating integer,
    employee_acknowledgment boolean DEFAULT false,
    manager_passionate_feedback text,
    manager_driven_feedback text,
    manager_resilient_feedback text,
    manager_responsive_feedback text,
    manager_gwc_gets_it_feedback text,
    manager_gwc_wants_it_feedback text,
    manager_gwc_capacity_feedback text,
    manager_strengths_feedback text,
    manager_improvements_feedback text,
    manager_performance_rating text,
    manager_core_values_feedback text,
    manager_action_items text,
    manager_gwc_gets_it boolean,
    manager_gwc_wants_it boolean,
    manager_gwc_capacity boolean,
    admin_approval_notes text,
    admin_approved_at timestamp with time zone,
    admin_approved_by uuid,
    admin_revision_notes text,
    admin_revision_requested_at timestamp with time zone,
    admin_revision_requested_by uuid,
    employee_acknowledged_at timestamp with time zone,
    CONSTRAINT assessments_overall_rating_check CHECK (((overall_rating >= 1) AND (overall_rating <= 5))),
    CONSTRAINT valid_manager_review_status CHECK ((manager_review_status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text])))
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
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE departments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.departments IS 'Department definitions';


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: development_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.development_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    goals jsonb DEFAULT '[]'::jsonb,
    skills_to_develop jsonb DEFAULT '[]'::jsonb,
    timeline text,
    status text DEFAULT 'submitted'::text,
    manager_feedback text,
    manager_reviewed_at timestamp with time zone,
    manager_reviewed_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    manager_id uuid,
    objectives text,
    resources_needed text,
    success_metrics text,
    target_completion_date date,
    manager_rating integer,
    submission_date timestamp with time zone,
    review_date timestamp with time zone,
    CONSTRAINT development_plans_manager_rating_check CHECK (((manager_rating >= 1) AND (manager_rating <= 5))),
    CONSTRAINT valid_plan_status CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'under_review'::text, 'approved'::text, 'needs_revision'::text])))
);


--
-- Name: employee_departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_departments (
    id integer NOT NULL,
    employee_id uuid,
    department_id integer,
    created_at timestamp with time zone DEFAULT now(),
    is_primary boolean DEFAULT false,
    assigned_by uuid
);


--
-- Name: TABLE employee_departments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.employee_departments IS 'Many-to-many relationship between employees and departments with primary designation';


--
-- Name: employee_departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_departments_id_seq OWNED BY public.employee_departments.id;


--
-- Name: employee_development_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_development_goals (
    goal_id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    goal_type text NOT NULL,
    title text NOT NULL,
    description text,
    target_date date,
    status text DEFAULT 'active'::text,
    priority text DEFAULT 'medium'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT employee_development_goals_goal_type_check CHECK ((goal_type = ANY (ARRAY['career_aspiration'::text, 'skill_development'::text, 'stretch_goal'::text]))),
    CONSTRAINT employee_development_goals_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))),
    CONSTRAINT employee_development_goals_status_check CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'on_hold'::text, 'cancelled'::text])))
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
    created_at timestamp with time zone DEFAULT now(),
    role text DEFAULT 'employee'::text,
    updated_at timestamp with time zone DEFAULT now(),
    temp_password text,
    must_change_password boolean DEFAULT false,
    department text DEFAULT 'General'::text,
    CONSTRAINT employees_role_check CHECK ((role = ANY (ARRAY['employee'::text, 'manager'::text, 'admin'::text])))
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
-- Name: manager_employee_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manager_employee_messages (
    message_id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_employee_id uuid NOT NULL,
    to_employee_id uuid NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    message_type text DEFAULT 'development'::text,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT manager_employee_messages_message_type_check CHECK ((message_type = ANY (ARRAY['development'::text, 'goal_update'::text, 'training_request'::text, 'general'::text])))
);


--
-- Name: manager_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manager_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    manager_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category text DEFAULT 'general'::text,
    priority text DEFAULT 'medium'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT valid_category CHECK ((category = ANY (ARRAY['general'::text, 'performance'::text, 'development'::text, 'personal'::text, 'goals'::text]))),
    CONSTRAINT valid_priority CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_id uuid NOT NULL,
    sender_id uuid,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT valid_notification_type CHECK ((type = ANY (ARRAY['review_cycle_opened'::text, 'assessment_submitted'::text, 'manager_review_ready'::text, 'manager_review_completed'::text, 'development_plan_submitted'::text, 'development_plan_reviewed'::text, 'assessment_overdue'::text, 'review_reminder'::text])))
);


--
-- Name: peer_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.peer_feedback (
    feedback_id bigint NOT NULL,
    giver_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    feedback_type text NOT NULL,
    feedback_timestamp timestamp with time zone DEFAULT now(),
    category text DEFAULT 'general'::text,
    message text DEFAULT ''::text,
    is_anonymous boolean DEFAULT false,
    helpful_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: peer_feedback_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.peer_feedback_feedback_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: peer_feedback_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.peer_feedback_feedback_id_seq OWNED BY public.peer_feedback.feedback_id;


--
-- Name: pulse_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pulse_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id text NOT NULL,
    question_text text NOT NULL,
    category text NOT NULL,
    type text DEFAULT 'scale'::text NOT NULL,
    options jsonb,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pulse_questions_category_check CHECK ((category = ANY (ARRAY['satisfaction'::text, 'workload'::text, 'support'::text, 'engagement'::text]))),
    CONSTRAINT pulse_questions_type_check CHECK ((type = ANY (ARRAY['scale'::text, 'boolean'::text, 'choice'::text])))
);


--
-- Name: TABLE pulse_questions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.pulse_questions IS 'Configurable health pulse questions for employee dashboards';


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
    description text,
    updated_at timestamp with time zone DEFAULT now()
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
-- Name: security_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.security_audit (
    id bigint NOT NULL,
    user_id uuid,
    employee_id uuid,
    action text NOT NULL,
    resource text,
    success boolean NOT NULL,
    ip_address inet,
    user_agent text,
    "timestamp" timestamp with time zone DEFAULT now()
);


--
-- Name: security_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.security_audit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: security_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.security_audit_id_seq OWNED BY public.security_audit.id;


--
-- Name: team_health_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_health_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    employee_id uuid,
    employee_name text NOT NULL,
    manager_id uuid,
    department text,
    question_id text NOT NULL,
    question text NOT NULL,
    response integer NOT NULL,
    severity text NOT NULL,
    acknowledged boolean DEFAULT false NOT NULL,
    acknowledged_by uuid,
    acknowledged_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT team_health_alerts_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])))
);


--
-- Name: TABLE team_health_alerts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.team_health_alerts IS 'Stores alerts generated from concerning pulse responses for manager attention';


--
-- Name: team_health_pulse_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_health_pulse_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    employee_id uuid,
    question_id text NOT NULL,
    question text NOT NULL,
    response integer NOT NULL,
    category text NOT NULL,
    department text,
    manager_id uuid,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT team_health_pulse_responses_category_check CHECK ((category = ANY (ARRAY['satisfaction'::text, 'workload'::text, 'support'::text, 'engagement'::text]))),
    CONSTRAINT team_health_pulse_responses_response_check CHECK (((response >= 1) AND (response <= 5)))
);


--
-- Name: TABLE team_health_pulse_responses; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.team_health_pulse_responses IS 'Stores employee satisfaction and health pulse survey responses';


--
-- Name: training_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_requests (
    request_id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    request_type text NOT NULL,
    title text NOT NULL,
    description text,
    provider text,
    estimated_cost numeric(10,2),
    preferred_date date,
    business_justification text NOT NULL,
    status text DEFAULT 'requested'::text,
    manager_notes text,
    created_at timestamp with time zone DEFAULT now(),
    reviewed_at timestamp with time zone,
    CONSTRAINT training_requests_request_type_check CHECK ((request_type = ANY (ARRAY['course'::text, 'certification'::text, 'conference'::text, 'workshop'::text, 'mentoring'::text]))),
    CONSTRAINT training_requests_status_check CHECK ((status = ANY (ARRAY['requested'::text, 'approved'::text, 'denied'::text, 'completed'::text])))
);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: employee_departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_departments ALTER COLUMN id SET DEFAULT nextval('public.employee_departments_id_seq'::regclass);


--
-- Name: peer_feedback feedback_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peer_feedback ALTER COLUMN feedback_id SET DEFAULT nextval('public.peer_feedback_feedback_id_seq'::regclass);


--
-- Name: security_audit id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_audit ALTER COLUMN id SET DEFAULT nextval('public.security_audit_id_seq'::regclass);


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

COPY public.assessments (id, employee_id, review_cycle_id, status, value_passionate_rating, value_passionate_examples, value_driven_rating, value_driven_examples, value_resilient_rating, value_resilient_examples, value_responsive_rating, value_responsive_examples, gwc_gets_it, gwc_gets_it_feedback, gwc_wants_it, gwc_wants_it_feedback, gwc_capacity, gwc_capacity_feedback, employee_strengths, employee_improvements, manager_summary_comments, manager_development_plan, submitted_by_employee_at, finalized_by_manager_at, created_at, self_assessment_status, employee_submitted_at, manager_reviewed_at, updated_at, manager_review_status, manager_feedback, employee_notified, manager_notified, due_date, self_assessment_data, manager_review_data, manager_notes, overall_rating, employee_acknowledgment, manager_passionate_feedback, manager_driven_feedback, manager_resilient_feedback, manager_responsive_feedback, manager_gwc_gets_it_feedback, manager_gwc_wants_it_feedback, manager_gwc_capacity_feedback, manager_strengths_feedback, manager_improvements_feedback, manager_performance_rating, manager_core_values_feedback, manager_action_items, manager_gwc_gets_it, manager_gwc_wants_it, manager_gwc_capacity, admin_approval_notes, admin_approved_at, admin_approved_by, admin_revision_notes, admin_revision_requested_at, admin_revision_requested_by, employee_acknowledged_at) FROM stdin;
39	26e3ed38-ad4d-4f1b-9229-4d992bdb1e32	8	not_started	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-30 14:22:15.135218+00	not_started	\N	\N	2025-07-30 14:22:15.135218+00	pending	{}	f	f	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
40	f07fc797-2849-4b8c-befe-c633732f18e9	8	not_started	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-30 14:22:15.135218+00	not_started	\N	\N	2025-07-30 14:22:15.135218+00	pending	{}	f	f	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
42	d8dfa847-2caa-4408-9434-8e25fcfadcd0	8	not_started	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-30 14:22:15.135218+00	not_started	\N	\N	2025-07-30 14:22:15.135218+00	pending	{}	f	f	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
41	3f2c6e27-8191-4bf1-9687-ba314598f39d	8	not_started	\N	aasdgasdg	\N	asga	\N	adsg	\N	asdga	t		t		f	asdgasdgasd	\N	\N	sdfhsdfhsdf	\N	\N	\N	2025-07-30 14:22:15.135218+00	acknowledged	2025-07-30 14:24:21.731+00	2025-07-30 14:25:39.775+00	2025-07-30 14:26:08.608654+00	completed	{}	f	f	\N	{"gwc_gets_it": true, "gwc_capacity": false, "gwc_wants_it": true, "support_needed": "asdgasdgasd", "challenges_faced": "asdgasdg", "skills_developed": "asdg'ag", "goals_next_period": "asdgag", "additional_comments": "asdgag", "key_accomplishments": "asdga", "gwc_gets_it_feedback": "", "overall_satisfaction": "neutral", "gwc_capacity_feedback": "asdgasdgasd", "gwc_wants_it_feedback": "", "core_values_driven_best": "asga", "core_values_respond_swiftly": "asdga", "core_values_passionate_purpose": "aasdgasdg", "core_values_resilient_together": "adsg"}	{"strengths": "sdfhsd", "goals_feedback": "sdh", "overall_rating": "exceeds_expectations", "skills_feedback": "sdfh", "manager_comments": "sdfhsdfhsdf", "passion_feedback": "sdh", "support_response": "sdfh", "challenges_feedback": "sdfghsdf", "excellence_feedback": "sdfh", "manager_gwc_gets_it": false, "resilience_feedback": "sdh", "areas_of_improvement": "sdfhsdf", "manager_gwc_capacity": true, "manager_gwc_wants_it": true, "goals_for_next_period": "sdh'", "satisfaction_feedback": "sdh", "development_priorities": "sdh", "responsiveness_feedback": "sdfh", "additional_manager_comments": "sdfhsdf", "key_accomplishments_feedback": "sry", "manager_gwc_gets_it_feedback": "sdh", "manager_gwc_capacity_feedback": "", "manager_gwc_wants_it_feedback": ""}	\N	\N	f	\N	\N	\N	\N	sdh			\N	\N	exceeds_expectations	\N	\N	f	t	t	\N	\N	\N	\N	\N	\N	2025-07-30 14:26:09.069+00
\.


--
-- Data for Name: company_rocks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_rocks (id, review_cycle_id, description, owner_name, target_date, status, created_at) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, name, description, created_at, updated_at) FROM stdin;
11	Accounting	Financial operations and accounting	2025-07-30 13:03:31.66752+00	2025-07-30 13:03:31.66752+00
12	Purchasing	Procurement and vendor management	2025-07-30 13:03:31.66752+00	2025-07-30 13:03:31.66752+00
13	Engineering	Product development and engineering	2025-07-30 13:03:31.66752+00	2025-07-30 13:03:31.66752+00
14	Executive	Executive leadership and strategy	2025-07-30 13:03:31.66752+00	2025-07-30 13:03:31.66752+00
15	Quality	Quality assurance and control	2025-07-30 13:03:31.66752+00	2025-07-30 13:03:31.66752+00
16	Production	Manufacturing and production	2025-07-30 13:03:31.66752+00	2025-07-30 13:03:31.66752+00
17	Machining	Machining operations	2025-07-30 13:03:31.66752+00	2025-07-30 13:03:31.66752+00
18	Program Management	Program and project management	2025-07-30 13:03:31.66752+00	2025-07-30 13:03:31.66752+00
19	Sales	Sales and customer relations	2025-07-30 13:03:31.66752+00	2025-07-30 13:03:31.66752+00
20	General	General/Unassigned employees	2025-07-30 13:03:31.66752+00	2025-07-30 13:03:31.66752+00
\.


--
-- Data for Name: development_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.development_plans (id, employee_id, title, description, goals, skills_to_develop, timeline, status, manager_feedback, manager_reviewed_at, manager_reviewed_by, created_at, updated_at, manager_id, objectives, resources_needed, success_metrics, target_completion_date, manager_rating, submission_date, review_date) FROM stdin;
\.


--
-- Data for Name: employee_departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_departments (id, employee_id, department_id, created_at, is_primary, assigned_by) FROM stdin;
8	3f2c6e27-8191-4bf1-9687-ba314598f39d	13	2025-07-30 15:22:00.329404+00	t	\N
9	3f2c6e27-8191-4bf1-9687-ba314598f39d	18	2025-07-30 15:22:01.194497+00	f	\N
10	f07fc797-2849-4b8c-befe-c633732f18e9	14	2025-07-30 17:33:46.141124+00	t	\N
11	26e3ed38-ad4d-4f1b-9229-4d992bdb1e32	13	2025-07-30 17:34:04.217224+00	t	\N
13	26e3ed38-ad4d-4f1b-9229-4d992bdb1e32	12	2025-07-30 17:34:19.108541+00	f	\N
14	d8dfa847-2caa-4408-9434-8e25fcfadcd0	13	2025-07-30 17:34:35.23078+00	t	\N
15	d8dfa847-2caa-4408-9434-8e25fcfadcd0	14	2025-07-30 17:34:36.178579+00	f	\N
\.


--
-- Data for Name: employee_development_goals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_development_goals (goal_id, employee_id, goal_type, title, description, target_date, status, priority, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, user_id, name, email, job_title, manager_id, is_active, created_at, role, updated_at, temp_password, must_change_password, department) FROM stdin;
3f2c6e27-8191-4bf1-9687-ba314598f39d	a01ffcdb-c09d-4e61-b5c0-a0c5a076cd96	Employee1	employee1@lucerne.com	Employee1	d8dfa847-2caa-4408-9434-8e25fcfadcd0	t	2025-07-28 12:45:18.769366+00	employee	2025-07-28 12:45:18.769366+00	Employee1	t	Engineering
f07fc797-2849-4b8c-befe-c633732f18e9	34e47cd9-1b10-4114-b5f3-708309644924	Administrator	admin@lucerne.com	System Administrator	\N	t	2025-07-28 02:33:17.191444+00	admin	2025-07-28 02:33:17.191444+00	\N	f	Executive
26e3ed38-ad4d-4f1b-9229-4d992bdb1e32	9f4ad8f1-50c8-4250-a0e9-11dc6ab5517c	Employee2	employee2@lucerne.com	Employee2	d8dfa847-2caa-4408-9434-8e25fcfadcd0	t	2025-07-28 16:44:38.768388+00	employee	2025-07-28 16:44:38.768388+00	Employee2	t	Engineering
d8dfa847-2caa-4408-9434-8e25fcfadcd0	9a6b509f-9e0a-4b2d-b17e-af32abfc91f8	Manager1	manager1@lucerne.com	Manager1	f07fc797-2849-4b8c-befe-c633732f18e9	t	2025-07-28 12:38:47.540613+00	manager	2025-07-28 12:38:47.540613+00	Manager1	t	Engineering
\.


--
-- Data for Name: kudos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.kudos (id, giver_id, receiver_id, core_value, message, created_at) FROM stdin;
\.


--
-- Data for Name: manager_employee_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.manager_employee_messages (message_id, from_employee_id, to_employee_id, subject, message, message_type, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: manager_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.manager_notes (id, manager_id, employee_id, title, content, category, priority, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, recipient_id, sender_id, type, title, message, data, read_at, created_at, updated_at) FROM stdin;
72a4f10c-478e-4cca-9e0b-f9b54331ddbe	3f2c6e27-8191-4bf1-9687-ba314598f39d	d8dfa847-2caa-4408-9434-8e25fcfadcd0	manager_review_completed	Your Manager Review is Complete	Manager1 has completed your performance review for Ed's Demo Cycle. You can now view their feedback.	{"cycle_id": 8, "cycle_name": "Ed's Demo Cycle", "employee_id": "3f2c6e27-8191-4bf1-9687-ba314598f39d", "manager_name": "Manager1", "assessment_id": 41}	\N	2025-07-30 14:25:39.325223+00	2025-07-30 14:25:39.325223+00
\.


--
-- Data for Name: peer_feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.peer_feedback (feedback_id, giver_id, recipient_id, feedback_type, feedback_timestamp, category, message, is_anonymous, helpful_count, created_at, updated_at) FROM stdin;
7	3f2c6e27-8191-4bf1-9687-ba314598f39d	d8dfa847-2caa-4408-9434-8e25fcfadcd0	appreciation	2025-07-30 14:26:34.195597+00	teamwork	Geta testcghsdffg	f	0	2025-07-30 14:26:34.195597+00	2025-07-30 14:26:34.195597+00
\.


--
-- Data for Name: pulse_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pulse_questions (id, question_id, question_text, category, type, options, is_active, sort_order, created_by, created_at, updated_at) FROM stdin;
d56dbd7e-5401-4af8-81c8-239e7f401926	provide_value	Do you feel you provide value to the company?	satisfaction	scale	\N	t	1	\N	2025-07-30 16:02:03.325647+00	2025-07-30 16:02:03.325647+00
9dad5ae6-522f-4d7a-9599-efbf72fcb04c	happy_to_start_work	Were you happy to start work today?	satisfaction	scale	\N	t	2	\N	2025-07-30 16:02:03.325647+00	2025-07-30 16:02:03.325647+00
00c77d01-eba0-46bd-b845-b497aa4528de	feel_contribute	Do you feel you contribute meaningfully to your team?	satisfaction	scale	\N	t	3	\N	2025-07-30 16:02:03.325647+00	2025-07-30 16:02:03.325647+00
94b1a577-ee19-4b88-9eeb-aacd4a5480ab	workplace_satisfaction	How satisfied are you with your workplace today?	satisfaction	scale	\N	t	4	\N	2025-07-30 16:02:03.325647+00	2025-07-30 16:02:03.325647+00
f36e88e3-1d5b-4f9a-8d51-22af6a1a818d	team_collaboration	How would you rate your team collaboration today?	satisfaction	scale	\N	t	5	\N	2025-07-30 16:02:03.325647+00	2025-07-30 16:02:03.325647+00
5a703287-b53d-49c6-aab3-852e0feb50d5	workload_balance	How manageable is your workload today?	satisfaction	scale	\N	t	6	\N	2025-07-30 16:02:03.325647+00	2025-07-30 16:02:03.325647+00
6444e723-c3a4-46bd-ab07-050bc3d90d3a	work_environment	How comfortable is your work environment?	satisfaction	scale	\N	t	7	\N	2025-07-30 16:02:03.325647+00	2025-07-30 16:02:03.325647+00
0afd4db1-d0a7-48d4-afcc-33a68c86ecbc	job_fulfillment	How fulfilling is your work today?	satisfaction	scale	\N	t	8	\N	2025-07-30 16:02:03.325647+00	2025-07-30 16:02:03.325647+00
\.


--
-- Data for Name: review_cycles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review_cycles (id, name, start_date, end_date, status, created_at, cycle_type, description, updated_at) FROM stdin;
8	Ed's Demo Cycle	2025-07-01	2025-09-30	active	2025-07-30 14:22:14.854364+00	quarterly	\N	2025-07-30 14:22:15.135218+00
\.


--
-- Data for Name: security_audit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.security_audit (id, user_id, employee_id, action, resource, success, ip_address, user_agent, "timestamp") FROM stdin;
1	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	employee_created	employee_id:36556956-ac4d-4cf3-9868-78ed84dc6a82,role:manager	t	\N	\N	2025-07-28 03:03:57.62216+00
2	\N	\N	employee_created	employee_id:0595b6e2-aae7-41be-90d8-4a2051cd32da,role:manager	t	\N	\N	2025-07-28 12:11:18.210966+00
3	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	employee_created	employee_id:8f8228db-4312-4358-b2d4-d396f021af20,role:manager	t	\N	\N	2025-07-28 12:13:32.027337+00
4	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	employee_created	employee_id:43738820-153a-4947-aad9-45d12513dfc9,role:manager	t	\N	\N	2025-07-28 12:36:15.640576+00
5	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	review_cycle_closed	cycle_id:1,name:TestRevCycle1	t	\N	\N	2025-07-28 13:44:52.538884+00
6	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	review_cycle_closed	cycle_id:2,name:Q3TestReview	t	\N	\N	2025-07-28 15:24:18.394628+00
7	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	review_cycle_closed	cycle_id:4,name:Q22026Test	t	\N	\N	2025-07-28 16:36:16.071196+00
8	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	employee_updated	employee_id:caad3baa-7ae8-4241-9654-80ca6ffd578d,changes:role,manager_id,	t	\N	\N	2025-07-28 19:34:58.104608+00
9	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	review_cycle_closed	cycle_id:5,name:Q1 2020 Test	t	\N	\N	2025-07-29 17:16:17.880932+00
10	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	review_cycle_closed	cycle_id:3,name:Q12026Test	t	\N	\N	2025-07-29 17:16:25.100863+00
11	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	review_cycle_closed	cycle_id:6,name:Q11999Test	t	\N	\N	2025-07-29 19:54:44.812451+00
12	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	employee_updated	employee_id:caad3baa-7ae8-4241-9654-80ca6ffd578d,changes:manager_id,	t	\N	\N	2025-07-29 20:34:31.854952+00
13	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	employee_updated	employee_id:71dc105f-4f64-4ab5-b308-54d02ad9f4d1,changes:manager_id,	t	\N	\N	2025-07-29 20:34:45.996953+00
\.


--
-- Data for Name: team_health_alerts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_health_alerts (id, user_id, employee_id, employee_name, manager_id, department, question_id, question, response, severity, acknowledged, acknowledged_by, acknowledged_at, created_at, updated_at) FROM stdin;
70030d0c-d708-467e-93b9-053f4d770df4	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	Administrator	\N	General	workplace_satisfaction	How satisfied are you with your workplace today?	2	medium	f	\N	\N	2025-07-30 17:33:02.748475+00	2025-07-30 17:33:02.748475+00
\.


--
-- Data for Name: team_health_pulse_responses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_health_pulse_responses (id, user_id, employee_id, question_id, question, response, category, department, manager_id, "timestamp", created_at, updated_at) FROM stdin;
feaa143b-1671-4d1e-90ff-9b554ec3e0cb	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	workload_balance	How manageable is your workload today?	4	satisfaction	General	\N	2025-07-30 16:16:47.456+00	2025-07-30 16:16:47.249171+00	2025-07-30 16:16:47.249171+00
4fc05e17-b04f-4018-a879-5a65bc5c27a8	34e47cd9-1b10-4114-b5f3-708309644924	f07fc797-2849-4b8c-befe-c633732f18e9	workplace_satisfaction	How satisfied are you with your workplace today?	2	satisfaction	General	\N	2025-07-30 17:33:03.032+00	2025-07-30 17:33:02.748475+00	2025-07-30 17:33:02.748475+00
99d31bea-6e6d-4440-a166-fe470eb20c1d	9a6b509f-9e0a-4b2d-b17e-af32abfc91f8	d8dfa847-2caa-4408-9434-8e25fcfadcd0	workload_balance	How manageable is your workload today?	5	satisfaction	Engineering	f07fc797-2849-4b8c-befe-c633732f18e9	2025-07-30 17:51:18.311+00	2025-07-30 17:51:18.017046+00	2025-07-30 17:51:18.017046+00
\.


--
-- Data for Name: training_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.training_requests (request_id, employee_id, request_type, title, description, provider, estimated_cost, preferred_date, business_justification, status, manager_notes, created_at, reviewed_at) FROM stdin;
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

SELECT pg_catalog.setval('public.assessments_id_seq', 42, true);


--
-- Name: company_rocks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.company_rocks_id_seq', 1, false);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_id_seq', 30, true);


--
-- Name: employee_departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_departments_id_seq', 15, true);


--
-- Name: kudos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.kudos_id_seq', 1, false);


--
-- Name: peer_feedback_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.peer_feedback_feedback_id_seq', 7, true);


--
-- Name: review_cycles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.review_cycles_id_seq', 8, true);


--
-- Name: security_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.security_audit_id_seq', 13, true);


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
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: development_plans development_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_plans
    ADD CONSTRAINT development_plans_pkey PRIMARY KEY (id);


--
-- Name: employee_departments employee_departments_employee_id_department_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_departments
    ADD CONSTRAINT employee_departments_employee_id_department_id_key UNIQUE (employee_id, department_id);


--
-- Name: employee_departments employee_departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_departments
    ADD CONSTRAINT employee_departments_pkey PRIMARY KEY (id);


--
-- Name: employee_development_goals employee_development_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_development_goals
    ADD CONSTRAINT employee_development_goals_pkey PRIMARY KEY (goal_id);


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
-- Name: manager_employee_messages manager_employee_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_employee_messages
    ADD CONSTRAINT manager_employee_messages_pkey PRIMARY KEY (message_id);


--
-- Name: manager_notes manager_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_notes
    ADD CONSTRAINT manager_notes_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: peer_feedback peer_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peer_feedback
    ADD CONSTRAINT peer_feedback_pkey PRIMARY KEY (feedback_id);


--
-- Name: pulse_questions pulse_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pulse_questions
    ADD CONSTRAINT pulse_questions_pkey PRIMARY KEY (id);


--
-- Name: pulse_questions pulse_questions_question_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pulse_questions
    ADD CONSTRAINT pulse_questions_question_id_key UNIQUE (question_id);


--
-- Name: review_cycles review_cycles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_cycles
    ADD CONSTRAINT review_cycles_pkey PRIMARY KEY (id);


--
-- Name: security_audit security_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_audit
    ADD CONSTRAINT security_audit_pkey PRIMARY KEY (id);


--
-- Name: team_health_alerts team_health_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_health_alerts
    ADD CONSTRAINT team_health_alerts_pkey PRIMARY KEY (id);


--
-- Name: team_health_pulse_responses team_health_pulse_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_health_pulse_responses
    ADD CONSTRAINT team_health_pulse_responses_pkey PRIMARY KEY (id);


--
-- Name: training_requests training_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_requests
    ADD CONSTRAINT training_requests_pkey PRIMARY KEY (request_id);


--
-- Name: idx_alerts_acknowledged; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerts_acknowledged ON public.team_health_alerts USING btree (acknowledged);


--
-- Name: idx_alerts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerts_created_at ON public.team_health_alerts USING btree (created_at);


--
-- Name: idx_alerts_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerts_department ON public.team_health_alerts USING btree (department);


--
-- Name: idx_alerts_manager_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerts_manager_id ON public.team_health_alerts USING btree (manager_id);


--
-- Name: idx_alerts_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alerts_severity ON public.team_health_alerts USING btree (severity);


--
-- Name: idx_assessments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assessments_created_at ON public.assessments USING btree (created_at);


--
-- Name: idx_assessments_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assessments_employee_id ON public.assessments USING btree (employee_id);


--
-- Name: idx_assessments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assessments_status ON public.assessments USING btree (self_assessment_status, manager_review_status);


--
-- Name: idx_assessments_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assessments_updated_at ON public.assessments USING btree (updated_at);


--
-- Name: idx_development_goals_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_development_goals_employee ON public.employee_development_goals USING btree (employee_id);


--
-- Name: idx_development_goals_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_development_goals_status ON public.employee_development_goals USING btree (status);


--
-- Name: idx_development_plans_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_development_plans_created_at ON public.development_plans USING btree (created_at DESC);


--
-- Name: idx_development_plans_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_development_plans_employee_id ON public.development_plans USING btree (employee_id);


--
-- Name: idx_development_plans_manager_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_development_plans_manager_id ON public.development_plans USING btree (manager_id);


--
-- Name: idx_development_plans_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_development_plans_status ON public.development_plans USING btree (status);


--
-- Name: idx_employee_departments_department_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_departments_department_id ON public.employee_departments USING btree (department_id);


--
-- Name: idx_employee_departments_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_departments_employee_id ON public.employee_departments USING btree (employee_id);


--
-- Name: idx_employee_departments_primary; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_departments_primary ON public.employee_departments USING btree (is_primary) WHERE (is_primary = true);


--
-- Name: idx_employee_primary_department; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_employee_primary_department ON public.employee_departments USING btree (employee_id) WHERE (is_primary = true);


--
-- Name: idx_employees_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_department ON public.employees USING btree (department);


--
-- Name: idx_manager_notes_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manager_notes_created_at ON public.manager_notes USING btree (created_at DESC);


--
-- Name: idx_manager_notes_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manager_notes_employee_id ON public.manager_notes USING btree (employee_id);


--
-- Name: idx_manager_notes_manager_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manager_notes_manager_id ON public.manager_notes USING btree (manager_id);


--
-- Name: idx_messages_from_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_from_employee ON public.manager_employee_messages USING btree (from_employee_id);


--
-- Name: idx_messages_to_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_to_employee ON public.manager_employee_messages USING btree (to_employee_id);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_read_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_read_at ON public.notifications USING btree (read_at);


--
-- Name: idx_notifications_recipient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_recipient_id ON public.notifications USING btree (recipient_id);


--
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);


--
-- Name: idx_notifications_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (recipient_id, read_at) WHERE (read_at IS NULL);


--
-- Name: idx_pulse_questions_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pulse_questions_active ON public.pulse_questions USING btree (is_active);


--
-- Name: idx_pulse_questions_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pulse_questions_category ON public.pulse_questions USING btree (category);


--
-- Name: idx_pulse_questions_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pulse_questions_sort_order ON public.pulse_questions USING btree (sort_order);


--
-- Name: idx_pulse_responses_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pulse_responses_category ON public.team_health_pulse_responses USING btree (category);


--
-- Name: idx_pulse_responses_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pulse_responses_department ON public.team_health_pulse_responses USING btree (department);


--
-- Name: idx_pulse_responses_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pulse_responses_employee_id ON public.team_health_pulse_responses USING btree (employee_id);


--
-- Name: idx_pulse_responses_manager_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pulse_responses_manager_dept ON public.team_health_pulse_responses USING btree (manager_id, department);


--
-- Name: idx_pulse_responses_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pulse_responses_timestamp ON public.team_health_pulse_responses USING btree ("timestamp");


--
-- Name: idx_pulse_responses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pulse_responses_user_id ON public.team_health_pulse_responses USING btree (user_id);


--
-- Name: idx_review_cycles_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_cycles_created_at ON public.review_cycles USING btree (created_at);


--
-- Name: idx_review_cycles_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_cycles_dates ON public.review_cycles USING btree (start_date, end_date);


--
-- Name: idx_review_cycles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_review_cycles_status ON public.review_cycles USING btree (status);


--
-- Name: idx_training_requests_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_training_requests_employee ON public.training_requests USING btree (employee_id);


--
-- Name: idx_training_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_training_requests_status ON public.training_requests USING btree (status);


--
-- Name: assessments trg_assessment_submitted; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_assessment_submitted AFTER UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.notify_manager_assessment_submitted();


--
-- Name: assessments trg_manager_review_completed; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_manager_review_completed AFTER UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.notify_employee_manager_review_completed();


--
-- Name: team_health_pulse_responses trigger_create_pulse_alert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_create_pulse_alert AFTER INSERT ON public.team_health_pulse_responses FOR EACH ROW EXECUTE FUNCTION public.create_pulse_alert();


--
-- Name: assessments update_assessments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: departments update_departments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: review_cycles update_review_cycles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_review_cycles_updated_at BEFORE UPDATE ON public.review_cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


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
-- Name: development_plans development_plans_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_plans
    ADD CONSTRAINT development_plans_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: development_plans development_plans_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_plans
    ADD CONSTRAINT development_plans_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: development_plans development_plans_manager_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_plans
    ADD CONSTRAINT development_plans_manager_reviewed_by_fkey FOREIGN KEY (manager_reviewed_by) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: employee_departments employee_departments_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_departments
    ADD CONSTRAINT employee_departments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.employees(id);


--
-- Name: employee_departments employee_departments_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_departments
    ADD CONSTRAINT employee_departments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: employee_departments employee_departments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_departments
    ADD CONSTRAINT employee_departments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_development_goals employee_development_goals_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_development_goals
    ADD CONSTRAINT employee_development_goals_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employees employees_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(id);


--
-- Name: assessments fk_admin_approved_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT fk_admin_approved_by FOREIGN KEY (admin_approved_by) REFERENCES public.employees(id);


--
-- Name: assessments fk_admin_revision_requested_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT fk_admin_revision_requested_by FOREIGN KEY (admin_revision_requested_by) REFERENCES public.employees(id);


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
-- Name: manager_employee_messages manager_employee_messages_from_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_employee_messages
    ADD CONSTRAINT manager_employee_messages_from_employee_id_fkey FOREIGN KEY (from_employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: manager_employee_messages manager_employee_messages_to_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_employee_messages
    ADD CONSTRAINT manager_employee_messages_to_employee_id_fkey FOREIGN KEY (to_employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: manager_notes manager_notes_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_notes
    ADD CONSTRAINT manager_notes_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: manager_notes manager_notes_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_notes
    ADD CONSTRAINT manager_notes_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: peer_feedback peer_feedback_giver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peer_feedback
    ADD CONSTRAINT peer_feedback_giver_id_fkey FOREIGN KEY (giver_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: peer_feedback peer_feedback_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peer_feedback
    ADD CONSTRAINT peer_feedback_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: pulse_questions pulse_questions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pulse_questions
    ADD CONSTRAINT pulse_questions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: security_audit security_audit_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_audit
    ADD CONSTRAINT security_audit_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: security_audit security_audit_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_audit
    ADD CONSTRAINT security_audit_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: team_health_alerts team_health_alerts_acknowledged_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_health_alerts
    ADD CONSTRAINT team_health_alerts_acknowledged_by_fkey FOREIGN KEY (acknowledged_by) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: team_health_alerts team_health_alerts_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_health_alerts
    ADD CONSTRAINT team_health_alerts_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: team_health_alerts team_health_alerts_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_health_alerts
    ADD CONSTRAINT team_health_alerts_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: team_health_alerts team_health_alerts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_health_alerts
    ADD CONSTRAINT team_health_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: team_health_pulse_responses team_health_pulse_responses_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_health_pulse_responses
    ADD CONSTRAINT team_health_pulse_responses_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: team_health_pulse_responses team_health_pulse_responses_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_health_pulse_responses
    ADD CONSTRAINT team_health_pulse_responses_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: team_health_pulse_responses team_health_pulse_responses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_health_pulse_responses
    ADD CONSTRAINT team_health_pulse_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: training_requests training_requests_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_requests
    ADD CONSTRAINT training_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: team_health_alerts Admins can manage all alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all alerts" ON public.team_health_alerts TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text)))));


--
-- Name: pulse_questions Admins can manage pulse questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage pulse questions" ON public.pulse_questions TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text)))));


--
-- Name: team_health_pulse_responses Admins can view all pulse responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all pulse responses" ON public.team_health_pulse_responses TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text)))));


--
-- Name: assessments Enable read access for own and team assessments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for own and team assessments" ON public.assessments FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.id = assessments.employee_id)))) OR public.is_manager_of(auth.uid(), employee_id) OR (public.get_user_role(auth.uid()) = 'admin'::text)));


--
-- Name: assessments Enable update for own and team assessments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for own and team assessments" ON public.assessments FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.id = assessments.employee_id)))) OR public.is_manager_of(auth.uid(), employee_id) OR (public.get_user_role(auth.uid()) = 'admin'::text)));


--
-- Name: pulse_questions Everyone can view active pulse questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view active pulse questions" ON public.pulse_questions FOR SELECT TO authenticated USING ((is_active = true));


--
-- Name: departments Everyone can view departments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view departments" ON public.departments FOR SELECT USING (true);


--
-- Name: team_health_alerts Managers can manage team alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Managers can manage team alerts" ON public.team_health_alerts TO authenticated USING ((manager_id IN ( SELECT employees.id
   FROM public.employees
  WHERE (employees.user_id = auth.uid()))));


--
-- Name: team_health_pulse_responses Managers can view team pulse responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Managers can view team pulse responses" ON public.team_health_pulse_responses FOR SELECT TO authenticated USING ((manager_id IN ( SELECT employees.id
   FROM public.employees
  WHERE (employees.user_id = auth.uid()))));


--
-- Name: employee_departments Only admins can modify department assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can modify department assignments" ON public.employee_departments USING ((EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text)))));


--
-- Name: departments Only admins can modify departments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can modify departments" ON public.departments USING ((EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text)))));


--
-- Name: team_health_pulse_responses Users can insert own pulse responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own pulse responses" ON public.team_health_pulse_responses FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: employee_departments Users can view department assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view department assignments" ON public.employee_departments FOR SELECT USING (((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE (employees.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM (public.employees e1
     JOIN public.employees e2 ON ((e1.id = e2.manager_id)))
  WHERE ((e1.user_id = auth.uid()) AND (e2.id = employee_departments.employee_id)))) OR (EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text))))));


--
-- Name: team_health_alerts Users can view own alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own alerts" ON public.team_health_alerts FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: team_health_pulse_responses Users can view own pulse responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own pulse responses" ON public.team_health_pulse_responses FOR SELECT TO authenticated USING ((auth.uid() = user_id));


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
-- Name: assessments assessments_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY assessments_insert_own ON public.assessments FOR INSERT TO authenticated WITH CHECK (((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))) OR (EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text) AND (employees.is_active = true))))));


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
-- Name: assessments assessments_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY assessments_select_own ON public.assessments FOR SELECT TO authenticated USING (((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))) OR (employee_id IN ( SELECT e.id
   FROM public.employees e
  WHERE (e.manager_id IN ( SELECT employees.id
           FROM public.employees
          WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))))) OR (EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text) AND (employees.is_active = true))))));


--
-- Name: assessments assessments_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY assessments_update_own ON public.assessments FOR UPDATE TO authenticated USING (((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))) OR (employee_id IN ( SELECT e.id
   FROM public.employees e
  WHERE (e.manager_id IN ( SELECT employees.id
           FROM public.employees
          WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))))) OR (EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text) AND (employees.is_active = true))))));


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
-- Name: departments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

--
-- Name: departments departments_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY departments_select_all ON public.departments FOR SELECT TO authenticated USING (true);


--
-- Name: development_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: development_plans development_plans_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY development_plans_access ON public.development_plans USING (((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))) OR (employee_id IN ( SELECT e.id
   FROM public.employees e
  WHERE (e.manager_id IN ( SELECT employees.id
           FROM public.employees
          WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true))))))));


--
-- Name: development_plans development_plans_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY development_plans_insert_own ON public.development_plans FOR INSERT TO authenticated WITH CHECK ((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))));


--
-- Name: development_plans development_plans_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY development_plans_select_own ON public.development_plans FOR SELECT TO authenticated USING (((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))) OR (manager_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))) OR (EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text) AND (employees.is_active = true))))));


--
-- Name: development_plans development_plans_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY development_plans_update_own ON public.development_plans FOR UPDATE TO authenticated USING (((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))) OR (manager_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))) OR (EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text) AND (employees.is_active = true))))));


--
-- Name: employee_departments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employee_departments ENABLE ROW LEVEL SECURITY;

--
-- Name: employee_departments employee_departments_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY employee_departments_select_own ON public.employee_departments FOR SELECT TO authenticated USING (((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))) OR (employee_id IN ( SELECT e.id
   FROM public.employees e
  WHERE (e.manager_id IN ( SELECT employees.id
           FROM public.employees
          WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))))) OR (EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text) AND (employees.is_active = true))))));


--
-- Name: employee_development_goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employee_development_goals ENABLE ROW LEVEL SECURITY;

--
-- Name: employee_development_goals employee_goals_admin_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY employee_goals_admin_access ON public.employee_development_goals TO authenticated USING ((auth.email() = 'admin@lucerne.com'::text)) WITH CHECK ((auth.email() = 'admin@lucerne.com'::text));


--
-- Name: employee_development_goals employee_goals_manager_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY employee_goals_manager_access ON public.employee_development_goals FOR SELECT TO authenticated USING ((employee_id IN ( SELECT employees.id
   FROM public.employees
  WHERE (employees.manager_id = ( SELECT employees_1.id
           FROM public.employees employees_1
          WHERE (employees_1.user_id = auth.uid()))))));


--
-- Name: employee_development_goals employee_goals_own_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY employee_goals_own_access ON public.employee_development_goals TO authenticated USING ((employee_id = ( SELECT employees.id
   FROM public.employees
  WHERE (employees.user_id = auth.uid())))) WITH CHECK ((employee_id = ( SELECT employees.id
   FROM public.employees
  WHERE (employees.user_id = auth.uid()))));


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
-- Name: manager_employee_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.manager_employee_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: manager_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.manager_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: manager_notes manager_notes_own_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY manager_notes_own_access ON public.manager_notes USING ((manager_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))));


--
-- Name: manager_employee_messages messages_admin_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY messages_admin_access ON public.manager_employee_messages TO authenticated USING ((auth.email() = 'admin@lucerne.com'::text)) WITH CHECK ((auth.email() = 'admin@lucerne.com'::text));


--
-- Name: manager_employee_messages messages_participant_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY messages_participant_access ON public.manager_employee_messages TO authenticated USING (((from_employee_id = ( SELECT employees.id
   FROM public.employees
  WHERE (employees.user_id = auth.uid()))) OR (to_employee_id = ( SELECT employees.id
   FROM public.employees
  WHERE (employees.user_id = auth.uid()))))) WITH CHECK (((from_employee_id = ( SELECT employees.id
   FROM public.employees
  WHERE (employees.user_id = auth.uid()))) OR (to_employee_id = ( SELECT employees.id
   FROM public.employees
  WHERE (employees.user_id = auth.uid())))));


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_insert_own ON public.notifications FOR INSERT TO authenticated WITH CHECK (((recipient_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))) OR (sender_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true))))));


--
-- Name: notifications notifications_own_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_own_access ON public.notifications USING ((recipient_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))));


--
-- Name: notifications notifications_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_select_own ON public.notifications FOR SELECT TO authenticated USING ((recipient_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))));


--
-- Name: notifications notifications_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_update_own ON public.notifications FOR UPDATE TO authenticated USING ((recipient_id IN ( SELECT employees.id
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.is_active = true)))));


--
-- Name: pulse_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pulse_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: review_cycles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.review_cycles ENABLE ROW LEVEL SECURITY;

--
-- Name: review_cycles review_cycles_admin_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY review_cycles_admin_access ON public.review_cycles TO authenticated USING ((auth.email() = 'admin@lucerne.com'::text)) WITH CHECK ((auth.email() = 'admin@lucerne.com'::text));


--
-- Name: review_cycles review_cycles_insert_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY review_cycles_insert_admin ON public.review_cycles FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text) AND (employees.is_active = true)))));


--
-- Name: review_cycles review_cycles_manager_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY review_cycles_manager_read ON public.review_cycles FOR SELECT TO authenticated USING (((status = ANY (ARRAY['active'::text, 'upcoming'::text])) AND (EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.id IN ( SELECT DISTINCT employees_1.manager_id
           FROM public.employees employees_1
          WHERE (employees_1.manager_id IS NOT NULL))))))));


--
-- Name: review_cycles review_cycles_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY review_cycles_select_all ON public.review_cycles FOR SELECT TO authenticated USING (true);


--
-- Name: review_cycles review_cycles_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY review_cycles_update_admin ON public.review_cycles FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.employees
  WHERE ((employees.user_id = auth.uid()) AND (employees.role = 'admin'::text) AND (employees.is_active = true)))));


--
-- Name: security_audit; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;

--
-- Name: security_audit security_audit_admin_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY security_audit_admin_read ON public.security_audit FOR SELECT TO authenticated USING (public.check_user_permission('admin'::text));


--
-- Name: team_health_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.team_health_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: team_health_pulse_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.team_health_pulse_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: training_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.training_requests ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

