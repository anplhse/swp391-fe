import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (email: string, password: string, role: string, userType: 'customer' | 'service') => {
    // Demo authentication - in real app, this would call an API
    const demoAccounts = {
      'customer@demo.com': { password: 'demo123', role: 'customer', userType: 'customer' },
      'staff@demo.com': { password: 'demo123', role: 'staff', userType: 'service' },
      'tech@demo.com': { password: 'demo123', role: 'technician', userType: 'service' },
      'admin@demo.com': { password: 'demo123', role: 'admin', userType: 'service' }
    };

    const account = demoAccounts[email as keyof typeof demoAccounts];

    if (account && account.password === password) {
      // In real app, this would store user session
      console.log('User logged in:', { email, role: account.role, userType: account.userType });

      toast({
        title: "Đăng nhập thành công!",
        description: `Chào mừng ${account.role === 'customer' ? 'khách hàng' : account.role}`,
      });

      // Redirect based on user type and role
      if (account.userType === 'customer') {
        navigate('/customer');
      } else {
        navigate(`/service/${account.role}`);
      }
    } else {
      toast({
        title: "Đăng nhập thất bại",
        description: "Email hoặc mật khẩu không đúng",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn."
    >
      <LoginForm onLogin={handleLogin} />
    </AuthLayout>
  );
}