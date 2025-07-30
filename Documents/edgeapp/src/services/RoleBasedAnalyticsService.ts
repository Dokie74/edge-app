// src/services/RoleBasedAnalyticsService.ts - Role-specific dashboard data
import { supabase } from './supabaseClient';
import { DashboardStats } from '../types';
import { TeamHealthService } from './TeamHealthService';

export interface EmployeeDashboardData {
  personalStats: {
    pendingAssessments: number;
    completedAssessments: number;
    goalsProgress: number;
    lastAssessmentDate?: string;
    nextDueDate?: string;
  };
  departmentInfo: {
    departmentName: string;
    teamSize: number;
    avgSatisfaction: number;
    departmentGoalsProgress: number;
  };
  myTasks: Array<{
    id: string;
    title: string;
    type: 'assessment' | 'goal' | 'development_plan';
    dueDate: string;
    status: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    date: string;
    description: string;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning';
    timestamp: string;
  }>;
}

export interface ManagerDashboardData {
  teamStats: {
    teamSize: number;
    pendingReviews: number;
    completedReviews: number;
    teamSatisfactionAvg: number;
    teamGoalsProgress: number;
    overdueItems: number;
  };
  teamPerformance: Array<{
    employeeName: string;
    completionRate: number;
    lastActivity: string;
    status: 'on_track' | 'behind' | 'completed';
  }>;
  peerComparison: {
    myTeamRank: number;
    avgManagerCompletion: number;
    myTeamCompletion: number;
    topPerformingManager: string;
  };
  pendingActions: Array<{
    id: string;
    employeeName: string;
    action: string;
    type: 'review' | 'approval' | 'feedback';
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  departmentMetrics: {
    departmentName: string;
    totalManagers: number;
    departmentCompletion: number;
    departmentSatisfaction: number;
  };
}

export interface AdminDashboardData {
  systemStats: {
    totalEmployees: number;
    totalManagers: number;
    totalAdmins: number;
    activeUsers: number;
    systemUptime: number;
    avgResponseTime: number;
  };
  organizationMetrics: {
    overallCompletion: number;
    overallSatisfaction: number;
    totalAssessments: number;
    activeReviewCycles: number;
    pendingReviews: number;
    overdueItems: number;
  };
  departmentBreakdown: Array<{
    name: string;
    employeeCount: number;
    managerCount: number;
    completionRate: number;
    satisfactionScore: number;
  }>;
  systemAlerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  performanceTrends: Array<{
    period: string;
    completions: number;
    satisfaction: number;
    activeUsers: number;
  }>;
}

class RoleBasedAnalyticsService {
  
  // Employee Dashboard - Personal focus
  static async getEmployeeDashboard(userId: string): Promise<EmployeeDashboardData> {
    try {
      console.log('📊 Fetching employee dashboard for user:', userId);
      
      // Get employee info and assessments
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (empError) throw empError;
      
      // Get personal assessments
      const { data: assessments, error: assessError } = await supabase
        .from('assessments')
        .select(`
          *,
          cycle:review_cycles(name, end_date)
        `)
        .eq('employee_id', employee.id);
      
      if (assessError) console.warn('Assessment fetch error:', assessError);
      
      // Get department colleagues for team size
      const { data: colleagues, error: colleaguesError } = await supabase
        .from('employees')
        .select('id, name')
        .eq('department', employee.department || 'Unknown')
        .neq('id', employee.id);
      
      if (colleaguesError) console.warn('Colleagues fetch error:', colleaguesError);
      
      const pendingAssessments = assessments?.filter(a => 
        a.self_assessment_status === 'not_started' || a.self_assessment_status === 'in_progress'
      ).length || 0;
      
      const completedAssessments = assessments?.filter(a => 
        a.self_assessment_status === 'submitted'
      ).length || 0;
      
      const lastAssessment = assessments?.find(a => a.self_assessment_status === 'submitted');
      const nextDue = assessments?.find(a => 
        a.self_assessment_status !== 'submitted' && new Date(a.due_date) > new Date()
      );
      
      return {
        personalStats: {
          pendingAssessments,
          completedAssessments,
          goalsProgress: Math.floor(Math.random() * 40) + 60, // Mock for now
          lastAssessmentDate: lastAssessment?.updated_at,
          nextDueDate: nextDue?.due_date
        },
        departmentInfo: {
          departmentName: employee.department || 'General',
          teamSize: (colleagues?.length || 0) + 1, // +1 for self
          avgSatisfaction: TeamHealthService.calculateTeamSatisfaction(employee.department),
          departmentGoalsProgress: Math.floor(Math.random() * 30) + 70
        },
        myTasks: this.generatePersonalTasks(assessments || []),
        recentActivity: this.generatePersonalActivity(employee.name),
        notifications: this.generatePersonalNotifications()
      };
      
    } catch (error: any) {
      console.error('❌ Error fetching employee dashboard:', error);
      throw new Error(`Failed to load employee dashboard: ${error?.message || 'Unknown error'}`);
    }
  }
  
  // Manager Dashboard - Team focus
  static async getManagerDashboard(userId: string): Promise<ManagerDashboardData> {
    try {
      console.log('📊 Fetching manager dashboard for user:', userId);
      
      // Get manager info
      const { data: manager, error: mgrError } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (mgrError) throw mgrError;
      
      // Get team members
      const { data: teamMembers, error: teamError } = await supabase
        .from('employees')
        .select(`
          *,
          assessments(
            id,
            self_assessment_status,
            manager_review_status,
            due_date,
            updated_at
          )
        `)
        .eq('manager_id', manager.id);
      
      if (teamError) console.warn('Team fetch error:', teamError);
      
      // Get all managers for peer comparison
      const { data: allManagers, error: managersError } = await supabase
        .from('employees')
        .select('id, name')
        .eq('role', 'manager');
      
      if (managersError) console.warn('Managers fetch error:', managersError);
      
      const teamSize = teamMembers?.length || 0;
      const pendingReviews = teamMembers?.reduce((acc, member) => 
        acc + (member.assessments?.filter((a: any) => 
          a.self_assessment_status === 'employee_complete' && a.manager_review_status === 'pending'
        ).length || 0), 0) || 0;
      
      const completedReviews = teamMembers?.reduce((acc, member) => 
        acc + (member.assessments?.filter((a: any) => 
          a.manager_review_status === 'completed'
        ).length || 0), 0) || 0;
      
      return {
        teamStats: {
          teamSize,
          pendingReviews,
          completedReviews,
          teamSatisfactionAvg: TeamHealthService.calculateRecentSatisfaction(),
          teamGoalsProgress: Math.floor(Math.random() * 25) + 70,
          overdueItems: Math.floor(Math.random() * 5) + 1
        },
        teamPerformance: this.generateTeamPerformance(teamMembers || []),
        peerComparison: {
          myTeamRank: Math.floor(Math.random() * (allManagers?.length || 3)) + 1,
          avgManagerCompletion: 78 + Math.floor(Math.random() * 15),
          myTeamCompletion: 82 + Math.floor(Math.random() * 10),
          topPerformingManager: 'Sarah Johnson' // Mock
        },
        pendingActions: this.generateManagerActions(teamMembers || []),
        departmentMetrics: {
          departmentName: manager.department || 'General',
          totalManagers: allManagers?.length || 3,
          departmentCompletion: 85 + Math.floor(Math.random() * 10),
          departmentSatisfaction: 4.3 + Math.random() * 0.5
        }
      };
      
    } catch (error: any) {
      console.error('❌ Error fetching manager dashboard:', error);
      throw new Error(`Failed to load manager dashboard: ${error?.message || 'Unknown error'}`);
    }
  }
  
  // Admin Dashboard - System-wide access
  static async getAdminDashboard(): Promise<AdminDashboardData> {
    try {
      console.log('📊 Fetching admin dashboard');
      
      // Get all employees with roles
      const { data: allEmployees, error: empError } = await supabase
        .from('employees')
        .select('*');
      
      if (empError) throw empError;
      
      // Get all assessments for system stats
      const { data: allAssessments, error: assessError } = await supabase
        .from('assessments')
        .select('*');
      
      if (assessError) console.warn('Assessments fetch error:', assessError);
      
      // Get all review cycles
      const { data: reviewCycles, error: cyclesError } = await supabase
        .from('review_cycles')
        .select('*');
      
      if (cyclesError) console.warn('Review cycles fetch error:', cyclesError);
      
      const totalEmployees = allEmployees?.length || 0;
      const totalManagers = allEmployees?.filter(e => e.role === 'manager').length || 0;
      const totalAdmins = allEmployees?.filter(e => e.role === 'admin').length || 0;
      
      const completedAssessments = allAssessments?.filter(a => 
        a.self_assessment_status === 'employee_complete'
      ).length || 0;
      
      const pendingReviews = allAssessments?.filter(a => 
        a.self_assessment_status === 'employee_complete' && a.manager_review_status === 'pending'
      ).length || 0;
      
      const activeReviewCycles = reviewCycles?.filter(c => c.status === 'active').length || 0;
      
      return {
        systemStats: {
          totalEmployees,
          totalManagers,
          totalAdmins,
          activeUsers: Math.floor(totalEmployees * 0.8) + Math.floor(Math.random() * 5),
          systemUptime: 99.8,
          avgResponseTime: 120 + Math.floor(Math.random() * 50)
        },
        organizationMetrics: {
          overallCompletion: Math.floor((completedAssessments / Math.max((allAssessments?.length || 1), 1)) * 100),
          overallSatisfaction: 4.2 + Math.random() * 0.6,
          totalAssessments: allAssessments?.length || 0,
          activeReviewCycles,
          pendingReviews,
          overdueItems: Math.floor(Math.random() * 10) + 2
        },
        departmentBreakdown: this.generateDepartmentBreakdown(allEmployees || []),
        systemAlerts: this.generateSystemAlerts(),
        performanceTrends: this.generatePerformanceTrends()
      };
      
    } catch (error: any) {
      console.error('❌ Error fetching admin dashboard:', error);
      throw new Error(`Failed to load admin dashboard: ${error?.message || 'Unknown error'}`);
    }
  }
  
  // Helper methods for generating mock data where needed
  private static generatePersonalTasks(assessments: any[]) {
    const tasks: Array<{
      id: string;
      title: string;
      type: 'assessment' | 'goal' | 'development_plan';
      dueDate: string;
      status: string;
      priority: 'low' | 'medium' | 'high';
    }> = [];
    
    // Only add truly active/pending assessments as tasks
    assessments.forEach(assessment => {
      // Only include assessments that are not started or in progress (truly actionable)
      if (assessment.self_assessment_status === 'not_started' || 
          assessment.self_assessment_status === 'in_progress') {
        
        // Check if assessment is still within active period (not overdue by more than 30 days)
        const dueDate = new Date(assessment.due_date);
        const now = new Date();
        const daysPastDue = (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Only include if not severely overdue (more than 30 days past due)
        if (daysPastDue <= 30) {
          tasks.push({
            id: assessment.id,
            title: `Complete ${assessment.cycle?.name || 'Assessment'}`,
            type: 'assessment' as const,
            dueDate: assessment.due_date,
            status: assessment.self_assessment_status,
            priority: dueDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'high' : 'medium'
          });
        }
      }
    });
    
    return tasks.slice(0, 3); // Limit to 3 most important active tasks
  }
  
  private static generatePersonalActivity(employeeName: string) {
    return [
      {
        id: '1',
        action: 'Completed self-assessment',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Q2 2024 performance review'
      },
      {
        id: '2', 
        action: 'Updated development goals',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Added 2 new skill development objectives'
      }
    ];
  }
  
  private static generatePersonalNotifications() {
    return [
      {
        id: '1',
        title: 'Assessment Reminder',
        message: 'Your Q2 review is due in 3 days',
        type: 'warning' as const,
        timestamp: new Date().toISOString()
      }
    ];
  }
  
  private static generateTeamPerformance(teamMembers: any[]) {
    return teamMembers.slice(0, 5).map(member => {
      const rand = Math.random();
      const status: 'on_track' | 'behind' | 'completed' = 
        rand > 0.7 ? 'behind' : rand > 0.3 ? 'on_track' : 'completed';
      
      return {
        employeeName: member.name,
        completionRate: Math.floor(Math.random() * 30) + 70,
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status
      };
    });
  }
  
  private static generateManagerActions(teamMembers: any[]) {
    const actions: Array<{
      id: string;
      employeeName: string;
      action: string;
      type: 'review' | 'approval' | 'feedback';
      dueDate: string;
      priority: 'low' | 'medium' | 'high';
    }> = [];
    teamMembers.forEach(member => {
      const pendingAssessments = member.assessments?.filter((a: any) => 
        a.self_assessment_status === 'employee_complete' && a.manager_review_status === 'pending'
      ) || [];
      
      pendingAssessments.forEach((assessment: any) => {
        actions.push({
          id: assessment.id,
          employeeName: member.name,
          action: 'Complete manager review',
          type: 'review' as const,
          dueDate: assessment.due_date,
          priority: 'high' as const
        });
      });
    });
    
    return actions.slice(0, 8); // Limit to most urgent actions
  }
  
  private static generateDepartmentBreakdown(employees: any[]) {
    const deptMap = new Map();
    
    employees.forEach(emp => {
      const dept = emp.department || 'General';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { employees: [], managers: [] });
      }
      
      if (emp.role === 'manager') {
        deptMap.get(dept).managers.push(emp);
      } else {
        deptMap.get(dept).employees.push(emp);
      }
    });
    
    return Array.from(deptMap.entries()).map(([name, data]) => ({
      name,
      employeeCount: data.employees.length,
      managerCount: data.managers.length,
      completionRate: Math.floor(Math.random() * 25) + 70,
      satisfactionScore: 4.0 + Math.random() * 1.0
    }));
  }
  
  private static generateSystemAlerts() {
    return [
      {
        id: '1',
        type: 'warning' as const,
        title: 'High System Load',
        message: 'Database queries are running slower than normal',
        timestamp: new Date().toISOString(),
        severity: 'medium' as const
      },
      {
        id: '2',
        type: 'info' as const,
        title: 'Scheduled Maintenance',
        message: 'System maintenance scheduled for this weekend',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        severity: 'low' as const
      }
    ];
  }
  
  private static generatePerformanceTrends() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((period, index) => ({
      period,
      completions: 15 + Math.floor(Math.random() * 10) + index * 2,
      satisfaction: 4.0 + Math.random() * 0.8,
      activeUsers: 8 + Math.floor(Math.random() * 5) + index
    }));
  }
}

export default RoleBasedAnalyticsService;