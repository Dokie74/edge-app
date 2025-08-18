// Database Fix Edge Function - Run critical fixes
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('EDGE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables')
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Allow fix_database_issues action without auth since this is a critical fix
    const body = await req.json().catch(() => ({ action: 'fix_database_issues' }))
    const { action } = body

    if (action !== 'fix_database_issues') {
      throw new Error('Invalid action')
    }

    console.log('🔧 Starting database fixes...')

    // Direct fixes since we can't execute raw SQL from edge functions
    console.log('🔧 Applying direct database fixes...')
    
    let fixes_applied = []
    let errors = []

    // 2. Fix departments table by adding missing data first
    console.log('🏢 Fixing departments table...')

    // Try to insert departments without is_active first (to check if table exists)
    console.log('📋 Ensuring departments exist...')
    const departments = [
      { name: 'Accounting', description: 'Financial operations and accounting' },
      { name: 'Engineering', description: 'Product development and engineering' },
      { name: 'Executive', description: 'Executive leadership and strategy' },
      { name: 'Production', description: 'Manufacturing and production' },
      { name: 'Sales', description: 'Sales and customer relations' },
      { name: 'General', description: 'General/Unassigned employees' }
    ]

    for (const dept of departments) {
      try {
        // Try without is_active column first
        const { error: insertError } = await supabaseAdmin
          .from('departments')
          .upsert({ 
            name: dept.name, 
            description: dept.description
          }, { 
            onConflict: 'name' 
          })
        
        if (insertError) {
          console.warn(`Failed to insert ${dept.name}:`, insertError.message)
          errors.push(`Department ${dept.name}: ${insertError.message}`)
        } else {
          fixes_applied.push(`Department ${dept.name} ensured`)
        }
      } catch (e) {
        console.warn(`Department insert error for ${dept.name}:`, e)
        errors.push(`Department ${dept.name}: ${e.message}`)
      }
    }

    const result = {
      success: errors.length === 0,
      timestamp: new Date().toISOString(),
      fixes_applied,
      errors,
      notes: [
        'Database functions need to be created via SQL migrations',
        'Use the fix_production_issues.sql file to manually create get_potential_managers function',
        'Departments table may need is_active column added manually'
      ]
    }

    console.log('✅ Database fixes completed:', result)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Database fix error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        success: false,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})