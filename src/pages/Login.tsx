import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isLoading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const mapBackendRoleToRoute = (backendRole: string): string => {
    const map: Record<string, string> = {
      'STAFF': 'staff',
      'TECHNICIAN': 'technician',
      'ADMIN': 'admin',
      'CUSTOMER': 'customer',
    };
    return map[backendRole] || backendRole.toLowerCase();
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);

    try {
      const response = await login(email, password);

      toast({
        title: "Đăng nhập thành công!",
        description: `Chào mừng ${response.user.fullName}`,
      });

      // Redirect based on backend role
      const mapped = mapBackendRoleToRoute(response.user.role);
      if (mapped === 'customer') {
        navigate('/customer');
      } else {
        navigate(`/service/${mapped}`);
      }
    } catch (error) {
      const err = error as { message?: string };
      console.error('Login error:', err);
      toast({
        title: "Đăng nhập thất bại",
        description: err?.message || "Có lỗi xảy ra khi đăng nhập",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn."
    >
      <LoginForm onLogin={handleLogin} isLoading={isLoggingIn || isLoading} />
    </AuthLayout>
  );
}