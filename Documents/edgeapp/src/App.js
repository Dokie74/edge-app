// src/App.js - Working Full Version V2.5
// Built on the successful minimal version

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from './services';
import { AppProvider, useApp } from './contexts';

// Import components one by one to ensure they work
import Sidebar from './components/shared/Sidebar';
import EnhancedDashboard from './components/pages/EnhancedDashboard';
import MyTeamEnhanced from './components/pages/MyTeamEnhanced';
import ManagerReview from './components/pages/ManagerReview';
import MyReviews from './components/pages/MyReviews';
import MyDevelopmentCenterEnhanced from './components/pages/MyDevelopmentCenterEnhanced';
import Assessment from './components/pages/Assessment';
import Admin from './components/pages/Admin';
import FeedbackWall from './components/pages/FeedbackWall';
import ManagerPlaybook from './components/pages/ManagerPlaybook';
import EmployeeHelpPage from './components/pages/EmployeeHelpPage';
import ManagerHelpPage from './components/pages/ManagerHelpPage';
import AdminHelpPage from './components/pages/AdminHelpPage';

// Import modals
import StartReviewCycleModal from './components/modals/StartReviewCycleModal';
import CreateReviewCycleModal from './components/modals/CreateReviewCycleModal';
import CreateEmployeeModal from './components/modals/CreateEmployeeModal';
import EditEmployeeModal from './components/modals/EditEmployeeModal';
import GiveKudoModal from './components/modals/GiveKudoModal';
import GiveFeedbackModal from './components/modals/GiveFeedbackModal';


// Main App Component
const MainApp = () => {
  const { 
    user, 
    userRole, 
    userName, 
    userDataLoading, 
    activePage, 
    modal, 
    setActivePage, 
    openModal, 
    closeModal, 
    signOut 
  } = useApp();

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

  // Page renderer function
  const PageRenderer = ({ page }) => {
  try {
    switch (page.name) {
      case 'Dashboard':
        return <EnhancedDashboard />;
      case 'My Team':
        return <MyTeamEnhanced />;
      case 'Manager Review':
        return <ManagerReview pageProps={page.props} />;
      case 'My Reviews':
        return <MyReviews />;
      case 'My Development':
        return <MyDevelopmentCenterEnhanced />;
      case 'Admin':
        return <Admin />;
      case 'Assessment':
        return <Assessment pageProps={page.props} />;
      case 'Feedback Wall':
        return <FeedbackWall />;
      case 'Manager Playbook':
        return <ManagerPlaybook />;
      case 'Help':
        // Return role-specific help page
        if (userRole === 'admin') {
          return <AdminHelpPage />;
        } else if (userRole === 'manager') {
          return <ManagerHelpPage />;
        } else {
          return <EmployeeHelpPage />;
        }
      default:
        return <EnhancedDashboard />;
    }
  } catch (error) {
    console.error('Error rendering page:', error);
    return (
      <div className="p-8">
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <h2 className="text-red-200 font-bold mb-2">Page Error</h2>
          <p className="text-red-300">Error loading {page.name}: {error.message}</p>
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


  // MAIN APP STRUCTURE
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* SIDEBAR - Fixed positioned */}
      <Sidebar />
      
      {/* MAIN CONTENT - With left margin to account for fixed sidebar */}
      <main className="ml-64 min-h-screen">
        <PageRenderer page={activePage} />
      </main>

      {/* MODALS - Only render when modal.isOpen is true and modal.name matches */}
      {modal.isOpen && modal.name === 'startReviewCycle' && (
        <StartReviewCycleModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: () => {
              if (modal.props?.onComplete) {
                modal.props.onComplete();
              }
              closeModal();
            }
          }} 
        />
      )}

      {modal.isOpen && modal.name === 'createReviewCycle' && (
        <CreateReviewCycleModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: () => {
              if (modal.props?.onComplete) {
                modal.props.onComplete();
              }
              closeModal();
            }
          }} 
        />
      )}

      {modal.isOpen && modal.name === 'createEmployee' && (
        <CreateEmployeeModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: () => {
              if (modal.props?.onComplete) {
                modal.props.onComplete();
              }
              closeModal();
            }
          }} 
        />
      )}

      {modal.isOpen && modal.name === 'editEmployee' && (
        <EditEmployeeModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: () => {
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
              if (modal.props?.onComplete) {
                modal.props.onComplete();
              }
              closeModal();
            }
          }} 
        />
      )}

      {modal.isOpen && modal.name === 'giveFeedback' && (
        <GiveFeedbackModal 
          supabase={supabase} 
          closeModal={closeModal} 
          modalProps={{
            ...modal.props,
            onComplete: () => {
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
};

// App wrapper with provider
export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}