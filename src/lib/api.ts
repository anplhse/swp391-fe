// src/lib/api.ts
import API from '@/config/API';
const API_BASE_URL = API.API_URL;
export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    phoneNumber: string;
    roleDisplayName: string; // Backend trả về roleDisplayName thay vì role
    status: string;
    createdAt: string;
    lastLogin: string;
  };
  requiresVerification: boolean;
  message: string | null;
}

export interface ApiError {
  message: string;
  status: number;
}

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.joinUrl(this.baseURL, endpoint);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...options.headers,
      },
      ...options,
    };

    // Thêm token vào header nếu có
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      // Nếu 401: thử refresh token và retry một lần
      if (response.status === 401) {
        // Không refresh cho endpoint refresh/login để tránh loop
        const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/refresh') || endpoint.includes('/auth/logout');
        if (!isAuthEndpoint) {
          const refreshed = await this.tryRefreshToken();
          if (refreshed) {
            const newAccessToken = localStorage.getItem('accessToken');
            const retryConfig: RequestInit = {
              ...config,
              headers: {
                ...(config.headers || {}),
                Authorization: newAccessToken ? `Bearer ${newAccessToken}` : '',
              },
            };
            const retryResponse = await fetch(url, retryConfig);
            if (!retryResponse.ok) {
              const retryErrorData = await retryResponse.json().catch(() => ({}));
              throw new Error(retryErrorData.message || `HTTP error! status: ${retryResponse.status}`);
            }
            return await retryResponse.json();
          }
        }
      }

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        let message = `HTTP error! status: ${response.status}`;
        let parsed: unknown = undefined;
        try { parsed = text ? JSON.parse(text) : undefined; } catch (e) { /* ignore invalid json */ }
        if (
          parsed &&
          typeof parsed === 'object' &&
          'message' in parsed &&
          typeof (parsed as { message?: unknown }).message === 'string'
        ) {
          message = (parsed as { message: string }).message;
        }
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private joinUrl(base: string, endpoint: string): string {
    const b = base.replace(/\/+$/, '');
    const e = endpoint.replace(/^\/+/, '');
    return `${b}/${e}`;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.request<LoginResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  private async tryRefreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      // Đợi lần refresh hiện tại hoàn tất bằng cách polling ngắn
      await new Promise((res) => setTimeout(res, 300));
      return !!localStorage.getItem('accessToken');
    }

    this.isRefreshing = true;
    try {
      const result = await this.refreshToken();
      // Lưu token mới
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      // Phát sự kiện để authService đồng bộ
      window.dispatchEvent(new CustomEvent('auth:tokenRefreshed', { detail: { accessToken: result.accessToken, refreshToken: result.refreshToken } }));
      return true;
    } catch (e) {
      // Refresh thất bại => xóa token để buộc đăng nhập lại
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Thông báo logout bắt buộc
      window.dispatchEvent(new Event('auth:logout'));
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.request<void>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Vehicle APIs
  async getVehicleByVin(vin: string): Promise<{
    vin: string;
    brand: string;
    model: string;
    year: string;
    plate?: string;
    type?: string;
  }> {
    return this.request(`/vehicles/vin/${encodeURIComponent(vin)}`, {
      method: 'GET',
    });
  }

  async addVehicle(vehicleData: {
    vin: string;
    name: string;
    plateNumber: string;
    year: string;
    color: string;
    distanceTraveledKm: number;
    purchasedAt: string;
    vehicleModelId: number;
  }): Promise<{ id?: number }> {
    return this.request<{ id?: number }>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async getVehiclesByUserId(userId: number): Promise<Array<{
    vin: string;
    name: string | null;
    plateNumber: string;
    year: string | null;
    color: string;
    distanceTraveledKm: number;
    purchasedAt: string;
    createdAt: string;
    entityStatus: string;
    userId: number;
    username: string;
    modelId: number;
    modelName: string;
  }>> {
    return this.request(`/vehicles/user/${userId}`, {
      method: 'GET',
    });
  }

  async getVehicleModels(): Promise<Array<{
    id: number;
    brandName: string;
    modelName: string;
    status: string;
  }>> {
    return this.request('/vehicle-models', {
      method: 'GET',
    });
  }

  async getProfile(): Promise<LoginResponse['user']> {
    return this.request<LoginResponse['user']>('/auth/profile');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
