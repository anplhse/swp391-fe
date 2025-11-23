import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { apiClient } from '@/lib/api';
import { getBookingStatusBadge, getBookingStatusLabel, mapBookingStatusToFrontend } from '@/lib/bookingStatusUtils';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Edit, Eye, Package, Search, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface Appointment {
  id: string;
  customerName?: string;
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
  status: 'pending' | 'confirmed' | 'assigned' | 'paid' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  center: string;
  technician?: string;
  notes?: string;
  createdAt: string;
  estimatedDuration: string;
  paymentStatus?: string;
  totalAmount?: number;
}

interface AppointmentTableProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onCheckParts?: (id: string) => void;
  partsCheckResult?: Record<string, boolean>;
  isLoadingParts?: Record<string, boolean>;
  showActions?: boolean;
}

// Filter form schema
const filterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'pending', 'confirmed', 'paid', 'in_progress', 'completed', 'cancelled'])
});
type FilterForm = z.infer<typeof filterSchema>;

export function AppointmentTable({
  appointments,
  onEdit,
  onConfirm,
  onCancel,
  onViewDetails,
  onCheckParts,
  partsCheckResult = {},
  isLoadingParts = {},
  showActions = true
}: AppointmentTableProps) {
  const [bookingStatuses, setBookingStatuses] = useState<string[]>([]);

  const filterForm = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: '', status: 'all' }
  });

  const watchFilters = filterForm.watch();
  const debouncedSearch = useDebounce(watchFilters.search || '', 300);

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

  const getStatusLabel = (status: string): string => {
    return getBookingStatusLabel(status);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const term = debouncedSearch.toLowerCase().trim();
      const matchesSearch = !term ||
        appointment.id.toLowerCase().includes(term) ||
        appointment.date.toLowerCase().includes(term) ||
        appointment.time.toLowerCase().includes(term) ||
        (appointment.customerName && appointment.customerName.toLowerCase().includes(term)) ||
        appointment.vehicle.plate.toLowerCase().includes(term) ||
        appointment.vehicle.model.toLowerCase().includes(term) ||
        (appointment.technician && appointment.technician.toLowerCase().includes(term));

      const matchesStatus = watchFilters.status === 'all' || appointment.status === watchFilters.status;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, debouncedSearch, watchFilters.status]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredAppointments.length / pageSize);

  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAppointments.slice(startIndex, startIndex + pageSize);
  }, [filteredAppointments, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, watchFilters.status]);


  const getStatusBadge = (status: string) => {
    // Convert frontend status to API status
    const normalized = (status || '').toLowerCase();
    let apiStatus = status;
    if (normalized === 'completed' || normalized === 'maintenance_complete') {
      apiStatus = 'MAINTENANCE_COMPLETE';
    } else {
      apiStatus = status.toUpperCase();
    }
    return getBookingStatusBadge(apiStatus);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex items-center justify-between">
        <Form {...filterForm}>
          <form className="flex items-center gap-3">
            <FormField name="search" control={filterForm.control} render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input className="pl-9 pr-10 w-64" placeholder="Tìm kiếm..." {...field} />
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
            )} />
            <FormField name="status" control={filterForm.control} render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {bookingStatuses.map((status) => {
                      const filterValue = mapBookingStatusToFrontend(status);
                      return (
                        <SelectItem key={`status-${status}`} value={filterValue}>
                          {getBookingStatusLabel(status)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
          </form>
        </Form>
      </div>

      {/* Appointments Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Ngày tạo lịch hẹn</TableHead>
              <TableHead>Tên khách</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Kỹ thuật viên</TableHead>
              {showActions && <TableHead className="text-right">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 8 : 7} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy lịch hẹn nào
                </TableCell>
              </TableRow>
            ) : (
              paginatedAppointments.map(appointment => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">#{appointment.id}</TableCell>
                  <TableCell>
                    {new Date(appointment.date).toLocaleDateString('vi-VN')} {appointment.time}
                  </TableCell>
                  <TableCell>{appointment.customerName || '—'}</TableCell>
                  <TableCell className="text-xs font-mono">{appointment.vehicle.plate || '—'}</TableCell>
                  <TableCell>{appointment.vehicle.model || '—'}</TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>{appointment.technician || '—'}</TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        {appointment.status === 'pending' && (
                          <>
                            {onCheckParts && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onCheckParts(appointment.id)}
                                disabled={isLoadingParts[appointment.id]}
                              >
                                <Package className="w-4 h-4 mr-1" />
                                {isLoadingParts[appointment.id] ? 'Đang kiểm tra...' : 'Kiểm tra phụ tùng'}
                              </Button>
                            )}
                            {partsCheckResult[appointment.id] === true && (
                              <Button
                                size="sm"
                                onClick={() => onConfirm(appointment.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Xác nhận
                              </Button>
                            )}
                            {partsCheckResult[appointment.id] === false && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onCancel(appointment.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Từ chối
                              </Button>
                            )}
                            {partsCheckResult[appointment.id] === undefined && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onCancel(appointment.id)}
                              >
                                Từ chối
                              </Button>
                            )}
                          </>
                        )}
                        {onViewDetails && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewDetails(appointment.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Chi tiết
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => onEdit(appointment)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
