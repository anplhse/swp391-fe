import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  Battery,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Edit,
  History,
  MapPin,
  Settings,
  Wrench
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  model: string;
  year: number;
  battery: number;
  nextService: string;
  status: 'healthy' | 'warning' | 'critical';
  mileage: number;
  color: string;
  vin: string;
  purchaseDate: string;
}

interface ServiceRecord {
  id: string;
  service: string;
  date: string;
  center: string;
  technician: string;
  status: 'completed' | 'in_progress' | 'pending';
  cost: string;
  details: {
    checkIn: string | null;
    checkOut: string | null;
    services: string[];
    notes: string;
  };
}

interface VehiclePackage {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export default function VehicleProfilePage() {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const { toast } = useToast();
  const user = { email: 'customer@example.com', role: 'customer', userType: 'customer' };

  // Mock data - in real app, this would be fetched based on vehicleId
  const vehicle: Vehicle = {
    id: vehicleId || '1',
    name: 'VinFast VF8',
    plate: '30A-123.45',
    model: 'VF8 Plus',
    year: 2024,
    battery: 85,
    nextService: '2025-10-15',
    status: 'healthy',
    mileage: 15000,
    color: 'Trắng',
    vin: 'VF8PLUS2024001',
    purchaseDate: '2024-01-15'
  };

  const serviceHistory: ServiceRecord[] = [
    {
      id: 'SV2025001',
      service: 'Bảo dưỡng định kỳ',
      date: '2025-08-20',
      center: 'Trung tâm bảo dưỡng Hà Nội',
      technician: 'Nguyễn Văn A',
      status: 'completed',
      cost: '2,500,000 VND',
      details: {
        checkIn: '08:00',
        checkOut: '11:30',
        services: ['Kiểm tra pin', 'Thay dầu phanh', 'Cập nhật phần mềm'],
        notes: 'Xe trong tình trạng tốt, đã thay dầu phanh theo lịch định kỳ'
      }
    },
    {
      id: 'SV2025002',
      service: 'Thay lốp xe',
      date: '2025-07-10',
      center: 'Trung tâm bảo dưỡng TP.HCM',
      technician: 'Trần Văn B',
      status: 'completed',
      cost: '1,800,000 VND',
      details: {
        checkIn: '14:00',
        checkOut: '15:45',
        services: ['Thay 4 lốp xe mới', 'Cân bằng lốp'],
        notes: 'Lốp cũ đã mòn 80%, được thay mới hoàn toàn'
      }
    },
    {
      id: 'SV2025003',
      service: 'Kiểm tra pin',
      date: '2025-09-25',
      center: 'Trung tâm bảo dưỡng Hà Nội',
      technician: 'Lê Văn C',
      status: 'in_progress',
      cost: '1,200,000 VND',
      details: {
        checkIn: '09:00',
        checkOut: null,
        services: ['Kiểm tra dung lượng pin', 'Chẩn đoán hệ thống sạc'],
        notes: 'Đang tiến hành kiểm tra chi tiết hệ thống pin'
      }
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" />Tốt</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="gap-1"><AlertCircle className="w-3 h-3" />Cần kiểm tra</Badge>;
      case 'critical':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" />Cần bảo dưỡng</Badge>;
      default:
        return null;
    }
  };

  const getServiceStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" />Hoàn thành</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Đang bảo dưỡng</Badge>;
      case 'pending':
        return <Badge variant="outline" className="gap-1"><AlertCircle className="w-3 h-3" />Chờ thực hiện</Badge>;
      default:
        return null;
    }
  };

  const totalCost = serviceHistory
    .filter(service => service.status === 'completed')
    .reduce((sum, service) => sum + parseInt(service.cost.replace(/[^\d]/g, '')), 0);


  const handleEditVehicle = () => {
    navigate('/customer/vehicles');
  };

  // Mock packages for this vehicle
  const packagesForThisVehicle: VehiclePackage[] = [
    {
      id: 'premium',
      name: 'Gói Cao cấp',
      startDate: '2024-01-01',
      endDate: '2025-01-01',
      status: 'active'
    }
  ];

  const daysLeft = (end: string) => {
    const diff = new Date(end).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleRenewPackage = (pkg: VehiclePackage) => {
    const priceMap: Record<string, number> = {
      basic: 15000000,
      premium: 25000000,
      vip: 40000000
    };
    const renewPrice = priceMap[pkg.id] ?? 0;
    navigate('/customer/payment', {
      state: {
        items: [
          {
            id: pkg.id,
            name: `${pkg.name} - Gia hạn`,
            type: 'package',
            price: renewPrice,
            quantity: 1,
            description: 'Gia hạn gói dịch vụ thêm 12 tháng'
          }
        ],
        from: 'packages',
        vehicleId: vehicleId
      }
    });
  };

  const handleBookService = () => {
    // Điều hướng tới đặt lịch với vehicleId đã biết
    const modelId = vehicle.name.toLowerCase().includes('vf8') ? 'vf8' : vehicle.name.toLowerCase().includes('vf9') ? 'vf9' : vehicle.name.toLowerCase().includes('e34') ? 'vfe34' : 'vf5';
    navigate('/customer/booking', {
      state: {
        vehicles: [{ id: modelId, name: vehicle.name, type: modelId === 'vfe34' ? 'Sedan' : (modelId === 'vf5' ? 'Hatchback' : 'SUV'), plate: vehicle.plate, year: String(vehicle.year) }],
        preselectVehicleId: modelId
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1" />
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditVehicle}>
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button variant="electric" onClick={handleBookService}>
            <Wrench className="w-4 h-4 mr-2" />
            Đặt lịch bảo dưỡng
          </Button>
        </div>
      </div>

      {/* Vehicle Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Tình trạng xe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{vehicle.name}</h3>
                <p className="text-sm text-muted-foreground">{vehicle.plate} • {vehicle.model}</p>
              </div>
              {getStatusBadge(vehicle.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Pin:</span>
                  <span className="font-medium">{vehicle.battery}%</span>
                </div>
                <Progress value={vehicle.battery} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Số km:</span>
                  <span className="font-medium">{vehicle.mileage.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Màu sắc:</span>
                <p className="font-medium">{vehicle.color}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Số VIN:</span>
                <p className="font-medium text-xs">{vehicle.vin}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Ngày mua:</span>
                <p className="font-medium">{new Date(vehicle.purchaseDate).toLocaleDateString('vi-VN')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Bảo dưỡng tiếp theo:</span>
                <p className="font-medium">{new Date(vehicle.nextService).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{serviceHistory.length}</p>
                <p className="text-sm text-muted-foreground">Lần bảo dưỡng</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCost.toLocaleString('vi-VN')} VND</p>
                <p className="text-sm text-muted-foreground">Tổng chi phí</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{serviceHistory.filter(s => s.status === 'completed').length}</p>
                <p className="text-sm text-muted-foreground">Hoàn thành</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{serviceHistory.filter(s => s.status !== 'completed').length}</p>
                <p className="text-sm text-muted-foreground">Đang xử lý</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Lịch sử bảo dưỡng
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Settings className="w-4 h-4 mr-2" />
            Lịch bảo dưỡng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử bảo dưỡng</CardTitle>
              <CardDescription>
                Chi tiết các lần bảo dưỡng và sửa chữa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceHistory.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{service.service}</h3>
                          {getServiceStatusBadge(service.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">Mã: {service.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(service.date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{service.cost}</p>
                        <p className="text-sm text-muted-foreground">{service.center}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{service.center}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-muted-foreground" />
                        <span>KTV: {service.technician}</span>
                      </div>
                    </div>

                    {service.details.checkIn && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Nhận xe: {service.details.checkIn}</span>
                        </div>
                        {service.details.checkOut && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Trả xe: {service.details.checkOut}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Dịch vụ thực hiện:</h4>
                      <div className="flex flex-wrap gap-2">
                        {service.details.services.map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {service.details.notes && (
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">Ghi chú:</h4>
                        <p className="text-sm text-muted-foreground">{service.details.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {service.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Tải hóa đơn
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          {/* Current Service Packages for this vehicle */}
          <Card>
            <CardHeader>
              <CardTitle>Gói dịch vụ hiện tại</CardTitle>
              <CardDescription>Gói đang gắn với xe này</CardDescription>
            </CardHeader>
            <CardContent>
              {packagesForThisVehicle.length > 0 ? (
                <div className="space-y-4">
                  {packagesForThisVehicle.map((p) => (
                    <div key={p.id} className="border rounded-lg p-4 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{p.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(p.startDate).toLocaleDateString('vi-VN')} - {new Date(p.endDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {daysLeft(p.endDate) > 0 ? (
                          <Badge variant="default">Còn {daysLeft(p.endDate)} ngày</Badge>
                        ) : (
                          <Badge variant="secondary">Hết hạn</Badge>
                        )}
                        {(daysLeft(p.endDate) <= 30) && (
                          <>
                            <span className="text-sm text-muted-foreground hidden md:inline">
                              {(() => {
                                const priceMap: Record<string, number> = { basic: 15000000, premium: 25000000, vip: 40000000 };
                                const renewPrice = priceMap[p.id] ?? 0;
                                return `${renewPrice.toLocaleString('vi-VN')} VND`;
                              })()}
                            </span>
                            <Button size="sm" onClick={() => handleRenewPackage(p)}>
                              Gia hạn
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-sm text-muted-foreground">Chưa có gói dịch vụ nào được gắn cho xe này.</p>
                  <Button onClick={() => navigate('/customer/packages')}>Mua gói dịch vụ</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch bảo dưỡng</CardTitle>
              <CardDescription>
                Lịch bảo dưỡng định kỳ và nhắc nhở
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Bảo dưỡng định kỳ tiếp theo</h3>
                    <Badge variant="secondary">Sắp tới</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(vehicle.nextService).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-muted-foreground" />
                      <span>Bảo dưỡng định kỳ 6 tháng</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Battery className="w-4 h-4 text-muted-foreground" />
                      <span>Kiểm tra pin và hệ thống điện</span>
                    </div>
                  </div>
                  <Button className="mt-4" onClick={handleBookService}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Đặt lịch ngay
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Bảo dưỡng 3 tháng</h4>
                    <p className="text-sm text-muted-foreground mb-2">Kiểm tra cơ bản</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span>Kiểm tra lốp</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span>Kiểm tra phanh</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span>Kiểm tra đèn</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Bảo dưỡng 6 tháng</h4>
                    <p className="text-sm text-muted-foreground mb-2">Bảo dưỡng toàn diện</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span>Kiểm tra pin</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span>Thay dầu phanh</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span>Cập nhật phần mềm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  );
}
