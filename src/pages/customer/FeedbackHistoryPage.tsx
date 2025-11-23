import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { apiClient } from '@/lib/api';
import { authService } from '@/lib/auth';
import { showApiErrorToast } from '@/lib/responseHandler';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { MessageSquare, Search, Star, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function FeedbackHistoryPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentUser = authService.getAuthState().user;
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: feedbacks = [],
    isLoading,
    error,
  } = useQuery<Feedback[]>({
    queryKey: ['feedbackHistory', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const feedbackList = await apiClient.getFeedbackByCustomerId(currentUser.id);
      // Sắp xếp theo thời gian tạo (mới nhất trước)
      return [...feedbackList].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    },
    enabled: !!currentUser, // Chỉ chạy query khi có user
  });

  // Xử lý error
  useEffect(() => {
    if (error) {
      showApiErrorToast(error, toast, 'Không thể tải lịch sử đánh giá.');
    }
  }, [error, toast]);

  // Filter feedbacks based on search term
  const filteredFeedbacks = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return feedbacks;
    }

    const searchLower = debouncedSearchTerm.toLowerCase().trim();
    return feedbacks.filter((feedback) => {
      return (
        feedback.comment.toLowerCase().includes(searchLower) ||
        feedback.bookingId.toString().includes(searchLower) ||
        feedback.rating.toString().includes(searchLower) ||
        feedback.tags.some((tag) => tag.content.toLowerCase().includes(searchLower)) ||
        new Date(feedback.createdAt)
          .toLocaleString('vi-VN')
          .toLowerCase()
          .includes(searchLower)
      );
    });
  }, [feedbacks, debouncedSearchTerm]);

  const handleViewBooking = useCallback((bookingId: number) => {
    navigate('/customer/booking-status', { state: { bookingId } });
  }, [navigate]);

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
                  : 'text-gray-300'
                  }`}
              />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'comment',
      header: 'Nhận xét',
      cell: ({ row }) => {
        const comment = row.getValue('comment') as string;
        return (
          <div className="max-w-md">
            <p className="text-sm line-clamp-2">{comment || 'Không có nhận xét'}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.getValue('tags') as Feedback['tags'];
        if (!tags || tags.length === 0) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.content}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'bookingId',
      header: 'Mã đơn',
      cell: ({ row }) => {
        const bookingId = row.getValue('bookingId') as number;
        return (
          <button
            onClick={() => handleViewBooking(bookingId)}
            className="text-primary hover:underline text-sm font-medium"
          >
            #{bookingId}
          </button>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày đánh giá',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt') as string);
        return (
          <span className="text-sm">
            {date.toLocaleString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        );
      },
    },
  ], [handleViewBooking]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Lịch sử đánh giá</h1>
        </div>
        <p className="text-muted-foreground">
          Xem tất cả các đánh giá dịch vụ của bạn
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo nhận xét, mã đơn, rating, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {debouncedSearchTerm && (
          <span className="text-sm text-muted-foreground">
            Tìm thấy {filteredFeedbacks.length} kết quả
          </span>
        )}
      </div>

      {/* Feedback History Table */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải lịch sử đánh giá...</p>
          </div>
        ) : filteredFeedbacks.length > 0 ? (
          <DataTable
            columns={feedbackColumns}
            data={filteredFeedbacks}
          />
        ) : feedbacks.length > 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Không tìm thấy kết quả nào</p>
            <p className="text-sm text-muted-foreground mt-2">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chưa có đánh giá nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

