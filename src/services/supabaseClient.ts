import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { getCurrentTenantId } from '../utils/tenant';

// Supabase Configuration - Lucerne International
// SECURITY: All credentials must come from environment variables
const supabaseUrl: string = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.REACT_APP_SUPABASE_URL!;

const supabaseAnonKey: string = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.REACT_APP_SUPABASE_ANON_KEY!;

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