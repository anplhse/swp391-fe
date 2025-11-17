import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { bookingApi } from '@/lib/bookingUtils';
import { showApiErrorToast } from '@/lib/responseHandler';
import { Activity, AlertTriangle, ArrowDown, ArrowUp, Calendar, CheckCircle, DollarSign, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';

interface UserCounts {
  totalActiveCustomer: number;
  totalActiveEmployee: number;
}

interface Revenue {
  period: string;
  totalRevenue: number;
  percentageChangeVsPreviousPeriod: number;
}

interface RevenueChart {
  period: string;
  totalRevenue: number;
}

interface BookingCounts {
  totalCompleteBooking: number;
  totalNotCompleteBooking: number;
}

interface Alert {
  alertMessage: string;
  alertType: string;
}

interface AlertCounts {
  totalAlert: number;
}

export default function AdminDashboard() {
  const [userCounts, setUserCounts] = useState<UserCounts | null>(null);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChart[]>([]);
  const [bookingCounts, setBookingCounts] = useState<BookingCounts | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertCounts, setAlertCounts] = useState<AlertCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6 tháng');
  const { toast } = useToast();

  // Mock data for different periods
  const generateMockData = (period: string, baseData: RevenueChart[]) => {
    if (period === '3 tháng') {
      // Return last 3 months from the 6-month data
      return baseData.slice(-3);
    } else if (period === '1 năm') {
      // Generate 12 months of mock data based on the pattern
      const lastValue = baseData[baseData.length - 1]?.totalRevenue || 0;
      const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
      return months.map((month, index) => ({
        period: `${month}/2025`,
        totalRevenue: Math.floor(lastValue * (0.5 + (index / 12) * 0.8)),
      }));
    }
    return baseData; // 6 tháng - original data
  };

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        userCountsData,
        revenueData,
        revenueChartData,
        bookingCountsData,
        alertsData,
        alertCountsData,
      ] = await Promise.all([
        bookingApi.getDashboardUserCounts(),
        bookingApi.getDashboardRevenue(),
        bookingApi.getDashboardRevenueLast6Months(),
        bookingApi.getDashboardBookingCounts(),
        bookingApi.getDashboardAlerts(),
        bookingApi.getDashboardAlertCounts(),
      ]);

      setUserCounts(userCountsData);
      setRevenue(revenueData);
      setRevenueChart(revenueChartData);
      setBookingCounts(bookingCountsData);
      setAlerts(alertsData);
      setAlertCounts(alertCountsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      showApiErrorToast(error, toast, 'Không thể tải dữ liệu dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan hiệu suất và doanh thu của trung tâm
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Cập nhật: {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* Stats Cards - All in one row */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {/* Total Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenue ? formatCurrency(revenue.totalRevenue) : '0 ₫'}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {revenue && revenue.percentageChangeVsPreviousPeriod !== 0 && (
                <>
                  {revenue.percentageChangeVsPreviousPeriod > 0 ? (
                    <ArrowUp className="h-3 w-3 text-accent" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className={`text-xs font-medium ${revenue.percentageChangeVsPreviousPeriod > 0
                    ? 'text-accent'
                    : 'text-destructive'
                    }`}>
                    {formatPercentage(revenue.percentageChangeVsPreviousPeriod)}
                  </span>
                </>
              )}
              <span className="text-xs text-muted-foreground ml-1">
                {revenue?.period || 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Active Customers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userCounts?.totalActiveCustomer || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Đang hoạt động
            </p>
          </CardContent>
        </Card>

        {/* Active Employees Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhân viên</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userCounts?.totalActiveEmployee || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Đang hoạt động
            </p>
          </CardContent>
        </Card>

        {/* Alerts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {alertCounts?.totalAlert || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tồn kho thấp
            </p>
          </CardContent>
        </Card>

        {/* Completed Bookings Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {bookingCounts?.totalCompleteBooking || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Đơn đã xong
            </p>
          </CardContent>
        </Card>

        {/* Pending Bookings Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa xong</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {bookingCounts?.totalNotCompleteBooking || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Đang xử lý
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Biểu đồ doanh thu</CardTitle>
              <CardDescription>
                Tổng doanh thu trong {selectedPeriod} gần nhất
              </CardDescription>
            </div>

            {/* Period Selector - TODO: Add API for different periods */}
            <div className="flex bg-muted rounded-lg p-1">
              {['3 tháng', '6 tháng', '1 năm'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${selectedPeriod === period
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pl-2">
          {revenueChart.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={generateMockData(selectedPeriod, revenueChart)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="period"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-card p-3 shadow-lg">
                            <p className="text-sm font-medium text-card-foreground mb-2">
                              {payload[0].payload.period}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-primary rounded-full"></div>
                              <span className="text-sm text-muted-foreground">Doanh thu:</span>
                              <span className="text-sm font-medium">
                                {formatCurrency(payload[0].value as number)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-4 pl-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Doanh thu</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(generateMockData(selectedPeriod, revenueChart)[generateMockData(selectedPeriod, revenueChart).length - 1]?.totalRevenue || 0)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Chưa có dữ liệu doanh thu
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Cảnh báo tồn kho
              </CardTitle>
              <CardDescription>
                Các phụ tùng có số lượng thấp cần nhập thêm
              </CardDescription>
            </div>
            {alertCounts && alertCounts.totalAlert > 0 && (
              <Badge variant="destructive" className="bg-warning text-warning-foreground">
                {alertCounts.totalAlert} cảnh báo
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border border-warning/20 bg-warning/5"
                >
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{alert.alertMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <CheckCircle className="h-12 w-12 text-accent mb-2" />
              <p>Không có cảnh báo tồn kho</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
