import { endpoints } from '@/config/endpoints.config';
import { authHttp } from '@/lib/auth-http';
import type {
  LoginCredentials,
  LoginResponse,
  RefreshResponse,
  RegisterCredentials,
  RegisterResponse,
} from '@/types/auth.types';

export class AuthService {
  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    const { data } = await authHttp.post<RegisterResponse>(
      endpoints.auth.register,
      credentials,
    );
    return data;
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await authHttp.post<LoginResponse>(endpoints.auth.login, credentials);
    return data;
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const { data } = await authHttp.post<RefreshResponse>(endpoints.auth.refresh, {
      refreshToken,
    });
    return data;
  }

  async logout(refreshToken: string): Promise<void> {
    await authHttp.post(endpoints.auth.logout, { refreshToken });
  }
}

export const authService = new AuthService();
