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

        // Try to extract error message from various backend response formats
        if (parsed && typeof parsed === 'object') {
          const errObj = parsed as Record<string, unknown>;

          // Check common error message fields
          if (typeof errObj.message === 'string' && errObj.message) {
            message = errObj.message;
          } else if (typeof errObj.error === 'string' && errObj.error) {
            message = errObj.error;
          } else if (typeof errObj.errorMessage === 'string' && errObj.errorMessage) {
            message = errObj.errorMessage;
          } else if (Array.isArray(errObj.errors) && errObj.errors.length > 0) {
            // Handle validation errors array
            const firstError = errObj.errors[0];
            if (typeof firstError === 'string') {
              message = firstError;
            } else if (typeof firstError === 'object' && firstError && 'message' in firstError && typeof (firstError as { message?: unknown }).message === 'string') {
              message = (firstError as { message: string }).message;
            }
          }
        }

        // Always append status for downstream handlers
        if (!message.includes(`status: ${response.status}`)) {
          message = `${message} (status: ${response.status})`;
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

  async register(data: {
    emailAddress: string;
    password: string;
    fullName: string;
    phoneNumber: string;
  }): Promise<{ message: string; timestamp?: string; path?: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyAccount(payload: { userName: string; code: string }): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
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
    color: string;
    distanceTraveledKm: number | null;
    batteryDegradation: number | null;
    purchasedAt: string; // ISO string with Z
    userId: number;
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
    color: string;
    distanceTraveledKm: number;
    batteryDegradation?: number;
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

  async getAllVehicles(): Promise<Array<{
    vin: string;
    name: string | null;
    plateNumber: string;
    color: string;
    distanceTraveledKm: number;
    batteryDegradation?: number;
    purchasedAt: string;
    createdAt: string;
    entityStatus: string;
    userId: number;
    username: string;
    modelId: number;
    modelName: string;
  }>> {
    return this.request('/vehicles', {
      method: 'GET',
    });
  }

  async updateVehicle(
    vin: string,
    payload: Partial<{
      vin: string;
      name: string | null;
      plateNumber: string;
      color: string;
      distanceTraveledKm: number;
      batteryDegradation: number;
      purchasedAt: string;
      createdAt: string;
      entityStatus: string;
      userId: number;
      username: string;
      modelId: number;
      modelName: string;
    }>
  ): Promise<{
    vin: string;
    name: string | null;
    plateNumber: string;
    color: string;
    distanceTraveledKm: number;
    batteryDegradation: number;
    purchasedAt: string;
    createdAt: string;
    entityStatus: string;
    userId: number;
    username: string;
    modelId: number;
    modelName: string;
  }> {
    return this.request(`/vehicles/${encodeURIComponent(vin)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async getVehicleModels(): Promise<Array<{
    id: number;
    brandName: string;
    modelName: string;
    dimensions?: string;
    seats?: number;
    batteryCapacityKwh?: number;
    rangeKm?: number;
    chargingTimeHours?: number;
    motorPowerKw?: number;
    weightKg?: number;
    status: string;
    createdAt?: string;
  }>> {
    return this.request('/vehicle-models', {
      method: 'GET',
    });
  }

  async getVehicleModelById(id: number): Promise<{
    id: number;
    brandName: string;
    modelName: string;
    dimensions?: string;
    seats?: number;
    batteryCapacityKwh?: number;
    rangeKm?: number;
    chargingTimeHours?: number;
    motorPowerKw?: number;
    weightKg?: number;
    status: string;
    createdAt?: string;
  }> {
    return this.request(`/vehicle-models/${id}`, {
      method: 'GET',
    });
  }

  async updateVehicleModel(
    id: number,
    payload: Partial<{
      brandName: string;
      modelName: string;
      dimensions?: string;
      seats?: number;
      batteryCapacityKwh?: number;
      rangeKm?: number;
      chargingTimeHours?: number;
      motorPowerKw?: number;
      weightKg?: number;
      status?: string;
    }>
  ): Promise<{
    id: number;
    brandName: string;
    modelName: string;
    dimensions?: string;
    seats?: number;
    batteryCapacityKwh?: number;
    rangeKm?: number;
    chargingTimeHours?: number;
    motorPowerKw?: number;
    weightKg?: number;
    status: string;
    createdAt?: string;
  }> {
    return this.request(`/vehicle-models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async getProfile(): Promise<LoginResponse['user']> {
    return this.request<LoginResponse['user']>('/auth/profile');
  }

  async getAllUsers(): Promise<Array<{
    id: number;
    email: string;
    fullName: string;
    phoneNumber: string;
    roleDisplayName: string;
    status: string;
    createdAt: string;
    lastLogin: string | null;
  }>> {
    return this.request('/userprofile', { method: 'GET' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
