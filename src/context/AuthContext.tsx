import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import { getStoredToken, setStoredToken } from '../api/client';
import type { LoginRequest, RegisterRequest } from '../api/types';

// Sesión persistida en localStorage junto al token, para no depender de
// decodificar el JWT en el cliente solo para saber username/roles.
const USER_STORAGE_KEY = 'ems.user';

interface StoredUser {
  username: string;
  roles: string[];
}

interface AuthContextValue {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as StoredUser) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // El estado inicial se hidrata desde localStorage para sobrevivir a recargas de página.
  const [user, setUser] = useState<StoredUser | null>(() => (getStoredToken() ? readStoredUser() : null));

  function persistSession(username: string, roles: string[], accessToken: string) {
    setStoredToken(accessToken);
    const nextUser: StoredUser = { username, roles };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function logout() {
    setStoredToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }

  async function login(credentials: LoginRequest) {
    const response = await authApi.login(credentials);
    persistSession(response.username, response.roles, response.accessToken);
  }

  async function register(payload: RegisterRequest) {
    const response = await authApi.register(payload);
    persistSession(response.username, response.roles, response.accessToken);
  }

  // El interceptor de Axios (api/client.ts) emite este evento cuando el backend
  // devuelve 401. Aquí se reacciona limpiando la sesión para que las rutas
  // protegidas redirijan a /login en el siguiente render.
  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout);
    return () => window.removeEventListener('auth:unauthorized', logout);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.roles.includes('ROLE_ADMIN') ?? false,
      login,
      register,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
