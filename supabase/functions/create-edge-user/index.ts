// Create Edge User Function - matches EDGEMASTER functionality
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const requestId = crypto.randomUUID()
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log(JSON.stringify({ level: 'info', requestId, event: 'create-edge-user:start' }))
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('EDGE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      throw new Error('Missing required environment variables')
    }

    // Create admin client for user creation
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const supabaseUser = createClient(supabaseUrl, anonKey)

    // Verify the request is from an authenticated admin user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Extract and verify JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    // Verify user has admin role
    const { data: employee, error: empError } = await supabaseAdmin
      .from('employees')
      .select('role, is_active')
      .eq('user_id', user.id)
      .single()

    if (empError || !employee || !['admin', 'super_admin'].includes(employee.role) || !employee.is_active) {
      throw new Error('Admin access required')
    }

    // Parse request body
    const { 
      name, 
      email, 
      job_title, 
      role = 'employee', 
      manager_id, 
      department,
      temp_password,
      send_email_invite = true
    } = await req.json()

    if (!name || !email) {
      throw new Error('Name and email are required')
    }

    // Generate temp password if not provided
    const password = temp_password || generateTempPassword()

    // Create new user account in Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: !send_email_invite, // Auto-confirm if not sending invite
      user_metadata: {
        name: name,
        role: role
      }
    })

    if (createError) {
      console.error('Auth user creation failed:', createError)
      throw new Error(`Failed to create auth user: ${createError.message}`)
    }

    // Create corresponding employee record
    const { data: newEmployee, error: empError2 } = await supabaseAdmin
      .from('employees')
      .insert({
        user_id: newUser.user.id,
        email: email,
        name: name,
        role: role,
        job_title: job_title,
        manager_id: manager_id,
        department: department,
        temp_password: password,
        password_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        is_active: true
      })
      .select()
      .single()

    if (empError2) {
      console.error('Employee record creation failed:', empError2)
      // Cleanup auth user if employee creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      throw new Error(`Failed to create employee record: ${empError2.message}`)
    }

    // Send invitation email if requested
    let inviteResult = null
    if (send_email_invite) {
      try {
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          email,
          {
            data: {
              name: name,
              role: role,
              temp_password: password
            }
          }
        )
        
        if (inviteError) {
          console.warn('Failed to send invite email:', inviteError)
          inviteResult = { error: inviteError.message }
        } else {
          inviteResult = { success: true, invite_sent: true }
        }
      } catch (inviteErr) {
        console.warn('Invite email exception:', inviteErr)
        inviteResult = { error: 'Failed to send invite email' }
      }
    }

    // Create notification for the new user
    try {
      await supabaseAdmin
        .from('notifications')
        .insert({
          recipient_id: newEmployee.id,
          sender_id: employee.id, // Admin who created the user
          type: 'welcome',
          title: 'Welcome to the Team!',
          message: `Your account has been created. ${send_email_invite ? 'Please check your email for login instructions.' : 'Your temporary password is: ' + password}`,
          data: {
            temp_password: send_email_invite ? null : password,
            first_login: true
          }
        })
    } catch (notifError) {
      console.warn('Failed to create welcome notification:', notifError)
    }

    const result = {
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        created_at: newUser.user.created_at
      },
      employee: newEmployee,
      temp_password: send_email_invite ? null : password,
      invite: inviteResult,
      requestId: requestId
    }

    console.log(JSON.stringify({ level: 'info', requestId, event: 'create-edge-user:success', email }))
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error(JSON.stringify({ 
      level: 'error', 
      requestId, 
      event: 'create-edge-user:error',
      error: error.message 
    }))
    
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        requestId: requestId 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper function to generate secure temporary password
function generateTempPassword(): string {
  const length = 12
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  
  // Ensure at least one of each type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)] // Uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)] // Lowercase  
  password += "0123456789"[Math.floor(Math.random() * 10)] // Number
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)] // Special char
  
  // Fill remaining length
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}