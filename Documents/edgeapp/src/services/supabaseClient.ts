import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { getCurrentTenantId } from '../utils/tenant';

// Environment variables - URL and Service Role Key only
const supabaseUrl: string = 
  process.env.REACT_APP_SUPABASE_URL || 
  'https://wvggehrxhnuvlxpaghft.supabase.co'; // Fallback for Lucerne deployment

const supabaseServiceKey: string = 
  process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2Z2dlaHJ4aG51dmx4cGFnaGZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc4MzAxNiwiZXhwIjoyMDcwMzU5MDE2fQ.m89LwIOa04IsPiEi_9mz4xW1jFPBCSA-B03_RxB84MU'; // Updated service role key

// Use anon key for client-side operations (authentication, user queries)  
const supabaseAnonKey = 
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2Z2dlaHJ4aG51dmx4cGFnaGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODMwMTYsImV4cCI6MjA3MDM1OTAxNn0.64TJpM2_6XZyUlOaVFrPSXqwvKn6QrTDukheC8EbVxo'; // Updated anon key

console.log('🔍 Supabase configuration:');
console.log('- URL:', supabaseUrl);
console.log('- Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');
console.log('- Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'MISSING');
console.log('- Environment:', process.env.NODE_ENV);
console.log('- REACT_APP_SUPABASE_URL available:', !!process.env.REACT_APP_SUPABASE_URL);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey);

// Set tenant context for RLS policies
export const setTenantContext = async () => {
  const tenantId = getCurrentTenantId();
  try {
    await supabase.rpc('set_config', {
      setting_name: 'app.tenant_id',
      setting_value: tenantId,
      is_local: true
    });
  } catch (error) {
    console.warn('Failed to set tenant context:', error);
  }
};

// Initialize tenant context when client loads
if (typeof window !== 'undefined') {
  setTenantContext();
}