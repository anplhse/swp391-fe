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
  plate: z.string().min(1, 'Biển số xe là bắt buộc'),
  modelId: z.string().min(1, 'Model xe là bắt buộc'),
  color: z.string().min(1, 'Màu sắc là bắt buộc'),
  vin: z.string().min(1, 'VIN là bắt buộc'),
  purchaseDate: z.string().min(1, 'Ngày mua là bắt buộc').refine((val) => {
    if (!val) return false;
    const selectedDate = new Date(val);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    return selectedDate <= today;
  }, 'Ngày mua không được trong tương lai'),
  mileage: z.string().refine((val) => {
    if (!val) return true; // Optional
    const num = Number(val);
    return !isNaN(num) && num >= 0;
  }, 'Số km phải là số dương'),
  batteryDegradation: z.string().refine((val) => {
    if (!val) return true; // Optional
    const num = Number(val);
    return !isNaN(num) && num >= 0 && num <= 100;
  }, 'Pin phải từ 0 đến 100'),
  phoneNumber: z.string().min(1, 'Số điện thoại là bắt buộc'),
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
  const [vehicleModels, setVehicleModels] = useState<Array<{ id: number; brandName: string; modelName: string; status: string }>>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [users, setUsers] = useState<Array<{ id: number; fullName: string; email: string; phoneNumber: string }>>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; fullName: string; email: string; phoneNumber: string } | null>(null);
  const [isSearchingUser, setIsSearchingUser] = useState(false);

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: '',
      plate: '',
      modelId: '',
      color: '',
      vin: '',
      purchaseDate: '',
      mileage: '',
      batteryDegradation: '',
      phoneNumber: '',
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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setModelsLoading(true);
        const models = await apiClient.getVehicleModels();
        if (!mounted) return;
        setVehicleModels(models.filter((m) => m.status === 'ACTIVE'));
      } catch (e) {
        console.error('Failed to load vehicle models', e);
      } finally {
        if (mounted) setModelsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setUsersLoading(true);
        const userList = await apiClient.getAllUsers();
        if (!mounted) return;
        setUsers(userList);
      } catch (e) {
        console.error('Failed to load users', e);
      } finally {
        if (mounted) setUsersLoading(false);
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
    setSelectedUser(null);
    form.reset({
      name: '',
      plate: '',
      modelId: '',
      color: '',
      vin: '',
      purchaseDate: '',
      mileage: '',
      batteryDegradation: '',
      phoneNumber: '',
    });
    setIsDialogOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.reset({
      name: vehicle.name || '',
      plate: vehicle.licensePlate,
      modelId: '',
      color: vehicle.color || '',
      vin: vehicle.vin,
      purchaseDate: vehicle.lastService,
      mileage: vehicle.mileage.toString(),
      batteryDegradation: vehicle.battery?.toString() || '',
      phoneNumber: '',
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
        // Add new vehicle using API
        const selectedModel = vehicleModels.find(m => String(m.id) === data.modelId);
        if (!selectedModel) {
          toast({
            title: "Lỗi",
            description: "Vui lòng chọn model xe",
            variant: "destructive"
          });
          return;
        }

        // Find user by phone number
        const foundUser = users.find(u => u.phoneNumber === data.phoneNumber);
        if (!foundUser) {
          toast({
            title: "Lỗi",
            description: "Không tìm thấy khách hàng với số điện thoại này.",
            variant: "destructive"
          });
          return;
        }

        // Validate purchase date - không được trong tương lai
        if (data.purchaseDate) {
          const selectedDate = new Date(data.purchaseDate);
          const today = new Date();
          today.setHours(23, 59, 59, 999); // Set to end of today
          if (selectedDate > today) {
            toast({
              title: "Lỗi",
              description: "Ngày mua không được trong tương lai.",
              variant: "destructive"
            });
            return;
          }
        }

        const purchasedAtIsoZ = data.purchaseDate
          ? new Date(data.purchaseDate).toISOString()
          : new Date().toISOString();
        const distanceKm = data.mileage === ''
          ? null
          : (typeof data.mileage === 'number' ? data.mileage : Number(data.mileage));
        const degVal = data.batteryDegradation === ''
          ? null
          : (typeof data.batteryDegradation === 'number' ? data.batteryDegradation : Number(data.batteryDegradation));
        const degradation = degVal === null ? null : Math.max(0, Math.min(100, isNaN(degVal) ? 0 : degVal));

        const vehicleData = {
          vin: data.vin,
          name: data.name || null,
          plateNumber: data.plate,
          color: data.color || 'Trắng',
          distanceTraveledKm: distanceKm,
          batteryDegradation: degradation,
          purchasedAt: purchasedAtIsoZ,
          userId: foundUser.id,
          vehicleModelId: selectedModel.id,
        };

        await apiClient.addVehicle(vehicleData);

        // Reload vehicles list
        const list = await apiClient.getAllVehicles();
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
          <div className="flex items-center gap-3">
            <Button onClick={handleAddVehicle}>
              Thêm xe mới
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                Trước
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                Sau
              </Button>
            </div>
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
                  {/* Khi thêm mới: hiển thị đầy đủ các field giống customer */}
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
                      name="plate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biển số *</FormLabel>
                          <FormControl>
                            <Input placeholder="VD: 30A-12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="modelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={modelsLoading ? 'Đang tải model...' : 'Chọn model'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {modelsLoading && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">Đang tải...</div>
                              )}
                              {!modelsLoading && vehicleModels.map((model) => (
                                <SelectItem key={model.id} value={String(model.id)}>
                                  {model.brandName} {model.modelName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                    <FormField
                      control={form.control}
                      name="vin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VIN *</FormLabel>
                          <FormControl>
                            <Input placeholder="Số VIN của xe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="purchaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày mua *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              max={new Date().toISOString().split('T')[0]}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại khách hàng *</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input
                                placeholder=" "
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  const phone = e.target.value.trim();
                                  if (phone) {
                                    setIsSearchingUser(true);
                                    const foundUser = users.find(u => u.phoneNumber === phone);
                                    setSelectedUser(foundUser || null);
                                    setIsSearchingUser(false);
                                  } else {
                                    setSelectedUser(null);
                                  }
                                }}
                              />
                              {isSearchingUser && (
                                <p className="text-sm text-muted-foreground">Đang tìm kiếm...</p>
                              )}
                              {selectedUser && !isSearchingUser && (
                                <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                                  <p className="text-sm font-medium text-green-800">
                                    {selectedUser.fullName}
                                  </p>
                                  <p className="text-xs text-green-600">{selectedUser.email}</p>
                                </div>
                              )}
                              {field.value && !selectedUser && !isSearchingUser && (
                                <p className="text-sm text-red-600">
                                  Không tìm thấy khách hàng với số điện thoại này
                                </p>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số km đã đi</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step={0.1}
                              placeholder="VD: 15000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
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
                              step={0.1}
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
