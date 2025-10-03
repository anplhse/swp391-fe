import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit,
  MapPin,
  MessageSquare,
  Phone,
  Trash2,
  Wrench
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BookingData {
  id: string;
  services: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
  }>;
  vehicle: {
    id: string;
    name: string;
    plate: string;
    model: string;
    year?: string;
  };
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  center: string;
  technician?: string;
  notes?: string;
  createdAt: string;
  estimatedDuration: string;
  paymentStatus?: string;
  totalAmount?: number;
}

export default function BookingStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Mock data - in real app, this would come from location state or API
  const bookingData: BookingData = location.state?.bookingData || {
    id: 'BK2025001',
    services: [{
      id: 'maintenance',
      name: 'Bảo dưỡng định kỳ',
      description: 'Kiểm tra tổng quát hệ thống xe điện',
      price: 2500000,
      duration: '2-3 giờ'
    }],
    vehicle: {
      id: '1',
      name: 'VinFast VF8',
      plate: '30A-123.45',
      model: 'VF8 Plus',
      year: '2024'
    },
    date: '2025-01-15',
    time: '09:00',
    status: 'pending',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    notes: 'Xe có tiếng ồn lạ ở bánh trước',
    createdAt: '2025-01-10T10:30:00Z',
    estimatedDuration: '2-3 giờ',
    paymentStatus: 'pending',
    totalAmount: 0
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Chờ xác nhận',
          color: 'secondary',
          icon: Clock,
          description: 'Đang chờ trung tâm xác nhận lịch hẹn',
          progress: 25
        };
      case 'confirmed':
        return {
          label: 'Đã xác nhận',
          color: 'default',
          icon: CheckCircle2,
          description: 'Lịch hẹn đã được xác nhận, sẵn sàng thực hiện',
          progress: 50
        };
      case 'in_progress':
        return {
          label: 'Đang thực hiện',
          color: 'default',
          icon: Wrench,
          description: 'Dịch vụ đang được thực hiện',
          progress: 75
        };
      case 'completed':
        return {
          label: 'Hoàn thành',
          color: 'default',
          icon: CheckCircle2,
          description: 'Dịch vụ đã hoàn thành',
          progress: 100
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          color: 'destructive',
          icon: AlertCircle,
          description: 'Lịch hẹn đã bị hủy',
          progress: 0
        };
      default:
        return {
          label: 'Không xác định',
          color: 'secondary',
          icon: AlertCircle,
          description: 'Trạng thái không xác định',
          progress: 0
        };
    }
  };

  const statusInfo = getStatusInfo(bookingData.status);
  const StatusIcon = statusInfo.icon;

  const handlePayment = () => {
    // Chỉ cho phép thanh toán khi dịch vụ đã hoàn thành
    if (bookingData.status !== 'completed') {
      toast({
        title: "Chưa thể thanh toán",
        description: "Vui lòng chờ trung tâm hoàn thành dịch vụ trước khi thanh toán",
        variant: "destructive"
      });
      return;
    }

    const paymentItems = bookingData.services.map(service => ({
      id: service.id,
      name: service.name,
      type: 'service' as const,
      price: service.price,
      quantity: 1,
      description: service.description
    }));

    navigate('/customer/payment', {
      state: {
        items: paymentItems,
        from: 'booking-status',
        bookingId: bookingData.id
      }
    });
  };

  const handleEdit = () => {
    navigate('/customer/booking', {
      state: { editBooking: bookingData }
    });
  };

  const handleCancel = () => {
    toast({
      title: "Hủy lịch hẹn",
      description: "Lịch hẹn đã được hủy thành công",
    });
    navigate('/customer');
  };

  const handleContact = () => {
    toast({
      title: "Liên hệ trung tâm",
      description: "Đang kết nối với trung tâm bảo dưỡng...",
    });
  };

  return (
    <DashboardLayout title="" user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4"></div>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className="w-5 h-5" />
              Trạng thái hiện tại
            </CardTitle>
            <CardDescription>
              {statusInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={statusInfo.color as 'default' | 'secondary' | 'destructive'} className="text-lg px-4 py-2">
                {statusInfo.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Tạo lúc: {new Date(bookingData.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiến độ xử lý</span>
                <span>{statusInfo.progress}%</span>
              </div>
              <Progress value={statusInfo.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết đặt lịch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {bookingData.services.map((service, index) => (
                  <div key={service.id} className="flex items-center gap-3">
                    <Wrench className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(service.price)} • {service.duration}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{bookingData.vehicle.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {bookingData.vehicle.plate} • {bookingData.vehicle.model}
                      {bookingData.vehicle.year && ` • ${bookingData.vehicle.year}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">Thời gian</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(bookingData.date).toLocaleDateString('vi-VN')} - {bookingData.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">Trung tâm</h3>
                    <p className="text-sm text-muted-foreground">{bookingData.center}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">Thời gian dự kiến</h3>
                    <p className="text-sm text-muted-foreground">{bookingData.estimatedDuration}</p>
                  </div>
                </div>
              </div>

              {bookingData.notes && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Ghi chú:</h4>
                  <p className="text-sm text-muted-foreground">{bookingData.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">
                    {bookingData.totalAmount && bookingData.totalAmount > 0
                      ? new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(bookingData.totalAmount)
                      : 'Chưa tính phí'
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.totalAmount && bookingData.totalAmount > 0
                      ? 'Tổng chi phí dịch vụ'
                      : 'Sẽ tính phí sau khi hoàn thành'
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  {bookingData.status === 'pending' && (
                    <>
                      <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-sm text-yellow-700 font-medium">Chờ trung tâm xác nhận</p>
                        <p className="text-xs text-yellow-600 mt-1">Bạn sẽ nhận được thông báo khi được xác nhận</p>
                      </div>
                      <Button variant="outline" onClick={handleEdit} className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa lịch hẹn
                      </Button>
                      <Button variant="outline" onClick={handleCancel} className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hủy lịch hẹn
                      </Button>
                    </>
                  )}

                  {bookingData.status === 'confirmed' && (
                    <>
                      <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <CheckCircle2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-blue-700 font-medium">Đã xác nhận lịch hẹn</p>
                        <p className="text-xs text-blue-600 mt-1">Trung tâm sẽ thực hiện dịch vụ theo lịch hẹn</p>
                      </div>
                      <Button variant="outline" onClick={handleEdit} className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa lịch hẹn
                      </Button>
                    </>
                  )}

                  {bookingData.status === 'in_progress' && (
                    <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <Wrench className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <p className="text-sm text-orange-700 font-medium">Đang thực hiện dịch vụ</p>
                      <p className="text-xs text-orange-600 mt-1">Kỹ thuật viên đang bảo dưỡng xe của bạn</p>
                    </div>
                  )}

                  {bookingData.status === 'completed' && (
                    <>
                      <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-green-700 font-medium">Dịch vụ đã hoàn thành</p>
                        <p className="text-xs text-green-600 mt-1">Xe sẵn sàng để nhận, vui lòng thanh toán</p>
                      </div>
                      <Button onClick={handlePayment} className="w-full">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Thanh toán ngay
                      </Button>
                    </>
                  )}

                  {bookingData.status === 'cancelled' && (
                    <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-red-700 font-medium">Lịch hẹn đã bị hủy</p>
                      <p className="text-xs text-red-600 mt-1">Vui lòng đặt lịch mới nếu cần</p>
                    </div>
                  )}

                  <Button variant="outline" onClick={handleContact} className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Liên hệ trung tâm
                  </Button>

                  <Button variant="outline" onClick={() => navigate('/customer/bookings')} className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Xem lịch sử
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Bước 1: Đặt lịch */}
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Đặt lịch thành công</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(bookingData.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Bước 2: Xác nhận */}
              {bookingData.status !== 'pending' && (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Trung tâm đã xác nhận</h4>
                    <p className="text-sm text-muted-foreground">
                      Lịch hẹn đã được trung tâm xác nhận và sẵn sàng thực hiện
                    </p>
                  </div>
                </div>
              )}

              {/* Bước 3: Thực hiện */}
              {bookingData.status === 'in_progress' && (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Đang thực hiện dịch vụ</h4>
                    <p className="text-sm text-muted-foreground">
                      Kỹ thuật viên đang bảo dưỡng xe của bạn
                    </p>
                  </div>
                </div>
              )}

              {/* Bước 4: Hoàn thành */}
              {bookingData.status === 'completed' && (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Dịch vụ hoàn thành</h4>
                    <p className="text-sm text-muted-foreground">
                      Trung tâm đã hoàn thành dịch vụ, xe sẵn sàng để nhận
                    </p>
                  </div>
                </div>
              )}

              {/* Bước 5: Thanh toán */}
              {bookingData.status === 'completed' && (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800">Chờ thanh toán</h4>
                    <p className="text-sm text-green-600">
                      Vui lòng thanh toán để hoàn tất quy trình
                    </p>
                  </div>
                </div>
              )}

              {/* Hủy bỏ */}
              {bookingData.status === 'cancelled' && (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-red-50">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800">Lịch hẹn đã bị hủy</h4>
                    <p className="text-sm text-red-600">
                      Lịch hẹn đã bị hủy, vui lòng đặt lịch mới nếu cần
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
