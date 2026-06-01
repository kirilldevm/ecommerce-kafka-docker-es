import { endpoints } from '@/config/endpoints.config';
import { apiClient } from '@/lib/api-client';
import type {
  LoginCredentials,
  LoginResponse,
  RefreshResponse,
  RegisterCredentials,
  RegisterResponse,
} from '@/types/auth.types';

export class AuthService {
  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    const { data } = await apiClient.post<RegisterResponse>(
      endpoints.auth.register,
      credentials,
    );
    return data;
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      endpoints.auth.login,
      credentials,
    );
    return data;
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const { data } = await apiClient.post<RefreshResponse>(endpoints.auth.refresh, {
      refreshToken,
    });
    return data;
  }

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post(endpoints.auth.logout, { refreshToken });
  }
}

export const authService = new AuthService();
