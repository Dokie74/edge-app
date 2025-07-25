// csrfProtection.js - CSRF protection utilities for secure form submissions

import { supabase } from '../services/supabaseClient';

/**
 * CSRF Protection utility class
 */
class CSRFProtection {
  constructor() {
    this.tokenKey = '_csrf_token';
    this.headerName = 'X-CSRF-Token';
  }

  /**
   * Generate a secure random token
   */
  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Store CSRF token in session storage
   */
  storeToken(token) {
    try {
      sessionStorage.setItem(this.tokenKey, token);
      return true;
    } catch (error) {
      console.error('Failed to store CSRF token:', error);
      return false;
    }
  }

  /**
   * Get stored CSRF token
   */
  getStoredToken() {
    try {
      return sessionStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Failed to retrieve CSRF token:', error);
      return null;
    }
  }

  /**
   * Initialize CSRF protection (call on app start)
   */
  initialize() {
    let token = this.getStoredToken();
    if (!token) {
      token = this.generateToken();
      this.storeToken(token);
    }
    return token;
  }

  /**
   * Create protected form data with CSRF token
   */
  createProtectedFormData(formData) {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('CSRF token not available');
    }

    return {
      ...formData,
      _csrf_token: token,
      _timestamp: Date.now(),
      _nonce: this.generateToken().substring(0, 16)
    };
  }

  /**
   * Validate form submission timing (prevent replay attacks)
   */
  validateTimestamp(timestamp, maxAgeMs = 300000) { // 5 minutes default
    if (!timestamp) return false;
    const now = Date.now();
    const age = now - timestamp;
    return age >= 0 && age <= maxAgeMs;
  }

  /**
   * Create secure headers for API requests
   */
  createSecureHeaders() {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('CSRF token not available');
    }

    return {
      [this.headerName]: token,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  /**
   * Secure RPC call wrapper with CSRF protection
   */
  async secureRPC(functionName, params = {}) {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('CSRF token not available');
    }

    // Add security metadata to params
    const secureParams = {
      ...params,
      _csrf_token: token,
      _timestamp: Date.now(),
      _nonce: this.generateToken().substring(0, 16)
    };

    try {
      const { data, error } = await supabase.rpc(functionName, secureParams);
      
      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Secure RPC call failed (${functionName}):`, error);
      throw error;
    }
  }

  /**
   * Validate form data before submission
   */
  validateFormData(formData) {
    const errors = [];

    // Check for CSRF token
    if (!formData._csrf_token) {
      errors.push('Security token missing');
    } else if (formData._csrf_token !== this.getStoredToken()) {
      errors.push('Invalid security token');
    }

    // Check timestamp
    if (!formData._timestamp) {
      errors.push('Timestamp missing');
    } else if (!this.validateTimestamp(formData._timestamp)) {
      errors.push('Request expired');
    }

    // Check for required nonce
    if (!formData._nonce) {
      errors.push('Security nonce missing');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Clear stored tokens (call on logout)
   */
  clearTokens() {
    try {
      sessionStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.error('Failed to clear CSRF token:', error);
    }
  }

  /**
   * Refresh token (call periodically or after sensitive operations)
   */
  refreshToken() {
    const newToken = this.generateToken();
    this.storeToken(newToken);
    return newToken;
  }
}

// Create singleton instance
const csrfProtection = new CSRFProtection();

// Initialize on module load
csrfProtection.initialize();

export default csrfProtection;

/**
 * Hook for React components to use CSRF protection
 */
export const useCSRFProtection = () => {
  const createProtectedData = (formData) => {
    return csrfProtection.createProtectedFormData(formData);
  };

  const secureSubmit = async (functionName, formData) => {
    const protectedData = createProtectedData(formData);
    return await csrfProtection.secureRPC(functionName, protectedData);
  };

  const getSecureHeaders = () => {
    return csrfProtection.createSecureHeaders();
  };

  return {
    createProtectedData,
    secureSubmit,
    getSecureHeaders,
    refreshToken: () => csrfProtection.refreshToken(),
    clearTokens: () => csrfProtection.clearTokens()
  };
};

/**
 * Higher-order component for CSRF protection
 */
export const withCSRFProtection = (WrappedComponent) => {
  return function CSRFProtectedComponent(props) {
    const csrfProps = useCSRFProtection();
    return <WrappedComponent {...props} csrf={csrfProps} />;
  };
};