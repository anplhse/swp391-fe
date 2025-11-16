import { ServiceTable } from '@/components/ServiceTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { showApiErrorToast } from '@/lib/responseHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Part interface
interface Part {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  brand: string;
  compatibleModel: string;
  initialQuantity: number;
  usedQuantity: number;
  currentStock: number;
  unitPrice: number;
  supplier: string;
}

// Schema validation
const serviceSchema = z.object({
  name: z.string().min(1, 'Tên dịch vụ là bắt buộc'),
  description: z.string().min(1, 'Mô tả là bắt buộc'),
  price: z.string().min(1, 'Giá dịch vụ là bắt buộc').refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Giá phải là số dương'),
  duration: z.string().min(1, 'Thời gian là bắt buộc').refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Thời gian phải là số dương'),
  compatibleVehicles: z.array(z.string()).min(1, 'Phải chọn ít nhất một loại xe'),
  relatedParts: z.record(z.string(), z.array(z.string())).optional(),
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
  relatedParts: Record<string, string[]>; // Model -> Parts mapping
  category: string;
  status: 'active' | 'inactive';
}

// Services should be loaded from API

const vehicleTypes = [
  { value: 'VF 3', label: 'VF 3' },
  { value: 'VF 5 Plus', label: 'VF 5 Plus' },
  { value: 'VF 6', label: 'VF 6' },
  { value: 'VF 7', label: 'VF 7' },
  { value: 'VF 8', label: 'VF 8' },
  { value: 'VF 9', label: 'VF 9' },
  { value: 'VF e34', label: 'VF e34' }
];

const serviceCategories = [
  { value: 'maintenance', label: 'Bảo dưỡng' },
  { value: 'repair', label: 'Sửa chữa' },
  { value: 'replacement', label: 'Thay thế' },
  { value: 'electrical', label: 'Điện' },
  { value: 'inspection', label: 'Kiểm tra' }
];

export default function ServiceManagementPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [relatedParts, setRelatedParts] = useState<Record<string, string[]>>({});
  const [newPartInputs, setNewPartInputs] = useState<Record<string, string>>({});
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const { toast } = useToast();

  // Parts should be loaded from API
  const mockParts: Part[] = []; // Empty - should load from API

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      duration: '',
      compatibleVehicles: [],
      relatedParts: {},
      category: '',
      status: 'active'
    }
  });

  // Fetch services from API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const catalogs = await apiClient.getMaintenanceCatalogs();
        if (!mounted) return;

        // Map API response to Service interface
        const mappedServices: Service[] = catalogs.map((catalog) => {
          // Get all unique model names
          const compatibleVehicles = catalog.models.map(m => m.modelName);

          // Calculate average price and duration
          const prices = catalog.models.map(m => m.maintenancePrice);
          const durations = catalog.models.map(m => m.estTimeMinutes);
          const avgPrice = prices.length > 0
            ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
            : 0;
          const avgDuration = durations.length > 0
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : 0;

          // Map parts by model
          const relatedParts: Record<string, string[]> = {};
          catalog.models.forEach(model => {
            if (model.parts && model.parts.length > 0) {
              relatedParts[model.modelName] = model.parts.map(p => p.partName);
            }
          });

          return {
            id: String(catalog.id),
            name: catalog.name,
            description: catalog.description,
            price: avgPrice,
            duration: avgDuration,
            compatibleVehicles: compatibleVehicles,
            relatedParts: relatedParts,
            category: catalog.maintenanceServiceCategory, // Use category directly from API
            status: catalog.status === 'ACTIVE' ? 'active' : 'inactive',
          };
        });

        setServices(mappedServices);
      } catch (error) {
        console.error('Error loading maintenance catalogs:', error);
        showApiErrorToast(error, toast, 'Không thể tải danh sách dịch vụ');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [toast]);

  // Mock user data removed; layout is provided by DefaultLayout

  const handleAddService = () => {
    setEditingService(null);
    setRelatedParts({});
    setNewPartInputs({});
    setSelectedParts([]);
    form.reset({
      name: '',
      description: '',
      price: '',
      duration: '',
      compatibleVehicles: [],
      relatedParts: {},
      category: '',
      status: 'active'
    });
    setIsDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setRelatedParts(service.relatedParts || {});
    setNewPartInputs({});

    // Load selected parts from service
    const selectedPartsFromService: string[] = [];
    if (service.relatedParts) {
      Object.values(service.relatedParts).forEach(partNames => {
        partNames.forEach(partName => {
          const part = mockParts.find(p => p.name === partName);
          if (part) {
            selectedPartsFromService.push(part.id);
          }
        });
      });
    }
    setSelectedParts(selectedPartsFromService);

    form.reset({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      compatibleVehicles: service.compatibleVehicles,
      relatedParts: service.relatedParts || {},
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
    // Convert selected parts to relatedParts format
    const newRelatedParts: Record<string, string[]> = {};
    form.watch('compatibleVehicles').forEach(model => {
      const selectedPartsForModel = getSelectedPartsForModel(model);
      newRelatedParts[model] = selectedPartsForModel.map(part => part.name);
    });

    const serviceData = {
      id: editingService ? editingService.id : (services.length + 1).toString(),
      name: data.name,
      description: data.description,
      price: parseInt(data.price),
      duration: parseInt(data.duration),
      compatibleVehicles: data.compatibleVehicles,
      relatedParts: newRelatedParts,
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

  // Functions to manage related parts
  const addPartToModel = (model: string, part: string) => {
    if (!part.trim()) return;

    setRelatedParts(prev => ({
      ...prev,
      [model]: [...(prev[model] || []), part.trim()]
    }));

    // Clear input after adding
    setNewPartInputs(prev => ({
      ...prev,
      [model]: ''
    }));
  };

  const handleAddPart = (model: string) => {
    const part = newPartInputs[model]?.trim();
    if (part) {
      addPartToModel(model, part);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, model: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPart(model);
    }
  };

  const removePartFromModel = (model: string, partIndex: number) => {
    setRelatedParts(prev => ({
      ...prev,
      [model]: prev[model]?.filter((_, index) => index !== partIndex) || []
    }));
  };

  const updatePartInModel = (model: string, partIndex: number, newPart: string) => {
    if (!newPart.trim()) return;

    setRelatedParts(prev => ({
      ...prev,
      [model]: prev[model]?.map((part, index) =>
        index === partIndex ? newPart.trim() : part
      ) || []
    }));
  };

  // Functions to manage part selection
  const togglePartSelection = (partId: string) => {
    setSelectedParts(prev =>
      prev.includes(partId)
        ? prev.filter(id => id !== partId)
        : [...prev, partId]
    );
  };

  const getCompatibleParts = (model: string) => {
    return mockParts.filter(part => part.compatibleModel === model);
  };

  const getSelectedPartsForModel = (model: string) => {
    const compatibleParts = getCompatibleParts(model);
    return compatibleParts.filter(part => selectedParts.includes(part.id));
  };

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Chọn model xe để xem phụ tùng:</label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Chọn model xe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả model</SelectItem>
              {vehicleTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ServiceTable
        services={services}
        mode="management"
        onEdit={handleEditService}
        onDelete={handleDeleteService}
        onAdd={handleAddService}
        showActions={true}
        showSelection={false}
        selectedModel={selectedModel}
      />

      {/* Add/Edit Service Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

              {/* Parts Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Chọn phụ tùng cho dịch vụ</h4>
                  <div className="text-xs text-muted-foreground">
                    {selectedModel && selectedModel !== 'all'
                      ? `Chỉ hiển thị phụ tùng cho ${vehicleTypes.find(vt => vt.value === selectedModel)?.label}`
                      : 'Chọn từ danh sách phụ tùng có sẵn trong hệ thống'
                    }
                  </div>
                </div>

                {form.watch('compatibleVehicles').length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      const modelsToShow = selectedModel && selectedModel !== 'all'
                        ? form.watch('compatibleVehicles').filter(model => model === selectedModel)
                        : form.watch('compatibleVehicles');

                      if (selectedModel && selectedModel !== 'all' && modelsToShow.length === 0) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">
                              Dịch vụ này không tương thích với {vehicleTypes.find(vt => vt.value === selectedModel)?.label}
                            </p>
                            <p className="text-xs mt-2">
                              Chuyển về "Tất cả model" để xem tất cả phụ tùng
                            </p>
                          </div>
                        );
                      }

                      return modelsToShow.map((model) => {
                        const compatibleParts = getCompatibleParts(model);
                        const selectedPartsForModel = getSelectedPartsForModel(model);

                        return (
                          <div key={model} className="border rounded-lg p-4">
                            <h5 className="text-sm font-medium text-primary mb-3">
                              {vehicleTypes.find(vt => vt.value === model)?.label} - Phụ tùng tương thích
                            </h5>

                            {compatibleParts.length > 0 ? (
                              <div className="border rounded-lg">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-12">Chọn</TableHead>
                                      <TableHead>Tên phụ tùng</TableHead>
                                      <TableHead>Mã</TableHead>
                                      <TableHead>Danh mục</TableHead>
                                      <TableHead>Thương hiệu</TableHead>
                                      <TableHead>Tồn kho</TableHead>
                                      <TableHead>Giá</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {compatibleParts.map((part) => (
                                      <TableRow key={part.id}>
                                        <TableCell>
                                          <input
                                            type="checkbox"
                                            checked={selectedParts.includes(part.id)}
                                            onChange={() => togglePartSelection(part.id)}
                                            className="rounded border-gray-300"
                                          />
                                        </TableCell>
                                        <TableCell className="font-medium">{part.name}</TableCell>
                                        <TableCell>{part.partNumber}</TableCell>
                                        <TableCell>{part.category}</TableCell>
                                        <TableCell>{part.brand}</TableCell>
                                        <TableCell>
                                          <div className="text-sm">
                                            <div className="font-medium text-green-600">{part.currentStock}</div>
                                            <div className="text-xs text-muted-foreground">
                                              Đã dùng: {part.usedQuantity} / Tổng: {part.initialQuantity}
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell>{part.unitPrice.toLocaleString('vi-VN')} VNĐ</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                <p className="text-sm">Không có phụ tùng nào cho model {model}</p>
                              </div>
                            )}

                            {selectedPartsForModel.length > 0 && (
                              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                <p className="text-sm font-medium text-green-800 mb-2">Đã chọn:</p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedPartsForModel.map((part) => (
                                    <Badge key={part.id} variant="secondary" className="text-xs">
                                      {part.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Vui lòng chọn ít nhất một loại xe tương thích để chọn phụ tùng</p>
                  </div>
                )}
              </div>

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
  );
}