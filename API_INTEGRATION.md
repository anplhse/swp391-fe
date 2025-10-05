# API Integration Guide

## Tích hợp API đăng nhập từ Backend

### 1. Cấu hình API

File `src/lib/api.ts` chứa cấu hình API client:

```typescript
const API_BASE_URL = "https://b46898d75118.ngrok-free.app/api"; // Backend API endpoint
```

### 2. Authentication Service

File `src/lib/auth.ts` quản lý authentication state và token:

- **Login**: Gọi API đăng nhập và lưu token
- **Logout**: Xóa token và clear session
- **Token Refresh**: Tự động refresh token khi hết hạn
- **Role Mapping**: Map role từ backend sang frontend

### 3. React Hooks

File `src/hooks/useAuth.ts` cung cấp hooks để sử dụng trong components:

```typescript
const { user, isAuthenticated, login, logout, isLoading } = useAuth();
```

### 4. Protected Routes

File `src/components/ProtectedRoute.tsx` bảo vệ các route cần authentication:

```typescript
<ProtectedRoute requiredRole="staff">
  <StaffDashboard />
</ProtectedRoute>
```

### 5. Cách sử dụng

#### Đăng nhập:

```typescript
const { login } = useAuth();

try {
  const response = await login(userName, password);
  // Redirect to appropriate dashboard
} catch (error) {
  // Handle error
}
```

#### Kiểm tra authentication:

```typescript
const { isAuthenticated, user } = useAuth();

if (isAuthenticated) {
  // User is logged in
  console.log("User:", user);
}
```

#### Đăng xuất:

```typescript
const { logout } = useAuth();

await logout();
// User will be redirected to login page
```

### 6. API Endpoints

#### Login

- **URL**: `POST /api/auth/login`
- **Body**: `{ userName: string, password: string }`
- **Response**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "expiresIn": 86400,
  "tokenType": "Bearer",
  "user": {
    "id": 2,
    "email": "staff@example.com",
    "fullName": "Tran Thi B",
    "phoneNumber": "0902345678",
    "role": "STAFF",
    "status": "ACTIVE",
    "createdAt": "2025-10-03 13:22:29",
    "lastLogin": "2025-10-03 13:26:04"
  },
  "requiresVerification": false,
  "message": null
}
```

#### Refresh Token

- **URL**: `POST /api/auth/refresh`
- **Body**: `{ refreshToken: string }`

#### Logout

- **URL**: `POST /api/auth/logout`

### 7. Role Mapping

Backend roles được map sang frontend roles:

| Backend    | Frontend   | Description   |
| ---------- | ---------- | ------------- |
| STAFF      | staff      | Nhân viên     |
| TECHNICIAN | technician | Kỹ thuật viên |
| ADMIN      | admin      | Quản trị viên |
| CUSTOMER   | customer   | Khách hàng    |

### 8. Token Management

- **Access Token**: Lưu trong localStorage, tự động thêm vào header API calls
- **Refresh Token**: Lưu trong localStorage, dùng để refresh access token
- **Auto Refresh**: Tự động refresh token khi gần hết hạn
- **Auto Logout**: Tự động logout khi refresh token hết hạn

### 9. Error Handling

- **Network Errors**: Hiển thị toast error message
- **Authentication Errors**: Redirect về login page
- **Authorization Errors**: Redirect về unauthorized page
- **Token Expired**: Tự động refresh hoặc logout

### 10. Testing

Để test API integration:

1. Đảm bảo backend đang chạy trên `http://localhost:8080`
2. Cập nhật `API_BASE_URL` trong `src/lib/api.ts` nếu cần
3. Sử dụng tài khoản test từ backend
4. Kiểm tra network tab trong DevTools để xem API calls

### 11. Troubleshooting

#### Lỗi CORS:

- Đảm bảo backend có cấu hình CORS cho frontend domain

#### Lỗi 401 Unauthorized:

- Kiểm tra token có hợp lệ không
- Kiểm tra token có hết hạn không

#### Lỗi 403 Forbidden:

- Kiểm tra user có đúng role không
- Kiểm tra route có được bảo vệ đúng không

#### Token không được lưu:

- Kiểm tra localStorage có bị disable không
- Kiểm tra browser có chặn localStorage không
