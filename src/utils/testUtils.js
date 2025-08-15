// Test utilities for EDGE application testing
import React from 'react';
import { render } from '@testing-library/react';

// Mock authentication context for tests
const MockAuthProvider = ({ children, user = null, loading = false }) => {
  const mockAuthContext = {
    user,
    loading,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    updateProfile: jest.fn()
  };

  // Create a mock context provider
  return (
    <div data-testid="mock-auth-provider">
      {children}
    </div>
  );
};

// Custom render function that includes providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    user = null,
    loading = false,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <MockAuthProvider user={user} loading={loading}>
      {children}
    </MockAuthProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    user,
    loading
  };
};

// Mock employee data for tests
export const mockEmployees = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'employee',
    job_title: 'Software Engineer',
    is_active: true,
    manager_id: 2
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'manager',
    job_title: 'Engineering Manager',
    is_active: true,
    manager_id: null
  },
  {
    id: 3,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    job_title: 'System Administrator',
    is_active: true,
    manager_id: null
  }
];

// Mock assessment data
export const mockAssessments = [
  {
    id: 1,
    employee_id: 1,
    review_cycle_id: 1,
    status: 'pending',
    self_assessment: null,
    manager_feedback: null,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    employee_id: 1,
    review_cycle_id: 1,
    status: 'completed',
    self_assessment: { goals: 'Test goals', achievements: 'Test achievements' },
    manager_feedback: { rating: 4, comments: 'Good work' },
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Mock review cycles
export const mockReviewCycles = [
  {
    id: 1,
    name: 'Q1 2024 Review',
    start_date: '2024-01-01',
    end_date: '2024-03-31',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Utility to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock API responses
export const mockApiResponses = {
  success: (data = {}) => ({ data, error: null }),
  error: (message = 'Test error') => ({ data: null, error: { message } }),
  loading: () => ({ data: null, error: null, loading: true })
};

// Mock user events
export const mockUserEvents = {
  admin: {
    id: 'admin-123',
    email: 'admin@example.com',
    user_metadata: { name: 'Admin User' }
  },
  manager: {
    id: 'manager-123', 
    email: 'manager@example.com',
    user_metadata: { name: 'Manager User' }
  },
  employee: {
    id: 'employee-123',
    email: 'employee@example.com', 
    user_metadata: { name: 'Employee User' }
  }
};

// Reset all mocks between tests
export const resetMocks = () => {
  global.mockSupabase.auth.getUser.mockReset();
  global.mockSupabase.auth.signInWithPassword.mockReset();
  global.mockSupabase.auth.signUp.mockReset();
  global.mockSupabase.auth.signOut.mockReset();
  global.mockSupabase.from.mockReset();
  global.mockSupabase.rpc.mockReset();
  global.mockSupabase.functions.invoke.mockReset();
};

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';