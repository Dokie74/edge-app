// src/components/routing/AuthenticatedApp.tsx - Authentication wrapper with router
import React, { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../services';
import { useApp } from '../../contexts';
import AppRouter from './AppRouter';
import ChangePasswordModal from '../modals/ChangePasswordModal';

const AuthenticatedApp: React.FC = () => {
  const { user, userDataLoading, mustChangePassword } = useApp();
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

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
            
          </div>
        </div>
      </div>
    );
  }

  // Secure logging - no sensitive data exposed
  if (process.env.NODE_ENV === 'development') {
    console.log('🏠 Authenticated app loaded - User authenticated:', !!user);
  }

  // Handle forced password change for new employees
  const handlePasswordChangeSuccess = () => {
    setShowPasswordChangeModal(false);
    // Context will automatically refresh and mustChangePassword will be false
    window.location.reload(); // Refresh to get updated context
  };

  // Show password change modal if required
  if (mustChangePassword && !showPasswordChangeModal) {
    setShowPasswordChangeModal(true);
  }

  // Show the main app with routing and password change modal if needed
  return (
    <>
      <AppRouter />
      {(mustChangePassword || showPasswordChangeModal) && (
        <ChangePasswordModal
          isRequired={true}
          onSuccess={handlePasswordChangeSuccess}
          // No onCancel because it's required
        />
      )}
    </>
  );
};

export default AuthenticatedApp;