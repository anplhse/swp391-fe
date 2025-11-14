import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { bookingApi } from '@/lib/bookingUtils';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, X, CreditCard } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type ApiBooking = {
  id: number;
  customerId: number;
  customerName: string;
  vehicleVin: string;
  vehicleModel: string;
  scheduleDateTime: {
    format: string;
    value: string;
    timezone: string | null;
  };
  bookingStatus: string;
  createdAt: string;
  updatedAt: string;
  catalogDetails?: Array<{
    id: number;
    catalogId: number;
    serviceName: string;
    description: string;
  }>;
  invoice?: {
    id: number;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    invoiceLines: Array<{
      id: number;
      itemDescription: string;
      itemType: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  };
};

type FallbackService = {
  id?: string | number;
  name?: string;
  description?: string;
};

export default function BookingConfirmationPage() {
  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const load = async () => {
      try {
        const idFromState = location.state?.bookingId as number | undefined;
        const latestId = localStorage.getItem('latestBookingId');
        if (idFromState || latestId) {
          const id = idFromState ?? Number(latestId);
          const data = await bookingApi.getBookingById(Number(id));
          setBooking(data);
        } else {
          // Fallback (cũ) để không trắng trang nếu thiếu id
          const old = localStorage.getItem('latestBooking');
          if (old) {
            const parsed = JSON.parse(old);
            const [date, time] = `${parsed?.date || ''} ${parsed?.time || ''}`.trim().split(' ');
            const fb: ApiBooking = {
              id: Date.now(),
              customerId: 0,
              customerName: '',
              vehicleVin: parsed?.vehicle?.vin || '',
              vehicleModel: parsed?.vehicle?.model || '',
              scheduleDateTime: { format: 'yyyy-MM-dd HH:mm:ss', value: `${date || ''} ${time || ''}`, timezone: null },
              bookingStatus: 'PENDING',
              createdAt: parsed?.createdAt || new Date().toISOString(),
              updatedAt: parsed?.createdAt || new Date().toISOString(),
              catalogDetails: ((parsed?.services || []) as FallbackService[]).map((s, i: number) => ({
                id: i + 1,
                catalogId: Number(s.id) || i + 1,
                serviceName: s.name || '',
                description: s.description || ''
              }))
            };
            setBooking(fb);
          }
        }
      } catch (e) {
        console.error('Load booking failed', e);
        toast({ title: 'Lỗi', description: 'Không tải được thông tin lịch hẹn', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [location.state, toast]);

  const handleCancelBooking = () => {
    toast({
      title: 'Thông báo',
      description: 'Tính năng hủy lịch sẽ được bổ sung sau.',
    });
  };

  const handleEditBooking = () => {
    if (!booking) return;

    // Chuyển về trang đặt lịch với dữ liệu hiện tại
    navigate('/customer/booking', {
      state: {
        preselectedVin: booking.vehicleVin,
        preselectedVehicle: { vin: booking.vehicleVin, modelName: booking.vehicleModel },
        editMode: true,
        existingBooking: null
      }
    });
  };

  const handlePayment = useCallback(async () => {
    if (!booking || !booking.invoice?.id) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy thông tin hóa đơn để thanh toán.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessingPayment(true);
    try {
      const result = await bookingApi.createPayment(booking.invoice.id);
      // Redirect to payment URL
      window.location.href = result.paymentUrl;
    } catch (error) {
      console.error('Payment creation failed', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tạo thanh toán. Vui lòng thử lại.',
        variant: 'destructive',
      });
      setIsProcessingPayment(false);
    }
  }, [booking, toast]);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Chờ xác nhận</Badge>;
      case 'CONFIRMED':
        return <Badge variant="default">Đã xác nhận</Badge>;
      case 'PAID':
        return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">Đã thanh toán</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="destructive">Đang thực hiện</Badge>;
      case 'MAINTENANCE_COMPLETE':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Hoàn thành</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Đã hủy</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Từ chối</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  }, []);

  // Old column definitions removed; using unified definitions below

  const bookingInfoColumns: ColumnDef<{ label: string; value: string | React.ReactNode }>[] = useMemo(
    () => [
      {
        accessorKey: 'label',
        header: 'Thông tin',
        cell: ({ row }) => <div className="font-medium">{row.getValue('label')}</div>,
      },
      {
        accessorKey: 'value',
        header: 'Chi tiết',
        cell: ({ row }) => <div>{row.getValue('value') as React.ReactNode}</div>,
      },
    ],
    []
  );

  const bookingInfoData = useMemo(() => {
    if (!booking) return [];
    const [dateStr = '', timeStr = ''] = (booking.scheduleDateTime?.value || '').split(' ');
    return [
      { label: 'Trạng thái', value: getStatusBadge(booking.bookingStatus) },
      { label: 'VIN', value: <span className="font-mono">{booking.vehicleVin}</span> },
      { label: 'Xe', value: booking.vehicleModel },
      { label: 'Ngày hẹn', value: dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '—' },
      { label: 'Giờ hẹn', value: timeStr || '—' },
      { label: 'Tạo lúc', value: new Date(booking.createdAt).toLocaleString('vi-VN') },
    ];
  }, [booking, getStatusBadge]);

  const servicesColumns: ColumnDef<{
    id: number;
    serviceName: string;
    description: string;
  }>[] = useMemo(
    () => [
      { accessorKey: 'serviceName', header: 'Tên dịch vụ' },
      { accessorKey: 'description', header: 'Mô tả' },
    ],
    []
  );

  const invoiceLinesColumns: ColumnDef<{
    id: number;
    itemDescription: string;
    itemType: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>[] = useMemo(
    () => [
      { accessorKey: 'itemDescription', header: 'Hạng mục' },
      {
        accessorKey: 'quantity',
        header: 'SL',
        cell: ({ row }) => <div className="text-center">{row.getValue('quantity')}</div>,
      },
      {
        accessorKey: 'unitPrice',
        header: 'Đơn giá',
        cell: ({ row }) => formatPrice(row.getValue('unitPrice') as number),
      },
      {
        accessorKey: 'totalPrice',
        header: 'Thành tiền',
        cell: ({ row }) => <div className="font-medium">{formatPrice(row.getValue('totalPrice') as number)}</div>,
      },
    ],
    [formatPrice]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thông tin đặt lịch...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <X className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy thông tin đặt lịch</h2>
        <p className="text-muted-foreground mb-6">
          Có vẻ như bạn chưa có lịch hẹn nào hoặc thông tin đã bị mất.
        </p>
        <Button onClick={() => navigate('/customer/booking')}>
          Đặt lịch mới
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          {booking.bookingStatus === 'REJECTED' ? (
            <X className="w-12 h-12 text-red-500 mr-3" />
          ) : (
            <CheckCircle className="w-12 h-12 text-green-500 mr-3" />
          )}
          <h1 className="text-3xl font-bold">
            {booking.bookingStatus === 'REJECTED' ? 'Lịch hẹn đã bị từ chối' : 'Đặt lịch thành công!'}
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          {booking.bookingStatus === 'REJECTED'
            ? 'Rất tiếc, lịch hẹn của bạn đã bị từ chối bởi trung tâm. Vui lòng liên hệ để biết thêm chi tiết hoặc đặt lịch mới.'
            : 'Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Thông tin chi tiết lịch hẹn như sau:'}
        </p>
      </div>

      {/* Booking Information Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Thông tin lịch hẹn</h2>
        <DataTable columns={bookingInfoColumns} data={bookingInfoData} />
      </div>

      {/* Services Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Dịch vụ đã chọn</h2>
        <DataTable
          columns={servicesColumns}
          data={(booking.catalogDetails || []).map(s => ({
            id: s.id,
            serviceName: s.serviceName,
            description: s.description
          }))}
        />
      </div>

      {/* Invoice Lines */}
      {booking.invoice && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Chi phí dự kiến</h2>
          <DataTable
            columns={invoiceLinesColumns}
            data={booking.invoice.invoiceLines}
          />
          <div className="flex justify-end">
            <div className="w-full max-w-md space-y-2 p-4 border rounded-lg bg-muted/50">
              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng cộng:</span>
                <span>{formatPrice(booking.invoice.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {booking.bookingStatus === 'CONFIRMED' && (
          <Button 
            onClick={handlePayment} 
            disabled={isProcessingPayment}
            className="bg-green-600 hover:bg-green-700"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isProcessingPayment ? 'Đang xử lý...' : 'Thanh toán'}
          </Button>
        )}
        {booking.bookingStatus !== 'CANCELLED' && booking.bookingStatus !== 'REJECTED' && (
          <>
            <Button variant="outline" onClick={handleEditBooking}>
              Chỉnh sửa lịch hẹn
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking}>
              Hủy lịch hẹn
            </Button>
          </>
        )}
        <Button onClick={() => navigate('/customer')}>
          Về trang chủ
        </Button>
      </div>

    </div>
  );
}
