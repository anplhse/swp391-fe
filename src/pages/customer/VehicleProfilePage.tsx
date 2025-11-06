import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
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
  Trash2,
  MapPin,
  Settings,
  Wrench
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

// Schema validation cho form edit xe
const vehicleEditSchema = z.object({
  battery: z.number().min(0, 'Pin không thể âm').max(100, 'Pin không thể vượt quá 100%'),
  mileage: z.number().min(0, 'Số km không thể âm')
});

type VehicleEditFormData = z.infer<typeof vehicleEditSchema>;

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  model: string;
  battery: number;
  nextService: string;
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

// Removed VehiclePackage type as packages tab/section is no longer displayed

export default function VehicleProfilePage() {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const location = useLocation() as { state?: { vehicle?: Vehicle } };
  const { toast } = useToast();
  const user = { email: 'customer@example.com', role: 'customer', userType: 'customer' };

  // State cho dialog edit
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form cho edit xe
  const form = useForm<VehicleEditFormData>({
    resolver: zodResolver(vehicleEditSchema),
    defaultValues: {
      battery: 0,
      mileage: 0
    }
  });

  // Handlers
  const handleEditClick = () => {
    if (!vehicleData) return;
    form.reset({
      battery: vehicleData.battery,
      mileage: vehicleData.mileage
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (data: VehicleEditFormData) => {
    // Trong thực tế, đây sẽ là API call
    console.log('Updating vehicle data:', data);

    toast({
      title: "Cập nhật thành công",
      description: "Thông tin xe đã được cập nhật."
    });

    setIsEditDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!vehicleData) return;
    // TODO: Gọi API xóa xe theo VIN nếu có endpoint
    toast({
      title: 'Đã xóa xe',
      description: `Đã xóa ${vehicleData.name}.`,
    });
    setIsDeleteDialogOpen(false);
    navigate('/customer/vehicles');
  };

  // Load vehicle detail from API by VIN (vehicleId param)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        if (!vehicleId) throw new Error('Thiếu VIN của xe');

        // 1) Prefer vehicle from navigation state
        if (location.state?.vehicle) {
          if (mounted) setVehicleData(location.state.vehicle);
          return;
        }

        // 2) Try fetch by VIN endpoint
        try {
          const apiV = await apiClient.getVehicleByVin(vehicleId);
          // Enrich with user's vehicle list to get mileage and battery degradation
          let enrichedMileage = 0;
          let enrichedBattery = 0;
          try {
            const auth = (await import('@/lib/auth')).authService;
            const current = auth.getAuthState().user;
            if (current) {
              const list = await apiClient.getVehiclesByUserId(current.id);
              const match = list.find(v => v.vin === apiV.vin);
              if (match) {
                enrichedMileage = Math.max(0, Number(match.distanceTraveledKm) || 0);
                enrichedBattery = Number(match.batteryDegradation) || null;
              }
            }
          } catch (_) { /* ignore enrichment errors */ }

          const mapped: Vehicle = {
            id: apiV.vin,
            name: apiV.brand ? `${apiV.brand} ${apiV.model}` : (apiV.model || apiV.vin),
            plate: apiV.plate || '-',
            model: apiV.model || '-',
            battery: enrichedBattery,
            nextService: new Date().toISOString().split('T')[0],
            mileage: enrichedMileage,
            color: apiV.type || '-',
            vin: apiV.vin,
            purchaseDate: new Date().toISOString().split('T')[0],
          };
          if (mounted) setVehicleData(mapped);
          return;
        } catch (e) {
          // fallthrough to search in user's vehicles
        }

        // 3) Fallback: get vehicles by current user and find by VIN
        const auth = (await import('@/lib/auth')).authService;
        const current = auth.getAuthState().user;
        if (!current) throw new Error('Chưa đăng nhập');
        const list = await apiClient.getVehiclesByUserId(current.id);
        const found = list.find(v => v.vin === vehicleId);
        if (!found) throw new Error('Không tìm thấy xe');
        const mappedFromList: Vehicle = {
          id: found.vin,
          name: found.name || found.modelName,
          plate: found.plateNumber,
          model: found.modelName,
          battery: typeof found.batteryDegradation === 'number' ? found.batteryDegradation : null,
          nextService: new Date().toISOString().split('T')[0],
          mileage: Math.max(0, Math.round(found.distanceTraveledKm || 0)),
          color: found.color,
          vin: found.vin,
          purchaseDate: (found.purchasedAt || '').split('T')[0] || new Date().toISOString().split('T')[0],
        };
        if (mounted) setVehicleData(mappedFromList);
      } catch (e) {
        console.error('Load vehicle failed', e);
        if (mounted) setLoadError('Không tải được thông tin xe');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [vehicleId, location.state]);

  // Service history should be loaded from API
  // TODO: Load service history from API
  const [serviceHistory, setServiceHistory] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    // Load service history when vehicle data is available
    if (vehicleData) {
      // Service history should be loaded from API
      // TODO: Load service history from API using vehicleData.id or vehicleData.vin
      setServiceHistory([]);
    }
  }, [vehicleData]);


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



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loadError || !vehicleData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        {loadError || 'Không có dữ liệu xe'}
      </div>
    );
  }

  const vehicle = vehicleData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1" />
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditClick}>
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa
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
                  <span className="font-medium">{vehicle.mileage.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}</span>
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

      {/* Edit Vehicle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin xe</DialogTitle>
            <DialogDescription>
              Chỉ có thể chỉnh sửa thông tin pin và số km. Các thông tin khác liên quan đến VIN không thể thay đổi.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
              {/* Thông tin khóa cứng - chỉ hiển thị */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium text-muted-foreground">Thông tin không thể thay đổi</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tên xe:</span>
                    <p className="font-medium">{vehicleData?.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Biển số:</span>
                    <p className="font-medium">{vehicleData?.plate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Model:</span>
                    <p className="font-medium">{vehicleData?.model}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Màu sắc:</span>
                    <p className="font-medium">{vehicleData?.color}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Số VIN:</span>
                    <p className="font-medium text-xs">{vehicleData?.vin}</p>
                  </div>
                </div>
              </div>

              {/* Thông tin có thể chỉnh sửa */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Thông tin có thể chỉnh sửa</h4>

                <FormField
                  control={form.control}
                  name="battery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mức pin (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Nhập mức pin"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số km đã đi</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Nhập số km"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">
                  Cập nhật
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa xe?</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa xe này?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
