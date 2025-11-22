import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/auth';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function DefaultLayout() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />; // Chưa đăng nhập: về trang gốc
  }

  const roleDisplayName = user.roleDisplayName;
  // Khách hàng: chỉ riêng trang dashboard "/customer" dùng layout công khai (giống trang gốc)
  if (roleDisplayName === 'Khách hàng' && location.pathname === '/customer') {
    return <Outlet />;
  }

  // Service center roles: bọc bằng DashboardLayout
  return (
    <DashboardLayout user={{
      email: user.email,
      role: roleDisplayName,
      userType: 'service'
    }}>
      <Outlet />
    </DashboardLayout>
  );
}
