import { AppointmentTable } from '@/components/AppointmentTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { getBookingStatusBadge, mapBookingStatusToFrontend } from '@/lib/bookingStatusUtils';
import { bookingApi } from '@/lib/bookingUtils';
import { showApiErrorToast, showApiResponseToast } from '@/lib/responseHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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

interface BookingDetail {
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
  catalogDetails: Array<{
    id: number;
    catalogId: number;
    serviceName: string;
    description: string;
  }>;
  invoice?: {
    id: number;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string | null;
    totalAmount: number;
    status: string;
    createdAt: string;
    invoiceLines: Array<{
      id: number;
      itemDescription: string;
      itemType: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  };
}

export default function AppointmentManagementPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<{
    id: number;
    rating: number;
    comment: string;
    tags: Array<{
      id: number;
      content: string;
      ratingTarget: number;
    }>;
    bookingId: number;
    customerId: number;
    customerName: string;
    createdAt: string;
  } | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [partsCheckResult, setPartsCheckResult] = useState<Record<string, boolean>>({});
  const [isLoadingParts, setIsLoadingParts] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const appointmentSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'paid', 'in_progress', 'completed', 'cancelled', 'rejected']),
    technician: z.string().optional(),
    notes: z.string().optional()
  });
  type AppointmentFormData = z.infer<typeof appointmentSchema>;

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { status: 'pending', technician: '', notes: '' }
  });


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const bookingsData = await bookingApi.getAllBookings();
        if (!mounted) return;

        // Ensure data is an array
        if (!Array.isArray(bookingsData)) {
          console.error('getAllBookings returned non-array:', bookingsData);
          setAppointments([]);
          return;
        }

        const mapped: Appointment[] = bookingsData.map(b => {
          const dt = b.scheduleDateTime?.value || '';
          const [date, time] = dt.split(' ');
          const toStatus = (s: string): Appointment['status'] => {
            return mapBookingStatusToFrontend(s);
          };

          return {
            id: String(b.id),
            customerName: b.customerName,
            services: (b.catalogDetails || []).map(cd => ({
              id: String(cd.id),
              name: cd.serviceName,
              description: cd.description || '',
              price: 0, // Not available in API
              duration: '1h', // Default
            })),
            vehicle: {
              id: b.vehicleVin,
              name: b.vehicleVin,
              plate: b.vehicleVin,
              model: b.vehicleModel,
            },
            date: date || new Date().toISOString().split('T')[0],
            time: time || '00:00',
            status: toStatus(b.bookingStatus),
            center: 'Trung tâm bảo dưỡng Hà Nội',
            technician: b.technicianName || b.assignedTechnicianName || undefined,
            createdAt: b.createdAt,
            estimatedDuration: '1h',
          };
        });

        setAppointments(mapped);
      } catch (error) {
        console.error('Failed to load bookings:', error);
        showApiErrorToast(error, toast, 'Không thể tải danh sách lịch hẹn');
        if (mounted) {
          setAppointments([]);
        }
      }
    })();
    return () => { mounted = false; };
  }, [toast]);


  const handleCheckParts = async (id: string) => {
    setIsLoadingParts(prev => ({ ...prev, [id]: true }));
    try {
      const bookingId = parseInt(id);
      if (isNaN(bookingId)) {
        throw new Error('ID booking không hợp lệ');
      }
      const hasEnoughParts = await bookingApi.checkBookingParts(bookingId);
      setPartsCheckResult(prev => ({ ...prev, [id]: hasEnoughParts }));
      toast({
        title: hasEnoughParts ? 'Đủ phụ tùng' : 'Thiếu phụ tùng',
        description: hasEnoughParts
          ? 'Có đủ phụ tùng để thực hiện dịch vụ. Bạn có thể xác nhận booking.'
          : 'Không đủ phụ tùng. Bạn có thể từ chối booking.',
        variant: hasEnoughParts ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Failed to check parts:', error);
      // Check if error message indicates booking is already confirmed
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('đã được xác nhận') || errorMessage.includes('không cần kiểm tra')) {
        toast({
          title: 'Thông báo',
          description: 'Đơn đã được xác nhận, không cần kiểm tra số lượng phụ tùng.',
          variant: 'default',
        });
      } else {
        showApiErrorToast(error, toast, 'Không thể kiểm tra phụ tùng');
      }
    } finally {
      setIsLoadingParts(prev => ({ ...prev, [id]: false }));
    }
  };

  const loadAppointments = useCallback(async (showErrorToast = true) => {
    try {
      const bookingsData = await bookingApi.getAllBookings();

      // Ensure data is an array
      if (!Array.isArray(bookingsData)) {
        console.error('getAllBookings returned non-array:', bookingsData);
        setAppointments([]);
        return;
      }

      const mapped: Appointment[] = bookingsData.map(b => {
        const dt = b.scheduleDateTime?.value || '';
        const [date, time] = dt.split(' ');
        const toStatus = (s: string): Appointment['status'] => {
          const normalized = (s || '').toUpperCase();
          switch (normalized) {
            case 'PENDING': return 'pending';
            case 'CONFIRMED': return 'confirmed';
            case 'PAID': return 'paid';
            case 'ASSIGNED': return 'assigned';
            case 'IN_PROGRESS': return 'in_progress';
            case 'MAINTENANCE_COMPLETE': return 'completed';
            case 'CANCELLED': return 'cancelled';
            case 'REJECTED': return 'rejected';
            default: return 'pending';
          }
        };

        return {
          id: String(b.id),
          customerName: b.customerName,
          services: (b.catalogDetails || []).map(cd => ({
            id: String(cd.id),
            name: cd.serviceName,
            description: cd.description || '',
            price: 0, // Not available in getAllBookings response
            duration: '1h', // Not available in getAllBookings response
          })),
          vehicle: {
            id: b.vehicleVin,
            name: b.vehicleVin,
            plate: b.vehicleVin, // VIN is used as plate identifier
            model: b.vehicleModel,
          },
          date: date || new Date().toISOString().split('T')[0],
          time: time || '00:00',
          status: toStatus(b.bookingStatus),
          center: 'Trung tâm bảo dưỡng Hà Nội',
          technician: b.technicianName || b.assignedTechnicianName || undefined,
          createdAt: b.createdAt,
          estimatedDuration: '1h',
        };
      });

      setAppointments(mapped);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      if (showErrorToast) {
        showApiErrorToast(error, toast, 'Không thể tải danh sách lịch hẹn');
      }
      setAppointments([]);
    }
  }, [toast]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadAppointments();
      if (!mounted) return;
    })();
    return () => { mounted = false; };
  }, [loadAppointments]);

  const handleConfirm = async (id: string) => {
    try {
      const bookingId = parseInt(id);
      if (isNaN(bookingId)) {
        throw new Error('ID booking không hợp lệ');
      }
      const confirmedBooking = await bookingApi.confirmBooking(bookingId);

      // Clear parts check result
      setPartsCheckResult(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      // Create payment if invoice exists
      if (confirmedBooking.invoice?.id) {
        try {
          await bookingApi.createPayment(confirmedBooking.invoice.id);
          toast({
            title: 'Xác nhận thành công',
            description: `Booking #${id} đã được xác nhận và đã tạo thanh toán.`,
          });
        } catch (paymentError) {
          console.error('Failed to create payment:', paymentError);
          // Still show success for booking confirmation, but warn about payment
          showApiErrorToast(paymentError, toast, `Booking #${id} đã được xác nhận, nhưng có lỗi khi tạo thanh toán.`);
        }
      } else {
        toast({
          title: 'Xác nhận thành công',
          description: `Booking #${id} đã được xác nhận.`,
        });
      }

      // Reload appointments to get updated data including jobs
      await loadAppointments(false);
    } catch (error) {
      console.error('Failed to confirm booking:', error);
      showApiErrorToast(error, toast, 'Không thể xác nhận booking');
    }
  };

  const handleViewDetails = async (id: string) => {
    setIsLoadingDetail(true);
    setIsLoadingFeedback(true);
    setIsDetailDialogOpen(true);
    setSelectedFeedback(null);
    try {
      const bookingId = parseInt(id);
      if (isNaN(bookingId)) {
        throw new Error('ID booking không hợp lệ');
      }
      const detail = await bookingApi.getBookingById(bookingId);
      setSelectedBooking(detail);

      // Load feedback for this booking
      try {
        const feedback = await apiClient.getFeedbackByBookingId(bookingId);
        setSelectedFeedback(feedback);
      } catch (error) {
        // Feedback might not exist, set to null
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error('Failed to load booking details:', error);
      showApiErrorToast(error, toast, 'Không thể tải chi tiết booking');
      setIsDetailDialogOpen(false);
    } finally {
      setIsLoadingDetail(false);
      setIsLoadingFeedback(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const bookingId = parseInt(id);
      if (isNaN(bookingId)) {
        throw new Error('ID booking không hợp lệ');
      }
      const result = await bookingApi.rejectBooking(bookingId);

      // Clear parts check result
      setPartsCheckResult(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      // Reload appointments to get updated data including jobs
      await loadAppointments(false);

      // Show success message from backend
      showApiResponseToast(result, toast, 'Từ chối thành công');
    } catch (error) {
      console.error('Failed to reject booking:', error);
      showApiErrorToast(error, toast, 'Không thể từ chối booking');
    }
  };


  const openEdit = (apt: Appointment) => {
    setEditing(apt);
    form.reset({ status: apt.status, technician: apt.technician || '', notes: apt.notes || '' });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: AppointmentFormData) => {
    if (!editing) return;
    const next = appointments.map(a => a.id === editing.id ? { ...a, status: data.status, technician: data.technician, notes: data.notes } : a);
    setAppointments(next);
    setIsDialogOpen(false);
    toast({ title: 'Cập nhật lịch hẹn thành công' });
  };

  return (
    <div className="space-y-6">
      <AppointmentTable
        appointments={appointments}
        onEdit={openEdit}
        onConfirm={handleConfirm}
        onCancel={handleReject}
        onViewDetails={handleViewDetails}
        onCheckParts={handleCheckParts}
        partsCheckResult={partsCheckResult}
        isLoadingParts={isLoadingParts}
        showActions={true}
      />
      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật lịch hẹn</DialogTitle>
            <DialogDescription>Chỉnh sửa trạng thái, kỹ thuật viên và ghi chú</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Chờ xác nhận</SelectItem>
                        <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                        <SelectItem value="paid">Đã thanh toán</SelectItem>
                        <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                        <SelectItem value="rejected">Từ chối</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="technician"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kỹ thuật viên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên kỹ thuật viên" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Input placeholder="Ghi chú cho lịch hẹn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit">Lưu</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết booking #{selectedBooking?.id}</DialogTitle>
            <DialogDescription>Thông tin chi tiết về booking này</DialogDescription>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : selectedBooking ? (
            <div className="space-y-6">
              {/* Booking Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Khách hàng</h4>
                  <p className="font-medium">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Trạng thái</h4>
                  {getBookingStatusBadge(selectedBooking.bookingStatus || '')}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">VIN</h4>
                  <p className="font-medium text-xs">{selectedBooking.vehicleVin}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Model</h4>
                  <p className="font-medium">{selectedBooking.vehicleModel}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Ngày giờ hẹn</h4>
                  <p className="font-medium">
                    {selectedBooking.scheduleDateTime?.value
                      ? new Date(selectedBooking.scheduleDateTime.value.replace(' ', 'T')).toLocaleString('vi-VN')
                      : '—'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Ngày tạo</h4>
                  <p className="font-medium">
                    {new Date(selectedBooking.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Dịch vụ</h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên dịch vụ</TableHead>
                        <TableHead>Mô tả</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBooking.catalogDetails.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.serviceName}</TableCell>
                          <TableCell className="text-muted-foreground">{service.description || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Invoice */}
              {selectedBooking.invoice && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Hóa đơn</h4>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mô tả</TableHead>
                          <TableHead className="text-right">Số lượng</TableHead>
                          <TableHead className="text-right">Đơn giá</TableHead>
                          <TableHead className="text-right">Thành tiền</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedBooking.invoice.invoiceLines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell>{line.itemDescription}</TableCell>
                            <TableCell className="text-right">{line.quantity}</TableCell>
                            <TableCell className="text-right">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(line.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(line.totalPrice)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-semibold">Tổng cộng:</TableCell>
                          <TableCell className="text-right font-semibold text-lg">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedBooking.invoice.totalAmount)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Đánh giá</h4>
                {isLoadingFeedback ? (
                  <div className="py-4 text-center text-muted-foreground">
                    Đang tải đánh giá...
                  </div>
                ) : selectedFeedback ? (
                  <div className="space-y-3 border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Đánh giá:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= selectedFeedback.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                              }`}
                          />
                        ))}
                        <span className="ml-1 text-sm font-medium">{selectedFeedback.rating}/5</span>
                      </div>
                    </div>
                    {selectedFeedback.comment && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Bình luận:</span>
                        <p className="mt-1 text-sm whitespace-pre-wrap">{selectedFeedback.comment}</p>
                      </div>
                    )}
                    {selectedFeedback.tags && selectedFeedback.tags.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedFeedback.tags.map((tag) => (
                            <Badge key={tag.id} variant="outline" className="text-xs">
                              {tag.content}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Ngày đánh giá: {new Date(selectedFeedback.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-muted-foreground border rounded-lg">
                    Chưa có đánh giá cho booking này
                  </div>
                )}
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
