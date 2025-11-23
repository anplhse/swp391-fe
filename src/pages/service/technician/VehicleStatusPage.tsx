import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { authService } from '@/lib/auth';
import { bookingApi } from '@/lib/bookingUtils';
import { showApiErrorToast } from '@/lib/responseHandler';
import { Car } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface VehicleStatus {
  id: string;
  jobId: number;
  bookingId: number;
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
  vehicleVin?: string;
}

interface VehicleDetail {
  vin: string;
  name: string;
  plateNumber: string;
  color: string;
  distanceTraveledKm: number;
  batteryDegradation: number;
  purchasedAt: string;
  modelName: string;
  username: string;
}

export default function VehicleStatusPage() {
  const [vehicles, setVehicles] = useState<VehicleStatus[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleStatus | null>(null);
  const [vehicleDetail, setVehicleDetail] = useState<VehicleDetail | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const { toast } = useToast();

  const loadVehicles = useCallback(async () => {
    try {
      const currentUser = authService.getAuthState().user;
      if (!currentUser || !currentUser.id) {
        console.error('User not found or missing ID');
        return;
      }

      // Get technician-specific tasks
      const jobs = await bookingApi.getTechnicianTasks(currentUser.id);

      // Load booking details for each job to get vehicle and customer info
      const vehiclesWithDetails = await Promise.all(
        jobs.map(async (job) => {
          try {
            const booking = await bookingApi.getBookingById(job.bookingId);

            const toStatus = (s: string): VehicleStatus['currentStatus'] => {
              const normalized = (s || '').toUpperCase();
              if (normalized === 'IN_PROGRESS') return 'in_service';
              if (normalized === 'COMPLETED') return 'completed';
              if (normalized === 'PENDING') return 'waiting';
              return 'waiting';
            };

            const progress = job.status === 'COMPLETED' ? 100 :
              job.status === 'IN_PROGRESS' ? 50 : 0;

            // Extract vehicle info from booking
            const vehicleVin = booking.vehicleVin || '';
            const vehicleModel = booking.vehicleModel || '';
            const vehicleParts = vehicleVin.split(' - ') || [];
            const plate = vehicleParts[0] || vehicleVin || `Booking #${job.bookingId}`;
            const brandModel = vehicleParts[1] || vehicleModel || '';
            const [brand = '', model = ''] = brandModel.split(' ');

            return {
              id: String(job.id),
              jobId: job.id,
              bookingId: job.bookingId,
              plate: plate,
              brand: brand || 'N/A',
              model: model || 'N/A',
              year: new Date().getFullYear(), // Default year if not available
              customerName: booking.customerName || 'N/A',
              currentStatus: toStatus(job.status),
              serviceType: (booking.catalogDetails || []).map(c => c.serviceName).join(', ') || 'Bảo dưỡng',
              startTime: job.startTime || new Date().toISOString(),
              estimatedEndTime: job.estEndTime || new Date().toISOString(),
              actualEndTime: job.actualEndTime || undefined,
              progress: progress,
              vehicleVin: vehicleVin,
            };
          } catch (error) {
            console.error(`Failed to load booking ${job.bookingId}:`, error);
            // Return vehicle with minimal info if booking load fails
            const toStatus = (s: string): VehicleStatus['currentStatus'] => {
              const normalized = (s || '').toUpperCase();
              if (normalized === 'IN_PROGRESS') return 'in_service';
              if (normalized === 'COMPLETED') return 'completed';
              if (normalized === 'PENDING') return 'waiting';
              return 'waiting';
            };
            return {
              id: String(job.id),
              jobId: job.id,
              bookingId: job.bookingId,
              plate: `Booking #${job.bookingId}`,
              brand: 'N/A',
              model: 'N/A',
              year: new Date().getFullYear(),
              customerName: 'N/A',
              currentStatus: toStatus(job.status),
              serviceType: 'Bảo dưỡng',
              startTime: job.startTime || new Date().toISOString(),
              estimatedEndTime: job.estEndTime || new Date().toISOString(),
              actualEndTime: job.actualEndTime || undefined,
              progress: job.status === 'COMPLETED' ? 100 : job.status === 'IN_PROGRESS' ? 50 : 0,
              vehicleVin: '',
            };
          }
        })
      );

      setVehicles(vehiclesWithDetails);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      showApiErrorToast(error, toast, 'Không thể tải danh sách xe');
    }
  }, [toast]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

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

  const handleViewDetail = async (vehicle: VehicleStatus) => {
    setSelectedVehicle(vehicle);
    setIsDetailDialogOpen(true);
    setIsLoadingDetail(true);
    setVehicleDetail(null);

    if (!vehicle.vehicleVin) {
      setIsLoadingDetail(false);
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy VIN của xe',
        variant: 'destructive',
      });
      return;
    }

    try {
      const detail = await apiClient.getVehicleByVin(vehicle.vehicleVin);
      setVehicleDetail({
        vin: detail.vin,
        name: detail.name,
        plateNumber: detail.plateNumber,
        color: detail.color,
        distanceTraveledKm: detail.distanceTraveledKm,
        batteryDegradation: detail.batteryDegradation,
        purchasedAt: detail.purchasedAt,
        modelName: detail.modelName,
        username: detail.username,
      });
    } catch (error) {
      console.error('Failed to load vehicle detail:', error);
      showApiErrorToast(error, toast, 'Không thể tải thông tin chi tiết xe');
    } finally {
      setIsLoadingDetail(false);
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

                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">Dịch vụ:</span> {vehicle.serviceType}
                    </div>
                    <div>
                      <span className="font-medium">Bắt đầu:</span> {new Date(vehicle.startTime).toLocaleString('vi-VN')}
                    </div>
                    <div>
                      <span className="font-medium">Dự kiến hoàn thành:</span> {new Date(vehicle.estimatedEndTime).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm">
                      Cập nhật trạng thái
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetail(vehicle)}>
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
                    <Button variant="outline" size="sm" onClick={() => handleViewDetail(vehicle)}>
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
                    <span className="font-medium">Dịch vụ:</span> {vehicle.serviceType}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetail(vehicle)}>
                      Chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Vehicle Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết xe</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về xe và khách hàng
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="py-8 text-center text-muted-foreground">
              Đang tải thông tin...
            </div>
          ) : vehicleDetail && selectedVehicle ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Biển số xe</label>
                  <p className="text-sm font-semibold">{vehicleDetail.plateNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">VIN</label>
                  <p className="text-sm font-semibold">{vehicleDetail.vin}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tên xe</label>
                  <p className="text-sm font-semibold">{vehicleDetail.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mẫu xe</label>
                  <p className="text-sm font-semibold">{vehicleDetail.modelName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Màu sắc</label>
                  <p className="text-sm font-semibold">{vehicleDetail.color}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Số km đã đi</label>
                  <p className="text-sm font-semibold">{vehicleDetail.distanceTraveledKm?.toLocaleString('vi-VN') || 'N/A'} km</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Độ suy giảm pin</label>
                  <p className="text-sm font-semibold">{vehicleDetail.batteryDegradation !== null ? `${vehicleDetail.batteryDegradation}%` : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày mua</label>
                  <p className="text-sm font-semibold">{new Date(vehicleDetail.purchasedAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Khách hàng</label>
                  <p className="text-sm font-semibold">{selectedVehicle.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tên tài khoản</label>
                  <p className="text-sm font-semibold">{vehicleDetail.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dịch vụ</label>
                  <p className="text-sm font-semibold">{selectedVehicle.serviceType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
                  <div className="mt-1">{getStatusBadge(selectedVehicle.currentStatus)}</div>
                </div>
                {selectedVehicle.startTime && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bắt đầu</label>
                    <p className="text-sm font-semibold">{new Date(selectedVehicle.startTime).toLocaleString('vi-VN')}</p>
                  </div>
                )}
                {selectedVehicle.estimatedEndTime && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dự kiến hoàn thành</label>
                    <p className="text-sm font-semibold">{new Date(selectedVehicle.estimatedEndTime).toLocaleString('vi-VN')}</p>
                  </div>
                )}
                {selectedVehicle.actualEndTime && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Hoàn thành lúc</label>
                    <p className="text-sm font-semibold">{new Date(selectedVehicle.actualEndTime).toLocaleString('vi-VN')}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Không thể tải thông tin chi tiết
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
