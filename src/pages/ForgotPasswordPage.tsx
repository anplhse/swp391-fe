import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { showApiErrorToast } from '@/lib/responseHandler';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập email của bạn',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.forgotPassword(email);
      setIsSubmitted(true);
      toast({
        title: 'Gửi email thành công',
        description: 'Vui lòng kiểm tra email để nhận link đặt lại mật khẩu.',
      });
    } catch (error) {
      showApiErrorToast(error, toast, 'Không thể gửi email. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email của bạn để nhận link đặt lại mật khẩu"
    >
      <div className="space-y-4">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Đang gửi...' : 'Gửi email đặt lại mật khẩu'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Chúng tôi đã gửi link đặt lại mật khẩu đến email <strong>{email}</strong>.
                Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="w-full"
            >
              Gửi lại email
            </Button>
          </div>
        )}
        <div className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

