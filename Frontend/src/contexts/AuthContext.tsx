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
      console.log('AuthContext useEffect - Starting auth initialization');
      const token = localStorage.getItem('cinepal-token');
      console.log('Initializing auth, token found:', !!token);
      
      if (token) {
        try {
          authService.setAuthToken(token);
          const profile = await authService.getProfile();
          console.log('Profile fetched:', profile);
          authStore.setUser(profile);
          authStore.setToken(token);
        } catch (error) {
          console.log('Token validation failed, clearing auth state', error);
          authStore.logout();
          authService.setAuthToken(null);
          localStorage.removeItem('cinepal-token');
        }
      } else {
        console.log('No token found, logging out');
        authStore.logout();
      }
      
      console.log('AuthContext - setting loading to false');
      authStore.setLoading(false);
    };

    initializeAuth();
  }, [authStore]);

  const login = async (credentials: LoginRequest) => {
    try {
      authStore.setLoading(true);
      console.log('Starting login process...');
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      
      authService.setAuthToken(response.access_token);
      const profileResponse = await authService.getProfile();
      console.log('Profile response:', profileResponse);
      
      authStore.setUser(profileResponse);
      authStore.setToken(response.access_token);
      localStorage.setItem('cinepal-token', response.access_token);
      
      console.log('Auth store updated, isAuthenticated:', authStore.isAuthenticated);
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
    console.log('Logging out...');
    authStore.logout();
    localStorage.removeItem('cinepal-token');
    authService.setAuthToken(null);
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