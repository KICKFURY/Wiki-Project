import { User, LoginForm, RegisterForm, ApiResponse } from '../types';
import { apiClient } from './api';
import { ENDPOINTS } from '../constants/endpoints';

export class AuthService {
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token?: string }>> {
    return apiClient.post(ENDPOINTS.LOGIN, credentials);
  }

  async register(userData: RegisterForm): Promise<ApiResponse<User>> {
    return apiClient.post(ENDPOINTS.REGISTER, userData);
  }

  async getCurrentUser(userId: string): Promise<ApiResponse<User>> {
    return apiClient.get(ENDPOINTS.USER_BY_ID(userId));
  }

  async updateProfile(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put(ENDPOINTS.USER_BY_ID(userId), userData);
  }

  async logout(userId: string): Promise<ApiResponse<any>> {
    return apiClient.post(ENDPOINTS.LOGOUT, { userId });
  }
}

export const authService = new AuthService();
