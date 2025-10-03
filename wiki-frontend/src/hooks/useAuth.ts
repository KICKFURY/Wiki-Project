import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState, LoginForm, RegisterForm } from '../types';
import { authService } from '../services/auth.service';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const loginTimestamp = await AsyncStorage.getItem('loginTimestamp');
      
      if (userId && loginTimestamp) {
        // Check if session has expired (3 hours)
        const sessionDuration = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
        const now = new Date().getTime();
        const loginTime = parseInt(loginTimestamp);
        
        if (now - loginTime > sessionDuration) {
          // Session expired, clear storage
          await AsyncStorage.removeItem('userId');
          await AsyncStorage.removeItem('loginTimestamp');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        const response = await authService.getCurrentUser(userId);
        if (response.data) {
          setAuthState({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          await AsyncStorage.removeItem('userId');
          await AsyncStorage.removeItem('loginTimestamp');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (credentials: LoginForm) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.login(credentials);
      if (response.data) {
        await AsyncStorage.setItem('userId', response.data.user._id);
        await AsyncStorage.setItem('loginTimestamp', new Date().getTime().toString());
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: response.error };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData: RegisterForm) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.register(userData);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      if (response.data) {
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      if (authState.user) {
        // Call logout API to clear session on server
        await authService.logout(authState.user._id);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage regardless of API call result
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('loginTimestamp');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!authState.user) return { success: false, error: 'No user logged in' };

    try {
      const response = await authService.updateProfile(authState.user._id, userData);
      if (response.data) {
        setAuthState(prev => ({
          ...prev,
          user: response.data as User,
        }));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Update failed' };
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    refreshUser: checkAuthStatus,
  };
};
