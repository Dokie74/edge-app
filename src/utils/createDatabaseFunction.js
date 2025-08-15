// Utility to create database function
import { supabase } from '../services/supabaseClient';

export const createManagerReviewFunction = async () => {
  const sqlQuery = `
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
    AS $$
    DECLARE
        v_current_user_id uuid;
        v_manager_employee_id uuid;
        v_assessment_employee_manager_id uuid;
    BEGIN
        -- Get the current user's ID
        v_current_user_id := auth.uid();
        
        -- Get the current user's employee record
        SELECT id INTO v_manager_employee_id
        FROM employees 
        WHERE user_id = v_current_user_id;
        
        IF v_manager_employee_id IS NULL THEN
            RAISE EXCEPTION 'Manager employee record not found';
        END IF;
        
        -- Get the manager_id of the employee whose assessment we're trying to access
        SELECT e.manager_id INTO v_assessment_employee_manager_id
        FROM assessments a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.id = p_assessment_id;
        
        -- Check if the current user is the manager of the employee being assessed
        -- or if they are an admin
        IF v_assessment_employee_manager_id != v_manager_employee_id THEN
            -- Check if user is admin
            DECLARE
                v_user_role text;
            BEGIN
                SELECT role INTO v_user_role FROM auth.users WHERE id = v_current_user_id;
                IF v_user_role != 'admin' THEN
                    RAISE EXCEPTION 'Access denied: You can only review assessments for your direct reports';
                END IF;
            END;
        END IF;
        
        -- Return the assessment data with employee and cycle information
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

    -- Grant execute permissions
    GRANT EXECUTE ON FUNCTION public.get_assessment_for_manager_review(bigint) TO authenticated;
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlQuery });
    if (error) {
      console.error('Error creating function:', error);
      throw error;
    }
    console.log('Function created successfully');
    return data;
  } catch (error) {
    console.error('Failed to create function:', error);
    // Try using raw SQL query approach
    try {
      const { data, error: rawError } = await supabase.from('_supabase_migrations').select('*').limit(0);
      console.log('Database connection test:', { data, rawError });
    } catch (e) {
      console.log('Cannot create function, using fallback approach');
    }
    throw error;
  }
};