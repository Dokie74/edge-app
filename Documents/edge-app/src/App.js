// src/App.js
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
import StartReviewCycleModal from './components/modals/StartReviewCycleModal';
import Modal from './components/modals/Modal';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// REMOVE DEVELOPMENT BYPASS
const DEV_MODE_BYPASS_LOGIN = false;

const PageRenderer = ({ page, setActivePage, openModal }) => {
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
    default:
      return null;
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState({ name: 'Dashboard' });
  const [modal, setModal] = useState({ isOpen: false, name: null, props: {} });

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && session.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const openModal = (name, props = {}) => setModal({ isOpen: true, name, props });
  const closeModal = () => setModal({ isOpen: false, name: null, props: {} });

  if (!user && !DEV_MODE_BYPASS_LOGIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-sm">
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
      <Sidebar activePage={activePage.name} setActivePage={setActivePage} />
      <main className="flex-grow">
        <PageRenderer page={activePage} setActivePage={setActivePage} openModal={openModal} />
      </main>

      {modal.isOpen && (
        <Modal closeModal={closeModal}>
          {modal.name === 'startReviewCycle' && (
            <StartReviewCycleModal supabase={supabase} closeModal={closeModal} modalProps={modal.props} />
          )}
          {/* Add additional modals as needed */}
        </Modal>
      )}
    </div>
  );
}
