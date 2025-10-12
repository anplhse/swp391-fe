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
    role: string;
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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

  // Có thể thêm các API khác ở đây
  async getVehicleByVin(vin: string): Promise<{
    vin: string;
    brand: string;
    model: string;
    year: string;
    plate?: string;
    type?: string;
  }> {
    // Mock data cho testing - sẽ thay bằng API thật sau
    const mockVehicles: Record<string, {
      vin: string;
      brand: string;
      model: string;
      year: string;
      plate?: string;
      type?: string;
    }> = {
      'RL4A1234567890ABCD': {
        vin: 'RL4A1234567890ABCD',
        brand: 'VinFast',
        model: 'VF8',
        year: '2024',
        plate: '30A-123.45',
        type: 'SUV'
      },
      'RL4B9876543210EFGH': {
        vin: 'RL4B9876543210EFGH',
        brand: 'VinFast',
        model: 'VF9',
        year: '2023',
        plate: '29B-678.90',
        type: 'SUV'
      },
      'RL4C5555555555IJKL': {
        vin: 'RL4C5555555555IJKL',
        brand: 'VinFast',
        model: 'VFe34',
        year: '2024',
        plate: '51C-111.11',
        type: 'Sedan'
      },
      'RL4D1111111111MNOP': {
        vin: 'RL4D1111111111MNOP',
        brand: 'VinFast',
        model: 'VF5',
        year: '2023',
        plate: '43D-222.22',
        type: 'Hatchback'
      },
      'TEST123456789ABCD': {
        vin: 'TEST123456789ABCD',
        brand: 'VinFast',
        model: 'VF8',
        year: '2024',
        plate: '30A-TEST.01',
        type: 'SUV'
      }
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const vehicle = mockVehicles[vin.toUpperCase()];
    if (!vehicle) {
      throw new Error('Không tìm thấy thông tin xe với mã VIN này');
    }

    return vehicle;

    // Uncomment khi có API thật:
    // return this.request(`/vehicles/vin/${encodeURIComponent(vin)}`, {
    //   method: 'GET',
    // });
  }
  async getProfile(): Promise<LoginResponse['user']> {
    return this.request<LoginResponse['user']>('/auth/profile');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
