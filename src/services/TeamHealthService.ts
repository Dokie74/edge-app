// src/services/TeamHealthService.ts - Team health monitoring service
import { supabase } from './supabaseClient';

export interface PulseResponse {
  questionId: string;
  question: string;
  response: any;
  timestamp: string;
  userId: string;
  category: 'satisfaction' | 'workload' | 'support' | 'engagement';
  isNegative?: boolean;
  department?: string;
  managerId?: string;
}

export interface TeamHealthAlert {
  id: string;
  userId: string;
  userName: string;
  managerId?: string;
  department?: string;
  questionId: string;
  question: string;
  response: any;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  acknowledged: boolean;
}

export class TeamHealthService {
  
  // Get all pulse responses from localStorage (could be enhanced to use database)
  static getAllResponses(): PulseResponse[] {
    try {
      const responses = localStorage.getItem('pulse_responses');
      return responses ? JSON.parse(responses) : [];
    } catch (error) {
      console.error('Error getting pulse responses:', error);
      return [];
    }
  }

  // Get responses for a specific user
  static getUserResponses(userId: string): PulseResponse[] {
    return this.getAllResponses().filter(response => response.userId === userId);
  }

  // Get responses for a specific date range
  static getResponsesInDateRange(startDate: Date, endDate: Date): PulseResponse[] {
    return this.getAllResponses().filter(response => {
      const responseDate = new Date(response.timestamp);
      return responseDate >= startDate && responseDate <= endDate;
    });
  }

  // Save a pulse response with department information
  static async savePulseResponse(
    response: PulseResponse, 
    userName: string, 
    managerId?: string, 
    department?: string
  ): Promise<void> {
    try {
      // Get employee info for database relationship
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', response.userId)
        .single();

      // Save to Supabase database
      const { error: insertError } = await supabase
        .from('team_health_pulse_responses')
        .insert({
          user_id: response.userId,
          employee_id: employee?.id,
          question_id: response.questionId,
          question: response.question,
          response: response.response,
          category: response.category,
          department: department,
          manager_id: managerId,
          timestamp: response.timestamp
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        // Fallback to localStorage if database fails
        const enhancedResponse = {
          ...response,
          userName,
          managerId,
          department
        };
        const existingResponses = this.getAllResponses();
        existingResponses.push(enhancedResponse);
        localStorage.setItem('pulse_responses', JSON.stringify(existingResponses));
      }

      // Also keep localStorage backup for immediate access
      const enhancedResponse = {
        ...response,
        userName,
        managerId,
        department
      };
      const existingResponses = this.getAllResponses();
      existingResponses.push(enhancedResponse);
      localStorage.setItem('pulse_responses', JSON.stringify(existingResponses));
      
    } catch (error) {
      console.error('Error saving pulse response:', error);
      throw error;
    }
  }

  // Get team health alerts
  static getTeamHealthAlerts(): TeamHealthAlert[] {
    try {
      const alerts = localStorage.getItem('team_health_alerts');
      return alerts ? JSON.parse(alerts) : [];
    } catch (error) {
      console.error('Error getting team health alerts:', error);
      return [];
    }
  }

  // Check if a response should generate an alert for managers
  private static checkForAlert(
    response: any, 
    userName: string, 
    managerId?: string, 
    department?: string
  ): void {
    // Generate alerts for low satisfaction scores (1-2 on 1-5 scale)
    if (response.category === 'satisfaction' && 
        typeof response.response === 'number' && 
        response.response <= 2) {
      
      const alert: TeamHealthAlert = {
        id: `alert_${Date.now()}_${response.userId}`,
        userId: response.userId,
        userName,
        managerId,
        department,
        questionId: response.questionId,
        question: response.question,
        response: response.response,
        severity: response.response === 1 ? 'high' : 'medium',
        timestamp: response.timestamp,
        acknowledged: false
      };

      // Save alert to localStorage (in production, this would go to database)
      const existingAlerts = this.getTeamHealthAlerts();
      existingAlerts.push(alert);
      localStorage.setItem('team_health_alerts', JSON.stringify(existingAlerts));
    }
  }

  // Calculate team satisfaction average
  static calculateTeamSatisfaction(departmentName?: string): number {
    const responses = this.getAllResponses();
    
    // Filter for satisfaction-related questions
    const satisfactionResponses = responses.filter(response => 
      response.category === 'satisfaction' && 
      typeof response.response === 'number' &&
      response.response >= 1 && response.response <= 5
    );

    if (satisfactionResponses.length === 0) {
      return 0; // No data available
    }

    const average = satisfactionResponses.reduce((sum, response) => 
      sum + response.response, 0) / satisfactionResponses.length;
    
    return Math.round(average * 10) / 10; // Round to 1 decimal place
  }

  // Calculate satisfaction for recent period (last 7 days)
  static calculateRecentSatisfaction(): number {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentResponses = this.getResponsesInDateRange(sevenDaysAgo, new Date())
      .filter(response => 
        response.category === 'satisfaction' && 
        typeof response.response === 'number'
      );

    if (recentResponses.length === 0) {
      return this.calculateTeamSatisfaction();
    }

    const average = recentResponses.reduce((sum, response) => 
      sum + response.response, 0) / recentResponses.length;
    
    return Math.round(average * 10) / 10;
  }

  // Calculate department satisfaction score 
  static async calculateDepartmentSatisfaction(department: string): Promise<number> {
    try {
      console.log('🔍 TeamHealthService: Fetching satisfaction for department:', department);
      
      // Method 1: Try RPC function first
      try {
        const { data: rpcResults, error: rpcError } = await supabase
          .rpc('get_department_satisfaction', { 
            dept_name: department,
            days_back: 30 
          });

        if (!rpcError && rpcResults && rpcResults.length > 0 && rpcResults[0].avg_satisfaction) {
          const satisfaction = parseFloat(rpcResults[0].avg_satisfaction);
          console.log('✅ Got department satisfaction from RPC:', satisfaction);
          return satisfaction;
        }
      } catch (rpcError) {
        console.warn('⚠️ RPC function not available for department, trying direct query:', rpcError);
      }

      // Method 2: Direct table query as fallback
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: directResults, error: directError } = await supabase
          .from('team_health_pulse_responses')
          .select('response')
          .eq('category', 'satisfaction')
          .eq('department', department)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .not('response', 'is', null);

        if (!directError && directResults && directResults.length > 0) {
          console.log('📊 Found', directResults.length, 'satisfaction responses for department:', department);
          
          const numericResponses = directResults
            .map(r => {
              if (typeof r.response === 'number') return r.response;
              if (typeof r.response === 'string' && !isNaN(parseFloat(r.response))) {
                return parseFloat(r.response);
              }
              return null;
            })
            .filter((r): r is number => r !== null && r >= 1 && r <= 5);

          if (numericResponses.length > 0) {
            const average = numericResponses.reduce((sum, val) => sum + val, 0) / numericResponses.length;
            const satisfaction = Math.round(average * 10) / 10;
            console.log('✅ Calculated department satisfaction from direct query:', satisfaction);
            return satisfaction;
          }
        }
      } catch (directError) {
        console.warn('⚠️ Direct query failed for department:', directError);
      }

      // Method 3: Fallback to localStorage
      const responses = this.getAllResponses();
      
      // Filter for satisfaction responses from this department
      const deptResponses = responses.filter(response => 
        response.category === 'satisfaction' && 
        typeof response.response === 'number' &&
        response.response >= 1 && response.response <= 5 &&
        (response as any).department === department
      );

      if (deptResponses.length > 0) {
        const average = deptResponses.reduce((sum, response) => 
          sum + response.response, 0) / deptResponses.length;
        const satisfaction = Math.round(average * 10) / 10;
        console.log('✅ Got department satisfaction from localStorage:', satisfaction);
        return satisfaction;
      }

      // Method 4: Final fallback to overall company satisfaction
      console.log('🔄 No department-specific data found, falling back to company average');
      return await this.calculateCompanySatisfaction();
      
    } catch (error) {
      console.error('❌ Error calculating department satisfaction:', error);
      return 0;
    }
  }

  // Calculate company-wide satisfaction score
  static async calculateCompanySatisfaction(): Promise<number> {
    try {
      console.log('🔍 TeamHealthService: Fetching company satisfaction...');
      
      // Method 1: Try RPC function first
      try {
        const { data: rpcResults, error: rpcError } = await supabase
          .rpc('get_company_satisfaction', { days_back: 30 });

        if (!rpcError && rpcResults && rpcResults.length > 0 && rpcResults[0].avg_satisfaction) {
          const satisfaction = parseFloat(rpcResults[0].avg_satisfaction);
          console.log('✅ Got satisfaction from RPC:', satisfaction);
          return satisfaction;
        }
      } catch (rpcError) {
        console.warn('⚠️ RPC function not available, trying direct query:', rpcError);
      }

      // Method 2: Direct table query as fallback
      try {
        console.log('🔄 Trying direct database query...');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: directResults, error: directError } = await supabase
          .from('team_health_pulse_responses')
          .select('response')
          .eq('category', 'satisfaction')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .not('response', 'is', null);

        if (!directError && directResults && directResults.length > 0) {
          console.log('📊 Found', directResults.length, 'satisfaction responses in database');
          
          // Calculate average from numeric responses
          const numericResponses = directResults
            .map(r => {
              // Handle both numeric and string responses
              if (typeof r.response === 'number') return r.response;
              if (typeof r.response === 'string' && !isNaN(parseFloat(r.response))) {
                return parseFloat(r.response);
              }
              return null;
            })
            .filter((r): r is number => r !== null && r >= 1 && r <= 5);

          if (numericResponses.length > 0) {
            const average = numericResponses.reduce((sum, val) => sum + val, 0) / numericResponses.length;
            const satisfaction = Math.round(average * 10) / 10;
            console.log('✅ Calculated satisfaction from direct query:', satisfaction);
            return satisfaction;
          }
        } else {
          console.log('📊 No satisfaction responses found in database');
        }
      } catch (directError) {
        console.warn('⚠️ Direct query failed:', directError);
      }

      // Method 3: Fallback to localStorage  
      console.log('🔄 Falling back to localStorage...');
      const responses = this.getAllResponses();
      
      const satisfactionResponses = responses.filter(response => 
        response.category === 'satisfaction' && 
        typeof response.response === 'number' &&
        response.response >= 1 && response.response <= 5
      );

      if (satisfactionResponses.length > 0) {
        const average = satisfactionResponses.reduce((sum, response) => 
          sum + response.response, 0) / satisfactionResponses.length;
        const satisfaction = Math.round(average * 10) / 10;
        console.log('✅ Got satisfaction from localStorage:', satisfaction);
        return satisfaction;
      }

      console.log('❌ No satisfaction data found anywhere, returning 0');
      return 0;
      
    } catch (error) {
      console.error('❌ Error calculating company satisfaction:', error);
      return 0;
    }
  }

  // Get health insights for dashboard
  static getHealthInsights() {
    const responses = this.getAllResponses();
    const recent = this.getResponsesInDateRange(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
      new Date()
    );

    return {
      totalResponses: responses.length,
      recentResponses: recent.length,
      averageSatisfaction: this.calculateRecentSatisfaction(),
      responseRate: recent.length > 0 ? (recent.length / 7) : 0, // responses per day
      categories: {
        satisfaction: recent.filter(r => r.category === 'satisfaction').length,
        workload: recent.filter(r => r.category === 'workload').length,
        support: recent.filter(r => r.category === 'support').length,
        engagement: recent.filter(r => r.category === 'engagement').length
      }
    };
  }

  // Get team health trends (for manager/admin dashboards)
  static getHealthTrends(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const responses = this.getResponsesInDateRange(startDate, endDate);
    
    // Group by day
    const dailyData: { [key: string]: any } = {};
    
    responses.forEach(response => {
      const day = new Date(response.timestamp).toDateString();
      if (!dailyData[day]) {
        dailyData[day] = {
          satisfaction: [],
          workload: [],
          support: [],
          engagement: []
        };
      }
      
      if (response.category && typeof response.response === 'number') {
        dailyData[day][response.category].push(response.response);
      }
    });

    // Calculate daily averages
    const trends = Object.entries(dailyData).map(([date, data]) => ({
      date,
      satisfaction: data.satisfaction.length > 0 
        ? data.satisfaction.reduce((a: number, b: number) => a + b, 0) / data.satisfaction.length 
        : null,
      workload: data.workload.length > 0 
        ? data.workload.reduce((a: number, b: number) => a + b, 0) / data.workload.length 
        : null,
      support: data.support.length > 0 
        ? data.support.reduce((a: number, b: number) => a + b, 0) / data.support.length 
        : null,
      engagement: data.engagement.length > 0 
        ? data.engagement.reduce((a: number, b: number) => a + b, 0) / data.engagement.length 
        : null,
      responseCount: responses.filter(r => new Date(r.timestamp).toDateString() === date).length
    }));

    return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Check if a response is negative based on question type and response
  static isNegativeResponse(questionId: string, response: any): boolean {
    // Questions where 'false' is negative
    const booleanNegativeQuestions = [
      'workload_manageable', 
      'workplace_safety', 
      'tools_resources', 
      'growth_opportunities'
    ];
    
    // Questions where 'true' would be negative (currently none, but framework for future)
    const booleanPositiveQuestions: string[] = [];
    
    // Choice questions where certain answers are negative
    const choiceNegativeAnswers = ['Needs Improvement', 'Poor'];
    
    if (booleanNegativeQuestions.includes(questionId)) {
      return response === false;
    }
    
    if (booleanPositiveQuestions.includes(questionId)) {
      return response === true;
    }
    
    // For scale questions (1-5), consider 1-3 as negative
    if (typeof response === 'number' && response >= 1 && response <= 5) {
      return response < 4;
    }
    
    // For choice questions
    if (typeof response === 'string') {
      return choiceNegativeAnswers.includes(response);
    }
    
    return false;
  }

  // Get severity level for negative response
  static getResponseSeverity(questionId: string, response: any): 'low' | 'medium' | 'high' {
    // High severity questions (safety, critical support)
    const highSeverityQuestions = ['workplace_safety', 'workload_manageable'];
    
    // Medium severity questions (support, communication)
    const mediumSeverityQuestions = ['tools_resources', 'communication_clear', 'team_support'];
    
    if (highSeverityQuestions.includes(questionId)) {
      return 'high';
    }
    
    if (mediumSeverityQuestions.includes(questionId)) {
      return 'medium';
    }
    
    // For scale responses, severity based on how low the score is
    if (typeof response === 'number') {
      if (response <= 2) return 'high';
      if (response === 3) return 'medium';
      return 'low';
    }
    
    // For choice responses
    if (response === 'Poor') return 'high';
    if (response === 'Needs Improvement') return 'medium';
    
    return 'low';
  }

  // Create alert for negative response
  static async createAlert(response: PulseResponse, userName: string, managerId?: string, department?: string): Promise<void> {
    const alert: TeamHealthAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: response.userId,
      userName,
      managerId,
      department,
      questionId: response.questionId,
      question: response.question,
      response: response.response,
      severity: this.getResponseSeverity(response.questionId, response.response),
      timestamp: response.timestamp,
      acknowledged: false
    };

    try {
      const existingAlerts = this.getAllAlerts();
      existingAlerts.push(alert);
      localStorage.setItem('team_health_alerts', JSON.stringify(existingAlerts));
    } catch (error) {
      console.error('Error creating team health alert:', error);
    }
  }

  // Get all alerts
  static getAllAlerts(): TeamHealthAlert[] {
    try {
      const alerts = localStorage.getItem('team_health_alerts');
      return alerts ? JSON.parse(alerts) : [];
    } catch (error) {
      console.error('Error getting alerts:', error);
      return [];
    }
  }

  // Get alerts for a specific manager
  static getManagerAlerts(managerId: string): TeamHealthAlert[] {
    return this.getAllAlerts().filter(alert => 
      alert.managerId === managerId && !alert.acknowledged
    );
  }

  // Get all unacknowledged alerts (for admin)
  static getAdminAlerts(): TeamHealthAlert[] {
    return this.getAllAlerts().filter(alert => !alert.acknowledged);
  }

  // Acknowledge an alert
  static acknowledgeAlert(alertId: string): void {
    try {
      const alerts = this.getAllAlerts();
      const alertIndex = alerts.findIndex(alert => alert.id === alertId);
      if (alertIndex !== -1) {
        alerts[alertIndex].acknowledged = true;
        localStorage.setItem('team_health_alerts', JSON.stringify(alerts));
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  }

}