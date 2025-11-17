import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { bookingApi } from '@/lib/bookingUtils';
import { ColumnDef } from '@tanstack/react-table';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';

interface BookingRecord {
  id: string;
  customerName: string;
  vehicleVin: string;
  vehicleModel: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  status: BookingStatus;
  technicianName?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BookingsAndHistoryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = { email: 'customer@example.com', role: 'customer', userType: 'customer' };

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | BookingStatus>('all');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const currentUser = authService.getAuthState().user;
        if (!currentUser) return;
        const data = await bookingApi.getCustomerBookings(currentUser.id);
        const mapped: BookingRecord[] = data.map(b => {
          // Split date/time from scheduleDateTime.value
          const dt = b.scheduleDateTime?.value || '';
          const [date, time] = dt.split(' ');
          const toStatus = (s: string): BookingStatus => {
            const normalized = (s || '').toUpperCase();
            switch (normalized) {
              case 'PENDING': return 'pending';
              case 'CONFIRMED': return 'confirmed';
              case 'PAID': return 'paid';
              case 'IN_PROGRESS': return 'in_progress';
              case 'MAINTENANCE_COMPLETE': return 'completed';
              case 'COMPLETED': return 'completed';
              case 'CANCELLED': return 'cancelled';
              case 'REJECTED': return 'rejected';
              default: return 'pending';
            }
          };
          return {
            id: String(b.id),
            customerName: b.customerName,
            vehicleVin: b.vehicleVin,
            vehicleModel: b.vehicleModel,
            date: date || '',
            time: time || '',
            status: toStatus(b.bookingStatus),
            technicianName: b.technicianName,
            createdAt: b.createdAt,
            updatedAt: b.updatedAt,
          };
        });
        setBookings(mapped);
      } catch (e) {
        console.error('Failed to load bookings', e);
        setBookings([]);
      }
    };
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchText = [
        b.id,
        b.vehicleVin,
        b.vehicleModel,
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
      case 'paid':
        return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 gap-1"><CheckCircle2 className="w-3 h-3" />Đã thanh toán</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Đang thực hiện</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" />Đã hủy</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><X className="w-3 h-3" />Từ chối</Badge>;
      default:
        return null;
    }
  }, []);

  const handleViewDetails = useCallback((bookingId: string) => {
    // Lưu bookingId vào localStorage để trang confirmation có thể load
    localStorage.setItem('latestBookingId', bookingId);
    // Điều hướng đến trang chi tiết booking
    navigate('/customer/booking/confirmation', {
      state: { bookingId: Number(bookingId) }
    });
  }, [navigate]);

  // Define columns for unified table
  const bookingColumns: ColumnDef<BookingRecord>[] = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'Booking ID',
      cell: ({ row }) => (
        <div className="font-medium font-mono">#{row.original.id}</div>
      ),
    },
    {
      accessorKey: 'vehicleVin',
      header: 'VIN',
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.vehicleVin}</div>
      ),
    },
    {
      accessorKey: 'vehicleModel',
      header: 'Model xe',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.vehicleModel}</div>
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
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'technicianName',
      header: 'Kỹ thuật viên',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.technicianName || '—'}</div>
      ),
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
        </div>
      ),
    },
  ], [getStatusBadge, handleViewDetails]);

  const clearAll = () => {
    setBookings([]);
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
              placeholder="Booking ID, VIN, Model xe..."
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
              <SelectItem value="paid">Đã thanh toán</SelectItem>
              <SelectItem value="in_progress">Đang thực hiện</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
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
