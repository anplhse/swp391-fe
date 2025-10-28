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

  const handleLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);

    try {
      const response = await login(email, password);

      toast({
        title: "Đăng nhập thành công!",
        description: `Chào mừng ${response.user.fullName}`,
      });

      // Redirect based on mapped role (already mapped by auth.ts)
      const userRole = response.user.role;
      if (userRole === 'customer') {
        navigate('/customer');
      } else {
        navigate(`/service/${userRole}`);
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
      subtitle=""
    >
      <LoginForm onLogin={handleLogin} isLoading={isLoggingIn || isLoading} />
    </AuthLayout>
  );
}