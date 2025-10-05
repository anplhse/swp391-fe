import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
  Wrench
} from 'lucide-react';

export default function AdminDashboard() {

  // Mock data for admin
  const dashboardStats = {
    totalRevenue: '2,450,000,000',
    monthlyGrowth: 12.5,
    totalCustomers: 1234,
    activeStaff: 25,
    completedServices: 892,
    pendingServices: 15
  };

  const revenueData = [
    { month: 'T1', revenue: 180000000 },
    { month: 'T2', revenue: 210000000 },
    { month: 'T3', revenue: 245000000 },
    { month: 'T4', revenue: 298000000 },
    { month: 'T5', revenue: 315000000 },
    { month: 'T6', revenue: 280000000 }
  ];

  const staffPerformance = [
    {
      id: 1,
      name: 'Nguyễn Văn Staff',
      role: 'Nhân viên',
      completedTasks: 45,
      efficiency: 95,
      customerRating: 4.8
    },
    {
      id: 2,
      name: 'Trần Văn Tech',
      role: 'Kỹ thuật viên',
      completedTasks: 38,
      efficiency: 92,
      customerRating: 4.7
    },
    {
      id: 3,
      name: 'Lê Thị Manager',
      role: 'Quản lý',
      completedTasks: 52,
      efficiency: 98,
      customerRating: 4.9
    }
  ];

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Tồn kho phụ tùng pin dưới mức tối thiểu',
      time: '10 phút trước',
      priority: 'high'
    },
    {
      id: 2,
      type: 'info',
      message: 'Cập nhật phần mềm hệ thống có sẵn',
      time: '1 giờ trước',
      priority: 'normal'
    },
    {
      id: 3,
      type: 'success',
      message: 'Hoàn thành backup dữ liệu hàng tuần',
      time: '2 giờ trước',
      priority: 'low'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Khách hàng mới đăng ký',
      user: 'Phạm Văn A',
      time: '5 phút trước',
      type: 'customer'
    },
    {
      id: 2,
      action: 'Hoàn thành bảo dưỡng',
      user: 'Trần Văn Tech',
      time: '15 phút trước',
      type: 'service'
    },
    {
      id: 3,
      action: 'Đặt lịch hẹn mới',
      user: 'Lê Thị B',
      time: '30 phút trước',
      type: 'appointment'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">Tổng quan hệ thống</h2>
        <p className="text-white/80">
          Quản lý toàn bộ hoạt động của trung tâm bảo dưỡng xe điện.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-lg font-bold">{(parseFloat(dashboardStats.totalRevenue) / 1000000000).toFixed(1)}B VND</p>
                <p className="text-sm text-muted-foreground">Doanh thu</p>
                <div className="flex items-center gap-1 text-xs text-accent">
                  <TrendingUp className="w-3 h-3" />
                  +{dashboardStats.monthlyGrowth}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold">{dashboardStats.totalCustomers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Khách hàng</p>
                <p className="text-xs text-muted-foreground">{dashboardStats.activeStaff} nhân viên</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Wrench className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-lg font-bold">{dashboardStats.completedServices}</p>
                <p className="text-sm text-muted-foreground">Dịch vụ hoàn thành</p>
                <p className="text-xs text-muted-foreground">{dashboardStats.pendingServices} đang chờ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-lg font-bold">{systemAlerts.filter(a => a.priority === 'high').length}</p>
                <p className="text-sm text-muted-foreground">Cảnh báo</p>
                <p className="text-xs text-muted-foreground">Cần xử lý ngay</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Hiệu suất nhân viên
            </CardTitle>
            <CardDescription>
              Đánh giá hiệu suất làm việc của đội ngũ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {staffPerformance.map((staff) => (
              <div key={staff.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`/avatars/${staff.id}.png`} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {staff.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{staff.name}</h3>
                    <p className="text-sm text-muted-foreground">{staff.role}</p>
                  </div>
                  <Badge variant="outline">
                    ⭐ {staff.customerRating}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Công việc hoàn thành:</span>
                    <span className="font-medium">{staff.completedTasks}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Hiệu suất:</span>
                    <span className="font-medium">{staff.efficiency}%</span>
                  </div>
                  <Progress value={staff.efficiency} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Cảnh báo hệ thống
            </CardTitle>
            <CardDescription>
              Các thông báo quan trọng cần xử lý
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-warning" />}
                    {alert.type === 'info' && <Settings className="w-4 h-4 text-primary" />}
                    {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-accent" />}
                    <Badge variant={
                      alert.priority === 'high' ? 'destructive' :
                        alert.priority === 'normal' ? 'secondary' : 'outline'
                    }>
                      {alert.priority === 'high' ? 'Khẩn cấp' :
                        alert.priority === 'normal' ? 'Thông thường' : 'Thấp'}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Doanh thu 6 tháng gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.map((item) => (
                <div key={item.month} className="flex items-center gap-4">
                  <span className="w-8 text-sm font-medium">{item.month}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{(item.revenue / 1000000).toFixed(0)}M VND</span>
                      <span>{((item.revenue / Math.max(...revenueData.map(r => r.revenue))) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress
                      value={(item.revenue / Math.max(...revenueData.map(r => r.revenue))) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="border-b pb-3 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-primary/10">
                    {activity.type === 'customer' && <UserPlus className="w-3 h-3 text-primary" />}
                    {activity.type === 'service' && <Wrench className="w-3 h-3 text-accent" />}
                    {activity.type === 'appointment' && <Calendar className="w-3 h-3 text-warning" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>Các chức năng quản trị thường dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="electric" className="h-20 flex-col space-y-2">
              <UserPlus className="w-6 h-6" />
              <span>Thêm nhân viên</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Car className="w-6 h-6" />
              <span>Quản lý xe</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="w-6 h-6" />
              <span>Báo cáo</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Settings className="w-6 h-6" />
              <span>Cài đặt</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}