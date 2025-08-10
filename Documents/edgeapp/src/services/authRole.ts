import { supabase } from "./supabaseClient";

/**
 * Get the current user's role using session-derived identity
 * Never pass user_id from client - always derive from auth.uid()
 */
export async function getMyRole(): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_my_role");
  if (error) {
    console.error("get_my_role failed", error);
    return null;
  }
  return data ?? null;
}

/**
 * Get the current user's name using session-derived identity
 */
export async function getMyName(): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_my_name");
  if (error) {
    console.error("get_my_name failed", error);
    return null;
  }
  return data ?? null;
}

/**
 * Check if current user is admin using session-derived identity
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getMyRole();
  return role === 'admin';
}

/**
 * Check if current user is manager using session-derived identity
 */
export async function isManager(): Promise<boolean> {
  const role = await getMyRole();
  return role === 'manager';
}