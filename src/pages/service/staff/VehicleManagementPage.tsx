import { VehicleTable } from '@/components/VehicleTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Schema validation
const vehicleSchema = z.object({
  name: z.string().optional(),
  licensePlate: z.string().min(1, 'Biển số xe là bắt buộc'),
  brand: z.string().min(1, 'Hãng xe là bắt buộc'),
  model: z.string().min(1, 'Model xe là bắt buộc'),
  year: z.string().min(1, 'Năm sản xuất là bắt buộc').refine((val) => !isNaN(Number(val)) && Number(val) > 1900 && Number(val) <= new Date().getFullYear(), 'Năm sản xuất không hợp lệ'),
  owner: z.string().min(1, 'Tên chủ xe là bắt buộc'),
  ownerPhone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
  mileage: z.string().min(1, 'Số km là bắt buộc').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Số km phải là số dương'),
  color: z.string().min(1, 'Màu sắc là bắt buộc'),
  batteryDegradation: z.string().refine((val) => {
    if (!val) return true; // Optional
    const num = Number(val);
    return !isNaN(num) && num >= 0 && num <= 100;
  }, 'Pin phải từ 0 đến 100'),
  status: z.enum(['active', 'maintenance', 'warning']).optional()
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface Vehicle {
  id: string;
  vin: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  owner: string;
  ownerPhone: string;
  lastService: string;
  nextService: string;
  status?: 'active' | 'maintenance' | 'warning';
  mileage: number;
  color?: string;
  battery?: number | null;
  name?: string | null;
}

export default function VehicleManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: '',
      licensePlate: '',
      brand: '',
      model: '',
      year: '',
      owner: '',
      ownerPhone: '',
      mileage: '',
      color: '',
      batteryDegradation: '',
      status: 'active'
    }
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await apiClient.getAllVehicles();
        if (!mounted) return;
        const mapped: Vehicle[] = list.map((v, idx) => ({
          id: v.vin || String(idx),
          vin: v.vin,
          licensePlate: v.plateNumber,
          brand: v.modelName.split(' ')[0] || '',
          model: v.modelName,
          year: new Date(v.purchasedAt).getFullYear(),
          owner: v.username,
          ownerPhone: '',
          lastService: v.purchasedAt?.split('T')[0] || new Date(v.createdAt).toISOString().split('T')[0],
          nextService: v.purchasedAt?.split('T')[0] || new Date(v.createdAt).toISOString().split('T')[0],
          status: 'active',
          mileage: Number.isFinite(Number(v.distanceTraveledKm)) ? Number(v.distanceTraveledKm) : 0,
          color: v.color,
          battery: typeof v.batteryDegradation === 'number' ? v.batteryDegradation : null,
          name: v.name,
        }));
        setVehicles(mapped);
      } catch (e) {
        console.error('Failed to load all vehicles', e);
      }
    })();
    return () => { mounted = false; };
  }, []);


  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(vehicles.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pagedVehicles = vehicles.slice(startIdx, endIdx);

  useEffect(() => {
    // Reset to first page when data size changes and current page is out of range
    const newTotal = Math.max(1, Math.ceil(vehicles.length / pageSize));
    if (page > newTotal) setPage(newTotal);
  }, [vehicles.length, pageSize, page]);

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    form.reset({
      name: '',
      licensePlate: '',
      brand: '',
      model: '',
      year: '',
      owner: '',
      ownerPhone: '',
      mileage: '',
      color: '',
      batteryDegradation: '',
      status: 'active'
    });
    setIsDialogOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.reset({
      name: vehicle.name || '',
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year.toString(),
      owner: vehicle.owner,
      ownerPhone: vehicle.ownerPhone,
      mileage: vehicle.mileage.toString(),
      color: vehicle.color || '',
      batteryDegradation: vehicle.battery?.toString() || '',
      status: vehicle.status || 'active'
    });
    setIsDialogOpen(true);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId));
    toast({
      title: "Xóa xe thành công",
      description: "Thông tin xe đã được xóa khỏi hệ thống."
    });
  };

  const onSubmit = async (data: VehicleFormData) => {
    try {
      if (editingVehicle) {
        // API chỉ cho phép thay đổi 2 trường: distanceTraveledKm và batteryDegradation
        const payload: {
          distanceTraveledKm: number;
          batteryDegradation: number | null;
        } = {
          distanceTraveledKm: Number(data.mileage) || 0,
          batteryDegradation: data.batteryDegradation ? Number(data.batteryDegradation) : null,
        };

        await apiClient.updateVehicle(editingVehicle.vin, payload);

        // Update local state - chỉ cập nhật 2 trường được phép
        const vehicleData: Vehicle = {
          ...editingVehicle,
          mileage: Number(data.mileage) || 0,
          battery: data.batteryDegradation ? Number(data.batteryDegradation) : null,
        };

        setVehicles(vehicles.map(vehicle =>
          vehicle.id === editingVehicle.id ? vehicleData : vehicle
        ));

        toast({
          title: "Cập nhật xe thành công",
          description: "Thông tin xe đã được cập nhật."
        });
      } else {
        // Add new vehicle (keep existing logic for now)
        const vehicleData: Vehicle = {
          id: (vehicles.length + 1).toString(),
          vin: '',
          licensePlate: data.licensePlate,
          brand: data.brand,
          model: data.model,
          year: parseInt(data.year),
          owner: data.owner,
          ownerPhone: data.ownerPhone,
          lastService: new Date().toISOString().split('T')[0],
          nextService: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: data.status || 'active',
          mileage: parseInt(data.mileage),
          color: data.color,
          battery: data.batteryDegradation ? Number(data.batteryDegradation) : null,
          name: data.name || null,
        };

        setVehicles([...vehicles, vehicleData]);
        toast({
          title: "Thêm xe thành công",
          description: "Xe mới đã được thêm vào hệ thống."
        });
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save vehicle', error);
      toast({
        title: editingVehicle ? "Cập nhật xe thất bại" : "Thêm xe thất bại",
        description: "Có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  // Map staff vehicles to VehicleTable shape (customer table shape)
  const tableVehicles = useMemo(() => {
    const mapStatus = (s: Vehicle['status']): 'healthy' | 'warning' | 'critical' => {
      switch (s) {
        case 'active':
          return 'healthy';
        case 'maintenance':
          return 'warning';
        case 'warning':
        default:
          return 'warning';
      }
    };
    return vehicles.map((v) => ({
      id: v.id,
      name: `${v.brand} ${v.model}`,
      plate: v.licensePlate,
      model: v.model,
      year: v.year,
      battery: 100,
      nextService: v.nextService,
      status: mapStatus(v.status),
      mileage: v.mileage,
      color: 'Trắng',
      vin: `STAFF-${v.licensePlate}`,
      purchaseDate: v.lastService,
    }));
  }, [vehicles]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý xe (Staff)</h1>
          <p className="text-muted-foreground">Xem và quản trị toàn bộ xe trong hệ thống</p>
        </div>
        <Button onClick={handleAddVehicle}>Thêm xe mới</Button>
      </div>

      <VehicleTable
        mode="staff"
        vehicles={pagedVehicles.map(v => ({
          id: v.id,
          name: `${v.brand} ${v.model}`,
          plate: v.licensePlate,
          model: v.model,
          year: v.year,
          battery: v.battery ?? null,
          nextService: v.nextService,
          mileage: v.mileage,
          color: v.color || '',
          vin: v.id,
          purchaseDate: v.lastService,
          owner: v.owner,
          ownerPhone: v.ownerPhone,
          lastService: v.lastService,
        }))}
        rightAction={(
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
              Trước
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
              Sau
            </Button>
          </div>
        )}
        onEdit={(veh) => {
          const found = vehicles.find(x => x.id === veh.id);
          if (found) handleEditVehicle(found);
        }}
        onDelete={handleDeleteVehicle}
        onView={(vehicleId) => {
          const found = vehicles.find(x => x.id === vehicleId);
          if (found) handleEditVehicle(found);
        }}
        showActions={true}
      />

      {/* Add/Edit Vehicle Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Chỉnh sửa xe' : 'Thêm xe mới'}
            </DialogTitle>
            <DialogDescription>
              {editingVehicle
                ? 'Cập nhật thông tin xe'
                : 'Thêm xe mới vào hệ thống'
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {editingVehicle ? (
                <>
                  {/* Khi edit: chỉ hiển thị thông tin không thể thay đổi */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Thông tin không thể thay đổi</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tên xe:</span>
                        <p className="font-medium">{editingVehicle.name || '—'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Biển số:</span>
                        <p className="font-medium">{editingVehicle.licensePlate}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Model:</span>
                        <p className="font-medium">{editingVehicle.model}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Màu sắc:</span>
                        <p className="font-medium">{editingVehicle.color || '—'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">VIN:</span>
                        <p className="font-medium text-xs">{editingVehicle.vin}</p>
                      </div>
                    </div>
                  </div>

                  {/* Chỉ cho phép sửa 2 trường: Pin và Số km */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Thông tin có thể chỉnh sửa</h4>
                    <FormField
                      control={form.control}
                      name="mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số km đã đi *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="Nhập số km" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="batteryDegradation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pin (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              step="0.1"
                              placeholder="0 - 100"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Khi thêm mới: hiển thị đầy đủ các field */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên xe</FormLabel>
                          <FormControl>
                            <Input placeholder="VD: VinFast VF8" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hãng xe *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập hãng xe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="licensePlate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biển số xe *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập biển số xe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model xe *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập model xe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Năm sản xuất *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Nhập năm sản xuất" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="owner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên chủ xe *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập tên chủ xe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ownerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập số điện thoại" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Màu sắc *</FormLabel>
                          <FormControl>
                            <Input placeholder="VD: Trắng" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số km *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="Nhập số km" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="batteryDegradation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pin (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              step="0.1"
                              placeholder="0 - 100"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Bình thường</SelectItem>
                            <SelectItem value="maintenance">Đang bảo dưỡng</SelectItem>
                            <SelectItem value="warning">Cần bảo dưỡng</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">
                  {editingVehicle ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
