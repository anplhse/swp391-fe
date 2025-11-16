import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { bookingApi } from '@/lib/bookingUtils';
import { showApiErrorToast } from '@/lib/responseHandler';
import { CheckCircle, X, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      // Get orderCode from URL params (VNPay returns vnp_TxnRef)
      const orderCode = searchParams.get('vnp_TxnRef') || searchParams.get('orderCode');
      
      if (!orderCode) {
        setError('Không tìm thấy mã đơn hàng trong URL');
        setIsProcessing(false);
        return;
      }

      try {
        // Simulate IPN success
        const result = await bookingApi.simulateIpnSuccess(orderCode);
        
        if (result.rspCode === '00') {
          setIsSuccess(true);
          toast({
            title: 'Thanh toán thành công',
            description: result.message || 'Đơn hàng của bạn đã được thanh toán thành công.',
          });
        } else {
          setError(result.message || 'Thanh toán không thành công');
        }
      } catch (err) {
        console.error('Payment processing failed:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xử lý thanh toán');
        toast({
          title: 'Lỗi',
          description: 'Không thể xử lý thanh toán. Vui lòng liên hệ hỗ trợ.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, toast]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
          {isProcessing ? (
            <>
              <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
              <h1 className="text-2xl font-bold">Đang xử lý thanh toán...</h1>
              <p className="text-muted-foreground">
                Vui lòng đợi trong giây lát, chúng tôi đang xác nhận giao dịch của bạn.
              </p>
            </>
          ) : isSuccess ? (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-green-600">Thanh toán thành công!</h1>
              <p className="text-muted-foreground">
                Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xác nhận và sẽ được xử lý sớm nhất.
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button onClick={() => navigate('/customer/bookings')}>
                  Xem lịch hẹn của tôi
                </Button>
                <Button variant="outline" onClick={() => navigate('/customer')}>
                  Về trang chủ
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-10 h-10 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-red-600">Thanh toán không thành công</h1>
              <p className="text-muted-foreground">
                {error || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.'}
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button onClick={() => navigate('/customer/bookings')}>
                  Xem lịch hẹn của tôi
                </Button>
                <Button variant="outline" onClick={() => navigate('/customer')}>
                  Về trang chủ
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

