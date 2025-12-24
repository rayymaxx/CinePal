import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/authService';
import { useAuthStore } from '../store';
import { useSessionManager } from '../hooks/useSessionManager';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authStore = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('cinepal-token');

      if (token) {
        try {
          authService.setAuthToken(token);
          const profile = await authService.getProfile();
          authStore.setUser(profile);
          authStore.setToken(token);
        } catch (error) {
          authStore.logout();
          authService.setAuthToken(null);
          localStorage.removeItem('cinepal-token');
        }
      } else {
        authStore.logout();
      }

      authStore.setLoading(false);
    };

    initializeAuth();
  }, []); // Removed authStore from dependencies to prevent re-runs

  const login = async (credentials: LoginRequest) => {
    try {
      authStore.setLoading(true);
      const response = await authService.login(credentials);

      authService.setAuthToken(response.access_token);
      const profileResponse = await authService.getProfile();

      authStore.setUser(profileResponse);
      authStore.setToken(response.access_token);
      localStorage.setItem('cinepal-token', response.access_token);
    } catch (error) {
      throw error;
    } finally {
      authStore.setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      authStore.setLoading(true);
      await authService.register(userData);
      // Don't auto-login, let the component handle the redirect
    } catch (error) {
      throw error;
    } finally {
      authStore.setLoading(false);
    }
  };

  const logout = () => {
    authStore.logout();
    localStorage.removeItem('cinepal-token');
    authService.setAuthToken(null);
    // Redirect to login after logout
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user: authStore.user,
        token: authStore.token,
        isAuthenticated: authStore.isAuthenticated,
        login,
        register,
        logout,
        loading: authStore.loading,
      }}
    >
      {authStore.loading ? (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};