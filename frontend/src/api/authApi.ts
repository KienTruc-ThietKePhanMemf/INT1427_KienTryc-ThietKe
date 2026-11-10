import axiosClient from './axiosClient';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../types';

/**
 * Authentication API Service
 * Interacts with FastAPI backend auth endpoints (/auth/...)
 */
export const authApi = {
  /**
   * Đăng ký tài khoản người dùng mới
   * POST /auth/register
   * Request JSON: { full_name, email, password }
   * Response: { id, email, full_name, created_at }
   */
  register: async (credentials: RegisterCredentials): Promise<User> => {
    const response = await axiosClient.post<User>('/auth/register', credentials);
    return response.data;
  },

  /**
   * Đăng nhập hệ thống (OAuth2PasswordRequestForm standard)
   * POST /auth/login
   * Request Form Data (x-www-form-urlencoded): username (email), password
   * Response: { access_token, token_type }
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const params = new URLSearchParams();
    params.append('username', credentials.username.trim());
    params.append('password', credentials.password);

    const response = await axiosClient.post<AuthResponse>('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết của người dùng đang đăng nhập
   * GET /auth/me
   * Header: Authorization: Bearer <token>
   * Response: User
   */
  getMe: async (): Promise<User> => {
    const response = await axiosClient.get<User>('/auth/me');
    return response.data;
  },
};

// Named exports for convenient direct imports
export const registerApi = authApi.register;
export const loginApi = authApi.login;
export const getMeApi = authApi.getMe;

export default authApi;

