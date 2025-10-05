import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AuthEventListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const onForcedLogout = () => {
      toast({
        title: 'Phiên đăng nhập đã hết hạn',
        description: 'Vui lòng đăng nhập lại để tiếp tục.',
        variant: 'destructive',
      });
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('auth:logout', onForcedLogout);
    return () => {
      window.removeEventListener('auth:logout', onForcedLogout);
    };
  }, [navigate, location.pathname]);

  return null;
}


