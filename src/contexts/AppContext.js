import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthService } from '../services';

// Action types
const APP_ACTIONS = {
  SET_USER: 'SET_USER',
  SET_USER_DATA: 'SET_USER_DATA',
  SET_USER_DATA_LOADING: 'SET_USER_DATA_LOADING',
  SET_ACTIVE_PAGE: 'SET_ACTIVE_PAGE',
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  RESET_USER_STATE: 'RESET_USER_STATE'
};

// Initial state
const initialState = {
  user: null,
  userRole: null,
  userName: '',
  mustChangePassword: false,
  userDataLoading: true,
  activePage: { name: 'Dashboard', props: {} },
  modal: { isOpen: false, name: null, props: {} }
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.SET_USER:
      return { ...state, user: action.payload };
    
    case APP_ACTIONS.SET_USER_DATA:
      return { 
        ...state, 
        userRole: action.payload.role, 
        userName: action.payload.name,
        mustChangePassword: action.payload.must_change_password || false
      };
    
    case APP_ACTIONS.SET_USER_DATA_LOADING:
      return { ...state, userDataLoading: action.payload };
    
    case APP_ACTIONS.SET_ACTIVE_PAGE:
      return { ...state, activePage: action.payload };
    
    case APP_ACTIONS.OPEN_MODAL:
      return { 
        ...state, 
        modal: { 
          isOpen: true, 
          name: action.payload.name, 
          props: action.payload.props || {} 
        } 
      };
    
    case APP_ACTIONS.CLOSE_MODAL:
      return { 
        ...state, 
        modal: { isOpen: false, name: null, props: {} } 
      };
    
    case APP_ACTIONS.RESET_USER_STATE:
      return {
        ...state,
        user: null,
        userRole: null,
        userName: '',
        userDataLoading: false,
        activePage: { name: 'Dashboard', props: {} },
        modal: { isOpen: false, name: null, props: {} }
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Fetch user role and name after authentication
  const fetchUserData = async (user) => {
    if (!user) {
      dispatch({ type: APP_ACTIONS.SET_USER_DATA_LOADING, payload: false });
      return;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Fetching user data for authenticated user');
      }
      
      const { role, name, must_change_password } = await AuthService.getUserRole(user.email);

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ User data loaded successfully');
      }
      dispatch({ type: APP_ACTIONS.SET_USER_DATA, payload: { role, name, must_change_password } });

    } catch (error) {
      console.error('💥 Error in fetchUserData:', error);
      // Set defaults if there's an error
      dispatch({ 
        type: APP_ACTIONS.SET_USER_DATA, 
        payload: { role: 'employee', name: user.email.split('@')[0] } 
      });
    } finally {
      dispatch({ type: APP_ACTIONS.SET_USER_DATA_LOADING, payload: false });
    }
  };

  // Initialize auth state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 App starting...');
    }
    
    AuthService.getSession().then((session) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Session check:', session?.user ? 'Active session' : 'No session');
      }
      dispatch({ type: APP_ACTIONS.SET_USER, payload: session?.user ?? null });
    });

    const { data: { subscription } } = AuthService.onAuthStateChange((event, session) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Auth changed:', event, session?.user?.email || 'No user');
      }
      dispatch({ type: APP_ACTIONS.SET_USER, payload: session?.user ?? null });
      
      // Reset user data when auth changes
      if (!session?.user) {
        dispatch({ type: APP_ACTIONS.RESET_USER_STATE });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user data when user changes
  useEffect(() => {
    if (state.user) {
      dispatch({ type: APP_ACTIONS.SET_USER_DATA_LOADING, payload: true });
      fetchUserData(state.user);
    }
  }, [state.user]);

  // Action creators
  const actions = {
    setActivePage: (page) => dispatch({ type: APP_ACTIONS.SET_ACTIVE_PAGE, payload: page }),
    openModal: (name, props = {}) => dispatch({ type: APP_ACTIONS.OPEN_MODAL, payload: { name, props } }),
    closeModal: () => dispatch({ type: APP_ACTIONS.CLOSE_MODAL }),
    signOut: async () => {
      try {
        await AuthService.signOut();
        dispatch({ type: APP_ACTIONS.RESET_USER_STATE });
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};