import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/auth';
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredUserType?: 'customer' | 'service';
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredUserType
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required (using roleDisplayName directly)
  const roleDisplayName = user?.roleDisplayName;
  if (requiredRole && roleDisplayName !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check user type if required
  if (requiredUserType) {
    const isCustomer = roleDisplayName === 'Khách hàng';
    const userType = isCustomer ? 'customer' : 'service';
    if (userType !== requiredUserType) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
