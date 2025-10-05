import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

export default function DefaultLayout() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />; // Redirect to login if not authenticated
  }

  return (
    <DashboardLayout user={{
      email: user.email,
      role: user.role,
      userType: user.role === 'customer' ? 'customer' : 'service'
    }}>
      <Outlet />
    </DashboardLayout>
  );
}
