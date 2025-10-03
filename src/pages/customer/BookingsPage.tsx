import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

interface PlainService {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
}

interface PlainVehicle {
  id: string;
  name: string;
  plate: string;
  model: string;
}

interface BookingRecord {
  id: string;
  service: PlainService;
  vehicle: PlainVehicle;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  status: BookingStatus;
  center: string;
  notes: string;
  createdAt: string;
  estimatedDuration: string;
}

export default function BookingsPage() {
  const user = { email: 'customer@example.com', role: 'customer', userType: 'customer' };
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | BookingStatus>('all');

  useEffect(() => {
    // Mock data
    const mockBookings: BookingRecord[] = [
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
        date: '2025-09-15',
        time: '09:00',
        status: 'pending',
        center: 'Trung tâm bảo dưỡng Hà Nội',
        notes: 'Xe có tiếng ồn lạ ở bánh trước',
        createdAt: '2025-01-10T10:30:00Z',
        estimatedDuration: '2-3 giờ'
      },
      {
        id: 'BK2025002',
        service: {
          id: 'battery',
          name: 'Kiểm tra pin',
          price: '1,800,000 VND',
          duration: '1-2 giờ',
          description: 'Chẩn đoán và bảo dưỡng hệ thống pin'
        },
        vehicle: {
          id: 'vf9',
          name: 'VinFast VF9',
          plate: '29B-67890',
          model: 'VF9 Plus'
        },
        date: '2025-09-16',
        time: '14:00',
        status: 'confirmed',
        center: 'Trung tâm bảo dưỡng Hà Nội',
        notes: 'Pin sạc chậm',
        createdAt: '2025-01-11T14:20:00Z',
        estimatedDuration: '1-2 giờ'
      },
      {
        id: 'BK2025003',
        service: {
          id: 'inspection',
          name: 'Kiểm tra an toàn',
          price: '1,200,000 VND',
          duration: '1-2 giờ',
          description: 'Kiểm tra hệ thống phanh và an toàn'
        },
        vehicle: {
          id: 'vfe34',
          name: 'VinFast VF e34',
          plate: '51C-11111',
          model: 'VF e34'
        },
        date: '2025-09-17',
        time: '10:30',
        status: 'completed',
        center: 'Trung tâm bảo dưỡng Hà Nội',
        notes: 'Kiểm tra hệ thống phanh',
        createdAt: '2025-01-12T09:15:00Z',
        estimatedDuration: '1-2 giờ'
      }
    ];
    setBookings(mockBookings);
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const matchText = [
        b.id,
        b.service?.name,
        b.vehicle?.name,
        b.vehicle?.plate,
        b.center,
        b.date,
        b.time,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchStatus = status === 'all' ? true : b.status === status;
      return matchText && matchStatus;
    });
  }, [bookings, query, status]);

  const clearAll = () => {
    localStorage.removeItem('bookings');
    setBookings([]);
  };

  return (
    <DashboardLayout title="" user={user}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
            <CardDescription>Tìm kiếm và lọc theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tìm kiếm</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Mã lịch hẹn, dịch vụ, biển số..." value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'all' | BookingStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end justify-end">
              <Button variant="destructive" onClick={clearAll}>
                <Trash2 className="w-4 h-4 mr-2" /> Xóa tất cả
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách lịch hẹn</CardTitle>
            <CardDescription>{filtered.length} lịch hẹn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                Chưa có lịch hẹn nào
              </div>
            )}

            {filtered.map(b => (
              <div key={b.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold">{b.service?.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {b.date} - {b.time}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {b.center}
                    </div>
                    <div className="text-sm">
                      Xe: {b.vehicle?.name} • {b.vehicle?.plate}
                    </div>
                  </div>
                  <Badge>
                    {b.status === 'pending' && 'Chờ xác nhận'}
                    {b.status === 'confirmed' && 'Đã xác nhận'}
                    {b.status === 'in_progress' && 'Đang thực hiện'}
                    {b.status === 'completed' && 'Hoàn thành'}
                    {b.status === 'cancelled' && 'Đã hủy'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}


