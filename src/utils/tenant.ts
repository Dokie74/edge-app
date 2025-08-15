// Multi-tenant utilities for EdgeApp
// Handles tenant context and permissions

export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  settings?: Record<string, any>;
}

// Get current tenant ID from environment
export const getCurrentTenantId = (): string => {
  return process.env.REACT_APP_TENANT_ID || process.env.NEXT_PUBLIC_TENANT_ID || 'lucerne';
};

// Get current client name
export const getCurrentClientName = (): string => {
  return process.env.REACT_APP_CLIENT_NAME || process.env.NEXT_PUBLIC_CLIENT_NAME || 'EdgeApp';
};

// Get current client domain
export const getCurrentClientDomain = (): string => {
  return process.env.REACT_APP_CLIENT_DOMAIN || process.env.NEXT_PUBLIC_CLIENT_DOMAIN || 'localhost';
};

// Check if god mode is enabled for current user
export const isGodModeUser = (email: string): boolean => {
  const godModeEmail = process.env.REACT_APP_GOD_MODE_EMAIL || process.env.NEXT_PUBLIC_GOD_MODE_EMAIL;
  return godModeEmail ? email === godModeEmail : false;
};

// Check if user can access all tenants (god mode or super admin)
export const canAccessAllTenants = (userEmail: string, userRole?: string): boolean => {
  return isGodModeUser(userEmail) || 
         userRole === 'super_admin' || 
         userRole === 'system_admin';
};

// Get database filter for current tenant
export const getTenantFilter = (userEmail?: string, userRole?: string) => {
  // If user has cross-tenant access, don't filter
  if (userEmail && canAccessAllTenants(userEmail, userRole)) {
    return null;
  }
  
  // Otherwise, filter by current tenant
  return { tenant_id: getCurrentTenantId() };
};

// Ensure data has correct tenant_id
export const addTenantId = <T extends Record<string, any>>(data: T): T => {
  return {
    ...data,
    tenant_id: getCurrentTenantId()
  };
};

// Validate that user can access specific tenant data
export const validateTenantAccess = (
  dataTenantId: string, 
  userEmail?: string, 
  userRole?: string
): boolean => {
  // God mode users can access everything
  if (userEmail && canAccessAllTenants(userEmail, userRole)) {
    return true;
  }
  
  // Otherwise, must match current tenant
  return dataTenantId === getCurrentTenantId();
};

// Get branded app configuration
export const getAppConfig = () => {
  return {
    tenantId: getCurrentTenantId(),
    clientName: getCurrentClientName(),
    clientDomain: getCurrentClientDomain(),
    appName: process.env.REACT_APP_APP_NAME || process.env.NEXT_PUBLIC_APP_NAME || `EdgeApp - ${getCurrentClientName()}`,
    supportEmail: process.env.REACT_APP_SUPPORT_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@edgeapp.com',
    godModeEnabled: (process.env.REACT_APP_GOD_MODE_ENABLED || process.env.GOD_MODE_ENABLED) === 'true',
    multiTenantEnabled: (process.env.REACT_APP_MULTI_TENANT_ENABLED || process.env.MULTI_TENANT_ENABLED) === 'true'
  };
};