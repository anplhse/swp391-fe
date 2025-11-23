import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { apiClient } from '@/lib/api';
import { authService } from '@/lib/auth';
import { getBookingStatusBadge, getBookingStatusLabel, mapBookingStatusToFrontend } from '@/lib/bookingStatusUtils';
import { bookingApi } from '@/lib/bookingUtils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ColumnDef } from '@tanstack/react-table';
import {
  Calendar,
  Eye,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

type BookingStatus = 'pending' | 'confirmed' | 'assigned' | 'paid' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';

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
  const [bookingStatuses, setBookingStatuses] = useState<string[]>([]);

  const filterSchema = z.object({
    query: z.string().optional(),
    status: z.enum(['all', 'pending', 'confirmed', 'assigned', 'paid', 'in_progress', 'completed', 'cancelled', 'rejected']).optional(),
  });
  type FilterForm = z.infer<typeof filterSchema>;

  const filterForm = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: { query: '', status: 'all' }
  });

  const watchFilters = filterForm.watch();
  const debouncedQuery = useDebounce(watchFilters.query || '', 300);

  useEffect(() => {
    const loadBookingStatuses = async () => {
      try {
        const statusData = await apiClient.getBookingStatusEnum();
        setBookingStatuses(statusData.enumValue);
      } catch (e) {
        console.error('Failed to load booking statuses', e);
        // Fallback to default statuses if API fails
        setBookingStatuses(['PENDING', 'CONFIRMED', 'PAID', 'ASSIGNED', 'IN_PROGRESS', 'MAINTENANCE_COMPLETE', 'CANCELLED', 'REJECTED']);
      }
    };
    loadBookingStatuses();
  }, []);

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
            return mapBookingStatusToFrontend(s);
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
      const matchText = !debouncedQuery.trim() || [
        b.id,
        b.vehicleVin,
        b.vehicleModel,
        b.date,
        b.time,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(debouncedQuery.toLowerCase());

      const matchStatus = (watchFilters.status || 'all') === 'all' ? true : b.status === watchFilters.status;
      return matchText && matchStatus;
    });
  }, [bookings, debouncedQuery, watchFilters.status]);

  // Gộp tất cả vào 1 danh sách duy nhất
  const allBookings = filteredBookings;

  const getStatusLabel = useCallback((status: string): string => {
    return getBookingStatusLabel(status);
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    // Convert frontend status back to API status for badge
    const apiStatus = status === 'completed' ? 'MAINTENANCE_COMPLETE' : status.toUpperCase();
    return getBookingStatusBadge(apiStatus);
  }, []);

  const handleViewDetails = useCallback((bookingId: string) => {
    // Điều hướng đến trang chi tiết booking status
    navigate('/customer/booking-status', {
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
      <div className="mb-6">
        <Form {...filterForm}>
          <form>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                name="query"
                control={filterForm.control}
                render={({ field }) => (
                  <FormItem>
                    <Label>Tìm kiếm</Label>
                    <FormControl>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="pl-9 pr-10"
                          placeholder="Booking ID, VIN, Model xe..."
                          {...field}
                        />
                        {field.value && (
                          <button
                            type="button"
                            onClick={() => field.onChange('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="status"
                control={filterForm.control}
                render={({ field }) => (
                  <FormItem>
                    <Label>Trạng thái</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {bookingStatuses.map((status) => {
                          const normalizedStatus = status.toLowerCase().replace('_', '_');
                          let filterValue = normalizedStatus;
                          // Map API status to filter value
                          if (status === 'MAINTENANCE_COMPLETE') {
                            filterValue = 'completed';
                          }
                          return (
                            <SelectItem key={`status-${status}`} value={filterValue}>
                              {getStatusLabel(status)}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <div className="flex items-end justify-end">
                <Button variant="destructive" onClick={clearAll}>
                  <Trash2 className="w-4 h-4 mr-2" /> Xóa tất cả
                </Button>
              </div>
            </div>
          </form>
        </Form>
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
