// src/lib/api.ts
import API from '@/config/API';
import { parseErrorResponse } from './responseHandler';

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
              const message = await parseErrorResponse(retryResponse);
              throw new Error(message);
            }
            return await retryResponse.json();
          }
        }
      }

      if (!response.ok) {
        // Use centralized error handler to extract message from BE
        const message = await parseErrorResponse(response);
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

  async verifyAccount(payload: { userName: string; code: string }): Promise<{ message: string; timestamp?: string; path?: string }> {
    return this.request<{ message: string; timestamp?: string; path?: string }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async forgotPassword(emailAddress: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ emailAddress }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
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
    name: string;
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
    return this.request<{
      vin: string;
      name: string;
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
    }>(`/vehicles/${encodeURIComponent(vin)}`, {
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

  async deleteVehicle(vin: string): Promise<{
    vin: string;
    name: string;
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
      method: 'DELETE',
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
    imageUrl?: string;
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
    imageUrl?: string;
    status: string;
    createdAt?: string;
  }> {
    return this.request(`/vehicle-models/${id}`, {
      method: 'GET',
    });
  }

  async createVehicleModel(payload: {
    brandName: string;
    modelName: string;
    dimensions?: string;
    seats?: number;
    batteryCapacityKwh?: number;
    rangeKm?: number;
    chargingTimeHours?: number;
    motorPowerKw?: number;
    weightKg?: number;
    imageUrl?: string;
  }): Promise<{
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
    imageUrl?: string;
    status: string;
    createdAt?: string;
  }> {
    return this.request('/vehicle-models', {
      method: 'POST',
      body: JSON.stringify(payload),
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
      imageUrl?: string;
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
    imageUrl?: string;
    status: string;
    createdAt?: string;
  }> {
    return this.request(`/vehicle-models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async getVehicleModelEnum(): Promise<{
    name: string;
    enumValue: string[];
    description: string;
    type: string;
  }> {
    return this.request('/vehicle-models/enum', {
      method: 'GET',
    });
  }

  async getBookingStatusEnum(): Promise<{
    name: string;
    enumValue: string[];
    description: string;
    type: string;
  }> {
    return this.request('/bookings/status', {
      method: 'GET',
    });
  }

  async getPartCategories(): Promise<{
    name: string;
    enumValue: string[];
    description: string;
    type: string;
  }> {
    return this.request('/parts/categories', {
      method: 'GET',
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

  async updateUserProfile(
    id: number,
    payload: { fullName: string; phoneNumber: string }
  ): Promise<{
    id: number;
    email: string;
    fullName: string;
    phoneNumber: string;
    roleDisplayName: string;
    status: string;
    createdAt: string;
    lastLogin: string | null;
  }> {
    return this.request(`/userprofile/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async createUserProfile(payload: {
    email: string;
    fullName: string;
    phoneNumber: string;
    roleDisplayName: string;
    password: string;
  }): Promise<{
    id: number;
    email: string;
    fullName: string;
    phoneNumber: string;
    roleDisplayName: string;
    status: string;
    createdAt: string;
    lastLogin: string | null;
  }> {
    return this.request('/userprofile', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getUserProfileRoles(): Promise<{
    name: string;
    enumValue: string[];
    description: string;
    type: string;
  }> {
    return this.request('/userprofile/roles', {
      method: 'GET',
    });
  }

  async getParts(): Promise<Array<{
    id: number;
    name: string;
    partNumber: string;
    manufacturer: string;
    category: string;
    currentUnitPrice: number;
    quantity: number;
    reserved: number;
    used: number;
    all: number;
    imageUrl: string | null;
    status: string;
    createdAt: string;
    catalogsEnum: {
      name: string;
      enumValue: string[];
      description: string;
      type: string;
    } | null;
    vehicleModelsEnum: {
      name: string;
      enumValue: string[];
      description: string;
      type: string;
    } | null;
    catalogVehicleMapping: Record<string, string[]> | null;
  }>> {
    return this.request('/parts', {
      method: 'GET',
    });
  }

  async createPart(payload: {
    name: string;
    partNumber: string;
    manufacturer: string;
    category: string;
    currentUnitPrice: number;
    quantity: number;
    imageUrl?: string;
  }): Promise<{
    id: number;
    name: string;
    partNumber: string;
    manufacturer: string;
    category: string;
    currentUnitPrice: number;
    quantity: number;
    reserved: number;
    used: number;
    all: number;
    imageUrl: string | null;
    status: string;
    createdAt: string;
    catalogsEnum: null;
    vehicleModelsEnum: null;
    catalogVehicleMapping: null;
  }> {
    return this.request('/parts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async increasePartStock(partId: number, amount: number): Promise<{
    id: number;
    name: string;
    partNumber: string;
    manufacturer: string;
    category: string;
    currentUnitPrice: number;
    quantity: number;
    reserved: number;
    used: number;
    all: number;
    imageUrl: string | null;
    status: string;
    createdAt: string;
    catalogsEnum: {
      name: string;
      enumValue: string[];
      description: string;
      type: string;
    } | null;
    vehicleModelsEnum: {
      name: string;
      enumValue: string[];
      description: string;
      type: string;
    } | null;
    catalogVehicleMapping: Record<string, string[]> | null;
  }> {
    return this.request(`/parts/${partId}/stock/increase?amount=${amount}`, {
      method: 'POST',
    });
  }

  async decreasePartStock(partId: number, amount: number): Promise<{
    id: number;
    name: string;
    partNumber: string;
    manufacturer: string;
    category: string;
    currentUnitPrice: number;
    quantity: number;
    reserved: number;
    used: number;
    all: number;
    imageUrl: string | null;
    status: string;
    createdAt: string;
    catalogsEnum: {
      name: string;
      enumValue: string[];
      description: string;
      type: string;
    } | null;
    vehicleModelsEnum: {
      name: string;
      enumValue: string[];
      description: string;
      type: string;
    } | null;
    catalogVehicleMapping: Record<string, string[]> | null;
  }> {
    return this.request(`/parts/${partId}/stock/decrease?amount=${amount}`, {
      method: 'POST',
    });
  }

  async updatePart(partId: number, payload: {
    name: string;
    partNumber: string;
    manufacturer: string;
    category: string;
    currentUnitPrice: number;
    quantity: number;
    reserved: number;
    used: number;
    imageUrl?: string;
  }): Promise<{
    id: number;
    name: string;
    partNumber: string;
    manufacturer: string;
    category: string;
    currentUnitPrice: number;
    quantity: number;
    reserved: number;
    used: number;
    all: number;
    imageUrl: string | null;
    status: string;
    createdAt: string;
    catalogsEnum: {
      name: string;
      enumValue: string[];
      description: string;
      type: string;
    } | null;
    vehicleModelsEnum: {
      name: string;
      enumValue: string[];
      description: string;
      type: string;
    } | null;
    catalogVehicleMapping: Record<string, string[]> | null;
  }> {
    return this.request(`/parts/${partId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async getMaintenanceCatalogs(): Promise<Array<{
    id: number;
    name: string;
    description: string;
    maintenanceServiceCategory: string;
    status: string;
    createdAt: string;
    models: Array<{
      modelId: number;
      modelName: string;
      modelBrand: string;
      estTimeMinutes: number;
      maintenancePrice: number;
      notes: string | null;
      createdAt: string;
      parts: Array<{
        partId: number;
        partName: string;
        quantityRequired: number;
        isOptional: boolean;
        notes: string | null;
      }>;
    }>;
  }>> {
    return this.request('/maintenance-catalogs', {
      method: 'GET',
    });
  }

  async getMaintenanceCatalogCategories(): Promise<{
    name: string;
    enumValue: string[];
    description: string;
    type: string;
  }> {
    return this.request('/maintenance-catalogs/enum/category', {
      method: 'GET',
    });
  }

  // Payment APIs
  async getPaymentHistory(bookingId: number): Promise<Array<{
    id: number;
    invoiceNumber: string;
    orderCode: string;
    amount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    paidAt: string;
    transactionRef: string;
    responseCode: string;
  }>> {
    return this.request(`/payments/history/${bookingId}`, {
      method: 'GET',
    });
  }

  async getCustomerPaymentHistory(customerId: number): Promise<Array<{
    id: number;
    invoiceNumber: string;
    orderCode: string;
    amount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    paidAt: string;
    transactionRef: string;
    responseCode: string;
  }>> {
    return this.request(`/payments/history/customers/${customerId}`, {
      method: 'GET',
    });
  }

  // Feedback APIs
  async getFeedbackTags(id?: number): Promise<Array<{
    id: number;
    content: string;
    ratingTarget: number;
  }>> {
    const endpoint = id ? `/feedbacks/tags?id=${id}` : '/feedbacks/tags';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async getFeedbackByBookingId(bookingId: number): Promise<{
    id: number;
    rating: number;
    comment: string;
    tags: Array<{
      id: number;
      content: string;
      ratingTarget: number;
    }>;
    bookingId: number;
    customerId: number;
    customerName: string;
    createdAt: string;
  } | null> {
    return this.request(`/feedbacks/booking/${bookingId}`, {
      method: 'GET',
    });
  }

  async getFeedbackByCustomerId(customerId: number): Promise<Array<{
    id: number;
    rating: number;
    comment: string;
    tags: Array<{
      id: number;
      content: string;
      ratingTarget: number;
    }>;
    bookingId: number;
    customerId: number;
    customerName: string;
    createdAt: string;
  }>> {
    return this.request(`/feedbacks/user/${customerId}`, {
      method: 'GET',
    });
  }

  async getAllFeedbacks(): Promise<Array<{
    id: number;
    rating: number;
    comment: string;
    tags: Array<{
      id: number;
      content: string;
      ratingTarget: number;
    }>;
    bookingId: number;
    customerId: number;
    customerName: string;
    createdAt: string;
  }>> {
    return this.request('/feedbacks', {
      method: 'GET',
    });
  }

  async askChatBot(question: string): Promise<{
    answer?: string;
    message?: string;
  }> {
    const url = this.joinUrl(this.baseURL, '/bot/ask');
    const token = localStorage.getItem('accessToken');

    const config: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ question }),
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const message = await parseErrorResponse(response);
        throw new Error(message);
      }

      // Try to parse as JSON first
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // If not JSON, read as text
        const text = await response.text();
        return { answer: text, message: text };
      }
    } catch (error) {
      console.error('Chatbot API request failed:', error);
      throw error;
    }
  }

  async createFeedback(payload: {
    rating: number;
    comment: string;
    tagIds?: number[];
    bookingId: number;
  }): Promise<{
    id: number;
    rating: number;
    comment: string;
    tags: Array<{
      id: number;
      content: string;
      ratingTarget: number;
    }>;
    bookingId: number;
    customerId: number;
    customerName: string;
    createdAt: string;
  }> {
    // Chỉ gửi tagIds nếu có tags được chọn
    const requestPayload: {
      rating: number;
      comment: string;
      bookingId: number;
      tagIds?: number[];
    } = {
      rating: payload.rating,
      comment: payload.comment,
      bookingId: payload.bookingId,
    };

    // Chỉ thêm tagIds nếu có tags được chọn
    if (payload.tagIds && payload.tagIds.length > 0) {
      requestPayload.tagIds = payload.tagIds;
    }

    return this.request('/feedbacks', {
      method: 'POST',
      body: JSON.stringify(requestPayload),
    });
  }

  async updateFeedback(
    feedbackId: number,
    payload: {
      rating: number;
      comment: string;
      bookingId: number;
      tagIds?: number[];
    }
  ): Promise<{
    id: number;
    rating: number;
    comment: string;
    tags: Array<{
      id: number;
      content: string;
      ratingTarget: number;
    }>;
    bookingId: number;
    customerId: number;
    customerName: string;
    createdAt: string;
  }> {
    // Chỉ gửi tagIds nếu có tags được chọn
    const requestPayload: {
      rating: number;
      comment: string;
      bookingId: number;
      tagIds?: number[];
    } = {
      rating: payload.rating,
      comment: payload.comment,
      bookingId: payload.bookingId,
    };

    // Chỉ thêm tagIds nếu có tags được chọn
    if (payload.tagIds && payload.tagIds.length > 0) {
      requestPayload.tagIds = payload.tagIds;
    }

    return this.request(`/feedbacks/${feedbackId}`, {
      method: 'PUT',
      body: JSON.stringify(requestPayload),
    });
  }

}

export const apiClient = new ApiClient(API_BASE_URL);
