import { apiClient, LoginRequest, LoginResponse } from './api';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  roleDisplayName: string; // Original roleDisplayName from backend
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
        const user = { ...rawUser };
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
    // Lưu user nguyên trạng từ backend (dùng roleDisplayName)
    const normalizedUser = {
      ...authData.user,
      roleDisplayName: authData.user.roleDisplayName,
    };
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  }

  private clearStorage() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Clear booking-related data to prevent data leakage between users
    localStorage.removeItem('latestBookingId');
    localStorage.removeItem('latestBooking');
    localStorage.removeItem('bookingVinData');
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
    // Clear booking-related data from previous user session
    localStorage.removeItem('latestBookingId');
    localStorage.removeItem('latestBooking');
    localStorage.removeItem('bookingVinData');

    this.authState.isLoading = true;
    this.notifyListeners();

    try {
      const response = await apiClient.login(credentials);

      this.authState = {
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };

      this.saveToStorage(response);
      this.notifyListeners();

      return response;
    } catch (error) {
      this.authState.isLoading = false;
      this.notifyListeners();
      throw error;
    }
  }

  async register(data: { email: string; password: string; fullName: string; phoneNumber: string }): Promise<{ message: string }> {
    const res = await apiClient.register({
      emailAddress: data.email,
      password: data.password,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
    });
    return { message: res.message };
  }

  async verifyAccount(payload: { userName: string; code: string }): Promise<{ message: string; timestamp?: string; path?: string }> {
    const response = await apiClient.verifyAccount(payload);
    // Verify chỉ trả về message, không tự động login
    // User cần login riêng sau khi verify thành công
    return response;
  }

  // Get role display name directly from backend
  getRoleDisplayName(): string | null {
    return this.authState.user?.roleDisplayName || null;
  }

  // Check if user is customer
  isCustomer(): boolean {
    return this.authState.user?.roleDisplayName === 'Khách hàng';
  }

  // Check if user is service role (staff, technician, admin)
  isServiceRole(): boolean {
    const role = this.authState.user?.roleDisplayName;
    return role === 'Nhân viên' || role === 'Kỹ thuật viên' || role === 'Quản trị viên';
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
