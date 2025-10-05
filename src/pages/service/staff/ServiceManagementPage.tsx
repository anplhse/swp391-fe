import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Schema validation
const serviceSchema = z.object({
  name: z.string().min(1, 'Tên dịch vụ là bắt buộc'),
  description: z.string().min(1, 'Mô tả là bắt buộc'),
  price: z.string().min(1, 'Giá dịch vụ là bắt buộc').refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Giá phải là số dương'),
  duration: z.string().min(1, 'Thời gian là bắt buộc').refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Thời gian phải là số dương'),
  compatibleVehicles: z.array(z.string()).min(1, 'Phải chọn ít nhất một loại xe'),
  category: z.string().min(1, 'Loại dịch vụ là bắt buộc'),
  status: z.enum(['active', 'inactive'])
});

type ServiceFormData = z.infer<typeof serviceSchema>;

// Service interface
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  compatibleVehicles: string[];
  category: string;
  status: 'active' | 'inactive';
}

// Mock data for services
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Bảo dưỡng định kỳ',
    description: 'Thay dầu, lọc dầu, kiểm tra hệ thống',
    price: 500000,
    duration: 120, // minutes
    compatibleVehicles: ['VF5', 'VF8', 'VF9', 'VFE34'],
    category: 'maintenance',
    status: 'active'
  },
  {
    id: '2',
    name: 'Sửa chữa động cơ',
    description: 'Chẩn đoán và sửa chữa các lỗi động cơ',
    price: 2000000,
    duration: 240,
    compatibleVehicles: ['VF8', 'VF9', 'VFE34'],
    category: 'repair',
    status: 'active'
  },
  {
    id: '3',
    name: 'Thay phụ tùng',
    description: 'Thay thế các phụ tùng cần thiết',
    price: 800000,
    duration: 180,
    compatibleVehicles: ['VF5', 'VF8', 'VF9', 'VFE34'],
    category: 'replacement',
    status: 'active'
  },
  {
    id: '4',
    name: 'Kiểm tra điện',
    description: 'Kiểm tra và sửa chữa hệ thống điện',
    price: 300000,
    duration: 90,
    compatibleVehicles: ['VF5', 'VF8', 'VF9', 'VFE34'],
    category: 'electrical',
    status: 'inactive'
  }
];

const vehicleTypes = [
  { value: 'VF5', label: 'VF5 (Hatchback)' },
  { value: 'VF8', label: 'VF8 (SUV)' },
  { value: 'VF9', label: 'VF9 (SUV)' },
  { value: 'VFE34', label: 'VFE34 (Sedan)' }
];

const serviceCategories = [
  { value: 'maintenance', label: 'Bảo dưỡng' },
  { value: 'repair', label: 'Sửa chữa' },
  { value: 'replacement', label: 'Thay thế' },
  { value: 'electrical', label: 'Điện' },
  { value: 'inspection', label: 'Kiểm tra' }
];

export default function ServiceManagementPage() {
  const [services, setServices] = useState(mockServices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { toast } = useToast();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      duration: '',
      compatibleVehicles: [],
      category: '',
      status: 'active'
    }
  });

  // Mock user data
  const user = {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'staff@example.com',
    role: 'staff',
    userType: 'service'
  };

  const handleAddService = () => {
    setEditingService(null);
    form.reset({
      name: '',
      description: '',
      price: '',
      duration: '',
      compatibleVehicles: [],
      category: '',
      status: 'active'
    });
    setIsDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      compatibleVehicles: service.compatibleVehicles,
      category: service.category,
      status: service.status
    });
    setIsDialogOpen(true);
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(services.filter(service => service.id !== serviceId));
    toast({
      title: "Xóa dịch vụ thành công",
      description: "Dịch vụ đã được xóa khỏi hệ thống."
    });
  };

  const onSubmit = (data: ServiceFormData) => {
    const serviceData = {
      id: editingService ? editingService.id : (services.length + 1).toString(),
      name: data.name,
      description: data.description,
      price: parseInt(data.price),
      duration: parseInt(data.duration),
      compatibleVehicles: data.compatibleVehicles,
      category: data.category,
      status: data.status
    };

    if (editingService) {
      setServices(services.map(service =>
        service.id === editingService.id ? serviceData : service
      ));
      toast({
        title: "Cập nhật dịch vụ thành công",
        description: "Thông tin dịch vụ đã được cập nhật."
      });
    } else {
      setServices([...services, serviceData]);
      toast({
        title: "Thêm dịch vụ thành công",
        description: "Dịch vụ mới đã được thêm vào hệ thống."
      });
    }

    setIsDialogOpen(false);
  };

  const handleVehicleTypeChange = (vehicleType: string, currentVehicles: string[]) => {
    if (currentVehicles.includes(vehicleType)) {
      return currentVehicles.filter(v => v !== vehicleType);
    } else {
      return [...currentVehicles, vehicleType];
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Hoạt động</Badge>
    ) : (
      <Badge variant="secondary">Tạm dừng</Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const cat = serviceCategories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                placeholder="Tìm kiếm dịch vụ..."
                className="w-64"
              />
            </div>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Tạm dừng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddService}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm dịch vụ
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên dịch vụ</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Xe tương thích</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {service.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getCategoryLabel(service.category)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {formatPrice(service.price)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(service.duration)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {service.compatibleVehicles.map((vehicle) => (
                      <Badge key={vehicle} variant="secondary" className="text-xs">
                        {vehicle}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(service.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Add/Edit Service Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
              </DialogTitle>
              <DialogDescription>
                {editingService
                  ? 'Cập nhật thông tin dịch vụ'
                  : 'Thêm dịch vụ mới vào hệ thống'
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên dịch vụ *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên dịch vụ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại dịch vụ *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại dịch vụ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả dịch vụ *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả chi tiết dịch vụ"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá dịch vụ (VNĐ) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Nhập giá dịch vụ"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thời gian (phút) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Nhập thời gian thực hiện"
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
                  name="compatibleVehicles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xe tương thích *</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {vehicleTypes.map((vehicle) => (
                          <div key={vehicle.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={vehicle.value}
                              checked={field.value.includes(vehicle.value)}
                              onChange={() => {
                                const newVehicles = handleVehicleTypeChange(vehicle.value, field.value);
                                field.onChange(newVehicles);
                              }}
                              className="rounded"
                            />
                            <label htmlFor={vehicle.value} className="text-sm">
                              {vehicle.label}
                            </label>
                          </div>
                        ))}
                      </div>
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
                          <SelectItem value="active">Hoạt động</SelectItem>
                          <SelectItem value="inactive">Tạm dừng</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">
                    {editingService ? 'Cập nhật' : 'Thêm mới'}
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