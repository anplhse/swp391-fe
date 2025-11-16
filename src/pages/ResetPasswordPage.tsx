import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { showApiErrorToast } from '@/lib/responseHandler';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      toast({
        title: 'Token không hợp lệ',
        description: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
        variant: 'destructive',
      });
      navigate('/forgot-password');
    }
  }, [token, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: 'Token không hợp lệ',
        description: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
        variant: 'destructive',
      });
      return;
    }

    if (!password || !confirmPassword) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Mật khẩu quá ngắn',
        description: 'Mật khẩu phải có ít nhất 6 ký tự.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Mật khẩu không khớp',
        description: 'Mật khẩu xác nhận không khớp với mật khẩu mới.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.resetPassword(token, password);
      setIsSuccess(true);
      toast({
        title: 'Đặt lại mật khẩu thành công',
        description: 'Mật khẩu của bạn đã được đặt lại. Vui lòng đăng nhập lại.',
      });
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      showApiErrorToast(error, toast, 'Không thể đặt lại mật khẩu. Token có thể đã hết hạn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Đặt lại mật khẩu thành công"
        subtitle="Mật khẩu của bạn đã được đặt lại thành công"
      >
        <div className="space-y-4 text-center">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển đến trang đăng nhập...
            </p>
          </div>
          <Button
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Đăng nhập ngay
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle="Nhập mật khẩu mới của bạn"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu mới</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              required
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !password || !confirmPassword}
        >
          {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </Button>
      </form>
    </AuthLayout>
  );
}

