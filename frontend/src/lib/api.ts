/**
 * AstraVaani API Client
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  ApiResponse,
  ChartSnapshot,
  GuidanceRequest,
  GuidanceResponse,
  Subscription,
  UsageStatus,
  UserProfile,
  AdminStats,
  AdminUserList,
  AdminSubscriptionList,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          this.token = null;
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('astravaani_token', token);
    }
  }

  loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('astravaani_token');
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('astravaani_token');
    }
  }

  // Auth endpoints
  async register(email: string, password: string, phone_number?: string): Promise<ApiResponse<{ user: UserProfile }>> {
    const response = await this.client.post('/auth/register', { email, password, phone_number });
    return { data: response.data };
  }

  async sendOTP(target: string, type: 'email' | 'phone', purpose: string = 'signup'): Promise<ApiResponse<{ message: string }>> {
    const response = await this.client.post('/auth/send-otp', { target, type, purpose });
    return { data: response.data };
  }

  async verifyOTP(target: string, code: string, type: 'email' | 'phone', purpose: string = 'signup'): Promise<ApiResponse<{ verified: boolean }>> {
    const response = await this.client.post('/auth/verify-otp', { target, code, type, purpose });
    return { data: response.data };
  }

  async login(email: string, password: string): Promise<ApiResponse<{ access_token: string }>> {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    return { data: response.data };
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    this.clearToken();
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string; expires_in_minutes: number }>> {
    const response = await this.client.post('/auth/forgot-password', { email });
    return { data: response.data };
  }

  async resetPassword(email: string, code: string, new_password: string): Promise<ApiResponse<{ message: string }>> {
    const response = await this.client.post('/auth/reset-password', { email, code, new_password });
    return { data: response.data };
  }

  async googleAuth(credential: string): Promise<ApiResponse<{ access_token: string }>> {
    const response = await this.client.post('/auth/google', { credential });
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    return { data: response.data };
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const response = await this.client.get('/users/profile');
    return { data: response.data };
  }

  async createProfile(profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const response = await this.client.post('/users/profile', profile);
    return { data: response.data };
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const response = await this.client.patch('/users/profile', profile);
    return { data: response.data };
  }

  // Guidance endpoints
  async askGuidance(request: GuidanceRequest): Promise<ApiResponse<GuidanceResponse>> {
    const response = await this.client.post('/guidance/ask', request);
    return { data: response.data };
  }

  async checkUsage(): Promise<ApiResponse<{ allowed: boolean; usage: UsageStatus }>> {
    const response = await this.client.get('/guidance/check-usage');
    return { data: response.data };
  }

  async getHistory(limit = 20, offset = 0): Promise<ApiResponse<{ messages: any[] }>> {
    const response = await this.client.get('/guidance/history', {
      params: { limit, offset },
    });
    return { data: response.data };
  }

  // Chart endpoints
  async getCurrentChart(): Promise<ApiResponse<ChartSnapshot>> {
    const response = await this.client.get('/charts/current');
    return { data: response.data };
  }

  async recomputeChart(mode?: string): Promise<ApiResponse<ChartSnapshot>> {
    const response = await this.client.post('/charts/recompute', { mode });
    return { data: response.data };
  }

  async explainDataPoint(dataPoint: string): Promise<ApiResponse<{ explanation: string }>> {
    const response = await this.client.get(`/charts/explain/${dataPoint}`);
    return { data: response.data };
  }

  // Subscription endpoints
  async getCurrentSubscription(): Promise<ApiResponse<Subscription>> {
    const response = await this.client.get('/subscriptions/current');
    return { data: response.data };
  }

  async getUsageStatus(): Promise<ApiResponse<UsageStatus>> {
    const response = await this.client.get('/subscriptions/usage');
    return { data: response.data };
  }

  async getPlans(): Promise<ApiResponse<{ plans: any[] }>> {
    const response = await this.client.get('/subscriptions/plans');
    return { data: response.data };
  }

  async upgradePlan(tier: string): Promise<ApiResponse<{
    order_id: string;
    amount: number;
    currency: string;
    key_id: string;
  }>> {
    const response = await this.client.post(`/subscriptions/upgrade/${tier}`);
    return { data: response.data };
  }

  // Person Profile endpoints
  async listPersonProfiles(): Promise<ApiResponse<{ profiles: any[]; total: number; max_profiles: number }>> {
    const response = await this.client.get('/person-profiles');
    return { data: response.data };
  }

  async getPrimaryProfile(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/person-profiles/primary');
    return { data: response.data };
  }

  async getPersonProfile(profileId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/person-profiles/${profileId}`);
    return { data: response.data };
  }

  async createPersonProfile(data: {
    name: string;
    nickname?: string;
    relation_type: string;
    date_of_birth: string;
    time_of_birth?: string;
    place_of_birth?: string;
    is_primary?: boolean;
  }): Promise<ApiResponse<any>> {
    const response = await this.client.post('/person-profiles', data);
    return { data: response.data };
  }

  async updatePersonProfile(profileId: string, data: any): Promise<ApiResponse<any>> {
    const response = await this.client.patch(`/person-profiles/${profileId}`, data);
    return { data: response.data };
  }

  async deletePersonProfile(profileId: string): Promise<void> {
    await this.client.delete(`/person-profiles/${profileId}`);
  }

  async setPrimaryProfile(profileId: string): Promise<ApiResponse<any>> {
    const response = await this.client.post(`/person-profiles/${profileId}/set-primary`);
    return { data: response.data };
  }

  // Admin endpoints
  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    const response = await this.client.get('/admin/stats');
    return { data: response.data };
  }

  async getAdminUsers(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    tier?: string;
  }): Promise<ApiResponse<AdminUserList>> {
    const response = await this.client.get('/admin/users', { params });
    return { data: response.data };
  }

  async getAdminUser(userId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/admin/users/${userId}`);
    return { data: response.data };
  }

  async changeUserTier(userId: string, tier: string): Promise<ApiResponse<{ success: boolean; message: string; new_tier: string }>> {
    const response = await this.client.post(`/admin/users/${userId}/change-tier`, { tier });
    return { data: response.data };
  }

  async toggleUserActive(userId: string): Promise<ApiResponse<{ success: boolean; is_active: boolean }>> {
    const response = await this.client.post(`/admin/users/${userId}/toggle-active`);
    return { data: response.data };
  }

  async getAdminSubscriptions(params?: {
    page?: number;
    page_size?: number;
    status_filter?: string;
    tier_filter?: string;
  }): Promise<ApiResponse<AdminSubscriptionList>> {
    const response = await this.client.get('/admin/subscriptions', { params });
    return { data: response.data };
  }
}

// Export singleton instance
export const api = new ApiClient();

// Initialize token on load
if (typeof window !== 'undefined') {
  api.loadToken();
}
