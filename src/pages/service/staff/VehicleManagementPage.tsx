import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Calendar, Car, Edit, Plus, Search, Trash2, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
    // Mock data
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        licensePlate: '30A-12345',
        brand: 'VinFast',
        model: 'VF8',
        year: 2023,
        owner: 'Nguyễn Văn A',
        ownerPhone: '0123456789',
        lastService: '2024-01-15',
        nextService: '2024-04-15',
        status: 'active',
        mileage: 15000
      },
      {
        id: '2',
        licensePlate: '29B-67890',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2022,
        owner: 'Trần Thị B',
        ownerPhone: '0987654321',
        lastService: '2024-01-10',
        nextService: '2024-02-10',
        status: 'warning',
        mileage: 25000
      },
      {
        id: '3',
        licensePlate: '51C-11111',
        brand: 'BYD',
        model: 'Atto 3',
        year: 2023,
        owner: 'Lê Văn C',
        ownerPhone: '0369852147',
        lastService: '2024-01-20',
        nextService: '2024-04-20',
        status: 'maintenance',
        mileage: 8000
      }
    ];
    setVehicles(mockVehicles);
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch =
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Bình thường</Badge>;
      case 'maintenance':
        return <Badge variant="secondary">Đang bảo dưỡng</Badge>;
      case 'warning':
        return <Badge variant="destructive">Cần bảo dưỡng</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  return (
    <DashboardLayout user={{ email: 'staff@service.com', role: 'staff', userType: 'service' }}>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm kiếm xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Bình thường</SelectItem>
                <SelectItem value="maintenance">Đang bảo dưỡng</SelectItem>
                <SelectItem value="warning">Cần bảo dưỡng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddVehicle}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm xe mới
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách xe</CardTitle>
            <CardDescription>
              Tổng cộng {filteredVehicles.length} xe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Biển số</TableHead>
                  <TableHead>Thông tin xe</TableHead>
                  <TableHead>Chủ xe</TableHead>
                  <TableHead>Số km</TableHead>
                  <TableHead>Dịch vụ cuối</TableHead>
                  <TableHead>Dịch vụ tiếp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-primary" />
                        <span className="font-medium">{vehicle.licensePlate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                        <div className="text-sm text-muted-foreground">({vehicle.year})</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vehicle.owner}</div>
                        <div className="text-sm text-muted-foreground">{vehicle.ownerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(vehicle.lastService).toLocaleDateString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-muted-foreground" />
                        {new Date(vehicle.nextService).toLocaleDateString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(vehicle.status)}
                        {vehicle.status === 'warning' && (
                          <div className="flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="w-3 h-3" />
                            <span>Cần bảo dưỡng</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVehicle(vehicle)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
    </DashboardLayout>
  );
}
