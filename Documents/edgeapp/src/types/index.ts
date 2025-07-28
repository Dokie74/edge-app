// Core TypeScript definitions for EDGE application

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  job_title?: string;
  role: 'employee' | 'manager' | 'admin';
  manager_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewCycle {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'closed';
  created_by: string;
  created_at: string;
}

export interface Assessment {
  id: string;
  employee_id: string;
  cycle_id: string;
  self_assessment_status: 'not_started' | 'in_progress' | 'submitted';
  manager_review_status: 'pending' | 'in_progress' | 'completed';
  self_assessment_data?: Record<string, any>;
  manager_review_data?: Record<string, any>;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface DevelopmentPlan {
  id: string;
  employee_id: string;
  title: string;
  description?: string;
  goals: string; // JSON string
  skills_to_develop: string; // JSON string
  timeline?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'needs_revision';
  manager_feedback?: string;
  manager_reviewed_at?: string;
  manager_reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  goal: string;
  timeline?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface Skill {
  skill: string;
  reason?: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id?: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read_at?: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  sender_id: string;
  recipient_id: string;
  feedback_text: string;
  feedback_type: 'positive' | 'constructive' | 'general';
  visibility: 'private' | 'manager' | 'public';
  created_at: string;
}

export interface Kudo {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  badge_type: 'teamwork' | 'innovation' | 'leadership' | 'dedication' | 'excellence';
  visibility: 'public' | 'private';
  created_at: string;
}

export interface ManagerNote {
  id: string;
  manager_id: string;
  employee_id: string;
  note_text: string;
  note_type: 'general' | 'performance' | 'goal' | 'development';
  created_at: string;
  updated_at: string;
}

// Component Props Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export interface ErrorMessageProps {
  error: string;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export interface StatusBadgeProps {
  status: string;
  color?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan';
  size?: 'sm' | 'md';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Form Types
export interface EmployeeFormData {
  name: string;
  email: string;
  jobTitle: string;
  role: 'employee' | 'manager' | 'admin';
  managerId?: string;
  isActive: boolean;
  tempPassword?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  data: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  employees?: {
    total: number;
    by_role: Record<string, number>;
    team_members?: Employee[];
    total_members?: number;
  };
  review_cycles?: {
    total: number;
    active: number;
    upcoming: number;
    closed: number;
  };
  assessments?: {
    total: number;
    completed: number;
    pending: number;
    manager_reviews_pending: number;
    manager_reviews_completed: number;
    completion_rate: number;
    team_completion_rate?: number;
    pending_reviews?: number;
  };
  development_plans?: {
    total: number;
    submitted: number;
    under_review: number;
    approved: number;
    needs_revision: number;
    pending_review?: number;
  };
  notifications?: {
    total_sent: number;
    unread: number;
    unread_count?: number;
  };
  recent_activity?: Array<{
    type: string;
    description: string;
    timestamp: string;
    employee_name: string;
  }>;
  profile?: {
    name: string;
    job_title: string;
    email: string;
    role: string;
    manager_name?: string;
  };
}

// App Context Types
export interface AppState {
  user: User | null;
  userRole: string | null;
  userName: string | null;
  userDataLoading: boolean;
  activePage: {
    name: string;
    props: Record<string, any>;
  };
  modal: {
    isOpen: boolean;
    name: string | null;
    props: Record<string, any>;
  };
}

export interface AppContextValue extends AppState {
  setActivePage: (page: { name: string; props?: Record<string, any> }) => void;
  openModal: (name: string, props?: Record<string, any>) => void;
  closeModal: () => void;
  signOut: () => Promise<void>;
}

// Service Types
export interface ServiceResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Utility Types
export type UserRole = 'employee' | 'manager' | 'admin';
export type AssessmentStatus = 'not_started' | 'in_progress' | 'submitted';
export type ReviewStatus = 'pending' | 'in_progress' | 'completed';
export type DevelopmentPlanStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'needs_revision';
export type NotificationType = 
  | 'review_cycle_opened'
  | 'assessment_submitted'
  | 'manager_review_ready'
  | 'manager_review_completed'
  | 'development_plan_submitted'
  | 'development_plan_reviewed'
  | 'assessment_overdue'
  | 'review_reminder';