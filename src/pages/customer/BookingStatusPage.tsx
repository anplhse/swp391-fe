import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { getBookingStatusBadge, getBookingStatusInfo } from '@/lib/bookingStatusUtils';
import { bookingApi } from '@/lib/bookingUtils';
import { showApiErrorToast } from '@/lib/responseHandler';
import { ColumnDef } from '@tanstack/react-table';
import {
  CreditCard,
  Edit,
  History,
  Star,
  Trash2,
  X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type ApiBooking = {
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
  technicianId?: number | null;
  technicianName?: string | null;
  catalogDetails?: Array<{
    id: number;
    catalogId: number;
    serviceName: string;
    description: string;
  }>;
  invoice?: {
    id: number;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    paidAt: string;
    invoiceLines: Array<{
      id: number;
      itemDescription: string;
      itemType: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  };
};


type FeedbackTag = {
  id: number;
  content: string;
  ratingTarget: number;
};

type Feedback = {
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
};

export default function BookingStatusPage() {
  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedbackTags, setFeedbackTags] = useState<FeedbackTag[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const bookingId = location.state?.bookingId;

        if (!bookingId) {
          toast({
            title: 'Lỗi',
            description: 'Không tìm thấy thông tin booking. Vui lòng quay lại danh sách booking.',
            variant: 'destructive'
          });
          if (mounted) navigate('/customer/bookings');
          return;
        }

        const data = await bookingApi.getBookingById(bookingId);
        if (!mounted) return;
        setBooking(data);

        // Load feedback for this booking
        setIsLoadingFeedback(true);
        try {
          const feedbackData = await apiClient.getFeedbackByBookingId(bookingId);
          if (mounted) {
            setFeedback(feedbackData);
          }
        } catch (error) {
          // Backend xử lý logic, chỉ cần set null nếu có lỗi
          if (mounted) {
            setFeedback(null);
          }
        } finally {
          if (mounted) setIsLoadingFeedback(false);
        }
      } catch (error) {
        console.error('Failed to load booking:', error);
        showApiErrorToast(error, toast, 'Không thể tải thông tin booking.');
        if (mounted) navigate('/customer/bookings');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [location.state, navigate, toast]);

  // Load feedback tags when dialog opens
  useEffect(() => {
    if (isFeedbackDialogOpen) {
      const loadTags = async () => {
        try {
          const tags = await apiClient.getFeedbackTags();
          setFeedbackTags(tags);
        } catch (error) {
          console.error('Failed to load feedback tags:', error);
        }
      };
      loadTags();
    }
  }, [isFeedbackDialogOpen]);

  const getStatusInfo = useCallback((status: string) => {
    return getBookingStatusInfo(status);
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    return getBookingStatusBadge(status);
  }, []);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }, []);

  const handleEditBooking = useCallback(() => {
    if (!booking) return;
    navigate('/customer/booking', {
      state: {
        preselectedVin: booking.vehicleVin,
        preselectedVehicle: { vin: booking.vehicleVin, modelName: booking.vehicleModel },
        editMode: true,
        existingBooking: null
      }
    });
  }, [booking, navigate]);

  const handleCancelBooking = useCallback(async () => {
    if (!booking) return;

    try {
      const result = await bookingApi.cancelBooking(booking.id);
      setBooking(result);
      toast({
        title: 'Hủy lịch hẹn thành công',
        description: 'Lịch hẹn đã được hủy thành công.',
      });
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      showApiErrorToast(error, toast, 'Không thể hủy lịch hẹn');
    }
  }, [booking, toast]);

  const handlePayment = useCallback(async () => {
    if (!booking || !booking.invoice?.id) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy thông tin hóa đơn để thanh toán.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessingPayment(true);
    try {
      const result = await bookingApi.createPayment(booking.invoice.id);
      window.location.href = result.paymentUrl;
    } catch (error) {
      console.error('Payment creation failed', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tạo thanh toán. Vui lòng thử lại.',
        variant: 'destructive',
      });
      setIsProcessingPayment(false);
    }
  }, [booking, toast]);

  const handleOpenFeedbackDialog = useCallback(() => {
    setIsEditingFeedback(false);
    setIsFeedbackDialogOpen(true);
    setSelectedRating(0);
    setSelectedTags([]);
    setFeedbackComment('');
  }, []);

  const handleEditFeedback = useCallback(() => {
    if (!feedback) return;
    setIsEditingFeedback(true);
    setIsFeedbackDialogOpen(true);
    setSelectedRating(feedback.rating);
    setSelectedTags(feedback.tags.map(tag => tag.id));
    setFeedbackComment(feedback.comment || '');
  }, [feedback]);

  const handleToggleTag = useCallback((tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  const handleSubmitFeedback = useCallback(async () => {
    if (!booking || !selectedRating) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn đánh giá sao.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      if (isEditingFeedback && feedback) {
        // Update existing feedback
        await apiClient.updateFeedback(feedback.id, {
          rating: selectedRating,
          comment: feedbackComment,
          bookingId: booking.id,
          tagIds: selectedTags.length > 0 ? selectedTags : undefined,
        });
      } else {
        // Create new feedback
        await apiClient.createFeedback({
          rating: selectedRating,
          comment: feedbackComment,
          tagIds: selectedTags.length > 0 ? selectedTags : undefined,
          bookingId: booking.id,
        });
      }

      // Reload feedback after successful submission
      const feedbackData = await apiClient.getFeedbackByBookingId(booking.id);
      setFeedback(feedbackData);

      toast({
        title: 'Thành công',
        description: isEditingFeedback ? 'Đã cập nhật đánh giá!' : 'Cảm ơn bạn đã đánh giá dịch vụ!',
      });

      setIsFeedbackDialogOpen(false);
      setIsEditingFeedback(false);
      setSelectedRating(0);
      setSelectedTags([]);
      setFeedbackComment('');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      showApiErrorToast(error, toast, isEditingFeedback ? 'Không thể cập nhật đánh giá. Vui lòng thử lại.' : 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  }, [booking, selectedRating, feedbackComment, selectedTags, isEditingFeedback, feedback, toast]);

  const filteredTags = useMemo(() => {
    if (!selectedRating) return [];
    return feedbackTags.filter(tag => tag.ratingTarget === selectedRating);
  }, [feedbackTags, selectedRating]);

  const bookingInfoColumns: ColumnDef<{ label: string; value: string | React.ReactNode }>[] = useMemo(
    () => [
      {
        accessorKey: 'label',
        header: 'Thông tin',
        cell: ({ row }) => <div className="font-medium">{row.getValue('label')}</div>,
      },
      {
        accessorKey: 'value',
        header: 'Chi tiết',
        cell: ({ row }) => <div>{row.getValue('value') as React.ReactNode}</div>,
      },
    ],
    []
  );

  const bookingInfoData = useMemo(() => {
    if (!booking) return [];
    const [dateStr = '', timeStr = ''] = (booking.scheduleDateTime?.value || '').split(' ');
    const data = [
      { label: 'Booking ID', value: <span className="font-mono font-semibold">#{booking.id}</span> },
      { label: 'Trạng thái', value: getStatusBadge(booking.bookingStatus) },
      { label: 'Khách hàng', value: booking.customerName },
      { label: 'VIN', value: <span className="font-mono">{booking.vehicleVin}</span> },
      { label: 'Model xe', value: booking.vehicleModel },
      { label: 'Ngày hẹn', value: dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '—' },
      { label: 'Giờ hẹn', value: timeStr || '—' },
    ];

    if (booking.technicianName) {
      data.push({ label: 'Kỹ thuật viên', value: booking.technicianName });
    }

    data.push(
      { label: 'Tạo lúc', value: new Date(booking.createdAt).toLocaleString('vi-VN') },
      { label: 'Cập nhật lúc', value: new Date(booking.updatedAt).toLocaleString('vi-VN') }
    );

    return data;
  }, [booking, getStatusBadge]);

  const servicesColumns: ColumnDef<{
    id: number;
    serviceName: string;
    description: string;
  }>[] = useMemo(
    () => [
      { accessorKey: 'serviceName', header: 'Tên dịch vụ' },
      { accessorKey: 'description', header: 'Mô tả' },
    ],
    []
  );


  const invoiceLinesColumns: ColumnDef<{
    id: number;
    itemDescription: string;
    itemType: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>[] = useMemo(
    () => [
      {
        accessorKey: 'itemType',
        header: 'Loại',
        cell: ({ row }) => (
          <Badge variant={row.getValue('itemType') === 'SERVICE' ? 'default' : 'secondary'}>
            {row.getValue('itemType') === 'SERVICE' ? 'Dịch vụ' : 'Linh kiện'}
          </Badge>
        ),
      },
      { accessorKey: 'itemDescription', header: 'Hạng mục' },
      {
        accessorKey: 'quantity',
        header: 'SL',
        cell: ({ row }) => <div className="text-center">{row.getValue('quantity')}</div>,
      },
      {
        accessorKey: 'unitPrice',
        header: 'Đơn giá',
        cell: ({ row }) => formatPrice(row.getValue('unitPrice') as number),
      },
      {
        accessorKey: 'totalPrice',
        header: 'Thành tiền',
        cell: ({ row }) => <div className="font-medium">{formatPrice(row.getValue('totalPrice') as number)}</div>,
      },
    ],
    [formatPrice]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thông tin booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <X className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy thông tin booking</h2>
        <p className="text-muted-foreground mb-6">
          Có vẻ như booking không tồn tại hoặc đã bị xóa.
        </p>
        <Button onClick={() => navigate('/customer/bookings')}>
          Quay lại danh sách booking
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.bookingStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <StatusIcon className={`w-12 h-12 mr-3 ${statusInfo.color === 'destructive' ? 'text-red-500' :
            statusInfo.color === 'secondary' ? 'text-yellow-500' :
              'text-green-500'
            }`} />
          <h1 className="text-3xl font-bold">Trạng thái Booking</h1>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Badge variant={statusInfo.color} className="text-lg px-4 py-2">
            {statusInfo.label}
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          {statusInfo.description}
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Booking Information Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Thông tin lịch hẹn</h2>
          <DataTable columns={bookingInfoColumns} data={bookingInfoData} showPagination={false} />
        </div>

        {/* Services Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Dịch vụ đã chọn</h2>
          <DataTable
            columns={servicesColumns}
            data={(booking.catalogDetails || []).map(s => ({
              id: s.id,
              serviceName: s.serviceName,
              description: s.description
            }))}
            showPagination={false}
          />
        </div>

        {/* Invoice Information */}
        {booking.invoice && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Thông tin hóa đơn</h2>
            <DataTable
              columns={bookingInfoColumns}
              data={[
                { label: 'Số hóa đơn', value: <span className="font-mono font-medium">{booking.invoice.invoiceNumber}</span> },
                {
                  label: 'Trạng thái',
                  value: (
                    <Badge
                      variant={booking.invoice.status === 'PAID' ? 'default' : 'secondary'}
                      className={booking.invoice.status === 'PAID' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {booking.invoice.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Badge>
                  ),
                },
                { label: 'Ngày tạo', value: new Date(booking.invoice.issueDate).toLocaleString('vi-VN') },
                { label: 'Hạn thanh toán', value: new Date(booking.invoice.dueDate).toLocaleDateString('vi-VN') },
                {
                  label: 'Thời gian thanh toán',
                  value: booking.invoice.paidAt ? new Date(booking.invoice.paidAt).toLocaleString('vi-VN') : '—',
                },
                {
                  label: 'Tổng tiền',
                  value: <span className="font-semibold text-green-600">{formatPrice(booking.invoice.totalAmount)}</span>,
                },
              ]}
              showPagination={false}
            />
          </div>
        )}

        {/* Invoice Lines */}
        {booking.invoice && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Chi tiết hóa đơn</h2>
            <DataTable
              columns={invoiceLinesColumns}
              data={booking.invoice.invoiceLines}
              showPagination={false}
            />
          </div>
        )}

        {/* Feedback Section - chỉ hiển thị khi booking completed */}
        {booking.bookingStatus === 'MAINTENANCE_COMPLETE' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Đánh giá dịch vụ</h2>
            {isLoadingFeedback ? (
              <div className="border rounded-lg p-6 text-center">
                <p className="text-muted-foreground">Đang tải đánh giá...</p>
              </div>
            ) : feedback ? (
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className={`w-5 h-5 ${rating <= feedback.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(feedback.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditFeedback}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                </div>
                {feedback.comment && (
                  <p className="text-sm">{feedback.comment}</p>
                )}
                {feedback.tags && feedback.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {feedback.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline">
                        {tag.content}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded-lg p-6 text-center space-y-4">
                <p className="text-muted-foreground">Chia sẻ trải nghiệm của bạn về dịch vụ</p>
                <Button
                  onClick={handleOpenFeedbackDialog}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Đánh giá dịch vụ
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          {booking.bookingStatus === 'CONFIRMED' && booking.invoice && (
            <Button
              onClick={handlePayment}
              disabled={isProcessingPayment}
              className="bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessingPayment ? 'Đang xử lý...' : 'Thanh toán'}
            </Button>
          )}
          {booking.bookingStatus === 'MAINTENANCE_COMPLETE' && booking.invoice && booking.invoice.status !== 'PAID' && (
            <Button
              onClick={handlePayment}
              disabled={isProcessingPayment}
              className="bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessingPayment ? 'Đang xử lý...' : 'Thanh toán ngay'}
            </Button>
          )}
          {booking.bookingStatus === 'PENDING' && (
            <>
              <Button variant="outline" onClick={handleEditBooking}>
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa lịch hẹn
              </Button>
              <Button variant="destructive" onClick={handleCancelBooking}>
                <Trash2 className="w-4 h-4 mr-2" />
                Hủy lịch hẹn
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => navigate('/customer/bookings')}>
            <History className="w-4 h-4 mr-2" />
            Xem lịch sử
          </Button>
          <Button variant="outline" onClick={() => navigate('/customer')}>
            Về trang chủ
          </Button>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditingFeedback ? 'Chỉnh sửa đánh giá' : 'Đánh giá dịch vụ'}</DialogTitle>
            <DialogDescription>
              {isEditingFeedback ? 'Cập nhật đánh giá của bạn về dịch vụ bảo dưỡng' : 'Chia sẻ trải nghiệm của bạn về dịch vụ bảo dưỡng'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Rating Stars */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Đánh giá sao *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setSelectedRating(rating)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${rating <= selectedRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            {selectedRating > 0 && filteredTags.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Chọn tags (tùy chọn)</label>
                <div className="flex flex-wrap gap-2">
                  {filteredTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleToggleTag(tag.id)}
                    >
                      {tag.content}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Comment */}
            <div className="space-y-2">
              <label htmlFor="feedback-comment" className="text-sm font-medium">
                Nhận xét (tùy chọn)
              </label>
              <Textarea
                id="feedback-comment"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFeedbackDialogOpen(false)}
              disabled={isSubmittingFeedback}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={isSubmittingFeedback || !selectedRating}
            >
              {isSubmittingFeedback ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
