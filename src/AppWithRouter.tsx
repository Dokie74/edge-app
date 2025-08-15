// src/AppWithRouter.tsx - Main App with React Router integration
import React from 'react';
import { AppProvider } from './contexts';
import AuthenticatedApp from './components/routing/AuthenticatedApp';

// New App wrapper with React Router integration
export default function AppWithRouter() {
  return (
    <AppProvider>
      <AuthenticatedApp />
    </AppProvider>
  );
}