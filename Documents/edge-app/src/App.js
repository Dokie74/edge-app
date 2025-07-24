// src/App.js - Ultra simple version that works
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
  const [userRole, setUserRole] = useState('admin'); // Hard-coded for now
  const [userName, setUserName] = useState('Admin'); // Hard-coded for now
  const [activePage, setActivePage] = useState({ name: 'Dashboard' });
  const [modal, setModal] = useState({ isOpen: false, name: null, props: {} });

  useEffect(() => {
    // Simple auth setup
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openModal = (name, props = {}) => setModal({ isOpen: true, name, props });
  const closeModal = () => setModal({ isOpen: false, name: null, props: {} });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-cyan-400">EDGE</h1>
            <p className="text-gray-400 text-sm">Employee Development & Growth Engine</p>
          </div>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['email']}
          />
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
    </div>
  );
}