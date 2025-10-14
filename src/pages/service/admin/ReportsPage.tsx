import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Car, DollarSign, Download, TrendingUp, Users, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ReportData {
  revenue: {
    monthly: { month: string; amount: number }[];
    byService: { service: string; amount: number; count: number }[];
    growth: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
    active: number;
    byType: { type: string; count: number }[];
  };
  services: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    byType: { type: string; count: number }[];
    averageDuration: number;
  };
  vehicles: {
    total: number;
    inService: number;
    completed: number;
    byBrand: { brand: string; count: number }[];
    byYear: { year: number; count: number }[];
  };
  performance: {
    technicians: { name: string; completed: number; rating: number }[];
    staff: { name: string; customers: number; rating: number }[];
    averageCompletionTime: number;
    customerSatisfaction: number;
  };
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [periodFilter, setPeriodFilter] = useState('this_month');
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    // Mock data
    const mockData: ReportData = {
      revenue: {
        monthly: [
          { month: 'Tháng 10', amount: 20000000 },
          { month: 'Tháng 11', amount: 22000000 },
          { month: 'Tháng 12', amount: 25000000 },
          { month: 'Tháng 1', amount: 28000000 }
        ],
        byService: [
          { service: 'Bảo dưỡng định kỳ', amount: 12000000, count: 24 },
          { service: 'Sửa chữa hệ thống pin', amount: 8000000, count: 8 },
          { service: 'Kiểm tra hệ thống điện', amount: 4000000, count: 16 },
          { service: 'Thay thế phụ tùng', amount: 4000000, count: 12 }
        ],
        growth: 12.0
      },
      customers: {
        total: 150,
        newThisMonth: 25,
        active: 120,
        byType: [
          { type: 'Cá nhân', count: 100 },
          { type: 'Doanh nghiệp', count: 50 }
        ]
      },
      services: {
        total: 60,
        completed: 45,
        pending: 10,
        cancelled: 5,
        byType: [
          { type: 'Bảo dưỡng', count: 30 },
          { type: 'Sửa chữa', count: 15 },
          { type: 'Kiểm tra', count: 10 },
          { type: 'Thay thế', count: 5 }
        ],
        averageDuration: 120
      },
      vehicles: {
        total: 200,
        inService: 15,
        completed: 180,
        byBrand: [
          { brand: 'VinFast', count: 80 },
          { brand: 'Tesla', count: 60 },
          { brand: 'BYD', count: 40 },
          { brand: 'Khác', count: 20 }
        ],
        byYear: [
          { year: 2023, count: 100 },
          { year: 2022, count: 60 },
          { year: 2021, count: 30 },
          { year: 2020, count: 10 }
        ]
      },
      performance: {
        technicians: [
          { name: 'Lê Văn Technician', completed: 25, rating: 4.9 },
          { name: 'Nguyễn Thị Kỹ thuật', completed: 20, rating: 4.8 },
          { name: 'Trần Văn Sửa chữa', completed: 18, rating: 4.7 }
        ],
        staff: [
          { name: 'Trần Thị Staff', customers: 50, rating: 4.7 },
          { name: 'Phạm Văn Tiếp nhận', customers: 45, rating: 4.6 },
          { name: 'Lê Thị Dịch vụ', customers: 40, rating: 4.8 }
        ],
        averageCompletionTime: 2.5,
        customerSatisfaction: 4.7
      }
    };
    setReportData(mockData);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingUp className="w-4 h-4 text-red-500" />;
  };

  if (!reportData) return null;

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Báo cáo & thống kê</h1>
            <p className="text-muted-foreground">Theo dõi hiệu suất và xu hướng kinh doanh</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button>
              <BarChart3 className="w-4 h-4 mr-2" />
              Tạo báo cáo
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
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Loại báo cáo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Tổng quan</SelectItem>
              <SelectItem value="revenue">Doanh thu</SelectItem>
              <SelectItem value="customers">Khách hàng</SelectItem>
              <SelectItem value="services">Dịch vụ</SelectItem>
              <SelectItem value="performance">Hiệu suất</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
            <TabsTrigger value="customers">Khách hàng</TabsTrigger>
            <TabsTrigger value="services">Dịch vụ</TabsTrigger>
            <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Doanh thu tháng</CardTitle>
                    <DollarSign className="w-4 h-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(reportData.revenue.monthly[3].amount)}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {getGrowthIcon(reportData.revenue.growth)}
                    <span className={getGrowthColor(reportData.revenue.growth)}>
                      +{reportData.revenue.growth}%
                    </span>
                    <span className="text-muted-foreground">so với tháng trước</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.customers.total}</div>
                  <div className="text-sm text-muted-foreground">
                    +{reportData.customers.newThisMonth} mới tháng này
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Dịch vụ</CardTitle>
                    <Wrench className="w-4 h-4 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.services.total}</div>
                  <div className="text-sm text-muted-foreground">
                    {reportData.services.completed} hoàn thành
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Xe</CardTitle>
                    <Car className="w-4 h-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.vehicles.total}</div>
                  <div className="text-sm text-muted-foreground">
                    {reportData.vehicles.inService} đang sửa chữa
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Doanh thu theo dịch vụ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.revenue.byService.map((service, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{service.service}</div>
                          <div className="text-sm text-muted-foreground">{service.count} dịch vụ</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(service.amount)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Xe theo thương hiệu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.vehicles.byBrand.map((brand, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="font-medium">{brand.brand}</div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(brand.count / reportData.vehicles.total) * 100}
                            className="w-20 h-2"
                          />
                          <span className="text-sm font-medium">{brand.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Doanh thu theo tháng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.revenue.monthly.map((month, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="font-medium">{month.month}</div>
                        <div className="font-bold">{formatCurrency(month.amount)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Doanh thu theo dịch vụ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.revenue.byService.map((service, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{service.service}</div>
                          <div className="text-sm text-muted-foreground">{service.count} dịch vụ</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(service.amount)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê khách hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Tổng khách hàng</span>
                      <span className="font-bold">{reportData.customers.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Khách hàng mới tháng này</span>
                      <span className="font-bold">{reportData.customers.newThisMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Khách hàng hoạt động</span>
                      <span className="font-bold">{reportData.customers.active}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Khách hàng theo loại</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.customers.byType.map((type, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="font-medium">{type.type}</div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(type.count / reportData.customers.total) * 100}
                            className="w-20 h-2"
                          />
                          <span className="text-sm font-medium">{type.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê dịch vụ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Tổng dịch vụ</span>
                      <span className="font-bold">{reportData.services.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Hoàn thành</span>
                      <span className="font-bold text-green-500">{reportData.services.completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Chờ xử lý</span>
                      <span className="font-bold text-yellow-500">{reportData.services.pending}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Hủy</span>
                      <span className="font-bold text-red-500">{reportData.services.cancelled}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Thời gian trung bình</span>
                      <span className="font-bold">{reportData.services.averageDuration} phút</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dịch vụ theo loại</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.services.byType.map((type, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="font-medium">{type.type}</div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(type.count / reportData.services.total) * 100}
                            className="w-20 h-2"
                          />
                          <span className="text-sm font-medium">{type.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Hiệu suất kỹ thuật viên</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.performance.technicians.map((tech, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{tech.name}</div>
                          <div className="text-sm text-muted-foreground">Đánh giá: {tech.rating}/5</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{tech.completed} công việc</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hiệu suất nhân viên</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.performance.staff.map((staff, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-muted-foreground">Đánh giá: {staff.rating}/5</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{staff.customers} khách hàng</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thời gian hoàn thành trung bình</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">{reportData.performance.averageCompletionTime} giờ</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mức độ hài lòng khách hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">{reportData.performance.customerSatisfaction}/5</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
