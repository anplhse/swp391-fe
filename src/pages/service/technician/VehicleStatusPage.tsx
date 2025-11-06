import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Battery, Car, CheckCircle, Clock, Wrench, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VehicleStatus {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  customerName: string;
  currentStatus: 'in_service' | 'waiting' | 'completed' | 'issue';
  serviceType: string;
  startTime: string;
  estimatedEndTime: string;
  actualEndTime?: string;
  progress: number;
  battery: {
    level: number;
    health: number;
    temperature: number;
    voltage: number;
    charging: boolean;
  };
  motor: {
    status: 'good' | 'warning' | 'error';
    temperature: number;
    rpm: number;
    power: number;
  };
  electrical: {
    status: 'good' | 'warning' | 'error';
    voltage: number;
    current: number;
    insulation: number;
  };
  diagnostics: {
    errorCodes: string[];
    warnings: string[];
    recommendations: string[];
  };
  maintenance: {
    lastService: string;
    nextService: string;
    mileage: number;
    serviceHistory: string[];
  };
}

export default function VehicleStatusPage() {
  const [vehicles, setVehicles] = useState<VehicleStatus[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Vehicles should be loaded from API
    // TODO: Load vehicles from API
    setVehicles([]);
  }, []);

  const filteredVehicles = vehicles.filter(vehicle =>
    statusFilter === 'all' || vehicle.currentStatus === statusFilter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_service':
        return <Badge variant="destructive">Đang sửa chữa</Badge>;
      case 'waiting':
        return <Badge className="bg-yellow-500">Chờ xử lý</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Hoàn thành</Badge>;
      case 'issue':
        return <Badge variant="outline">Có vấn đề</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getBatteryStatus = (battery: VehicleStatus['battery']) => {
    if (battery.health < 70) return 'error';
    if (battery.health < 85) return 'warning';
    return 'good';
  };

  const getBatteryStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const inServiceVehicles = filteredVehicles.filter(v => v.currentStatus === 'in_service');
  const waitingVehicles = filteredVehicles.filter(v => v.currentStatus === 'waiting');
  const completedVehicles = filteredVehicles.filter(v => v.currentStatus === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trạng thái xe</h1>
          <p className="text-muted-foreground">Theo dõi trạng thái và thông số kỹ thuật của xe</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="in_service">Đang sửa chữa</SelectItem>
            <SelectItem value="waiting">Chờ xử lý</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="issue">Có vấn đề</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="in_service" className="space-y-4">
        <TabsList>
          <TabsTrigger value="in_service">Đang sửa chữa ({inServiceVehicles.length})</TabsTrigger>
          <TabsTrigger value="waiting">Chờ xử lý ({waitingVehicles.length})</TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành ({completedVehicles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="in_service" className="space-y-4">
          <div className="grid gap-4">
            {inServiceVehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{vehicle.plate}</CardTitle>
                    </div>
                    {getStatusBadge(vehicle.currentStatus)}
                  </div>
                  <CardDescription>
                    {vehicle.brand} {vehicle.model} ({vehicle.year}) - {vehicle.customerName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tiến độ sửa chữa</span>
                      <span>{vehicle.progress}%</span>
                    </div>
                    <Progress value={vehicle.progress} className="w-full" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Battery className="w-4 h-4" />
                          <CardTitle className="text-sm">Pin</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Mức pin:</span>
                          <span>{vehicle.battery.level}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Sức khỏe:</span>
                          <span>{vehicle.battery.health}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Nhiệt độ:</span>
                          <span>{vehicle.battery.temperature}°C</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Điện áp:</span>
                          <span>{vehicle.battery.voltage}V</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4" />
                          <CardTitle className="text-sm">Động cơ</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Trạng thái:</span>
                          <Badge variant={vehicle.motor.status === 'good' ? 'default' : vehicle.motor.status === 'warning' ? 'destructive' : 'outline'}>
                            {vehicle.motor.status === 'good' ? 'Tốt' : vehicle.motor.status === 'warning' ? 'Cảnh báo' : 'Lỗi'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Nhiệt độ:</span>
                          <span>{vehicle.motor.temperature}°C</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>RPM:</span>
                          <span>{vehicle.motor.rpm}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Công suất:</span>
                          <span>{vehicle.motor.power}kW</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          <CardTitle className="text-sm">Hệ thống điện</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Trạng thái:</span>
                          <Badge variant={vehicle.electrical.status === 'good' ? 'default' : vehicle.electrical.status === 'warning' ? 'destructive' : 'outline'}>
                            {vehicle.electrical.status === 'good' ? 'Tốt' : vehicle.electrical.status === 'warning' ? 'Cảnh báo' : 'Lỗi'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Điện áp:</span>
                          <span>{vehicle.electrical.voltage}V</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Dòng điện:</span>
                          <span>{vehicle.electrical.current}A</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Cách điện:</span>
                          <span>{vehicle.electrical.insulation}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {vehicle.diagnostics.errorCodes.length > 0 && (
                    <Card className="border-destructive">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-destructive">Mã lỗi</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {vehicle.diagnostics.errorCodes.map((code, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">{code}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {vehicle.diagnostics.warnings.length > 0 && (
                    <Card className="border-yellow-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-yellow-600">Cảnh báo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside text-sm text-yellow-600">
                          {vehicle.diagnostics.warnings.map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button size="sm">
                      Cập nhật trạng thái
                    </Button>
                    <Button variant="outline" size="sm">
                      Chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="waiting" className="space-y-4">
          <div className="grid gap-4">
            {waitingVehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{vehicle.plate}</CardTitle>
                    </div>
                    {getStatusBadge(vehicle.currentStatus)}
                  </div>
                  <CardDescription>
                    {vehicle.brand} {vehicle.model} ({vehicle.year}) - {vehicle.customerName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <span className="font-medium">Dịch vụ:</span> {vehicle.serviceType}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Thời gian dự kiến:</span> {new Date(vehicle.estimatedEndTime).toLocaleString('vi-VN')}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm">
                      Bắt đầu sửa chữa
                    </Button>
                    <Button variant="outline" size="sm">
                      Chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {completedVehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{vehicle.plate}</CardTitle>
                    </div>
                    {getStatusBadge(vehicle.currentStatus)}
                  </div>
                  <CardDescription>
                    {vehicle.brand} {vehicle.model} ({vehicle.year}) - {vehicle.customerName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <span className="font-medium">Dịch vụ:</span> {vehicle.serviceType}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Hoàn thành lúc:</span> {vehicle.actualEndTime ? new Date(vehicle.actualEndTime).toLocaleString('vi-VN') : 'N/A'}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Dịch vụ tiếp theo:</span> {new Date(vehicle.maintenance.nextService).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      Chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
