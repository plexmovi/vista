import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthState, APP_CONFIG } from '../types';

interface AuthContextType extends AuthState {
  login: (pin: string) => boolean;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    pin: null
  });
  const [error, setError] = useState<string | null>(null);

  // Verificar sesión existente al cargar
  useEffect(() => {
    const storedAuth = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH);
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        if (parsed.isAuthenticated && parsed.pin) {
          setAuthState(parsed);
        }
      } catch {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH);
      }
    }
  }, []);

  const login = useCallback((pin: string): boolean => {
    setError(null);

    // Verificar PIN (usar variable de entorno o valor por defecto)
    const validPin = import.meta.env.VITE_ADMIN_PIN || APP_CONFIG.DEFAULT_PIN;

    if (pin === validPin) {
      const newState = { isAuthenticated: true, pin };
      setAuthState(newState);
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH, JSON.stringify(newState));
      return true;
    } else {
      setError('PIN incorrecto. Intenta de nuevo.');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({ isAuthenticated: false, pin: null });
    setError(null);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH);
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
