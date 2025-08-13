// Check what departments exist in the database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wvggehrxhnuvlxpaghft.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2Z2dlaHJ4aG51dmx4cGFnaGZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzQyNjk3NywiZXhwIjoyMDM5MDAyOTc3fQ.6aOhpoq7lI8wdCEGbYJdtVfN0fH1rUE4eKiUb8T-Lck';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkDepartments() {
  console.log('🏢 Checking departments in database...');
  
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('tenant_id', 'lucerne');
    
    if (error) {
      console.log('❌ Error querying departments:', error.message);
      return;
    }
    
    console.log('✅ Found departments:');
    data.forEach(dept => {
      console.log(`  - ID: ${dept.id}, Name: "${dept.name}", Active: ${dept.is_active}`);
    });
    
    // Check if "Engineering" exists
    const engineering = data.find(d => d.name === 'Engineering');
    if (engineering) {
      console.log('✅ "Engineering" department found with ID:', engineering.id);
    } else {
      console.log('❌ "Engineering" department NOT found - this would cause the error!');
    }
    
  } catch (error) {
    console.log('💥 Error:', error.message);
  }
}

checkDepartments();