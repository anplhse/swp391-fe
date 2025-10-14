import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getRegisteredVehicles, setRegisteredVehicles, type RegisteredVehicle } from '@/lib/sessionStore';
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  Edit,
  Filter,
  Plus,
  Search,
  Trash2,
  Wrench
} from 'lucide-react';
import { useState } from 'react';
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
  // Chuyển đổi từ RegisteredVehicle sang Vehicle
  const convertToVehicle = (registered: RegisteredVehicle): Vehicle => ({
    id: registered.id,
    name: registered.name,
    plate: registered.plate || 'Chưa có',
    model: registered.name,
    year: parseInt(registered.year || '2024'),
    battery: Math.floor(Math.random() * 30) + 70, // Random battery 70-100%
    nextService: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: Math.random() > 0.7 ? 'warning' : 'healthy' as const,
    mileage: Math.floor(Math.random() * 20000) + 5000, // Random mileage 5k-25k
    color: ['Trắng', 'Đen', 'Xám', 'Xanh'][Math.floor(Math.random() * 4)],
    vin: registered.vin,
    purchaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const registeredVehicles = getRegisteredVehicles();
    return registeredVehicles.map(convertToVehicle);
  });

  const [newVehicle, setNewVehicle] = useState({
    name: '',
    plate: '',
    model: '',
    year: new Date().getFullYear(),
    battery: 100,
    nextService: '',
    status: 'healthy' as const,
    mileage: 0,
    color: '',
    vin: '',
    purchaseDate: ''
  });

  const vehicleModels = [
    { id: 'vf8', name: 'VinFast VF8', type: 'SUV' },
    { id: 'vf9', name: 'VinFast VF9', type: 'SUV' },
    { id: 'vfe34', name: 'VinFast VF e34', type: 'Sedan' },
    { id: 'vf5', name: 'VinFast VF5', type: 'Hatchback' }
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

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddVehicle = () => {
    if (!newVehicle.name || !newVehicle.plate || !newVehicle.model) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin xe",
        variant: "destructive"
      });
      return;
    }

    const vehicle: Vehicle = {
      id: Date.now().toString(),
      ...newVehicle,
      nextService: newVehicle.nextService || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const nextList = [...vehicles, vehicle];
    setVehicles(nextList);

    // Update in-memory session for booking page
    const registeredVehicles = getRegisteredVehicles();
    const newRegisteredVehicle: RegisteredVehicle = {
      id: vehicle.id,
      name: vehicle.name,
      type: vehicle.name.toLowerCase().includes('vf9') || vehicle.name.toLowerCase().includes('vf8') ? 'SUV' : vehicle.name.toLowerCase().includes('e34') ? 'Sedan' : 'Hatchback',
      vin: vehicle.vin,
      plate: vehicle.plate,
      year: String(vehicle.year)
    };
    setRegisteredVehicles([...registeredVehicles, newRegisteredVehicle]);
    setNewVehicle({
      name: '',
      plate: '',
      model: '',
      year: new Date().getFullYear(),
      battery: 100,
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

    // No auto-navigation; user will manually go to booking
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsEditDialogOpen(true);
  };

  const handleUpdateVehicle = () => {
    if (!editingVehicle) return;

    setVehicles(vehicles.map(v => v.id === editingVehicle.id ? editingVehicle : v));
    setIsEditDialogOpen(false);
    setEditingVehicle(null);

    toast({
      title: "Cập nhật xe thành công!",
      description: `Đã cập nhật thông tin ${editingVehicle.name}`,
    });
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setVehicles(vehicles.filter(v => v.id !== vehicleId));

    // Update in-memory session for booking page
    const registeredVehicles = getRegisteredVehicles();
    setRegisteredVehicles(registeredVehicles.filter(v => v.id !== vehicleId));

    toast({
      title: "Xóa xe thành công!",
      description: `Đã xóa ${vehicle?.name} khỏi danh sách`,
    });
  };

  const handleViewVehicleProfile = (vehicleId: string) => {
    navigate(`/customer/vehicle/${vehicleId}`);
  };

  const handleBookService = (vehicle: Vehicle) => {
    // Chuyển đến trang đặt lịch với VIN đã điền sẵn
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
      <div className="flex items-center gap-4"></div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vehicles.length}</p>
                <p className="text-sm text-muted-foreground">Tổng số xe</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'healthy').length}</p>
                <p className="text-sm text-muted-foreground">Xe tốt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status !== 'healthy').length}</p>
                <p className="text-sm text-muted-foreground">Cần kiểm tra</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vehicles.filter(v => new Date(v.nextService) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}</p>
                <p className="text-sm text-muted-foreground">Sắp bảo dưỡng</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên xe, biển số..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="healthy">Tốt</SelectItem>
              <SelectItem value="warning">Cần kiểm tra</SelectItem>
              <SelectItem value="critical">Cần bảo dưỡng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="electric">
              <Plus className="w-4 h-4 mr-2" />
              Thêm xe mới
            </Button>
          </DialogTrigger>
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
                  placeholder="VinFast VF8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plate">Biển số</Label>
                <Input
                  id="plate"
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                  placeholder="30A-123.45"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Mẫu xe</Label>
                <Select value={newVehicle.model} onValueChange={(value) => setNewVehicle({ ...newVehicle, model: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mẫu xe" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleModels.map((model) => (
                      <SelectItem key={model.id} value={model.name}>
                        {model.name} - {model.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Năm sản xuất</Label>
                <Input
                  id="year"
                  type="number"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Màu sắc</Label>
                <Input
                  id="color"
                  value={newVehicle.color}
                  onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                  placeholder="Trắng"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">Số VIN</Label>
                <Input
                  id="vin"
                  value={newVehicle.vin}
                  onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value })}
                  placeholder="VF8PLUS2024001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Số km</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={newVehicle.mileage}
                  onChange={(e) => setNewVehicle({ ...newVehicle, mileage: parseInt(e.target.value) })}
                  placeholder="15000"
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


      </div>

      {/* Vehicle List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                  <CardDescription>{vehicle.plate} • {vehicle.model}</CardDescription>
                </div>
                {getStatusBadge(vehicle.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Pin:</span>
                  <span className="font-medium">{vehicle.battery}%</span>
                </div>
                <Progress
                  value={vehicle.battery}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Năm:</span>
                  <p className="font-medium">{vehicle.year}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Km:</span>
                  <p className="font-medium">{vehicle.mileage.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Màu:</span>
                  <p className="font-medium">{vehicle.color}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">VIN:</span>
                  <p className="font-medium text-xs">{vehicle.vin}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Bảo dưỡng tiếp theo: {new Date(vehicle.nextService).toLocaleDateString('vi-VN')}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleBookService(vehicle)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Đặt lịch
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewVehicleProfile(vehicle.id)}
                >
                  <Wrench className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditVehicle(vehicle)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa xe</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa xe {vehicle.name}? Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteVehicle(vehicle.id)}>
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">Chưa có xe nào</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm xe đầu tiên
            </Button>
          </CardContent>
        </Card>
      )}

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
                <Label htmlFor="edit-model">Mẫu xe</Label>
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
                <Label htmlFor="edit-vin">Số VIN</Label>
                <Input
                  id="edit-vin"
                  value={editingVehicle.vin}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, vin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mileage">Số km</Label>
                <Input
                  id="edit-mileage"
                  type="number"
                  value={editingVehicle.mileage}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, mileage: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-battery">Pin (%)</Label>
                <Input
                  id="edit-battery"
                  type="number"
                  min="0"
                  max="100"
                  value={editingVehicle.battery}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, battery: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-purchaseDate">Ngày mua</Label>
                <Input
                  id="edit-purchaseDate"
                  type="date"
                  value={editingVehicle.purchaseDate}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, purchaseDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nextService">Bảo dưỡng tiếp theo</Label>
                <Input
                  id="edit-nextService"
                  type="date"
                  value={editingVehicle.nextService}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, nextService: e.target.value })}
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
