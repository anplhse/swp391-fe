import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Banknote, CreditCard, DollarSign, Receipt, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FinancialData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  expenses: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  profit: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  transactions: {
    id: string;
    type: 'revenue' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: string;
    status: 'completed' | 'pending' | 'cancelled';
    paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'other';
  }[];
  invoices: {
    id: string;
    customerName: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    dueDate: string;
    paidDate?: string;
    services: string[];
  }[];
  expenses: {
    id: string;
    category: string;
    amount: number;
    description: string;
    date: string;
    status: 'approved' | 'pending' | 'rejected';
    approvedBy?: string;
  }[];
}

export default function FinanceManagementPage() {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [periodFilter, setPeriodFilter] = useState('this_month');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    // Mock data
    const mockData: FinancialData = {
      revenue: {
        total: 150000000,
        thisMonth: 25000000,
        lastMonth: 22000000,
        growth: 13.6
      },
      expenses: {
        total: 120000000,
        thisMonth: 18000000,
        lastMonth: 20000000,
        growth: -10.0
      },
      profit: {
        total: 30000000,
        thisMonth: 7000000,
        lastMonth: 2000000,
        growth: 250.0
      },
      transactions: [
        {
          id: '1',
          type: 'revenue',
          category: 'Bảo dưỡng',
          amount: 500000,
          description: 'Bảo dưỡng định kỳ - VinFast VF8',
          date: '2024-01-25',
          status: 'completed',
          paymentMethod: 'bank_transfer'
        },
        {
          id: '2',
          type: 'revenue',
          category: 'Sửa chữa',
          amount: 1500000,
          description: 'Sửa chữa hệ thống pin - Tesla Model 3',
          date: '2024-01-24',
          status: 'completed',
          paymentMethod: 'credit_card'
        },
        {
          id: '3',
          type: 'expense',
          category: 'Phụ tùng',
          amount: 800000,
          description: 'Mua phụ tùng thay thế',
          date: '2024-01-23',
          status: 'completed',
          paymentMethod: 'bank_transfer'
        },
        {
          id: '4',
          type: 'expense',
          category: 'Lương',
          amount: 50000000,
          description: 'Lương tháng 1/2024',
          date: '2024-01-31',
          status: 'pending',
          paymentMethod: 'bank_transfer'
        }
      ],
      invoices: [
        {
          id: 'INV-001',
          customerName: 'Nguyễn Văn A',
          amount: 500000,
          status: 'paid',
          dueDate: '2024-01-25',
          paidDate: '2024-01-25',
          services: ['Bảo dưỡng định kỳ']
        },
        {
          id: 'INV-002',
          customerName: 'Trần Thị B',
          amount: 1500000,
          status: 'paid',
          dueDate: '2024-01-24',
          paidDate: '2024-01-24',
          services: ['Sửa chữa hệ thống pin']
        },
        {
          id: 'INV-003',
          customerName: 'Lê Văn C',
          amount: 300000,
          status: 'pending',
          dueDate: '2024-01-30',
          services: ['Kiểm tra hệ thống điện']
        },
        {
          id: 'INV-004',
          customerName: 'Phạm Thị D',
          amount: 800000,
          status: 'overdue',
          dueDate: '2024-01-20',
          services: ['Thay thế phụ tùng']
        }
      ],
      expenses: [
        {
          id: '1',
          category: 'Phụ tùng',
          amount: 800000,
          description: 'Mua phụ tùng thay thế',
          date: '2024-01-23',
          status: 'approved',
          approvedBy: 'Nguyễn Văn Admin'
        },
        {
          id: '2',
          category: 'Lương',
          amount: 50000000,
          description: 'Lương tháng 1/2024',
          date: '2024-01-31',
          status: 'pending'
        },
        {
          id: '3',
          category: 'Điện nước',
          amount: 2000000,
          description: 'Hóa đơn điện nước tháng 1',
          date: '2024-01-25',
          status: 'approved',
          approvedBy: 'Nguyễn Văn Admin'
        },
        {
          id: '4',
          category: 'Bảo hiểm',
          amount: 5000000,
          description: 'Bảo hiểm nhân viên',
          date: '2024-01-20',
          status: 'approved',
          approvedBy: 'Nguyễn Văn Admin'
        }
      ]
    };
    setFinancialData(mockData);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'approved':
        return <Badge className="bg-green-500">Hoàn thành</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Chờ xử lý</Badge>;
      case 'cancelled':
      case 'rejected':
        return <Badge variant="destructive">Hủy</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Quá hạn</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'bank_transfer':
        return <CreditCard className="w-4 h-4" />;
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-500' : 'text-red-500';
  };

  if (!financialData) return null;

  return (
    <DashboardLayout user={{ email: 'admin@service.com', role: 'admin', userType: 'service' }}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Quản lý tài chính</h1>
            <p className="text-muted-foreground">Theo dõi doanh thu, chi phí và lợi nhuận</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Receipt className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button>
              <DollarSign className="w-4 h-4 mr-2" />
              Thêm giao dịch
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Chọn kỳ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">Tháng này</SelectItem>
              <SelectItem value="last_month">Tháng trước</SelectItem>
              <SelectItem value="this_quarter">Quý này</SelectItem>
              <SelectItem value="this_year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="revenue">Doanh thu</SelectItem>
              <SelectItem value="expense">Chi phí</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
                <DollarSign className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialData.revenue.thisMonth)}</div>
              <div className="flex items-center gap-1 text-sm">
                {getGrowthIcon(financialData.revenue.growth)}
                <span className={getGrowthColor(financialData.revenue.growth)}>
                  {Math.abs(financialData.revenue.growth)}%
                </span>
                <span className="text-muted-foreground">so với tháng trước</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Chi phí</CardTitle>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialData.expenses.thisMonth)}</div>
              <div className="flex items-center gap-1 text-sm">
                {getGrowthIcon(financialData.expenses.growth)}
                <span className={getGrowthColor(financialData.expenses.growth)}>
                  {Math.abs(financialData.expenses.growth)}%
                </span>
                <span className="text-muted-foreground">so với tháng trước</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Lợi nhuận</CardTitle>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financialData.profit.thisMonth)}</div>
              <div className="flex items-center gap-1 text-sm">
                {getGrowthIcon(financialData.profit.growth)}
                <span className={getGrowthColor(financialData.profit.growth)}>
                  {Math.abs(financialData.profit.growth)}%
                </span>
                <span className="text-muted-foreground">so với tháng trước</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Giao dịch ({financialData.transactions.length})</TabsTrigger>
            <TabsTrigger value="invoices">Hóa đơn ({financialData.invoices.length})</TabsTrigger>
            <TabsTrigger value="expenses">Chi phí ({financialData.expenses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <div className="grid gap-4">
              {financialData.transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <CardTitle className="text-lg">{transaction.description}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={transaction.type === 'revenue' ? 'default' : 'secondary'}>
                          {transaction.type === 'revenue' ? 'Doanh thu' : 'Chi phí'}
                        </Badge>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                    <CardDescription>
                      {transaction.category} - {new Date(transaction.date).toLocaleDateString('vi-VN')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">{formatCurrency(transaction.amount)}</span>
                      <div className="text-sm text-muted-foreground">
                        {transaction.paymentMethod === 'cash' ? 'Tiền mặt' :
                          transaction.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' :
                            transaction.paymentMethod === 'credit_card' ? 'Thẻ tín dụng' : 'Khác'}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Chi tiết
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Chỉnh sửa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <div className="grid gap-4">
              {financialData.invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{invoice.id}</CardTitle>
                      </div>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <CardDescription>
                      {invoice.customerName} - {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-2xl font-bold">{formatCurrency(invoice.amount)}</div>
                    <div className="text-sm">
                      <span className="font-medium">Dịch vụ:</span> {invoice.services.join(', ')}
                    </div>
                    {invoice.paidDate && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Thanh toán:</span> {new Date(invoice.paidDate).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Xem hóa đơn
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Gửi lại
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <div className="grid gap-4">
              {financialData.expenses.map((expense) => (
                <Card key={expense.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{expense.description}</CardTitle>
                      </div>
                      {getStatusBadge(expense.status)}
                    </div>
                    <CardDescription>
                      {expense.category} - {new Date(expense.date).toLocaleDateString('vi-VN')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-2xl font-bold">{formatCurrency(expense.amount)}</div>
                    {expense.approvedBy && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Duyệt bởi:</span> {expense.approvedBy}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Chi tiết
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Chỉnh sửa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
