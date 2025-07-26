// testUtils.tsx - Testing utilities and providers
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider } from '../contexts/AppContext';
import { AppState, User, Employee } from '../types';

// Mock user data for tests
export const mockUsers = {
  admin: {
    id: 'admin-id',
    email: 'admin@lucerne.com',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  } as User,
  manager: {
    id: 'manager-id',
    email: 'manager@lucerne.com',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  } as User,
  employee: {
    id: 'employee-id',
    email: 'employee@lucerne.com',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  } as User
};

export const mockEmployees = {
  admin: {
    id: 'emp-admin-id',
    user_id: 'admin-id',
    name: 'Admin User',
    email: 'admin@lucerne.com',
    job_title: 'Administrator',
    role: 'admin',
    is_active: true,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  } as Employee,
  manager: {
    id: 'emp-manager-id',
    user_id: 'manager-id',
    name: 'Manager User',
    email: 'manager@lucerne.com',
    job_title: 'Team Manager',
    role: 'manager',
    is_active: true,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  } as Employee,
  employee: {
    id: 'emp-employee-id',
    user_id: 'employee-id',
    name: 'Employee User',
    email: 'employee@lucerne.com',
    job_title: 'Developer',
    role: 'employee',
    manager_id: 'emp-manager-id',
    is_active: true,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  } as Employee
};

// Mock app state for different user roles
export const createMockAppState = (userRole: 'admin' | 'manager' | 'employee' | null = null): AppState => ({
  user: userRole ? mockUsers[userRole] : null,
  userRole: userRole,
  userName: userRole ? mockEmployees[userRole].name : null,
  userDataLoading: false,
  activePage: {
    name: 'Dashboard',
    props: {}
  },
  modal: {
    isOpen: false,
    name: null,
    props: {}
  }
});

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: Partial<AppState>;
  userRole?: 'admin' | 'manager' | 'employee' | null;
}

const createWrapper = (initialState?: Partial<AppState>) => {
  return ({ children }: { children: React.ReactNode }) => {
    // Mock the AppProvider with initial state
    return (
      <div data-testid="app-wrapper">
        {children}
      </div>
    );
  };
};

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialState, userRole, ...renderOptions } = options;
  
  const mockState = initialState || createMockAppState(userRole);
  const Wrapper = createWrapper(mockState);

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock API responses
export const mockApiResponses = {
  employees: [mockEmployees.admin, mockEmployees.manager, mockEmployees.employee],
  reviewCycles: [
    {
      id: 'cycle-1',
      name: 'Q1 2024 Review',
      description: 'Quarterly performance review',
      start_date: '2024-01-01',
      end_date: '2024-03-31',
      status: 'active',
      created_by: 'admin-id',
      created_at: '2023-12-15'
    }
  ],
  assessments: [
    {
      id: 'assessment-1',
      employee_id: 'emp-employee-id',
      cycle_id: 'cycle-1',
      self_assessment_status: 'in_progress',
      manager_review_status: 'pending',
      due_date: '2024-03-15',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }
  ]
};

// Helper function to wait for async operations
export const waitForAsyncOperation = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Setup localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

export default renderWithProviders;