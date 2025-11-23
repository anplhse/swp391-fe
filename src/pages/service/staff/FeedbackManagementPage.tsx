import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { apiClient } from '@/lib/api';
import { bookingApi } from '@/lib/bookingUtils';
import { showApiErrorToast } from '@/lib/responseHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Search, Star, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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

export default function FeedbackManagementPage() {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);

  const filterSchema = z.object({
    search: z.string().optional(),
  });
  type FilterForm = z.infer<typeof filterSchema>;

  const filterForm = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: '' }
  });

  const watchFilters = filterForm.watch();
  const debouncedSearchTerm = useDebounce(watchFilters.search || '', 300);

  const loadFeedbacks = useCallback(async () => {
    try {
      setIsLoading(true);
      const feedbackList = await apiClient.getAllFeedbacks();
      // Sắp xếp theo thời gian tạo (mới nhất trước)
      const sorted = [...feedbackList].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      setFeedbacks(sorted);
    } catch (error) {
      console.error('Failed to load feedbacks:', error);
      showApiErrorToast(error, toast, 'Không thể tải danh sách đánh giá');
      setFeedbacks([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  const filteredFeedbacks = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return feedbacks;
    }

    const searchLower = debouncedSearchTerm.toLowerCase().trim();
    return feedbacks.filter((feedback) => {
      return (
        feedback.comment.toLowerCase().includes(searchLower) ||
        feedback.bookingId.toString().includes(searchLower) ||
        feedback.customerName.toLowerCase().includes(searchLower) ||
        feedback.rating.toString().includes(searchLower) ||
        feedback.tags.some((tag) => tag.content.toLowerCase().includes(searchLower)) ||
        new Date(feedback.createdAt)
          .toLocaleString('vi-VN')
          .toLowerCase()
          .includes(searchLower)
      );
    });
  }, [feedbacks, debouncedSearchTerm]);

  const handleViewDetails = useCallback(async (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsDetailDialogOpen(true);
    setIsLoadingBooking(true);
    try {
      const booking = await bookingApi.getBookingById(feedback.bookingId);
      setSelectedBooking(booking);
    } catch (error) {
      console.error('Failed to load booking details:', error);
      showApiErrorToast(error, toast, 'Không thể tải thông tin booking');
    } finally {
      setIsLoadingBooking(false);
    }
  }, [toast]);

  const feedbackColumns: ColumnDef<Feedback>[] = useMemo(() => [
    {
      accessorKey: 'rating',
      header: 'Đánh giá',
      cell: ({ row }) => {
        const rating = row.getValue('rating') as number;
        return (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
                  }`}
              />
            ))}
            <span className="ml-2 text-sm font-medium">{rating}/5</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'customerName',
      header: 'Khách hàng',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('customerName')}</div>
      ),
    },
    {
      accessorKey: 'bookingId',
      header: 'Booking ID',
      cell: ({ row }) => (
        <div className="font-mono text-sm">#{row.getValue('bookingId')}</div>
      ),
    },
    {
      accessorKey: 'comment',
      header: 'Bình luận',
      cell: ({ row }) => {
        const comment = row.getValue('comment') as string;
        return (
          <div className="max-w-md truncate text-sm">
            {comment || '—'}
          </div>
        );
      },
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.getValue('tags') as Feedback['tags'];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.length > 0 ? (
              tags.slice(0, 2).map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.content}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        return (
          <div className="text-sm">
            {date.toLocaleDateString('vi-VN')}
            <div className="text-xs text-muted-foreground">
              {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDetails(row.original)}
        >
          <Eye className="w-4 h-4 mr-2" />
          Chi tiết
        </Button>
      ),
    },
  ], [handleViewDetails]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý đánh giá</h1>
          <p className="text-muted-foreground">Xem tất cả đánh giá từ khách hàng</p>
        </div>
      </div>

      <Form {...filterForm}>
        <form className="flex items-center gap-3">
          <FormField
            name="search"
            control={filterForm.control}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9 pr-10"
                      placeholder="Tìm kiếm theo khách hàng, booking ID, bình luận..."
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
        </form>
      </Form>

      <DataTable
        columns={feedbackColumns}
        data={filteredFeedbacks}
        pageSize={10}
      />

      {/* Feedback Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đánh giá</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về đánh giá và booking liên quan
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-6">
              {/* Feedback Info */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Đánh giá</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= selectedFeedback.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                          }`}
                      />
                    ))}
                    <span className="ml-2 text-lg font-semibold">{selectedFeedback.rating}/5</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Khách hàng</Label>
                  <p className="mt-1 font-medium">{selectedFeedback.customerName}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Bình luận</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedFeedback.comment || 'Không có bình luận'}</p>
                </div>

                {selectedFeedback.tags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedFeedback.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline">
                          {tag.content}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ngày tạo</Label>
                  <p className="mt-1 text-sm">
                    {new Date(selectedFeedback.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Booking Info */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium">Thông tin Booking</Label>
                {isLoadingBooking ? (
                  <div className="py-4 text-center text-muted-foreground">
                    Đang tải thông tin booking...
                  </div>
                ) : selectedBooking ? (
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">Booking ID:</span>
                        <p className="font-medium">#{selectedBooking.id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">VIN:</span>
                        <p className="font-medium font-mono text-xs">{selectedBooking.vehicleVin}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Model:</span>
                        <p className="font-medium">{selectedBooking.vehicleModel}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Trạng thái:</span>
                        <div className="mt-1">
                          {getBookingStatusBadge(selectedBooking.bookingStatus || '')}
                        </div>
                      </div>
                      {selectedBooking.scheduleDateTime?.value && (
                        <div>
                          <span className="text-muted-foreground">Ngày hẹn:</span>
                          <p className="font-medium">
                            {new Date(selectedBooking.scheduleDateTime.value).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      )}
                      {selectedBooking.catalogDetails && selectedBooking.catalogDetails.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Dịch vụ:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedBooking.catalogDetails.map((detail: any) => (
                              <Badge key={detail.id} variant="outline" className="text-xs">
                                {detail.serviceName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    Không thể tải thông tin booking
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

