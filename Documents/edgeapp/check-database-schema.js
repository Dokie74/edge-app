// Check the actual database schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wvggehrxhnuvlxpaghft.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2Z2dlaHJ4aG51dmx4cGFnaGZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzQyNjk3NywiZXhwIjoyMDM5MDAyOTc3fQ.6aOhpoq7lI8wdCEGbYJdtVfN0fH1rUE4eKiUb8T-Lck'; // Service role for schema inspection

const supabase = createClient(supabaseUrl, serviceKey);

async function checkSchema() {
  console.log('🔍 Checking actual database schema...');
  
  try {
    // Try to select from employees table to see what columns exist
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error querying employees:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Employees table found');
      const columns = Object.keys(data[0]);
      console.log('📋 Columns in employees table:');
      columns.sort().forEach(col => console.log(`  - ${col}`));
      
      const hasTenantId = columns.includes('tenant_id');
      console.log(`\n🎯 tenant_id column: ${hasTenantId ? '✅ EXISTS' : '❌ MISSING'}`);
      
      if (hasTenantId) {
        console.log('🔥 CRITICAL: The Edge Function fix was incorrect!');
        console.log('    The database DOES have tenant_id, so the fix needs to be reverted');
      } else {
        console.log('✅ GOOD: The database does not have tenant_id, so the fix was correct');
      }
    } else {
      console.log('⚠️ No employees found in database');
    }
    
  } catch (error) {
    console.log('💥 Error:', error.message);
  }
}

checkSchema();