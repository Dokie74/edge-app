// Database types generated from Supabase schema
export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          job_title: string | null;
          role: 'employee' | 'manager' | 'admin';
          manager_id: string | null;
          department: string | null;
          is_active: boolean;
          temp_password: string | null;
          must_change_password: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          job_title?: string | null;
          role?: 'employee' | 'manager' | 'admin';
          manager_id?: string | null;
          department?: string | null;
          is_active?: boolean;
          temp_password?: string | null;
          must_change_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          email?: string;
          job_title?: string | null;
          role?: 'employee' | 'manager' | 'admin';
          manager_id?: string | null;
          department?: string | null;
          is_active?: boolean;
          temp_password?: string | null;
          must_change_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      review_cycles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          start_date: string;
          end_date: string;
          due_date: string | null;
          is_active: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          due_date?: string | null;
          is_active?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          due_date?: string | null;
          is_active?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          employee_id: string;
          cycle_id: string;
          self_assessment_status: 'not_started' | 'in_progress' | 'submitted';
          manager_review_status: 'pending' | 'in_progress' | 'completed';
          self_assessment_data: any | null;
          manager_review_data: any | null;
          due_date: string;
          submitted_at: string | null;
          manager_reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          cycle_id: string;
          self_assessment_status?: 'not_started' | 'in_progress' | 'submitted';
          manager_review_status?: 'pending' | 'in_progress' | 'completed';
          self_assessment_data?: any | null;
          manager_review_data?: any | null;
          due_date: string;
          submitted_at?: string | null;
          manager_reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          cycle_id?: string;
          self_assessment_status?: 'not_started' | 'in_progress' | 'submitted';
          manager_review_status?: 'pending' | 'in_progress' | 'completed';
          self_assessment_data?: any | null;
          manager_review_data?: any | null;
          due_date?: string;
          submitted_at?: string | null;
          manager_reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      development_plans: {
        Row: {
          id: string;
          employee_id: string;
          title: string;
          description: string | null;
          goals: string;
          skills_to_develop: string;
          timeline: string | null;
          status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'needs_revision';
          manager_feedback: string | null;
          manager_reviewed_at: string | null;
          manager_reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          title: string;
          description?: string | null;
          goals: string;
          skills_to_develop: string;
          timeline?: string | null;
          status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'needs_revision';
          manager_feedback?: string | null;
          manager_reviewed_at?: string | null;
          manager_reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          title?: string;
          description?: string | null;
          goals?: string;
          skills_to_develop?: string;
          timeline?: string | null;
          status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'needs_revision';
          manager_feedback?: string | null;
          manager_reviewed_at?: string | null;
          manager_reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          sender_id: string | null;
          type: string;
          title: string;
          message: string;
          data: any | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          sender_id?: string | null;
          type: string;
          title: string;
          message: string;
          data?: any | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          sender_id?: string | null;
          type?: string;
          title?: string;
          message?: string;
          data?: any | null;
          read_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_all_employees_for_admin: {
        Args: Record<PropertyKey, never>;
        Returns: any;
      };
      get_potential_managers: {
        Args: Record<PropertyKey, never>; 
        Returns: any;
      };
      create_review_cycle: {
        Args: {
          p_name: string;
          p_start_date: string;
          p_end_date: string;
          p_due_date?: string;
        };
        Returns: any;
      };
      activate_review_cycle_with_assessments: {
        Args: {
          p_cycle_id: string;
        };
        Returns: any;
      };
      update_employee: {
        Args: {
          p_employee_id: string;
          p_name?: string | null;
          p_email?: string | null;
          p_job_title?: string | null;
          p_role?: string | null;
          p_manager_id?: string | null;
          p_is_active?: boolean | null;
        };
        Returns: any;
      };
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>;
        Returns: any;
      };
    };
    Enums: {
      user_role: 'employee' | 'manager' | 'admin';
      assessment_status: 'not_started' | 'in_progress' | 'submitted';
      review_status: 'pending' | 'in_progress' | 'completed';
      development_plan_status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'needs_revision';
    };
  };
}