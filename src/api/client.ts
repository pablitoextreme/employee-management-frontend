import axios from 'axios';
import type { ApiError } from './types';

// Clave única de localStorage donde se persiste el JWT entre recargas de página.
const TOKEN_STORAGE_KEY = 'ems.accessToken';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// Instancia central de Axios. Todas las llamadas a la API pasan por aquí
// para que el JWT y el manejo de errores se apliquen en un único sitio.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor de request: añade "Authorization: Bearer <token>" si hay sesión activa.
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de response: si el backend responde 401 (token ausente/expirado/inválido),
// se limpia la sesión local y se emite un evento global. AuthContext escucha ese evento
// para actualizar su estado y redirigir a /login — el interceptor no tiene acceso directo
// al router de React, así que la comunicación se hace por CustomEvent.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setStoredToken(null);
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

// Extrae un mensaje legible del ApiError del backend, con fallback genérico.
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    const data = error.response?.data;
    if (data?.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
      return Object.values(data.fieldErrors).join(' — ');
    }
    if (data?.message) return data.message;
  }
  return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
}
