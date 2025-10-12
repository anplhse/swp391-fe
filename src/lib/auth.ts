import { apiClient, LoginRequest, LoginResponse } from './api';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.loadFromStorage();
    // Đồng bộ token/user khi có sự kiện từ ApiClient
    window.addEventListener('auth:tokenRefreshed', this.onTokenRefreshed as EventListener);
    window.addEventListener('auth:logout', this.onForcedLogout as EventListener);
  }

  private loadFromStorage() {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');

      if (accessToken && userStr) {
        const rawUser = JSON.parse(userStr);
        // Chuẩn hóa role từ backend sang frontend khi load lại
        const user = {
          ...rawUser,
          role: this.mapRole(rawUser.role),
        };
        this.authState = {
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        };
      } else {
        this.authState = {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        };
      }
      this.notifyListeners();
    } catch (error) {
      console.error('Error loading auth state from storage:', error);
      this.clearAuth();
    }
  }

  private saveToStorage(authData: LoginResponse) {
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    // Lưu user với role đã chuẩn hóa để F5 không lệch role
    const normalizedUser = {
      ...authData.user,
      role: this.mapRole(authData.user.role),
    };
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  }

  private clearStorage() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    this.authState.isLoading = true;
    this.notifyListeners();

    try {
      const response = await apiClient.login(credentials);

      // Map role từ backend sang frontend
      const mappedUser = {
        ...response.user,
        role: this.mapRole(response.user.role),
      };

      this.authState = {
        user: mappedUser,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };

      this.saveToStorage(response);
      this.notifyListeners();

      return response;
    } catch (error) {
      console.warn('API login failed, using mock data:', error);

      // Fallback to mock data when API fails
      const mockResponse = this.getMockLoginResponse(credentials.userName);

      if (mockResponse) {
        const mappedUser = {
          ...mockResponse.user,
          role: this.mapRole(mockResponse.user.role),
        };

        this.authState = {
          user: mappedUser,
          accessToken: mockResponse.accessToken,
          refreshToken: mockResponse.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        };

        this.saveToStorage(mockResponse);
        this.notifyListeners();

        return mockResponse;
      }

      this.authState.isLoading = false;
      this.notifyListeners();
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.clearAuth();
    }
  }

  private clearAuth() {
    this.authState = {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    };
    this.clearStorage();
    this.notifyListeners();
  }

  private onTokenRefreshed = (e: CustomEvent<{ accessToken: string; refreshToken: string }>) => {
    const { accessToken, refreshToken } = e.detail;
    this.authState.accessToken = accessToken;
    this.authState.refreshToken = refreshToken;
    this.notifyListeners();
  };

  private onForcedLogout = () => {
    this.clearAuth();
  };

  private mapRole(backendRole: string): string {
    const roleMap: { [key: string]: string } = {
      'STAFF': 'staff',
      'TECHNICIAN': 'technician',
      'ADMIN': 'admin',
      'CUSTOMER': 'customer',
    };
    return roleMap[backendRole] || backendRole.toLowerCase();
  }

  private getMockLoginResponse(userName: string): LoginResponse | null {
    // Mock data cho testing khi API bị hỏng
    const mockUsers: Record<string, LoginResponse> = {
      'admin@evservice.com': {
        user: {
          id: 1,
          email: 'admin@evservice.com',
          fullName: 'Nguyễn Văn Admin',
          phoneNumber: '0901234567',
          role: 'ADMIN',
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z',
          lastLogin: new Date().toISOString(),
        },
        accessToken: 'mock-access-token-admin',
        refreshToken: 'mock-refresh-token-admin',
        expiresIn: 3600,
        tokenType: 'Bearer',
        requiresVerification: false,
        message: null,
      },
      'staff@evservice.com': {
        user: {
          id: 2,
          email: 'staff@evservice.com',
          fullName: 'Trần Thị Staff',
          phoneNumber: '0901234568',
          role: 'STAFF',
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z',
          lastLogin: new Date().toISOString(),
        },
        accessToken: 'mock-access-token-staff',
        refreshToken: 'mock-refresh-token-staff',
        expiresIn: 3600,
        tokenType: 'Bearer',
        requiresVerification: false,
        message: null,
      },
      'technician@evservice.com': {
        user: {
          id: 3,
          email: 'technician@evservice.com',
          fullName: 'Lê Văn Technician',
          phoneNumber: '0901234569',
          role: 'TECHNICIAN',
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z',
          lastLogin: new Date().toISOString(),
        },
        accessToken: 'mock-access-token-technician',
        refreshToken: 'mock-refresh-token-technician',
        expiresIn: 3600,
        tokenType: 'Bearer',
        requiresVerification: false,
        message: null,
      },
      'customer@evservice.com': {
        user: {
          id: 4,
          email: 'customer@evservice.com',
          fullName: 'Phạm Thị Customer',
          phoneNumber: '0901234570',
          role: 'CUSTOMER',
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z',
          lastLogin: new Date().toISOString(),
        },
        accessToken: 'mock-access-token-customer',
        refreshToken: 'mock-refresh-token-customer',
        expiresIn: 3600,
        tokenType: 'Bearer',
        requiresVerification: false,
        message: null,
      },
    };

    return mockUsers[userName] || null;
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await apiClient.refreshToken();

      this.authState.accessToken = response.accessToken;
      this.authState.refreshToken = response.refreshToken;

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuth();
      return false;
    }
  }

  getAccessToken(): string | null {
    return this.authState.accessToken;
  }

  isTokenExpired(): boolean {
    const token = this.authState.accessToken;
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}

export const authService = AuthService.getInstance();
