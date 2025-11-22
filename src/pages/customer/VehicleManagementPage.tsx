import { VehicleTable } from '@/components/VehicleTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { authService } from '@/lib/auth';
import { showApiErrorToast, showAuthErrorToast } from '@/lib/responseHandler';
import {
  Plus
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ApiVehicle = {
  vin: string;
  name: string | null;
  plateNumber: string;
  color: string;
  distanceTraveledKm: number;
  batteryDegradation?: number;
  purchasedAt: string;
  createdAt: string;
  entityStatus: string;
  userId: number;
  username: string;
  modelId: number;
  modelName: string;
};

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  model: string;
  battery: number | null;
  nextService: string;
  mileage: number | null;
  color: string;
  vin: string;
  purchaseDate: string;
  apiVehicle?: ApiVehicle;
}

type NewVehicleState = {
  name: string;
  plate: string;
  model: string;
  battery: number | '';
  batteryDegradation: number | '';
  nextService: string;
  mileage: number | '';
  color: string;
  vin: string;
  purchaseDate: string;
};

export default function VehicleManagementPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);


  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleDetails, setVehicleDetails] = useState<Record<string, ApiVehicle>>({});

  const [newVehicle, setNewVehicle] = useState<NewVehicleState>({
    name: '',
    plate: '',
    model: '',
    battery: '',
    batteryDegradation: '',
    nextService: '',
    mileage: '',
    color: '',
    vin: '',
    purchaseDate: ''
  });

  const [vehicleModels, setVehicleModels] = useState<Array<{ id: number; brandName: string; modelName: string; yearIntroduce?: string }>>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setModelsLoading(true);
        setModelsError(null);
        const models = await apiClient.getVehicleModels();
        if (mounted) {
          setVehicleModels(models.filter((m) => m.status === 'ACTIVE'));
        }
      } catch (e) {
        console.error('Failed to load vehicle models', e);
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('status: 401') || msg.includes('status: 403')) {
          if (mounted) {
            setModelsError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          }
          showAuthErrorToast(e, toast);
          navigate('/login');
        } else {
          if (mounted) {
            setModelsError('Không tải được danh sách model');
          }
          showApiErrorToast(e, toast, 'Không tải được danh sách model');
        }
      } finally {
        if (mounted) setModelsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  useEffect(() => {
    const loadUserVehicles = async () => {
      try {
        const currentUser = authService.getAuthState().user;
        if (!currentUser) return;
        const apiVehicles = await apiClient.getVehiclesByUserId(currentUser.id);
        const detailMap: Record<string, ApiVehicle> = {};
        const mapped: Vehicle[] = apiVehicles.map(v => {
          detailMap[v.vin] = {
            vin: v.vin,
            name: v.name ?? v.modelName ?? '',
            plateNumber: v.plateNumber,
            color: v.color,
            distanceTraveledKm: v.distanceTraveledKm,
            batteryDegradation: v.batteryDegradation,
            purchasedAt: v.purchasedAt,
            createdAt: v.createdAt,
            entityStatus: v.entityStatus,
            userId: v.userId,
            username: v.username,
            modelId: v.modelId,
            modelName: v.modelName,
          };

          return {
            id: v.vin,
            name: v.name ?? `${v.modelName}`,
            plate: v.plateNumber,
            model: v.modelName,
            battery: typeof v.batteryDegradation === 'number'
              ? v.batteryDegradation
              : null,
            nextService: '',
            mileage: typeof v.distanceTraveledKm === 'number'
              ? Math.max(0, Math.round(v.distanceTraveledKm))
              : null,
            color: v.color || '-',
            vin: v.vin,
            purchaseDate: v.purchasedAt.split('T')[0],
            apiVehicle: detailMap[v.vin],
          };
        });
        setVehicles(mapped);
        setVehicleDetails(detailMap);
      } catch (e) {
        console.error('Failed to load user vehicles', e);
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('status: 401') || msg.includes('status: 403')) {
          showAuthErrorToast(e, toast);
          navigate('/login');
        } else {
          showApiErrorToast(e, toast, 'Không thể tải danh sách xe');
        }
      }
    };
    loadUserVehicles();
  }, [navigate, toast]);

  // Reset selectedModelId when add dialog opens
  useEffect(() => {
    if (isAddDialogOpen) {
      setSelectedModelId(null);
    }
  }, [isAddDialogOpen]);

  const handleAddVehicle = async () => {
    if (!newVehicle.name || !newVehicle.plate || !newVehicle.model || !newVehicle.vin || !selectedModelId) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng chọn model và điền đầy đủ thông tin (bao gồm VIN)",
        variant: "destructive",
      });
      return;
    }

    // Cho phép để trống (sẽ gửi null lên API)

    try {
      // Get current user ID from auth service
      const user = authService.getAuthState().user;
      if (!user) {
        toast({
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập lại",
          variant: "destructive",
        });
        return;
      }

      // Prefer selectedModelId; fallback by name
      const selectedModel = selectedModelId
        ? vehicleModels.find((m) => m.id === selectedModelId)
        : vehicleModels.find(m => m.modelName === newVehicle.model);
      const modelId = selectedModel!.id;

      // Validate purchase date - không được trong tương lai
      if (newVehicle.purchaseDate) {
        const selectedDate = new Date(newVehicle.purchaseDate);
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

      // Call API to add vehicle
      const purchasedAtIsoZ = newVehicle.purchaseDate
        ? new Date(newVehicle.purchaseDate).toISOString()
        : new Date().toISOString();
      const distanceKm = newVehicle.mileage === ''
        ? null
        : (typeof newVehicle.mileage === 'number' ? newVehicle.mileage : Number(newVehicle.mileage));
      const degVal = newVehicle.batteryDegradation === ''
        ? null
        : (typeof newVehicle.batteryDegradation === 'number' ? newVehicle.batteryDegradation : Number(newVehicle.batteryDegradation));
      const degradation = degVal === null ? null : Math.max(0, Math.min(100, isNaN(degVal) ? 0 : degVal));
      const vehicleData = {
        vin: newVehicle.vin,
        name: newVehicle.name,
        plateNumber: newVehicle.plate,
        color: newVehicle.color || 'Trắng',
        distanceTraveledKm: distanceKm,
        batteryDegradation: degradation,
        purchasedAt: purchasedAtIsoZ,
        userId: user.id,
        vehicleModelId: modelId,
      };

      const response = await apiClient.addVehicle(vehicleData);

      // Create vehicle object for local state
      const apiVehicle: ApiVehicle = {
        vin: newVehicle.vin,
        name: newVehicle.name,
        plateNumber: newVehicle.plate,
        color: newVehicle.color || 'Trắng',
        distanceTraveledKm: distanceKm ?? 0,
        batteryDegradation: degradation ?? undefined,
        purchasedAt: purchasedAtIsoZ,
        createdAt: new Date().toISOString(),
        entityStatus: 'ACTIVE',
        userId: user.id,
        username: user.fullName,
        modelId: modelId,
        modelName: newVehicle.model,
      };

      const vehicle: Vehicle = {
        id: response.id?.toString() || Date.now().toString(),
        name: newVehicle.name,
        plate: newVehicle.plate,
        model: newVehicle.model,
        battery: degradation,
        mileage: distanceKm === null ? null : distanceKm,
        nextService: '',
        color: newVehicle.color || 'Trắng',
        vin: newVehicle.vin,
        purchaseDate: purchasedAtIsoZ.split('T')[0],
        apiVehicle,
      };

      setVehicles([...vehicles, vehicle]);
      setVehicleDetails(prev => ({
        ...prev,
        [apiVehicle.vin]: apiVehicle,
      }));

      // Không dùng sessionStore nữa

      setNewVehicle({
        name: '',
        plate: '',
        model: '',
        battery: '',
        batteryDegradation: '',
        nextService: '',
        mileage: '',
        color: '',
        vin: '',
        purchaseDate: ''
      });

      setSelectedModelId(null);
      setIsAddDialogOpen(false);

      toast({
        title: "Thêm xe thành công!",
        description: `Đã thêm ${vehicle.name} vào danh sách`,
      });
    } catch (error) {
      console.error('Error adding vehicle:', error);
      showApiErrorToast(error, toast, "Có lỗi xảy ra khi thêm xe. Vui lòng thử lại.");
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsEditDialogOpen(true);
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return;
    try {
      // API chỉ cho phép thay đổi 2 trường: distanceTraveledKm và batteryDegradation
      const payload = {
        distanceTraveledKm: typeof editingVehicle.mileage === 'number' ? editingVehicle.mileage : Number(editingVehicle.mileage) || 0,
        batteryDegradation: typeof editingVehicle.battery === 'number' ? editingVehicle.battery : Number(editingVehicle.battery) || 0,
      };

      // Send update by VIN
      await apiClient.updateVehicle(editingVehicle.vin, payload);

      // Optimistic UI update
      setVehicles(vehicles.map(v => (
        v.id === editingVehicle.id ? { ...v, mileage: editingVehicle.mileage, battery: editingVehicle.battery } : v
      )));
      setVehicleDetails(prev => {
        const detail = prev[editingVehicle.vin];
        if (!detail) return prev;
        return {
          ...prev,
          [editingVehicle.vin]: {
            ...detail,
            distanceTraveledKm: typeof editingVehicle.mileage === 'number'
              ? editingVehicle.mileage
              : Number(editingVehicle.mileage) || 0,
            batteryDegradation: typeof editingVehicle.battery === 'number'
              ? editingVehicle.battery
              : Number(editingVehicle.battery) || 0,
          },
        };
      });

      setIsEditDialogOpen(false);
      setEditingVehicle(null);

      toast({
        title: 'Cập nhật thành công!',
        description: `Đã cập nhật thông tin ${editingVehicle.name}`,
      });
    } catch (error) {
      console.error('Update vehicle failed', error);
      showApiErrorToast(error, toast, 'Không thể cập nhật xe. Vui lòng thử lại.');
    }
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setVehicles(vehicles.filter(v => v.id !== vehicleId));
    setVehicleDetails(prev => {
      const updated = { ...prev };
      delete updated[vehicleId];
      return updated;
    });

    // Không dùng sessionStore

    toast({
      title: "Xóa xe thành công!",
      description: `Đã xóa ${vehicle?.name} khỏi danh sách`,
    });
  };

  const handleViewVehicle = (vehicleId: string) => {
    const found = vehicles.find(v => v.id === vehicleId);
    navigate(`/customer/vehicle/${vehicleId}`, {
      state: found ? { vehicle: found } : undefined,
    });
  };

  const handleBookService = (vehicle: Vehicle) => {
    const detail = vehicleDetails[vehicle.vin] ?? vehicle.apiVehicle;
    navigate('/customer/booking', {
      state: {
        preselectVin: vehicle.vin,
        preselectVehicle: detail
          ? detail
          : {
            vin: vehicle.vin,
            name: vehicle.name,
            plateNumber: vehicle.plate,
            color: vehicle.color,
            distanceTraveledKm: vehicle.mileage ?? 0,
            batteryDegradation: vehicle.battery ?? undefined,
            purchasedAt: vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toISOString() : new Date().toISOString(),
            createdAt: new Date().toISOString(),
            entityStatus: 'ACTIVE',
            userId: authService.getAuthState().user?.id ?? 0,
            username: authService.getAuthState().user?.fullName ?? '',
            modelId: 0,
            modelName: vehicle.model,
          },
      }
    });
  };

  return (
    <div className="space-y-6 w-full mx-auto px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý xe</h1>
          <p className="text-muted-foreground">Quản lý thông tin xe của bạn</p>
        </div>
      </div>

      {/* Vehicle Table */}
      <VehicleTable
        vehicles={vehicles}
        onEdit={handleEditVehicle}
        onDelete={handleDeleteVehicle}
        onView={handleViewVehicle}
        onBook={handleBookService}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        rightAction={(
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm xe mới
          </Button>
        )}
      />

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm xe mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết về xe của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên xe</Label>
              <Input
                id="name"
                value={newVehicle.name}
                onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                placeholder="VD: VinFast VF8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plate">Biển số</Label>
              <Input
                id="plate"
                value={newVehicle.plate}
                onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                placeholder="VD: 30A-12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={selectedModelId ? String(selectedModelId) : ''}
                onValueChange={(value) => {
                  const idNum = Number(value);
                  setSelectedModelId(idNum);
                  const m = vehicleModels.find(v => v.id === idNum);
                  setNewVehicle({
                    ...newVehicle,
                    model: m ? m.modelName : '',
                    // Không tự động binding năm sản xuất từ model
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={modelsLoading ? 'Đang tải model...' : (modelsError || 'Chọn model')} />
                </SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Màu sắc</Label>
              <Input
                id="color"
                value={newVehicle.color}
                onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                placeholder="VD: Trắng"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                value={newVehicle.vin}
                onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value })}
                placeholder="Số VIN của xe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Ngày mua</Label>
              <Input
                id="purchaseDate"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={newVehicle.purchaseDate}
                onChange={(e) => setNewVehicle({ ...newVehicle, purchaseDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mileage">Số km đã đi</Label>
            <Input
              id="mileage"
              type="number"
              min={0}
              step={0.1}
              value={newVehicle.mileage === '' ? '' : newVehicle.mileage}
              onChange={(e) => {
                const valStr = e.target.value;
                if (valStr === '') {
                  setNewVehicle({ ...newVehicle, mileage: '' });
                  return;
                }
                const val = Number(valStr);
                setNewVehicle({ ...newVehicle, mileage: isNaN(val) || val < 0 ? '' : val });
              }}
              placeholder="VD: 15000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="batteryDegradation">Pin (%)</Label>
            <Input
              id="batteryDegradation"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={newVehicle.batteryDegradation === '' ? '' : newVehicle.batteryDegradation}
              onChange={(e) => {
                const valStr = e.target.value;
                if (valStr === '') {
                  setNewVehicle({ ...newVehicle, batteryDegradation: '' });
                  return;
                }
                const val = Number(valStr);
                if (isNaN(val)) {
                  setNewVehicle({ ...newVehicle, batteryDegradation: '' });
                  return;
                }
                const safe = Math.max(0, Math.min(100, val));
                setNewVehicle({ ...newVehicle, batteryDegradation: safe });
              }}
              placeholder="0 - 100"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddVehicle}>
              Thêm xe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin xe</DialogTitle>
            <DialogDescription>
              Chỉ có thể chỉnh sửa thông tin pin và số km. Các thông tin khác liên quan đến VIN không thể thay đổi.
            </DialogDescription>
          </DialogHeader>
          {editingVehicle && (
            <>
              {/* Thông tin không thể thay đổi - chỉ hiển thị */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium text-muted-foreground">Thông tin không thể thay đổi</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tên xe:</span>
                    <p className="font-medium">{editingVehicle.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Biển số:</span>
                    <p className="font-medium">{editingVehicle.plate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Model:</span>
                    <p className="font-medium">{editingVehicle.model}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Màu sắc:</span>
                    <p className="font-medium">{editingVehicle.color}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Số VIN:</span>
                    <p className="font-medium text-xs">{editingVehicle.vin}</p>
                  </div>
                </div>
              </div>

              {/* Thông tin có thể chỉnh sửa */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Thông tin có thể chỉnh sửa</h4>

                <div className="space-y-2">
                  <Label htmlFor="edit-battery">Pin (%)</Label>
                  <Input
                    id="edit-battery"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={editingVehicle.battery === null || editingVehicle.battery === undefined ? '' : editingVehicle.battery}
                    onChange={(e) => {
                      const valStr = e.target.value;
                      if (valStr === '') {
                        setEditingVehicle({ ...editingVehicle, battery: null });
                        return;
                      }
                      const val = Number(valStr);
                      const safe = Math.max(0, Math.min(100, val));
                      setEditingVehicle({ ...editingVehicle, battery: safe });
                    }}
                    placeholder="0 - 100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-mileage">Số km đã đi</Label>
                  <Input
                    id="edit-mileage"
                    type="number"
                    min={0}
                    step={0.1}
                    value={editingVehicle.mileage === null || editingVehicle.mileage === undefined ? '' : editingVehicle.mileage}
                    onChange={(e) => {
                      const valStr = e.target.value;
                      if (valStr === '') {
                        setEditingVehicle({ ...editingVehicle, mileage: 0 });
                        return;
                      }
                      const val = Number(valStr);
                      setEditingVehicle({ ...editingVehicle, mileage: isNaN(val) || val < 0 ? 0 : val });
                    }}
                    placeholder="Nhập số km"
                  />
                </div>
              </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateVehicle}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}