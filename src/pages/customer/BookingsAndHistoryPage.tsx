import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Search,
  Trash2,
  Wrench
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  // Additional fields for completed services
  technician?: string;
  checkIn?: string;
  checkOut?: string;
  services?: string[];
  cost?: string;
}

export default function BookingsAndHistoryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = { email: 'customer@example.com', role: 'customer', userType: 'customer' };

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | BookingStatus>('all');

  useEffect(() => {
    // Mock data combining both bookings and service history
    const mockData: BookingRecord[] = [
      // Upcoming bookings
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
      // Completed services (service history)
      {
        id: 'SV2025001',
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
        date: '2025-08-20',
        time: '08:00',
        status: 'completed',
        center: 'Trung tâm bảo dưỡng Hà Nội',
        notes: 'Xe trong tình trạng tốt, đã thay dầu phanh theo lịch định kỳ',
        createdAt: '2025-08-20T08:00:00Z',
        estimatedDuration: '2-3 giờ',
        technician: 'Nguyễn Văn A',
        checkIn: '08:00',
        checkOut: '11:30',
        services: ['Kiểm tra pin', 'Thay dầu phanh', 'Cập nhật phần mềm'],
        cost: '2,500,000 VND'
      },
      {
        id: 'SV2025002',
        service: {
          id: 'tire',
          name: 'Thay lốp xe',
          price: '1,800,000 VND',
          duration: '1-2 giờ',
          description: 'Thay lốp mới, cân bằng bánh xe'
        },
        vehicle: {
          id: 'vf8',
          name: 'VinFast VF8',
          plate: '30A-12345',
          model: 'VF8 Plus'
        },
        date: '2025-07-10',
        time: '14:00',
        status: 'completed',
        center: 'Trung tâm bảo dưỡng TP.HCM',
        notes: 'Lốp cũ đã mòn 80%, được thay mới hoàn toàn',
        createdAt: '2025-07-10T14:00:00Z',
        estimatedDuration: '1-2 giờ',
        technician: 'Trần Văn B',
        checkIn: '14:00',
        checkOut: '15:45',
        services: ['Thay 4 lốp xe mới', 'Cân bằng lốp'],
        cost: '1,800,000 VND'
      },
      // In progress
      {
        id: 'SV2025003',
        service: {
          id: 'battery',
          name: 'Kiểm tra pin',
          price: '1,200,000 VND',
          duration: '1-2 giờ',
          description: 'Chẩn đoán và bảo dưỡng hệ thống pin'
        },
        vehicle: {
          id: 'vf8',
          name: 'VinFast VF8',
          plate: '30A-12345',
          model: 'VF8 Plus'
        },
        date: '2025-09-25',
        time: '09:00',
        status: 'in_progress',
        center: 'Trung tâm bảo dưỡng Hà Nội',
        notes: 'Đang tiến hành kiểm tra chi tiết hệ thống pin',
        createdAt: '2025-09-25T09:00:00Z',
        estimatedDuration: '1-2 giờ',
        technician: 'Lê Văn C',
        checkIn: '09:00',
        checkOut: undefined,
        services: ['Kiểm tra dung lượng pin', 'Chẩn đoán hệ thống sạc'],
        cost: '1,200,000 VND'
      }
    ];
    setBookings(mockData);
  }, []);

  const filteredBookings = useMemo(() => {
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

  // Gộp tất cả vào 1 danh sách duy nhất
  const allBookings = filteredBookings;

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><AlertCircle className="w-3 h-3" />Chờ xác nhận</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" />Đã xác nhận</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Đang thực hiện</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" />Đã hủy</Badge>;
      default:
        return null;
    }
  }, []);

  const formatPrice = useCallback((price: string) => {
    return price || '—';
  }, []);

  // Define columns for unified table
  const bookingColumns: ColumnDef<BookingRecord>[] = useMemo(() => [
    {
      accessorKey: 'service.name',
      header: 'Dịch vụ',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.service.name}</div>
          <div className="text-sm text-muted-foreground">Mã: {row.original.id}</div>
        </div>
      ),
    },
    {
      accessorKey: 'vehicle',
      header: 'Xe',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.vehicle.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.vehicle.plate}</div>
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Ngày & Giờ',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{new Date(row.original.date).toLocaleDateString('vi-VN')}</div>
            <div className="text-sm text-muted-foreground">{row.original.time}</div>
            {row.original.checkIn && (
              <div className="text-xs text-muted-foreground">
                Nhận: {row.original.checkIn}
                {row.original.checkOut && ` • Trả: ${row.original.checkOut}`}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'technician',
      header: 'Kỹ thuật viên',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{row.original.technician || 'Chưa phân công'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'cost',
      header: 'Chi phí',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-semibold">{formatPrice(row.original.cost || '')}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleViewDetails(row.original.id)}>
            <Eye className="w-4 h-4 mr-2" />
            Chi tiết
          </Button>
          {row.original.status === 'completed' && (
            <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(row.original.id)}>
              <Download className="w-4 h-4 mr-2" />
              Hóa đơn
            </Button>
          )}
        </div>
      ),
    },
  ], [getStatusBadge, formatPrice]);

  const clearAll = () => {
    localStorage.removeItem('bookings');
    setBookings([]);
  };

  const handleViewDetails = (bookingId: string) => {
    toast({
      title: "Chi tiết lịch hẹn",
      description: `Xem chi tiết lịch hẹn ${bookingId}`,
    });
  };

  const handleDownloadInvoice = (bookingId: string) => {
    toast({
      title: "Tải hóa đơn",
      description: `Đang tải hóa đơn ${bookingId}`,
    });
  };


  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label>Tìm kiếm</Label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Mã lịch hẹn, dịch vụ, biển số..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
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
      </div>

      {/* Main Content - Single Table */}
      {allBookings.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Chưa có lịch hẹn hoặc dịch vụ nào</p>
        </div>
      ) : (
        <DataTable columns={bookingColumns} data={allBookings} />
      )}
    </div>
  );
}
