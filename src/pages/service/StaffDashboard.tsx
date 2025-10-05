import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Users
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

interface StaffBookingRecord {
  id: string;
  service: { id: string; name: string; price: string; duration: string; description: string };
  vehicle: { id: string; name: string; plate: string; model: string };
  date: string;
  time: string;
  status: BookingStatus;
  center: string;
  notes?: string;
  createdAt: string;
  estimatedDuration: string;
  customerName?: string;
  customerPhone?: string;
  technician?: string;
}

export default function StaffDashboard() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<StaffBookingRecord[]>([]);

  useEffect(() => {
    // Mock data
    const today = new Date().toISOString().split('T')[0];
    const mockBookings: StaffBookingRecord[] = [
      {
        id: 'BK2025001',
        service: {
          id: 'maintenance',
          name: 'Bảo dưỡng định kỳ',
          price: '2,500,000 VND',
          duration: '2-3 giờ',
          description: 'Kiểm tra tổng quát hệ thống xe điện'
        },
        vehicle: {
          id: 'vf8',
          name: 'VinFast VF8',
          plate: '30A-12345',
          model: 'VF8 Plus'
        },
        date: today, // Sử dụng ngày hôm nay
        time: '09:00',
        status: 'pending',
        center: 'Trung tâm bảo dưỡng Hà Nội',
        notes: 'Xe có tiếng ồn lạ ở bánh trước',
        createdAt: '2025-01-10T10:30:00Z',
        estimatedDuration: '2-3 giờ',
        customerName: 'Nguyễn Văn A',
        customerPhone: '0901234567'
      },
      {
        id: 'BK2025002',
        service: {
          id: 'repair',
          name: 'Sửa chữa hệ thống phanh',
          price: '1,800,000 VND',
          duration: '1-2 giờ',
          description: 'Kiểm tra và sửa chữa hệ thống phanh'
        },
        vehicle: {
          id: 'vf9',
          name: 'VinFast VF9',
          plate: '29B-67890',
          model: 'VF9 Plus'
        },
        date: today, // Sử dụng ngày hôm nay
        time: '14:00',
        status: 'confirmed',
        center: 'Trung tâm bảo dưỡng Hà Nội',
        notes: 'Phanh có tiếng kêu khi dừng',
        createdAt: '2025-01-09T15:20:00Z',
        estimatedDuration: '1-2 giờ',
        customerName: 'Lê Thị B',
        customerPhone: '0912345678',
        technician: 'Trần Văn C'
      }
    ];
    setBookings(mockBookings);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsRaw = useMemo(() => bookings.filter(b => b.date === todayStr), [bookings, todayStr]);

  const recentCustomers = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      phone: '0901234567',
      lastVisit: '2025-09-10',
      totalServices: 5
    },
    {
      id: 2,
      name: 'Lê Thị C',
      email: 'lethic@email.com',
      phone: '0912345678',
      lastVisit: '2025-09-08',
      totalServices: 2
    }
  ];

  const pendingRequests: Array<{ id: string; customer: string; service: string; requestTime: string; priority: 'high' | 'normal' }> = bookings
    .filter(b => b.status === 'pending')
    .slice(0, 5)
    .map(b => ({
      id: b.id,
      customer: b.customerName || 'Khách hàng',
      service: b.service?.name,
      requestTime: new Date(b.createdAt).toLocaleString('vi-VN'),
      priority: 'normal'
    }));

  // Filter form (React Hook Form + Zod) for dashboard lists
  const filterSchema = z.object({ status: z.enum(['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled']), search: z.string().optional() });
  type FilterForm = z.infer<typeof filterSchema>;
  const filterForm = useForm<FilterForm>({ resolver: zodResolver(filterSchema), defaultValues: { status: 'all', search: '' } });
  const filters = filterForm.watch();

  const todayAppointments = useMemo(() => {
    const term = (filters.search || '').toLowerCase().trim();
    return todayAppointmentsRaw
      .filter(a => filters.status === 'all' ? true : a.status === filters.status)
      .filter(a => term ? (
        (a.customerName || '').toLowerCase().includes(term) ||
        (a.vehicle?.plate || '').toLowerCase().includes(term) ||
        (a.service?.name || '').toLowerCase().includes(term)
      ) : true);
  }, [todayAppointmentsRaw, filters]);


  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">Chào buổi sáng!</h2>
        <p className="text-white/80">Hôm nay bạn có {todayAppointments.length} cuộc hẹn và {pendingRequests.length} yêu cầu đang chờ xử lý.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayAppointments.length}</p>
                <p className="text-sm text-muted-foreground">Hẹn hôm nay</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recentCustomers.length}</p>
                <p className="text-sm text-muted-foreground">Khách hàng</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Yêu cầu chờ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Tin nhắn mới</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments (Table + Filter Form) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Lịch hẹn hôm nay
                </CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/service/appointments')}>
                Xem tất cả
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Không có lịch hẹn nào hôm nay</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Giờ</TableHead>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead>Khách/Xe</TableHead>
                    <TableHead>Kỹ thuật viên</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayAppointments.slice(0, 5).map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {appointment.time}
                      </TableCell>
                      <TableCell>{appointment.service?.name}</TableCell>
                      <TableCell>{appointment.customerName} • {appointment.vehicle?.plate}</TableCell>
                      <TableCell>{appointment.technician || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={appointment.status === 'confirmed' ? 'default' : appointment.status === 'pending' ? 'secondary' : appointment.status === 'in_progress' ? 'outline' : appointment.status === 'completed' ? 'default' : 'destructive'}>
                          {appointment.status === 'confirmed' ? 'Đã xác nhận' : appointment.status === 'pending' ? 'Chờ xác nhận' : appointment.status === 'in_progress' ? 'Đang thực hiện' : appointment.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pending Requests (Table overview) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Yêu cầu đang chờ
                </CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/service/appointments')}>
                Xem tất cả
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Không có yêu cầu nào đang chờ</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead>Thời gian yêu cầu</TableHead>
                    <TableHead>Ưu tiên</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.slice(0, 5).map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.customer}</TableCell>
                      <TableCell>{request.service}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(request.requestTime).toLocaleString('vi-VN')}</TableCell>
                      <TableCell>
                        <Badge variant={request.priority === 'high' ? 'destructive' : 'secondary'}>
                          {request.priority === 'high' ? 'Khẩn cấp' : 'Thường'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Khách hàng gần đây
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/service/customers')}>
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCustomers.slice(0, 3).map((customer) => (
              <div key={customer.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={`/avatars/${customer.id}.png`} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {customer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{customer.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{customer.totalServices} dịch vụ</p>
                  <p className="text-sm text-muted-foreground">
                    Lần cuối: {new Date(customer.lastVisit).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
            {recentCustomers.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/service/customers')}>
                  +{recentCustomers.length - 3} khách hàng khác
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}