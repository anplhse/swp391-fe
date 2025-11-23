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
import { History, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type PaymentHistory = {
  id: number;
  invoiceNumber: string;
  orderCode: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  paidAt: string;
  transactionRef: string;
  responseCode: string;
  bookingId?: number;
};

export default function PaymentHistoryPage() {
  const { toast } = useToast();
  const currentUser = authService.getAuthState().user;
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: paymentHistory = [],
    isLoading,
    error,
  } = useQuery<PaymentHistory[]>({
    queryKey: ['paymentHistory', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const history = await apiClient.getCustomerPaymentHistory(currentUser.id);
      // Sắp xếp theo thời gian thanh toán (mới nhất trước)
      return [...history].sort((a, b) => {
        const dateA = new Date(a.paidAt || a.createdAt).getTime();
        const dateB = new Date(b.paidAt || b.createdAt).getTime();
        return dateB - dateA;
      });
    },
    enabled: !!currentUser, // Chỉ chạy query khi có user
  });

  // Xử lý error
  useEffect(() => {
    if (error) {
      showApiErrorToast(error, toast, 'Không thể tải lịch sử thanh toán.');
    }
  }, [error, toast]);

  // Filter payment history based on search term
  const filteredPaymentHistory = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return paymentHistory;
    }

    const searchLower = debouncedSearchTerm.toLowerCase().trim();
    return paymentHistory.filter((payment) => {
      return (
        payment.orderCode.toLowerCase().includes(searchLower) ||
        payment.invoiceNumber.toLowerCase().includes(searchLower) ||
        payment.transactionRef?.toLowerCase().includes(searchLower) ||
        payment.paymentMethod.toLowerCase().includes(searchLower) ||
        payment.status.toLowerCase().includes(searchLower) ||
        payment.amount.toString().includes(searchLower) ||
        new Date(payment.paidAt || payment.createdAt)
          .toLocaleString('vi-VN')
          .toLowerCase()
          .includes(searchLower)
      );
    });
  }, [paymentHistory, debouncedSearchTerm]);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }, []);

  const paymentHistoryColumns: ColumnDef<PaymentHistory>[] = useMemo(() => [
    {
      accessorKey: 'orderCode',
      header: 'Mã đơn hàng',
      cell: ({ row }) => <span className="font-mono font-medium">{row.original.orderCode}</span>,
    },
    {
      accessorKey: 'invoiceNumber',
      header: 'Số hóa đơn',
      cell: ({ row }) => <span className="font-mono">{row.original.invoiceNumber}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Số tiền',
      cell: ({ row }) => (
        <span className="font-semibold text-green-600">
          {formatPrice(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Phương thức',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.paymentMethod}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={status === 'SUCCESSFUL' ? 'default' : 'secondary'}
            className={status === 'SUCCESSFUL' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {status === 'SUCCESSFUL' ? 'Thành công' : status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'transactionRef',
      header: 'Mã giao dịch',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.transactionRef || '—'}</span>
      ),
    },
    {
      accessorKey: 'paidAt',
      header: 'Thời gian thanh toán',
      cell: ({ row }) => (
        <span>{new Date(row.original.paidAt || row.original.createdAt).toLocaleString('vi-VN')}</span>
      ),
    },
  ], [formatPrice]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Lịch sử thanh toán</h1>
        </div>
        <p className="text-muted-foreground">
          Xem tất cả các giao dịch thanh toán của bạn
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, hóa đơn, giao dịch, phương thức..."
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
            Tìm thấy {filteredPaymentHistory.length} kết quả
          </span>
        )}
      </div>

      {/* Payment History Table */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải lịch sử thanh toán...</p>
          </div>
        ) : filteredPaymentHistory.length > 0 ? (
          <DataTable
            columns={paymentHistoryColumns}
            data={filteredPaymentHistory}
          />
        ) : paymentHistory.length > 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Không tìm thấy kết quả nào</p>
            <p className="text-sm text-muted-foreground mt-2">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chưa có lịch sử thanh toán</p>
          </div>
        )}
      </div>
    </div>
  );
}

