import { createClient } from 'npm:@supabase/supabase-js@2.43.0';

// FORCED REDEPLOY - August 13, 2025 - Version 2.2
// This ensures the function is completely rebuilt and redeployed

// UPDATED CORS - Force complete rebuild v2.2
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://lucerne-edge-app.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'X-Edge-Function-Version': '2.2-forced-redeploy'
};

Deno.serve(async (req: Request) => {
  const timestamp = new Date().toISOString();
  console.log(`🚀 EDGE FUNCTION ADMIN-OPERATIONS - VERSION 2.2 - FORCED DEPLOY - ${timestamp}`);
  
  // CORS preflight handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Health check endpoint - NO AUTH REQUIRED
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'healthy', 
      version: '2.2-FINAL',
      timestamp: timestamp,
      deployment_check: 'SUCCESS',
      message: 'Admin Operations Edge Function - DEPLOYMENT VERIFIED',
      env_check: {
        supabase_url_exists: !!Deno.env.get('SUPABASE_URL'),
        service_key_exists: !!(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('EDGE_SERVICE_ROLE_KEY'))
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Debug environment variables - try both possible names
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('EDGE_SERVICE_ROLE_KEY');
    
    console.log('🔍 Environment check - FORCED REDEPLOY V2.2:', {
      url_exists: !!supabaseUrl,
      url_length: supabaseUrl?.length || 0,
      service_key_exists: !!serviceKey,
      service_key_length: serviceKey?.length || 0,
      deployment_timestamp: timestamp,
      env_vars: Object.keys(Deno.env.toObject()).filter(k => k.includes('SUPABASE') || k.includes('EDGE'))
    });
    
    if (!supabaseUrl || !serviceKey) {
      throw new Error(`Missing environment variables: URL=${!!supabaseUrl}, SERVICE_KEY=${!!serviceKey}`);
    }
    
    // Create Supabase client with service role for elevated permissions
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse the request body - YOUR APP USES { action, data } format
    const body = await req.json();
    console.log('📦 Raw request body:', body);
    
    const { action, data } = body;

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔐 Auth token length:', token.length);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ Token validation failed:', userError);
      return new Response(JSON.stringify({ 
        error: 'Invalid token',
        debug: {
          token_length: token.length,
          error: userError?.message
        }
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Token validated for user:', user.email);

    // Verify user is admin in employees table for Lucerne tenant
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('role, is_active')
      .eq('email', user.email)
      .eq('tenant_id', 'lucerne')
      .single();

    if (empError || !employee || employee.role !== 'admin' || !employee.is_active) {
      return new Response(JSON.stringify({ 
        error: 'Admin access required',
        debug: {
          user_email: user.email,
          employee_found: !!employee,
          employee_role: employee?.role,
          employee_active: employee?.is_active,
          emp_error: empError?.message
        }
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Admin operations router - MATCHING YOUR APP'S EXPECTED ACTIONS
    let result;
    switch (action) {
      case 'create_user': {
        console.log('🔨 Starting user creation process...');
        
        // Create new user account - WITH DETAILED LOGGING
        console.log('📧 Creating auth user for:', data.email);
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: data.email,
          password: data.temp_password || 'TempPass123!',
          email_confirm: true,
          user_metadata: {
            name: data.name,
            source: 'admin-create'
          }
        });

        console.log('🎯 Auth user creation result:');
        console.log('  - Success:', !!newUser);
        console.log('  - Error:', createError?.message);
        console.log('  - User ID:', newUser?.user?.id);

        if (createError) {
          console.log('💥 Auth user creation FAILED:', createError);
          console.log('💥 Auth error details:', {
            message: createError.message,
            status: createError.status,
            details: createError
          });
          
          // Check if user already exists
          if (createError.message?.includes('already registered') || createError.status === 422) {
            console.log('👤 User already exists, trying to fetch existing user...');
            const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(data.email);
            
            if (getUserError || !existingUser?.user) {
              return new Response(JSON.stringify({
                error: 'user_exists_but_not_retrievable',
                auth_error: createError.message
              }), {
                status: 409,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
            
            console.log('✅ Found existing user:', existingUser.user.id);
            // Continue with existing user
            newUser = { user: existingUser.user };
          } else {
            // Different auth error
            return new Response(JSON.stringify({
              error: 'auth_create_failed',
              auth_error: {
                message: createError.message,
                status: createError.status
              }
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }

        if (!newUser?.user) {
          console.log('💥 No user returned from auth creation');
          throw new Error('No user returned from auth.admin.createUser');
        }

        console.log('✅ Auth user created successfully:', newUser.user.id);

        // Create corresponding employee record
        console.log('🏢 Creating employee record...');
        
        // Handle name splitting more safely
        const nameParts = (data.name || '').trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        console.log('👤 Name parsing:', { firstName, lastName, originalName: data.name });
        
        // Handle department - check if it's a string name that needs to be converted to ID
        let departmentId = null;
        if (data.department) {
          // First try to find department by name
          const { data: dept } = await supabase
            .from('departments')
            .select('id')
            .eq('name', data.department)
            .eq('tenant_id', 'lucerne')
            .single();
          
          if (dept) {
            departmentId = dept.id;
            console.log('📁 Found department ID:', departmentId, 'for name:', data.department);
          } else {
            console.log('⚠️ Department not found, using null:', data.department);
          }
        }

        const { data: newEmployee, error: empError } = await supabase
          .from('employees')
          .insert({
            user_id: newUser.user.id,
            email: data.email,
            // DON'T include 'name' field - it's generated from first_name + last_name
            first_name: firstName,
            last_name: lastName,
            role: data.role || 'employee',
            job_title: data.job_title || 'Staff',
            department_id: departmentId, // Use department_id instead of department
            manager_id: data.manager_id || null,
            is_active: true,
            tenant_id: 'lucerne'
          })
          .select()
          .single();

        console.log('🎯 Employee creation result:');
        console.log('  - Success:', !!newEmployee);
        console.log('  - Error:', empError?.message);

        if (empError) {
          console.log('💥 Employee creation FAILED, cleaning up auth user...');
          console.log('💥 Exact error details:', {
            message: empError.message,
            code: empError.code,
            details: empError.details,
            hint: empError.hint
          });
          
          // Cleanup user if employee creation fails
          await supabase.auth.admin.deleteUser(newUser.user.id);
          console.log('🗑️ Auth user cleaned up');
          
          // Return structured error instead of throwing
          return new Response(JSON.stringify({
            error: 'employee_insert_failed',
            postgres_error: {
              message: empError.message,
              code: empError.code,
              details: empError.details,
              hint: empError.hint
            }
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        console.log('✅ Employee record created successfully:', newEmployee.id);

        result = { 
          success: true, 
          user: newUser.user, 
          employee: newEmployee,
          debug: {
            auth_user_id: newUser.user.id,
            employee_id: newEmployee.id
          }
        };
        break;
      }

      case 'update_employee': {
        const { data: updatedEmployee, error: updateError } = await supabase
          .from('employees')
          .update(data.updates)
          .eq('id', data.employee_id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = { success: true, employee: updatedEmployee };
        break;
      }

      case 'delete_employee': {
        // Soft delete - mark as inactive
        const { error: deleteError } = await supabase
          .from('employees')
          .update({ is_active: false })
          .eq('id', data.employee_id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Admin operation error:', error);
    console.error('💥 Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      debug: {
        error_name: error.name,
        error_stack: error.stack?.substring(0, 500), // First 500 chars
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});