import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Read params from query (?userName=...&code=...) if provided
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      userName: params.get('userName') || '',
      code: params.get('code') || '',
    };
  }, [location.search]);

  useEffect(() => {
    // Priority: navigation state -> query -> sessionStorage
    const navState = (location.state as { userName?: string } | null) || null;
    const fromState = navState?.userName || '';
    const fromQuery = queryParams.userName || '';
    const fromSession = sessionStorage.getItem('pendingUserName') || '';

    const resolvedUser = fromState || fromQuery || fromSession;
    if (resolvedUser) {
      setUserName(resolvedUser);
    } else {
      toast({ title: 'Thiếu email đăng ký', description: 'Vui lòng đăng ký lại để nhận mã xác minh.', variant: 'destructive' });
      navigate('/login', { replace: true, state: { openRegister: true } });
      return;
    }
    if (queryParams.code) setCode(queryParams.code);
  }, [location.state, queryParams, navigate, toast]);

  const handleVerify = async () => {
    if (!userName || !code) {
      toast({ title: 'Thiếu thông tin', description: 'Vui lòng nhập email và mã xác minh', variant: 'destructive' });
      return;
    }
    setIsVerifying(true);
    try {
      const res = await authService.verifyAccount({ userName, code });

      toast({
        title: 'Xác minh thành công',
        description: res.message || 'Bạn có thể đăng nhập ngay bây giờ.'
      });

      // Redirect to login sau khi verify thành công
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (e) {
      const err = e as Error;
      toast({ title: 'Xác minh thất bại', description: err.message || 'Vui lòng thử lại', variant: 'destructive' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md border rounded-xl p-6 bg-card">
        <h1 className="text-2xl font-semibold mb-2">Xác minh tài khoản</h1>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="verify-code">Mã xác minh</Label>
            <Input id="verify-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Nhập mã 6 số" />
          </div>
          <Button className="w-full" onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? 'Đang xác minh...' : 'Xác minh'}
          </Button>
        </div>
      </div>
    </div>
  );
}


