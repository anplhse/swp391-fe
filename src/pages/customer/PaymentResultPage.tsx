import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { bookingApi } from '@/lib/bookingUtils';
import { CheckCircle, Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PaymentResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [orderCode, setOrderCode] = useState<string | null>(null);

  // Parse query parameters from VNPay
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      vnp_Amount: params.get('vnp_Amount'),
      vnp_BankCode: params.get('vnp_BankCode'),
      vnp_BankTranNo: params.get('vnp_BankTranNo'),
      vnp_CardType: params.get('vnp_CardType'),
      vnp_OrderInfo: params.get('vnp_OrderInfo'),
      vnp_PayDate: params.get('vnp_PayDate'),
      vnp_ResponseCode: params.get('vnp_ResponseCode'),
      vnp_TmnCode: params.get('vnp_TmnCode'),
      vnp_TransactionNo: params.get('vnp_TransactionNo'),
      vnp_TransactionStatus: params.get('vnp_TransactionStatus'),
      vnp_TxnRef: params.get('vnp_TxnRef'),
      vnp_SecureHash: params.get('vnp_SecureHash'),
    };
  }, [location.search]);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const txnRef = queryParams.vnp_TxnRef;
        if (!txnRef) {
          setPaymentStatus('failed');
          setIsVerifying(false);
          toast({
            title: 'Lỗi',
            description: 'Không tìm thấy thông tin đơn hàng.',
            variant: 'destructive',
          });
          return;
        }

        setOrderCode(txnRef);

        // Check if payment is successful based on VNPay response
        const isSuccess = queryParams.vnp_ResponseCode === '00' && queryParams.vnp_TransactionStatus === '00';

        // Call appropriate API - backend handles all logic
        if (isSuccess) {
          await bookingApi.simulateIpnSuccess(txnRef);
          setPaymentStatus('success');
          toast({
            title: 'Thanh toán thành công!',
            description: 'Giao dịch của bạn đã được xử lý thành công.',
          });
        } else {
          await bookingApi.simulateIpnFail(txnRef);
          setPaymentStatus('failed');
          toast({
            title: 'Thanh toán thất bại',
            description: 'Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        setPaymentStatus('failed');
        toast({
          title: 'Lỗi xử lý',
          description: 'Có lỗi xảy ra khi xử lý kết quả thanh toán.',
          variant: 'destructive',
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [queryParams, toast]);

  const formatAmount = (amount: string | null) => {
    if (!amount) return 'N/A';
    const numAmount = parseInt(amount) / 100; // VNPay returns amount in cents
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numAmount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    // Format: yyyyMMddHHmmss
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
  };

  const handleViewBooking = () => {
    const bookingId = localStorage.getItem('latestBookingId');
    if (bookingId) {
      navigate('/customer/booking-status', { state: { bookingId: Number(bookingId) } });
    } else {
      navigate('/customer/bookings');
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <h2 className="text-2xl font-semibold">Đang xử lý kết quả thanh toán...</h2>
          <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-2xl border rounded-2xl p-8 bg-card shadow-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          {paymentStatus === 'success' ? (
            <>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-green-600">Thanh toán thành công!</h1>
              <p className="text-muted-foreground text-lg">
                Giao dịch của bạn đã được xử lý thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center">
                <X className="w-16 h-16 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-red-600">Thanh toán thất bại</h1>
              <p className="text-muted-foreground text-lg">
                Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
              </p>
            </>
          )}
        </div>

        {/* Payment Details */}
        {paymentStatus === 'success' && (
          <div className="border rounded-lg p-6 bg-muted/50 space-y-3">
            <h2 className="text-xl font-semibold mb-4">Thông tin giao dịch</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Mã đơn hàng:</span>
                <p className="font-medium font-mono">{orderCode || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Mã giao dịch:</span>
                <p className="font-medium font-mono">{queryParams.vnp_TransactionNo || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Số tiền:</span>
                <p className="font-medium text-green-600">{formatAmount(queryParams.vnp_Amount)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Ngân hàng:</span>
                <p className="font-medium">{queryParams.vnp_BankCode || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Loại thẻ:</span>
                <p className="font-medium">{queryParams.vnp_CardType || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Thời gian thanh toán:</span>
                <p className="font-medium">{formatDate(queryParams.vnp_PayDate)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                <div className="mt-1">
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    Thành công
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {paymentStatus === 'success' && (
            <Button onClick={handleViewBooking} size="lg">
              Xem chi tiết đơn hàng
            </Button>
          )}
          <Button
            variant={paymentStatus === 'success' ? 'outline' : 'default'}
            onClick={() => navigate('/customer')}
            size="lg"
          >
            Về trang chủ
          </Button>
          {paymentStatus === 'failed' && (
            <Button
              variant="outline"
              onClick={() => navigate('/customer/bookings')}
              size="lg"
            >
              Xem lịch sử đặt lịch
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
