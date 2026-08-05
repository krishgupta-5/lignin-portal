import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getToken,
  getStoredUser,
  setToken,
  setStoredUser,
  removeToken,
  apiLogin as serviceLogin,
  apiSignup as serviceSignup,
  apiVerifyOTP,
  apiResendOTP,
  apiGetMe,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  // Synchronize and verify stored session on mount
  useEffect(() => {
    async function initAuth() {
      const token = getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const freshUser = await apiGetMe();
        setUser(freshUser);
        setStoredUser(freshUser);
      } catch (err) {
        if (err.status === 401) {
          console.warn('Session expired or unauthorized:', err.message);
          removeToken();
          setUser(null);
        } else {
          // Server briefly offline or reloading: retain cached user from localStorage
          console.warn('Server unreachable during session check; retaining local session:', err.message);
          const cached = getStoredUser();
          if (cached) setUser(cached);
        }
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);


  const login = useCallback(async (email, password) => {
    const data = await serviceLogin(email, password);
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const data = await serviceSignup(name, email, password);
    if (data.user) {
      setUser(data.user);
    }
    return data;
  }, []);

  const verifyOTP = useCallback(async (email, otp) => {
    const data = await apiVerifyOTP(email, otp);
    setUser(data.user);
    return data;
  }, []);

  const resendOTP = useCallback(async (email) => {
    return await apiResendOTP(email);
  }, []);


  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  const updateProfile = useCallback((updatedUser) => {
    setUser(updatedUser);
    setStoredUser(updatedUser);
  }, []);

  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    targetPath: '/predict',
  });

  const openAuthModal = useCallback((targetPath = '/predict') => {
    setAuthModalState({ isOpen: true, targetPath });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        verifyOTP,
        resendOTP,
        logout,
        updateProfile,
        authModalState,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
