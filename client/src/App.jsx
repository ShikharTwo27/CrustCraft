import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkMe, localLogout } from './features/auth/authSlice';
import AppRouter from './router/AppRouter';

export const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Attempt to hydrate user session on mount
    dispatch(checkMe());

    // Listen for global logout events triggered by refresh token failures
    const handleLogoutEvent = () => {
      dispatch(localLogout());
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, [dispatch]);

  return <AppRouter />;
};

export default App;
