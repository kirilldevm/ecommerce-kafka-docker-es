import { endpoints } from '@/config/endpoints.config';
import { apiConfig } from '@/config/api.config';
import { ensureValidSession } from '@/lib/auth-session';
import { useAuthStore } from '@/stores/auth/auth.store';
import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

let accessTokenGetter: (() => string | null) | null = null;

export function registerAccessTokenGetter(getter: () => string | null): void {
  accessTokenGetter = getter;
}

function isAuthRequest(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  const path = url.startsWith('http') ? new URL(url).pathname : url;
  return (
    path.includes(endpoints.auth.login) ||
    path.includes(endpoints.auth.register) ||
    path.includes(endpoints.auth.refresh) ||
    path.includes(endpoints.auth.logout)
  );
}

function attachAccessToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = accessTokenGetter?.() ?? useAuthStore.getState().getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  if (isAuthRequest(config.url)) {
    return config;
  }

  const hasSession = Boolean(
    useAuthStore.getState().user && useAuthStore.getState().refreshToken,
  );

  if (hasSession) {
    await ensureValidSession();
  }

  return attachAccessToken(config);
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest || originalRequest._retry || isAuthRequest(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshed = await ensureValidSession();
    if (!refreshed) {
      return Promise.reject(error);
    }

    return apiClient(attachAccessToken(originalRequest));
  },
);
