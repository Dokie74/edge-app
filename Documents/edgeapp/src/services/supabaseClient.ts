import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { getCurrentTenantId } from '../utils/tenant';

// Support both React and Next.js environment variables
const supabaseUrl: string = 
  process.env.REACT_APP_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://wvggehrxhnuvlxpaghft.supabase.co'; // Fallback for Lucerne deployment

const supabaseAnonKey: string = 
  process.env.REACT_APP_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2Z2dlaHJ4aG51dmx4cGFnaGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ0MzMzODAsImV4cCI6MjA0MDAwOTM4MH0.T7Nt3w9cVMGNQSgc-0OzlOLYHRp5a8GjJGdCdYelVXg'; // Fallback anon key

console.log('🔍 Supabase configuration:');
console.log('- URL:', supabaseUrl);
console.log('- Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');

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