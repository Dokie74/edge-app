// Database Diagnostics Utility
// Use this to test and debug database connectivity and schema issues

import { supabase } from '../services/supabaseClient';

export interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  data?: any;
  error?: any;
}

export class DatabaseDiagnostics {
  static async runAllTests(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];
    
    console.log('🧪 Starting database diagnostics...');
    
    // Test 1: Basic connection
    results.push(await this.testConnection());
    
    // Test 2: User authentication
    results.push(await this.testUserAuth());
    
    // Test 3: Employee table access
    results.push(await this.testEmployeeAccess());
    
    // Test 4: Check if RPC function exists
    results.push(await this.testRPCFunctionExists());
    
    // Test 5: Test team_health_pulse_responses table
    results.push(await this.testPulseResponsesTable());
    
    // Test 6: Test pulse_questions table
    results.push(await this.testPulseQuestionsTable());
    
    // Test 7: Try calling the RPC function
    results.push(await this.testRPCFunctionCall());
    
    // Test 8: Check table relationships
    results.push(await this.testTableJoin());
    
    // Print summary
    this.printSummary(results);
    
    return results;
  }
  
  private static async testConnection(): Promise<DiagnosticResult> {
    try {
      const { data, error } = await supabase.from('employees').select('count').limit(1);
      if (error) throw error;
      
      return {
        test: 'Database Connection',
        status: 'pass',
        message: 'Successfully connected to Supabase'
      };
    } catch (error: any) {
      return {
        test: 'Database Connection',
        status: 'fail',
        message: 'Failed to connect to database',
        error: error.message
      };
    }
  }
  
  private static async testUserAuth(): Promise<DiagnosticResult> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error('No authenticated user');
      
      return {
        test: 'User Authentication',
        status: 'pass',
        message: `Authenticated as: ${user.email}`,
        data: { userId: user.id, email: user.email }
      };
    } catch (error: any) {
      return {
        test: 'User Authentication',
        status: 'fail',
        message: 'User not authenticated',
        error: error.message
      };
    }
  }
  
  private static async testEmployeeAccess(): Promise<DiagnosticResult> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, user_id, role, name, email')
        .limit(5);
      
      if (error) throw error;
      
      return {
        test: 'Employee Table Access',
        status: 'pass',
        message: `Found ${data?.length || 0} employee records`,
        data: data
      };
    } catch (error: any) {
      return {
        test: 'Employee Table Access',
        status: 'fail',
        message: 'Cannot access employees table',
        error: error.message
      };
    }
  }
  
  private static async testRPCFunctionExists(): Promise<DiagnosticResult> {
    try {
      // Query pg_proc to check if function exists
      const { data, error } = await supabase
        .rpc('get_team_health_analytics')
        .limit(0); // Don't actually get data, just test if function exists
      
      // If we get here without error, function exists but might have other issues
      return {
        test: 'RPC Function Existence',
        status: 'warning',
        message: 'Function exists but returned error (check permissions/schema)',
        error: error?.message
      };
    } catch (error: any) {
      if (error.message?.includes('function') && error.message?.includes('does not exist')) {
        return {
          test: 'RPC Function Existence',
          status: 'fail',
          message: 'RPC function get_team_health_analytics does not exist',
          error: error.message
        };
      }
      
      return {
        test: 'RPC Function Existence',
        status: 'warning',
        message: 'Function might exist but has issues',
        error: error.message
      };
    }
  }
  
  private static async testPulseResponsesTable(): Promise<DiagnosticResult> {
    try {
      const { data, error } = await supabase
        .from('team_health_pulse_responses')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      return {
        test: 'Pulse Responses Table',
        status: 'pass',
        message: `Table exists, ${data?.length || 0} sample records`,
        data: data?.[0] // Show structure of first record
      };
    } catch (error: any) {
      return {
        test: 'Pulse Responses Table',
        status: 'fail',
        message: 'Cannot access team_health_pulse_responses table',
        error: error.message
      };
    }
  }
  
  private static async testPulseQuestionsTable(): Promise<DiagnosticResult> {
    try {
      const { data, error } = await supabase
        .from('pulse_questions')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      return {
        test: 'Pulse Questions Table',
        status: 'pass',
        message: `Table exists, ${data?.length || 0} sample records`,
        data: data?.[0] // Show structure of first record
      };
    } catch (error: any) {
      return {
        test: 'Pulse Questions Table',
        status: 'fail',
        message: 'Cannot access pulse_questions table',
        error: error.message
      };
    }
  }
  
  private static async testRPCFunctionCall(): Promise<DiagnosticResult> {
    try {
      const { data, error } = await supabase
        .rpc('get_team_health_analytics');
      
      if (error) {
        return {
          test: 'RPC Function Call',
          status: 'fail',
          message: 'RPC function call failed',
          error: error.message
        };
      }
      
      return {
        test: 'RPC Function Call',
        status: 'pass',
        message: `RPC function successful, returned ${data?.length || 0} records`,
        data: data?.slice(0, 2) // Show first 2 records
      };
    } catch (error: any) {
      return {
        test: 'RPC Function Call',
        status: 'fail',
        message: 'RPC function call threw exception',
        error: error.message
      };
    }
  }
  
  private static async testTableJoin(): Promise<DiagnosticResult> {
    try {
      // Test the join that's used in our RPC function
      const { data, error } = await supabase
        .from('team_health_pulse_responses')
        .select(`
          response_value,
          pulse_questions:question_id(category)
        `)
        .limit(1);
      
      if (error) throw error;
      
      return {
        test: 'Table Join Test',
        status: 'pass',
        message: 'Join between pulse responses and questions works',
        data: data?.[0]
      };
    } catch (error: any) {
      return {
        test: 'Table Join Test',
        status: 'fail',
        message: 'Cannot join pulse_responses with pulse_questions',
        error: error.message
      };
    }
  }
  
  private static printSummary(results: DiagnosticResult[]): void {
    console.log('\n🧪 DIAGNOSTIC SUMMARY:');
    console.log('='.repeat(50));
    
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log('='.repeat(50));
    
    results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      console.log(`${icon} ${result.test}: ${result.message}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.data) {
        console.log(`   Data:`, result.data);
      }
    });
  }
}

// Helper function to run diagnostics from console
export const runDiagnostics = () => DatabaseDiagnostics.runAllTests();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).runDiagnostics = runDiagnostics;
  (window as any).DatabaseDiagnostics = DatabaseDiagnostics;
}