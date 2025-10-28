import { apiClient, LoginRequest, LoginResponse } from './api';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string; // Mapped role for frontend use
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
        // Chuẩn hóa role từ backend sang frontend khi load lại
        const user = {
          ...rawUser,
          role: this.mapRole(rawUser.roleDisplayName || rawUser.role), // Map từ roleDisplayName nếu có
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
      role: this.mapRole(authData.user.roleDisplayName), // Map từ roleDisplayName
      roleDisplayName: authData.user.roleDisplayName, // Lưu nguyên roleDisplayName gốc
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

  async login(credentials: LoginRequest): Promise<LoginResponse & { user: { role: string } }> {
    this.authState.isLoading = true;
    this.notifyListeners();

    try {
      const response = await apiClient.login(credentials);

      // Map role từ backend sang frontend (từ roleDisplayName)
      const mappedUser = {
        ...response.user,
        role: this.mapRole(response.user.roleDisplayName), // Map từ roleDisplayName
        roleDisplayName: response.user.roleDisplayName,
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

      return {
        ...response,
        user: mappedUser,
      };
    } catch (error) {
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
    // Map backend roleDisplayName (from database display_name) to frontend role
    const roleMap: { [key: string]: string } = {
      // From database 'name' column (uppercase)
      'STAFF': 'staff',
      'TECHNICIAN': 'technician',
      'ADMIN': 'admin',
      'CUSTOMER': 'customer',
      // From database 'display_name' column (capitalized)
      'Staff Employee': 'staff',
      'Technician Employee': 'technician',
      'Admin': 'admin',
      'Customer': 'customer',
      // Fallback for other variations
      'Staff': 'staff',
      'Technician': 'technician',
    };

    // Try exact match first
    if (roleMap[backendRole]) {
      return roleMap[backendRole];
    }

    // Try uppercase version
    const normalizedRole = backendRole.toUpperCase();
    if (roleMap[normalizedRole]) {
      return roleMap[normalizedRole];
    }

    // Default fallback
    return backendRole.toLowerCase();
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
