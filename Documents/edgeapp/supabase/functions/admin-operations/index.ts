// Secure Admin Operations Edge Function - PRODUCTION VERSION
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('EDGE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables')
    }

    // Create admin client with service role key (secure on server-side only)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Verify the request is from an authenticated admin user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create regular client to verify user authentication
    const supabaseUser = createClient(supabaseUrl, anonKey || '')

    // Extract and verify JWT token
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    // Verify user has admin role in employees table
    const { data: employee, error: empError } = await supabaseAdmin
      .from('employees')
      .select('role, is_active')
      .eq('email', user.email)
      .single()

    if (empError || !employee || employee.role !== 'admin' || !employee.is_active) {
      throw new Error('Admin access required')
    }

    // Parse request body
    const { action, data } = await req.json()

    // Handle different admin operations
    let result;
    switch (action) {
      case 'create_user':
        // Create new user account in Supabase Auth
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: data.email,
          password: data.temp_password || 'TempPass123!',
          email_confirm: true,
          user_metadata: {
            name: data.name
          }
        })

        if (createError) throw createError

        // Create corresponding employee record
        const { data: newEmployee, error: empError } = await supabaseAdmin
          .from('employees')
          .insert({
            user_id: newUser.user.id,
            email: data.email,
            name: data.name,
            role: data.role || 'employee',
            job_title: data.job_title,
            manager_id: data.manager_id,
            department: data.department,
            is_active: true
          })
          .select()
          .single()

        if (empError) {
          // Cleanup user if employee creation fails
          await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
          throw empError
        }

        result = { success: true, user: newUser.user, employee: newEmployee }
        break

      case 'update_employee':
        const { data: updatedEmployee, error: updateError } = await supabaseAdmin
          .from('employees')
          .update(data.updates)
          .eq('id', data.employee_id)
          .select()
          .single()

        if (updateError) throw updateError
        result = { success: true, employee: updatedEmployee }
        break

      case 'delete_employee':
        // Soft delete - mark as inactive instead of hard delete
        const { error: deleteError } = await supabaseAdmin
          .from('employees')
          .update({ is_active: false })
          .eq('id', data.employee_id)

        if (deleteError) throw deleteError
        result = { success: true }
        break

      case 'reset_password':
        const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: data.email
        })

        if (resetError) throw resetError
        result = { success: true, reset_link: resetData.properties?.action_link }
        break

      case 'cleanup_test_users':
        // Cleanup test users while preserving admin@lucerne.com
        const testUsersToCleanup = data.test_emails || [
          'employee1@lucerne.com',
          'manager1@lucerne.com'
        ]
        
        // Safety check - never allow admin deletion
        const safeEmails = testUsersToCleanup.filter(email => email !== 'admin@lucerne.com')
        
        if (safeEmails.length === 0) {
          result = { success: true, message: 'No test users to cleanup', cleaned: [] }
          break
        }

        const cleanupResults = []
        
        for (const email of safeEmails) {
          try {
            // Get employee record
            const { data: empToDelete, error: empFindError } = await supabaseAdmin
              .from('employees')
              .select('id, user_id, name, email, role')
              .eq('email', email)
              .single()

            if (empFindError || !empToDelete) {
              cleanupResults.push({ email, status: 'not_found', message: 'Employee record not found' })
              continue
            }

            // Clean up related data first (foreign key constraints)
            
            // Clean notifications
            await supabaseAdmin
              .from('notifications')
              .delete()
              .eq('recipient_id', empToDelete.id)

            // Clean development plans
            await supabaseAdmin
              .from('development_plans')
              .delete()
              .eq('employee_id', empToDelete.id)

            // Clean assessments
            await supabaseAdmin
              .from('assessments')
              .delete()
              .eq('employee_id', empToDelete.id)

            // Clean pulse responses
            await supabaseAdmin
              .from('team_health_pulse_responses')
              .delete()
              .eq('employee_id', empToDelete.id)

            // Clean kudos (both given and received)
            await supabaseAdmin
              .from('kudos')
              .delete()
              .eq('given_by', empToDelete.id)

            await supabaseAdmin
              .from('kudos')
              .delete()
              .eq('employee_id', empToDelete.id)

            // Clean feedback (both given and received)
            await supabaseAdmin
              .from('feedback')
              .delete()
              .eq('giver_id', empToDelete.id)

            await supabaseAdmin
              .from('feedback')
              .delete()
              .eq('receiver_id', empToDelete.id)

            // Delete employee record
            const { error: empDeleteError } = await supabaseAdmin
              .from('employees')
              .delete()
              .eq('id', empToDelete.id)

            if (empDeleteError) throw empDeleteError

            // Delete auth user if user_id exists
            if (empToDelete.user_id) {
              const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
                empToDelete.user_id
              )
              
              if (authDeleteError) {
                console.warn(`Warning: Could not delete auth user for ${email}:`, authDeleteError)
              }
            }

            cleanupResults.push({
              email,
              status: 'success',
              message: `Cleaned up ${empToDelete.name} (${empToDelete.role})`,
              employee_id: empToDelete.id,
              user_id: empToDelete.user_id
            })

          } catch (cleanupError) {
            console.error(`Error cleaning up ${email}:`, cleanupError)
            cleanupResults.push({
              email,
              status: 'error',
              message: cleanupError.message || 'Unknown error during cleanup'
            })
          }
        }

        // Final verification - ensure admin still exists
        const { data: adminCheck, error: adminCheckError } = await supabaseAdmin
          .from('employees')
          .select('id, email, role, is_active')
          .eq('email', 'admin@lucerne.com')
          .single()

        if (adminCheckError || !adminCheck || !adminCheck.is_active) {
          throw new Error('CRITICAL: Admin user verification failed after cleanup')
        }

        result = {
          success: true,
          message: `Cleanup completed. Processed ${safeEmails.length} users.`,
          admin_preserved: true,
          admin_email: adminCheck.email,
          cleanup_results: cleanupResults,
          summary: {
            total_processed: safeEmails.length,
            successful: cleanupResults.filter(r => r.status === 'success').length,
            failed: cleanupResults.filter(r => r.status === 'error').length,
            not_found: cleanupResults.filter(r => r.status === 'not_found').length
          }
        }
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Admin operation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})