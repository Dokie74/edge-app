// src/App.js - Working Full Version V2.5
// Built on the successful minimal version

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

// Import components one by one to ensure they work
import Sidebar from './components/shared/Sidebar';
import Dashboard from './components/pages/Dashboard';
import MyTeam from './components/pages/MyTeam';
import MyReviews from './components/pages/MyReviews';
import Settings from './components/pages/Settings';
import Assessment from './components/pages/Assessment';
import Admin from './components/pages/Admin';

// Import modals
import StartReviewCycleModal from './components/modals/StartReviewCycleModal';
import GiveKudoModal from './components/modals/GiveKudoModal';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [activePage, setActivePage] = useState({ name: 'Dashboard', props: {} });
  const [modal, setModal] = useState({ isOpen: false, name: null, props: {} });

  // Fetch user role and name after authentication
  const fetchUserData = async () => {
    if (!user) {
      setUserDataLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching user data for:', user.email);
      
      // Simple role assignment for now (we know this works)
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

      console.log('✅ User data loaded:', { role, name });
      setUserRole(role);
      setUserName(name);

    } catch (error) {
      console.error('💥 Error in fetchUserData:', error);
      // Set defaults if there's an error
      setUserRole('employee');
      setUserName(user.email.split('@')[0]);
    } finally {
      setUserDataLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 App starting...');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Session check:', session?.user?.email || 'No session');
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth changed:', event, session?.user?.email || 'No user');
      setUser(session?.user ?? null);
      
      // Reset user data when auth changes
      if (!session?.user) {
        setUserRole(null);
        setUserName('');
        setUserDataLoading(false);
        setModal({ isOpen: false, name: null, props: {} });
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

  const openModal = (name, props = {}) => {
    console.log('📝 Opening modal:', name, props);
    setModal({ isOpen: true, name, props });
  };

  const closeModal = () => {
    console.log('❌ Closing modal');
    setModal({ isOpen: false, name: null, props: {} });
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Reset all user-related state
      setUserRole(null);
      setUserName('');
      setActivePage({ name: 'Dashboard', props: {} });
      setModal({ isOpen: false, name: null, props: {} });
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
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    console.log('🚪 Showing login screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-cyan-400">EDGE</h1>
            <p className="text-gray-400 text-sm">Employee Development & Growth Engine</p>
            <p className="text-xs text-gray-500 mt-2">Version 2.5 - Enhanced with Kudos</p>
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

  // Page renderer function
  const renderPage = () => {
    try {
      switch (activePage.name) {
        case 'Dashboard':
          return <Dashboard supabase={supabase} setActivePage={setActivePage} openModal={openModal} />;
        case 'My Team':
          return <MyTeam supabase={supabase} openModal={openModal} setActivePage={setActivePage} />;
        case 'My Reviews':
          return <MyReviews supabase={supabase} />;
        case 'Settings':
          return <Settings supabase={supabase} />;
        case 'Assessment':
          return <Assessment supabase={supabase} pageProps={activePage.props} setActivePage={setActivePage} />;
        case 'Admin':
          return <Admin supabase={supabase} />;
        default:
          return <Dashboard supabase={supabase} setActivePage={setActivePage} openModal={openModal} />;
      }
    } catch (error) {
      console.error('💥 Error rendering page:', error);
      return (
        <div className="p-8">
          <div className="bg-red-900 border border-red-700 rounded-lg p-4">
            <h2 className="text-red-200 font-bold mb-2">Page Error</h2>
            <p className="text-red-300">Error loading {activePage.name}: {error.message}</p>
            <button 
              onClick={() => setActivePage({ name: 'Dashboard', props: {} })}
              className="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
  };

  console.log('🏠 Showing main app - User:', user.email, 'Role:', userRole, 'Page:', activePage.name);

  // MAIN APP STRUCTURE
  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-100">
      {/* SIDEBAR */}
      <Sidebar 
        activePage={activePage.name} 
        setActivePage={setActivePage} 
        userRole={userRole}
        userName={userName}
        handleSignOut={handleSignOut}
      />
      
      {/* MAIN CONTENT */}
      <main className="flex-grow">
        {renderPage()}
      </main>

      {/* MODALS - Only render when modal.isOpen is true and modal.name matches */}
      {modal.isOpen && modal.name === 'startReviewCycle' && (
        <StartReviewCycleModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: () => {
              console.log('✅ Review cycle modal completed');
              if (modal.props?.onComplete) {
                modal.props.onComplete();
              }
              closeModal();
            }
          }} 
        />
      )}

      {modal.isOpen && modal.name === 'giveKudo' && (
        <GiveKudoModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: () => {
              console.log('✅ Give kudo modal completed');
              if (modal.props?.onComplete) {
                modal.props.onComplete();
              }
              closeModal();
            }
          }} 
        />
      )}

      {/* DEBUG INFO (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-75 text-xs text-gray-400 p-2 border-t border-gray-700">
          Debug: User: {user?.email} | Role: {userRole} | Page: {activePage.name} | Modal: {modal.isOpen ? modal.name : 'none'}
        </div>
      )}
    </div>
  );
}