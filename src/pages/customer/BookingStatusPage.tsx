import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { bookingApi } from '@/lib/bookingUtils';
import { showApiErrorToast } from '@/lib/responseHandler';
import { ColumnDef } from '@tanstack/react-table';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit,
  History,
  Trash2,
  Wrench,
  X
} from 'lucide-react';
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
  technicianId?: number | null;
  technicianName?: string | null;
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
    paidAt: string;
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

type PaymentHistory = {
  id: number;
  invoiceNumber: string;
  orderCode: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  paidAt: string;
  transactionRef: string;
  responseCode: string;
};

export default function BookingStatusPage() {
  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPaymentHistory, setIsLoadingPaymentHistory] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const bookingId = location.state?.bookingId;

        if (!bookingId) {
          toast({
            title: 'Lỗi',
            description: 'Không tìm thấy thông tin booking. Vui lòng quay lại danh sách booking.',
            variant: 'destructive'
          });
          if (mounted) navigate('/customer/bookings');
          return;
        }

        const data = await bookingApi.getBookingById(bookingId);
        if (!mounted) return;
        setBooking(data);

        // Load payment history
        try {
          setIsLoadingPaymentHistory(true);
          const history = await apiClient.getPaymentHistory(bookingId);
          if (mounted) setPaymentHistory(history);
        } catch (error) {
          console.error('Failed to load payment history:', error);
          // Don't show error toast for payment history, just log it
          if (mounted) setPaymentHistory([]);
        } finally {
          if (mounted) setIsLoadingPaymentHistory(false);
        }
      } catch (error) {
        console.error('Failed to load booking:', error);
        showApiErrorToast(error, toast, 'Không thể tải thông tin booking.');
        if (mounted) navigate('/customer/bookings');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [location.state, navigate, toast]);

  const getStatusInfo = useCallback((status: string) => {
    const normalized = (status || '').toUpperCase();
    switch (normalized) {
      case 'PENDING':
        return {
          label: 'Chờ xác nhận',
          color: 'secondary' as const,
          icon: Clock,
          description: 'Đang chờ trung tâm xác nhận lịch hẹn'
        };
      case 'CONFIRMED':
        return {
          label: 'Đã xác nhận',
          color: 'default' as const,
          icon: CheckCircle2,
          description: 'Lịch hẹn đã được xác nhận, sẵn sàng thực hiện'
        };
      case 'PAID':
        return {
          label: 'Đã thanh toán',
          color: 'default' as const,
          icon: CreditCard,
          description: 'Đã thanh toán trước, sẵn sàng thực hiện dịch vụ'
        };
      case 'IN_PROGRESS':
        return {
          label: 'Đang thực hiện',
          color: 'default' as const,
          icon: Wrench,
          description: 'Dịch vụ đang được thực hiện'
        };
      case 'MAINTENANCE_COMPLETE':
      case 'COMPLETED':
        return {
          label: 'Hoàn thành',
          color: 'default' as const,
          icon: CheckCircle2,
          description: 'Dịch vụ đã hoàn thành'
        };
      case 'CANCELLED':
        return {
          label: 'Đã hủy',
          color: 'destructive' as const,
          icon: AlertCircle,
          description: 'Lịch hẹn đã bị hủy'
        };
      case 'REJECTED':
        return {
          label: 'Từ chối',
          color: 'destructive' as const,
          icon: AlertCircle,
          description: 'Lịch hẹn đã bị từ chối bởi trung tâm'
        };
      default:
        return {
          label: 'Không xác định',
          color: 'secondary' as const,
          icon: AlertCircle,
          description: 'Trạng thái không xác định'
        };
    }
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
        return <Badge variant="default" className="bg-orange-600 hover:bg-orange-700">Đang thực hiện</Badge>;
      case 'MAINTENANCE_COMPLETE':
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Hoàn thành</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Đã hủy</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Từ chối</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  }, []);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }, []);

  const handleEditBooking = useCallback(() => {
    if (!booking) return;
    navigate('/customer/booking', {
      state: {
        preselectedVin: booking.vehicleVin,
        preselectedVehicle: { vin: booking.vehicleVin, modelName: booking.vehicleModel },
        editMode: true,
        existingBooking: null
      }
    });
  }, [booking, navigate]);

  const handleCancelBooking = useCallback(() => {
    toast({
      title: 'Thông báo',
      description: 'Tính năng hủy lịch sẽ được bổ sung sau.',
    });
  }, [toast]);

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
    const data = [
      { label: 'Booking ID', value: <span className="font-mono font-semibold">#{booking.id}</span> },
      { label: 'Trạng thái', value: getStatusBadge(booking.bookingStatus) },
      { label: 'Khách hàng', value: booking.customerName },
      { label: 'VIN', value: <span className="font-mono">{booking.vehicleVin}</span> },
      { label: 'Model xe', value: booking.vehicleModel },
      { label: 'Ngày hẹn', value: dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '—' },
      { label: 'Giờ hẹn', value: timeStr || '—' },
    ];

    if (booking.technicianName) {
      data.push({ label: 'Kỹ thuật viên', value: booking.technicianName });
    }

    data.push(
      { label: 'Tạo lúc', value: new Date(booking.createdAt).toLocaleString('vi-VN') },
      { label: 'Cập nhật lúc', value: new Date(booking.updatedAt).toLocaleString('vi-VN') }
    );

    return data;
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

  const paymentHistoryColumns: ColumnDef<PaymentHistory>[] = useMemo(() => [
    {
      accessorKey: 'orderCode',
      header: 'Mã đơn hàng',
      cell: ({ row }) => <span className="font-mono font-medium">{row.original.orderCode}</span>,
    },
    {
      accessorKey: 'invoiceNumber',
      header: 'Số hóa đơn',
      cell: ({ row }) => <span className="font-mono">{row.original.invoiceNumber}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Số tiền',
      cell: ({ row }) => (
        <span className="font-semibold text-green-600">
          {formatPrice(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Phương thức',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.paymentMethod}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={status === 'SUCCESSFUL' ? 'default' : 'secondary'}
            className={status === 'SUCCESSFUL' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {status === 'SUCCESSFUL' ? 'Thành công' : status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'transactionRef',
      header: 'Mã giao dịch',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.transactionRef || '—'}</span>
      ),
    },
    {
      accessorKey: 'paidAt',
      header: 'Thời gian thanh toán',
      cell: ({ row }) => (
        <span>{new Date(row.original.paidAt).toLocaleString('vi-VN')}</span>
      ),
    },
  ], [formatPrice]);

  const invoiceLinesColumns: ColumnDef<{
    id: number;
    itemDescription: string;
    itemType: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>[] = useMemo(
    () => [
      {
        accessorKey: 'itemType',
        header: 'Loại',
        cell: ({ row }) => (
          <Badge variant={row.getValue('itemType') === 'SERVICE' ? 'default' : 'secondary'}>
            {row.getValue('itemType') === 'SERVICE' ? 'Dịch vụ' : 'Linh kiện'}
          </Badge>
        ),
      },
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
          <p className="text-muted-foreground">Đang tải thông tin booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <X className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy thông tin booking</h2>
        <p className="text-muted-foreground mb-6">
          Có vẻ như booking không tồn tại hoặc đã bị xóa.
        </p>
        <Button onClick={() => navigate('/customer/bookings')}>
          Quay lại danh sách booking
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.bookingStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <StatusIcon className={`w-12 h-12 mr-3 ${statusInfo.color === 'destructive' ? 'text-red-500' :
            statusInfo.color === 'secondary' ? 'text-yellow-500' :
              'text-green-500'
            }`} />
          <h1 className="text-3xl font-bold">Trạng thái Booking</h1>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Badge variant={statusInfo.color} className="text-lg px-4 py-2">
            {statusInfo.label}
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          {statusInfo.description}
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

      {/* Invoice Information */}
      {booking.invoice && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Thông tin hóa đơn</h2>
          <DataTable
            columns={bookingInfoColumns}
            data={[
              { label: 'Số hóa đơn', value: <span className="font-mono font-medium">{booking.invoice.invoiceNumber}</span> },
              {
                label: 'Trạng thái',
                value: (
                  <Badge
                    variant={booking.invoice.status === 'PAID' ? 'default' : 'secondary'}
                    className={booking.invoice.status === 'PAID' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {booking.invoice.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Badge>
                ),
              },
              { label: 'Ngày tạo', value: new Date(booking.invoice.issueDate).toLocaleString('vi-VN') },
              { label: 'Hạn thanh toán', value: new Date(booking.invoice.dueDate).toLocaleDateString('vi-VN') },
              {
                label: 'Thời gian thanh toán',
                value: booking.invoice.paidAt ? new Date(booking.invoice.paidAt).toLocaleString('vi-VN') : '—',
              },
              {
                label: 'Tổng tiền',
                value: <span className="font-semibold text-green-600">{formatPrice(booking.invoice.totalAmount)}</span>,
              },
            ]}
          />
        </div>
      )}

      {/* Invoice Lines */}
      {booking.invoice && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Chi tiết hóa đơn</h2>
          <DataTable
            columns={invoiceLinesColumns}
            data={booking.invoice.invoiceLines}
          />
        </div>
      )}

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Lịch sử thanh toán</h2>
          {isLoadingPaymentHistory ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải lịch sử thanh toán...
            </div>
          ) : (
            <DataTable
              columns={paymentHistoryColumns}
              data={paymentHistory}
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {booking.bookingStatus === 'CONFIRMED' && booking.invoice && (
          <Button
            onClick={handlePayment}
            disabled={isProcessingPayment}
            className="bg-green-600 hover:bg-green-700"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isProcessingPayment ? 'Đang xử lý...' : 'Thanh toán'}
          </Button>
        )}
        {['MAINTENANCE_COMPLETE', 'COMPLETED'].includes(booking.bookingStatus) && booking.invoice && booking.invoice.status !== 'PAID' && (
          <Button
            onClick={handlePayment}
            disabled={isProcessingPayment}
            className="bg-green-600 hover:bg-green-700"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isProcessingPayment ? 'Đang xử lý...' : 'Thanh toán ngay'}
          </Button>
        )}
        {!['CANCELLED', 'REJECTED', 'COMPLETED', 'MAINTENANCE_COMPLETE'].includes(booking.bookingStatus) && (
          <>
            <Button variant="outline" onClick={handleEditBooking}>
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa lịch hẹn
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking}>
              <Trash2 className="w-4 h-4 mr-2" />
              Hủy lịch hẹn
            </Button>
          </>
        )}
        <Button variant="outline" onClick={() => navigate('/customer/bookings')}>
          <History className="w-4 h-4 mr-2" />
          Xem lịch sử
        </Button>
        <Button variant="outline" onClick={() => navigate('/customer')}>
          Về trang chủ
        </Button>
      </div>
    </div>
  );
}
