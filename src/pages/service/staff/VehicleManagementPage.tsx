import { VehicleTable } from '@/components/VehicleTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Schema validation
const vehicleSchema = z.object({
  licensePlate: z.string().min(1, 'Biển số xe là bắt buộc'),
  brand: z.string().min(1, 'Hãng xe là bắt buộc'),
  model: z.string().min(1, 'Model xe là bắt buộc'),
  year: z.string().min(1, 'Năm sản xuất là bắt buộc').refine((val) => !isNaN(Number(val)) && Number(val) > 1900 && Number(val) <= new Date().getFullYear(), 'Năm sản xuất không hợp lệ'),
  owner: z.string().min(1, 'Tên chủ xe là bắt buộc'),
  ownerPhone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
  mileage: z.string().min(1, 'Số km là bắt buộc').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Số km phải là số dương'),
  status: z.enum(['active', 'maintenance', 'warning'])
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  owner: string;
  ownerPhone: string;
  lastService: string;
  nextService: string;
  status: 'active' | 'maintenance' | 'warning';
  mileage: number;
}

export default function VehicleManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      licensePlate: '',
      brand: '',
      model: '',
      year: '',
      owner: '',
      ownerPhone: '',
      mileage: '',
      status: 'active'
    }
  });

  useEffect(() => {
    // Vehicles should be loaded from API
    // TODO: Load vehicles from API
    setVehicles([]);
  }, []);


  const handleAddVehicle = () => {
    setEditingVehicle(null);
    form.reset({
      licensePlate: '',
      brand: '',
      model: '',
      year: '',
      owner: '',
      ownerPhone: '',
      mileage: '',
      status: 'active'
    });
    setIsDialogOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.reset({
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year.toString(),
      owner: vehicle.owner,
      ownerPhone: vehicle.ownerPhone,
      mileage: vehicle.mileage.toString(),
      status: vehicle.status
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

  const onSubmit = (data: VehicleFormData) => {
    const vehicleData: Vehicle = {
      id: editingVehicle ? editingVehicle.id : (vehicles.length + 1).toString(),
      licensePlate: data.licensePlate,
      brand: data.brand,
      model: data.model,
      year: parseInt(data.year),
      owner: data.owner,
      ownerPhone: data.ownerPhone,
      lastService: editingVehicle?.lastService || new Date().toISOString().split('T')[0],
      nextService: editingVehicle?.nextService || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: data.status,
      mileage: parseInt(data.mileage)
    };

    if (editingVehicle) {
      setVehicles(vehicles.map(vehicle =>
        vehicle.id === editingVehicle.id ? vehicleData : vehicle
      ));
      toast({
        title: "Cập nhật xe thành công",
        description: "Thông tin xe đã được cập nhật."
      });
    } else {
      setVehicles([...vehicles, vehicleData]);
      toast({
        title: "Thêm xe thành công",
        description: "Xe mới đã được thêm vào hệ thống."
      });
    }

    setIsDialogOpen(false);
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
        vehicles={vehicles.map(v => ({
          id: v.id,
          name: `${v.brand} ${v.model}`,
          plate: v.licensePlate,
          model: v.model,
          year: v.year,
          battery: 100,
          nextService: v.nextService,
          status: v.status === 'active' ? 'healthy' : 'warning',
          mileage: v.mileage,
          color: 'Trắng',
          vin: `STAFF-${v.licensePlate}`,
          purchaseDate: v.lastService,
          owner: v.owner,
          ownerPhone: v.ownerPhone,
          lastService: v.lastService,
        }))}
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
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số km *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Nhập số km" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>

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
