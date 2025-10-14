import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BookingData {
  id: string;
  vehicle: {
    vin: string;
    brand: string;
    model: string;
    year: number;
  };
  services: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
  }>;
  date: string;
  time: string;
  notes?: string;
  totalAmount: number;
  estimatedDuration: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export default function BookingConfirmationPage() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Lấy dữ liệu booking từ state hoặc localStorage
    const bookingFromState = location.state?.bookingData;
    const bookingFromStorage = localStorage.getItem('latestBooking');

    if (bookingFromState) {
      setBookingData(bookingFromState);
      setIsLoading(false);
    } else if (bookingFromStorage) {
      try {
        const parsedBooking = JSON.parse(bookingFromStorage);
        setBookingData(parsedBooking);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing booking data:', error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [location.state]);

  const handleCancelBooking = () => {
    if (!bookingData) return;

    // Cập nhật trạng thái booking thành cancelled
    const updatedBooking = { ...bookingData, status: 'cancelled' as const };
    setBookingData(updatedBooking);

    // Lưu vào localStorage
    localStorage.setItem('latestBooking', JSON.stringify(updatedBooking));

    toast({
      title: "Hủy lịch hẹn thành công",
      description: "Lịch hẹn của bạn đã được hủy. Bạn có thể đặt lịch mới bất cứ lúc nào.",
    });
  };

  const handleEditBooking = () => {
    if (!bookingData) return;

    // Chuyển về trang đặt lịch với dữ liệu hiện tại
    navigate('/customer/booking', {
      state: {
        preselectedVin: bookingData.vehicle.vin,
        preselectedVehicle: bookingData.vehicle,
        editMode: true,
        existingBooking: bookingData
      }
    });
  };

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Chờ xác nhận</Badge>;
      case 'confirmed':
        return <Badge variant="default">Đã xác nhận</Badge>;
      case 'in_progress':
        return <Badge variant="destructive">Đang thực hiện</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  }, []);

  // Define columns for booking information table
  const bookingInfoColumns: ColumnDef<{ label: string; value: string | React.ReactNode }>[] = useMemo(
    () => [
      {
        accessorKey: 'label',
        header: 'Thông tin',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('label')}</div>
        ),
      },
      {
        accessorKey: 'value',
        header: 'Chi tiết',
        cell: ({ row }) => (
          <div>{row.getValue('value')}</div>
        ),
      },
    ],
    []
  );

  // Define columns for services table
  const servicesColumns: ColumnDef<{
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
  }>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Tên dịch vụ',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Mô tả',
        cell: ({ row }) => (
          <div className="text-muted-foreground text-sm">
            {row.getValue('description')}
          </div>
        ),
      },
      {
        accessorKey: 'duration',
        header: 'Thời gian',
        cell: ({ row }) => (
          <div>{row.getValue('duration')} phút</div>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Giá',
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {formatPrice(row.getValue('price'))}
          </div>
        ),
      },
    ],
    [formatPrice]
  );

  // Prepare booking info data
  const bookingInfoData = useMemo(() => {
    if (!bookingData) return [];

    return [
      {
        label: 'Mã lịch hẹn',
        value: (
          <div className="flex items-center justify-between">
            <span className="font-mono">{bookingData.id}</span>
            {getStatusBadge(bookingData.status)}
          </div>
        ),
      },
      {
        label: 'VIN',
        value: <span className="font-mono">{bookingData.vehicle.vin}</span>,
      },
      {
        label: 'Thông tin xe',
        value: `${bookingData.vehicle.brand} ${bookingData.vehicle.model} (${bookingData.vehicle.year})`,
      },
      {
        label: 'Ngày hẹn',
        value: new Date(bookingData.date).toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
      },
      {
        label: 'Giờ hẹn',
        value: bookingData.time,
      },
      {
        label: 'Tổng cộng',
        value: (
          <span className="text-lg font-semibold text-primary">
            {formatPrice(bookingData.totalAmount)}
          </span>
        ),
      },
      ...(bookingData.notes ? [{
        label: 'Ghi chú',
        value: (
          <div className="bg-muted p-3 rounded text-sm">
            {bookingData.notes}
          </div>
        ),
      }] : []),
    ];
  }, [bookingData, getStatusBadge, formatPrice]);

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

  if (!bookingData) {
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
          <CheckCircle className="w-12 h-12 text-green-500 mr-3" />
          <h1 className="text-3xl font-bold">Đặt lịch thành công!</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Thông tin chi tiết lịch hẹn như sau:
        </p>
      </div>

      {/* Booking Information Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Thông tin lịch hẹn</h2>
        <DataTable columns={bookingInfoColumns} data={bookingInfoData} />
      </div>

      {/* Services Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Dịch vụ đã chọn ({bookingData.services.length} dịch vụ)
        </h2>
        <DataTable columns={servicesColumns} data={bookingData.services} />
        <div className="text-right text-sm text-muted-foreground">
          Tổng thời gian dự kiến: <span className="font-medium">{bookingData.estimatedDuration} phút</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {bookingData.status !== 'cancelled' && (
          <>
            <Button variant="outline" onClick={handleEditBooking}>
              Chỉnh sửa lịch hẹn
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking}>
              Hủy lịch hẹn
            </Button>
          </>
        )}
        <Button onClick={() => navigate('/customer/dashboard')}>
          Về trang chủ
        </Button>
      </div>

    </div>
  );
}
