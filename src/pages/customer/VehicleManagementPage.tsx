import { VehicleTable } from '@/components/VehicleTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { authService } from '@/lib/auth';
import {
  Plus
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function VehicleManagementPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = { email: 'customer@example.com', role: 'customer', userType: 'customer' };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);


  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [newVehicle, setNewVehicle] = useState({
    name: '',
    plate: '',
    model: '',
    year: new Date().getFullYear(),
    battery: 100,
    batteryDegradation: 100,
    nextService: '',
    status: 'healthy' as const,
    mileage: 0,
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
        if (mounted) setModelsError('Không tải được danh sách model');
      } finally {
        if (mounted) setModelsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Bình thường</Badge>;
      case 'warning':
        return <Badge variant="destructive">Cần bảo dưỡng</Badge>;
      case 'critical':
        return <Badge variant="destructive">Khẩn cấp</Badge>;
      default:
        return null;
    }
  };

  useEffect(() => {
    const loadUserVehicles = async () => {
      try {
        const currentUser = authService.getAuthState().user;
        if (!currentUser) return;
        const apiVehicles = await apiClient.getVehiclesByUserId(currentUser.id);
        const mapped: Vehicle[] = apiVehicles.map(v => {
          const rawYear = v.year;
          const parsedYear = (typeof rawYear === 'string' || typeof rawYear === 'number')
            ? parseInt(String(rawYear))
            : NaN;
          const safeYear = Number.isFinite(parsedYear)
            ? parsedYear
            : new Date(v.createdAt).getFullYear();

          return {
            id: v.vin,
            name: v.name ?? `${v.modelName}`,
            plate: v.plateNumber,
            model: v.modelName,
            year: safeYear,
            battery: 0,
            nextService: '',
            status: v.entityStatus === 'ACTIVE' ? 'healthy' : 'warning',
            mileage: Math.max(0, Math.round(v.distanceTraveledKm)),
            color: v.color || '-',
            vin: v.vin,
            purchaseDate: v.purchasedAt.split('T')[0],
          };
        });
        setVehicles(mapped);
      } catch (e) {
        console.error('Failed to load user vehicles', e);
      }
    };
    loadUserVehicles();
  }, []);

  const formatLocalIsoMillis = (date: Date) => {
    const pad = (n: number, w = 2) => n.toString().padStart(w, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    const ms = pad(date.getMilliseconds(), 3);
    return `${y}-${m}-${d}T${hh}:${mm}:${ss}.${ms}`;
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.name || !newVehicle.plate || !newVehicle.model || !newVehicle.vin || !selectedModelId) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng chọn model và điền đầy đủ thông tin (bao gồm VIN)",
        variant: "destructive",
      });
      return;
    }

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

      // Call API to add vehicle
      const purchasedAtIsoZ = newVehicle.purchaseDate
        ? new Date(newVehicle.purchaseDate).toISOString()
        : new Date().toISOString();
      const distanceKm = Number(newVehicle.mileage) || 0;
      const degradation = Math.max(0, Math.min(100, Number(newVehicle.batteryDegradation) || 0));
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
      const vehicle: Vehicle = {
        id: response.id?.toString() || Date.now().toString(),
        name: newVehicle.name,
        plate: newVehicle.plate,
        model: newVehicle.model,
        year: newVehicle.year,
        battery: Math.max(0, 100 - degradation),
        mileage: distanceKm,
        nextService: '',
        status: 'healthy',
        color: newVehicle.color || 'Trắng',
        vin: newVehicle.vin,
        purchaseDate: purchasedAtIsoZ.split('T')[0]
      };

      setVehicles([...vehicles, vehicle]);

      // Không dùng sessionStore nữa

      setNewVehicle({
        name: '',
        plate: '',
        model: '',
        year: new Date().getFullYear(),
        battery: 100,
        batteryDegradation: 100,
        nextService: '',
        status: 'healthy',
        mileage: 0,
        color: '',
        vin: '',
        purchaseDate: ''
      });

      setIsAddDialogOpen(false);

      toast({
        title: "Thêm xe thành công!",
        description: `Đã thêm ${vehicle.name} vào danh sách`,
      });
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Thêm xe thất bại",
        description: "Có lỗi xảy ra khi thêm xe. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsEditDialogOpen(true);
  };

  const handleUpdateVehicle = () => {
    if (!editingVehicle) return;

    setVehicles(vehicles.map(v =>
      v.id === editingVehicle.id ? editingVehicle : v
    ));

    // Không cập nhật sessionStore

    setIsEditDialogOpen(false);
    setEditingVehicle(null);

    toast({
      title: "Cập nhật thành công!",
      description: `Đã cập nhật thông tin ${editingVehicle.name}`,
    });
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setVehicles(vehicles.filter(v => v.id !== vehicleId));

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
    navigate('/customer/booking', {
      state: {
        preselectVin: vehicle.vin,
        preselectVehicle: {
          vin: vehicle.vin,
          brand: vehicle.name.split(' ')[0], // VinFast
          model: vehicle.name.split(' ').slice(1).join(' '), // VF8, VF9, etc.
          year: vehicle.year.toString(),
          plate: vehicle.plate
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý xe</h1>
          <p className="text-muted-foreground">Quản lý thông tin xe của bạn</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm xe mới
        </Button>
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
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
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
              value={newVehicle.mileage}
              onChange={(e) => {
                const val = Number(e.target.value);
                setNewVehicle({ ...newVehicle, mileage: isNaN(val) || val < 0 ? 0 : val });
              }}
              placeholder="VD: 15000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="batteryDegradation">% pin chai</Label>
            <Input
              id="batteryDegradation"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={newVehicle.batteryDegradation}
              onChange={(e) => {
                const val = Number(e.target.value);
                const safe = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin xe</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết về xe của bạn
            </DialogDescription>
          </DialogHeader>
          {editingVehicle && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên xe</Label>
                <Input
                  id="edit-name"
                  value={editingVehicle.name}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-plate">Biển số</Label>
                <Input
                  id="edit-plate"
                  value={editingVehicle.plate}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, plate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model">Model</Label>
                <Input
                  id="edit-model"
                  value={editingVehicle.model}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">Năm sản xuất</Label>
                <Input
                  id="edit-year"
                  type="number"
                  value={editingVehicle.year}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, year: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Màu sắc</Label>
                <Input
                  id="edit-color"
                  value={editingVehicle.color}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, color: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vin">VIN</Label>
                <Input
                  id="edit-vin"
                  value={editingVehicle.vin}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, vin: e.target.value })}
                />
              </div>
            </div>
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