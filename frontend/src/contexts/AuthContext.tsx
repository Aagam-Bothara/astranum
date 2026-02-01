'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import type { UserProfile } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  hasProfile: boolean; // Has completed onboarding (has a person profile)
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    hasProfile: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      api.loadToken();
      const token = typeof window !== 'undefined' ? localStorage.getItem('astravaani_token') : null;

      if (!token) {
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          hasProfile: false,
        });
        return;
      }

      // Fetch user profile
      const profileResponse = await api.getProfile();
      const userData = profileResponse.data as any;

      // Check if user has completed onboarding (has a primary person profile)
      let hasProfile = false;
      try {
        const personProfileResponse = await api.getPrimaryProfile();
        hasProfile = !!personProfileResponse.data;
      } catch {
        // No primary profile exists
        hasProfile = false;
      }

      setState({
        isAuthenticated: true,
        isLoading: false,
        user: userData,
        hasProfile,
      });
    } catch (error) {
      // Token invalid or expired
      api.clearToken();
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        hasProfile: false,
      });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await api.login(email, password);
    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    }
    api.clearToken();
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      hasProfile: false,
    });
  }, []);

  const setToken = useCallback((token: string) => {
    api.setToken(token);
    refreshUser();
  }, [refreshUser]);

  // Initialize auth state on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
