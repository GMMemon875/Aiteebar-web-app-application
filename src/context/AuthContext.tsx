import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  setupAdmin: (fullName: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('aiteebar_token'));
  const [isInitialized, setIsInitialized] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshAuth = async () => {
    try {
      const storedToken = localStorage.getItem('aiteebar_token');
      const res = await fetch('/api/auth/status', {
        headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setIsInitialized(data.initialized);
        setUser(data.currentUser);
        if (!data.currentUser && storedToken) {
          localStorage.removeItem('aiteebar_token');
          setToken(null);
        }
      }
    } catch (err) {
      console.error('Error fetching auth status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      localStorage.setItem('aiteebar_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const setupAdmin = async (fullName: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Admin setup failed' };
      }
      localStorage.setItem('aiteebar_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsInitialized(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('aiteebar_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isInitialized, isLoading, login, setupAdmin, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
