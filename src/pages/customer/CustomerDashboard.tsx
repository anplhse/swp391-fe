import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Plus
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  // Get user from localStorage (demo)
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Types
  interface BookingServiceInfo {
    id?: string | number;
    name: string;
    price?: number;
  }

  type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

  interface Booking {
    id?: string | number;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    status?: BookingStatus;
    service?: BookingServiceInfo;
  }

  // Get bookings from localStorage
  const bookings: Booking[] = JSON.parse(localStorage.getItem('bookings') || '[]');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const filteredRecent = useMemo(() => {
    const recent = bookings.slice(-5).reverse();
    if (statusFilter === 'all') return recent;
    return recent.filter(b => (b.status || 'pending') === statusFilter);
  }, [bookings, statusFilter]);

  return (
    <DashboardLayout title="Dashboard Khách Hàng" user={user}>
      <div className="space-y-6">
        {/* Quick Actions removed per request */}

        {/* Toolbar */}
        <div className="flex items-center justify-between pb-4">
          <div className="text-sm text-muted-foreground">Khách hàng / Dashboard</div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | BookingStatus)}>
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Recent bookings only */}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Lịch gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="space-y-3">
                {/* Mock data khi chưa có booking */}
                <div className="flex items-center justify-between border rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>2025-09-16 - 09:00</span>
                  </div>
                  <span className="capitalize">Bảo dưỡng định kỳ</span>
                </div>
                <div className="flex items-center justify-between border rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>2025-09-17 - 13:00</span>
                  </div>
                  <span className="capitalize">Kiểm tra pin</span>
                </div>
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={() => navigate('/customer/booking')}>
                    <Plus className="w-4 h-4 mr-2" /> Đặt lịch thật
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecent.map((b: Booking) => (
                  <div key={b.id} className="flex items-center justify-between border rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{b.date} - {b.time}</span>
                    </div>
                    <span className="capitalize">{b.service?.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}