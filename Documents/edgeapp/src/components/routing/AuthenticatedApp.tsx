// src/components/routing/AuthenticatedApp.tsx - Authentication wrapper with router
import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../services';
import { useApp } from '../../contexts';
import AppRouter from './AppRouter';

const AuthenticatedApp: React.FC = () => {
  const { user, userDataLoading } = useApp();

  // Show loading screen while checking authentication
  if (userDataLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-400 mb-4">EDGE</h1>
          <p className="text-gray-400">Loading your profile...</p>
          <div className="mt-4 w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚪 Showing login screen');
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-cyan-400">EDGE</h1>
            <p className="text-gray-400 text-sm">Employee Development & Growth Engine</p>
            <p className="text-xs text-gray-500 mt-2">Version 2.5 - Enhanced with React Router</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                style: {
                  button: { 
                    background: '#0891b2', 
                    color: 'white',
                    borderRadius: '0.5rem'
                  },
                  anchor: { color: '#67e8f9' },
                  input: { 
                    background: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }
                }
              }}
              providers={[]}
              view="sign_in"
            />
            
            {/* Test Users Helper */}
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-400 mb-2">Test Users:</p>
              <div className="text-xs text-gray-300 space-y-1">
                <div>• admin@lucerne.com (Admin)</div>
                <div>• manager@lucerne.com (Manager)</div>
                <div>• employee1@lucerne.com (Employee)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Secure logging - no sensitive data exposed
  if (process.env.NODE_ENV === 'development') {
    console.log('🏠 Authenticated app loaded - User authenticated:', !!user);
  }

  // Show the main app with routing
  return <AppRouter />;
};

export default AuthenticatedApp;