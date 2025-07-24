// src/App.js - Debug version to clear any cached errors
// Replace your App.js temporarily with this version

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

import Sidebar from './components/shared/Sidebar';
import Dashboard from './components/pages/Dashboard';
import MyTeam from './components/pages/MyTeam';
import MyReviews from './components/pages/MyReviews';
import Settings from './components/pages/Settings';
import Assessment from './components/pages/Assessment';
import Admin from './components/pages/Admin';
import StartReviewCycleModal from './components/modals/StartReviewCycleModal';
import Modal from './components/modals/Modal';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PageRenderer = ({ page, setActivePage, openModal, userRole }) => {
  switch (page.name) {
    case 'Dashboard':
      return <Dashboard supabase={supabase} />;
    case 'My Team':
      return <MyTeam supabase={supabase} openModal={openModal} setActivePage={setActivePage} />;
    case 'My Reviews':
      return <MyReviews supabase={supabase} />;
    case 'Settings':
      return <Settings supabase={supabase} />;
    case 'Assessment':
      return <Assessment supabase={supabase} pageProps={page.props} setActivePage={setActivePage} />;
    case 'Admin':
      return <Admin supabase={supabase} />;
    default:
      return null;
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [activePage, setActivePage] = useState({ name: 'Dashboard' });
  const [modal, setModal] = useState({ isOpen: false, name: null, props: {} });
  const [debugInfo, setDebugInfo] = useState('');

  // Fetch user role and name after authentication - SIMPLIFIED VERSION
  const fetchUserData = async () => {
    if (!user) {
      setUserDataLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching user data for:', user.email);
      setDebugInfo(`Fetching data for: ${user.email}`);
      
      // SIMPLIFIED: Just use email to determine role for now
      let role = 'employee';
      let name = user.email.split('@')[0];
      
      if (user.email === 'admin@lucerne.com') {
        role = 'admin';
        name = 'Admin';
      } else if (user.email === 'manager@lucerne.com') {
        role = 'manager'; 
        name = 'Manager';
      } else if (user.email === 'employee1@lucerne.com') {
        role = 'employee';
        name = 'Employee 1';
      }

      console.log('✅ Using simplified role assignment:', { role, name });
      setDebugInfo(`✅ Role: ${role}, Name: ${name}`);
      
      setUserRole(role);
      setUserName(name);

    } catch (error) {
      console.error('💥 Error in fetchUserData:', error);
      setDebugInfo(`❌ Error: ${error.message}`);
      // Set defaults if there's an error
      setUserRole('employee');
      setUserName(user.email.split('@')[0]);
    } finally {
      setUserDataLoading(false);
    }
  };

  useEffect(() => {
    // Simple auth setup
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      
      // Reset user data when auth changes
      if (!session?.user) {
        setUserRole(null);
        setUserName('');
        setUserDataLoading(false);
        setDebugInfo('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user data when user changes
  useEffect(() => {
    if (user) {
      setUserDataLoading(true);
      fetchUserData();
    }
  }, [user]);

  const openModal = (name, props = {}) => setModal({ isOpen: true, name, props });
  const closeModal = () => setModal({ isOpen: false, name: null, props: {} });

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Reset all user-related state
      setUserRole(null);
      setUserName('');
      setActivePage({ name: 'Dashboard' });
      setDebugInfo('');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading screen while checking authentication
  if (userDataLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-400 mb-4">EDGE</h1>
          <p className="text-gray-400">Loading your profile...</p>
          <div className="mt-4 w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          {debugInfo && (
            <div className="mt-4 text-xs text-gray-500 max-w-md">
              Debug: {debugInfo}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-cyan-400">EDGE</h1>
            <p className="text-gray-400 text-sm">Employee Development & Growth Engine</p>
            <p className="text-xs text-gray-500 mt-2">DEBUG VERSION - Simplified Auth</p>
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
                <div>• admin@lucerne.com (Admin) ← Use this</div>
                <div>• manager@lucerne.com (Manager)</div>
                <div>• employee1@lucerne.com (Employee)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-100">
      <Sidebar 
        activePage={activePage.name} 
        setActivePage={setActivePage} 
        userRole={userRole}
        userName={userName}
        handleSignOut={handleSignOut}
      />
      <main className="flex-grow">
        <PageRenderer 
          page={activePage} 
          setActivePage={setActivePage} 
          openModal={openModal} 
          userRole={userRole}
        />
      </main>

      {modal.isOpen && (
        <Modal closeModal={closeModal}>
          {modal.name === 'startReviewCycle' && (
            <StartReviewCycleModal supabase={supabase} closeModal={closeModal} modalProps={modal.props} />
          )}
        </Modal>
      )}

      {/* Debug Info Footer */}
      {debugInfo && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-xs text-gray-400 p-2 border-t border-gray-700">
          Debug: {debugInfo} | Role: {userRole} | User: {user?.email}
        </div>
      )}
    </div>
  );
}