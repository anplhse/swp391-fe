import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/auth';
import { showApiErrorToast } from '@/lib/responseHandler';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, isLoading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });

  // Open register dialog if navigated with state { openRegister: true }
  React.useEffect(() => {
    const anyLoc = location as unknown as { state?: { openRegister?: boolean } };
    if (anyLoc?.state?.openRegister) {
      setIsRegisterOpen(true);
    }
  }, [location]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);

    try {
      const response = await login(email, password);

      toast({
        title: "Đăng nhập thành công!",
        description: `Chào mừng ${response.user.fullName}`,
      });

      // Redirect based on mapped role derived from roleDisplayName
      const userRole = authService.getRoleKey();

      // Map role to valid routes
      const roleRoutes: Record<string, string> = {
        'customer': '/customer',
        'staff': '/service/staff',
        'technician': '/service/technician',
        'admin': '/service/admin',
      };

      const targetRoute = userRole ? roleRoutes[userRole] : undefined;

      if (!targetRoute) {
        toast({
          title: "Lỗi phân quyền",
          description: `Role "${userRole}" không có route tương ứng. Vui lòng liên hệ quản trị viên.`,
          variant: "destructive"
        });
        return;
      }

      navigate(targetRoute);
    } catch (error) {
      console.error('Login error:', error);
      showApiErrorToast(error, toast, "Có lỗi xảy ra khi đăng nhập");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleOpenRegister = () => setIsRegisterOpen(true);

  const handleRegister = async () => {
    try {
      // Basic client-side validation
      if (!registerForm.email || !registerForm.password || !registerForm.fullName || !registerForm.phoneNumber) {
        toast({ title: 'Thiếu thông tin', description: 'Vui lòng điền đầy đủ thông tin đăng ký', variant: 'destructive' });
        return;
      }

      // Call register API via authService
      const { authService } = await import('@/lib/auth');
      const res = await authService.register(registerForm);
      setIsRegisterOpen(false);
      // Lưu email vừa đăng ký để auto-bind ở trang verify
      sessionStorage.setItem('pendingUserName', registerForm.email);
      const pendingEmail = registerForm.email;
      setRegisterForm({ email: '', password: '', fullName: '', phoneNumber: '' });
      toast({ title: 'Đăng ký thành công', description: res.message || 'Vui lòng kiểm tra email để xác minh tài khoản.' });
      navigate('/verify', { state: { userName: pendingEmail } });
    } catch (e) {
      showApiErrorToast(e, toast, 'Có lỗi xảy ra khi đăng ký');
    }
  };

  return (
    <>
      <AuthLayout
        title="Đăng nhập"
        subtitle=""
      >
        <div className="space-y-4">
          <LoginForm onLogin={handleLogin} isLoading={isLoggingIn || isLoading} />
          <div className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <button onClick={handleOpenRegister} className="text-primary hover:underline">Đăng ký</button>
          </div>
        </div>
      </AuthLayout>

      {/* Register Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo tài khoản</DialogTitle>
            <DialogDescription>Điền thông tin để đăng ký. Bạn sẽ nhận email xác minh.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reg-fullname">Họ và tên</Label>
              <Input id="reg-fullname" value={registerForm.fullName} onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input id="reg-email" type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-phone">Số điện thoại</Label>
              <Input id="reg-phone" value={registerForm.phoneNumber} onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Mật khẩu</Label>
              <Input id="reg-password" type="password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegisterOpen(false)}>Hủy</Button>
            <Button onClick={handleRegister}>Đăng ký</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}