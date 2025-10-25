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
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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

// Mock data for services
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Bảo dưỡng định kỳ',
    description: 'Thay dầu, lọc dầu, kiểm tra hệ thống',
    price: 500000,
    duration: 120, // minutes
    compatibleVehicles: ['VF5', 'VF8', 'VF9', 'VFE34'],
    relatedParts: {
      'VF5': ['Dầu động cơ VF5', 'Lọc dầu VF5', 'Lọc gió VF5', 'Bugi VF5'],
      'VF8': ['Dầu động cơ VF8', 'Lọc dầu VF8', 'Lọc gió VF8', 'Bugi VF8'],
      'VF9': ['Dầu động cơ VF9', 'Lọc dầu VF9', 'Lọc gió VF9', 'Bugi VF9'],
      'VFE34': ['Dầu động cơ VFe34', 'Lọc dầu VFe34', 'Lọc gió VFe34', 'Bugi VFe34']
    },
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
    relatedParts: {
      'VF8': ['Cảm biến VF8', 'Bơm nhiên liệu VF8', 'Bộ lọc nhiên liệu VF8', 'Hệ thống làm mát VF8'],
      'VF9': ['Cảm biến VF9', 'Bơm nhiên liệu VF9', 'Bộ lọc nhiên liệu VF9', 'Hệ thống làm mát VF9'],
      'VFE34': ['Cảm biến VFe34', 'Bơm nhiên liệu VFe34', 'Bộ lọc nhiên liệu VFe34', 'Hệ thống làm mát VFe34']
    },
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
    relatedParts: {
      'VF5': ['Phụ tùng thay thế VF5', 'Gioăng phớt VF5', 'Bulong ốc vít VF5', 'Dây curoa VF5'],
      'VF8': ['Phụ tùng thay thế VF8', 'Gioăng phớt VF8', 'Bulong ốc vít VF8', 'Dây curoa VF8'],
      'VF9': ['Phụ tùng thay thế VF9', 'Gioăng phớt VF9', 'Bulong ốc vít VF9', 'Dây curoa VF9'],
      'VFE34': ['Phụ tùng thay thế VFe34', 'Gioăng phớt VFe34', 'Bulong ốc vít VFe34', 'Dây curoa VFe34']
    },
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
    relatedParts: {
      'VF5': ['Ắc quy VF5', 'Cầu chì VF5', 'Dây điện VF5', 'Bộ điều khiển VF5'],
      'VF8': ['Ắc quy VF8', 'Cầu chì VF8', 'Dây điện VF8', 'Bộ điều khiển VF8'],
      'VF9': ['Ắc quy VF9', 'Cầu chì VF9', 'Dây điện VF9', 'Bộ điều khiển VF9'],
      'VFE34': ['Ắc quy VFe34', 'Cầu chì VFe34', 'Dây điện VFe34', 'Bộ điều khiển VFe34']
    },
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
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [relatedParts, setRelatedParts] = useState<Record<string, string[]>>({});
  const [newPartInputs, setNewPartInputs] = useState<Record<string, string>>({});
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const { toast } = useToast();

  // Mock data for parts - matching with service relatedParts
  const mockParts: Part[] = [
    // VF5 parts
    {
      id: '1',
      name: 'Phụ tùng thay thế VF5',
      partNumber: 'VF5-PART-001',
      category: 'Phụ tùng',
      brand: 'VinFast',
      compatibleModel: 'VF5',
      initialQuantity: 20,
      usedQuantity: 15,
      currentStock: 5,
      unitPrice: 500000,
      supplier: 'VinFast Parts'
    },
    {
      id: '2',
      name: 'Gioăng phớt VF5',
      partNumber: 'VF5-SEAL-002',
      category: 'Gioăng',
      brand: 'VinFast',
      compatibleModel: 'VF5',
      initialQuantity: 50,
      usedQuantity: 30,
      currentStock: 20,
      unitPrice: 100000,
      supplier: 'VinFast Parts'
    },
    {
      id: '3',
      name: 'Bulong ốc vít VF5',
      partNumber: 'VF5-BOLT-003',
      category: 'Bulong',
      brand: 'VinFast',
      compatibleModel: 'VF5',
      initialQuantity: 100,
      usedQuantity: 80,
      currentStock: 20,
      unitPrice: 50000,
      supplier: 'VinFast Parts'
    },
    {
      id: '4',
      name: 'Dây curoa VF5',
      partNumber: 'VF5-BELT-004',
      category: 'Dây curoa',
      brand: 'VinFast',
      compatibleModel: 'VF5',
      initialQuantity: 15,
      usedQuantity: 10,
      currentStock: 5,
      unitPrice: 200000,
      supplier: 'VinFast Parts'
    },
    {
      id: '5',
      name: 'Ắc quy VF5',
      partNumber: 'VF5-BAT-005',
      category: 'Ắc quy',
      brand: 'VinFast',
      compatibleModel: 'VF5',
      initialQuantity: 10,
      usedQuantity: 5,
      currentStock: 5,
      unitPrice: 2000000,
      supplier: 'VinFast Parts'
    },
    {
      id: '6',
      name: 'Cầu chì VF5',
      partNumber: 'VF5-FUSE-006',
      category: 'Cầu chì',
      brand: 'VinFast',
      compatibleModel: 'VF5',
      initialQuantity: 30,
      usedQuantity: 20,
      currentStock: 10,
      unitPrice: 50000,
      supplier: 'VinFast Parts'
    },
    {
      id: '7',
      name: 'Dây điện VF5',
      partNumber: 'VF5-WIRE-007',
      category: 'Dây điện',
      brand: 'VinFast',
      compatibleModel: 'VF5',
      initialQuantity: 25,
      usedQuantity: 15,
      currentStock: 10,
      unitPrice: 150000,
      supplier: 'VinFast Parts'
    },
    {
      id: '8',
      name: 'Bộ điều khiển VF5',
      partNumber: 'VF5-CTRL-008',
      category: 'Điều khiển',
      brand: 'VinFast',
      compatibleModel: 'VF5',
      initialQuantity: 8,
      usedQuantity: 3,
      currentStock: 5,
      unitPrice: 3000000,
      supplier: 'VinFast Parts'
    },
    // VF8 parts
    {
      id: '9',
      name: 'Phụ tùng thay thế VF8',
      partNumber: 'VF8-PART-009',
      category: 'Phụ tùng',
      brand: 'VinFast',
      compatibleModel: 'VF8',
      initialQuantity: 20,
      usedQuantity: 15,
      currentStock: 5,
      unitPrice: 500000,
      supplier: 'VinFast Parts'
    },
    {
      id: '10',
      name: 'Gioăng phớt VF8',
      partNumber: 'VF8-SEAL-010',
      category: 'Gioăng',
      brand: 'VinFast',
      compatibleModel: 'VF8',
      initialQuantity: 50,
      usedQuantity: 30,
      currentStock: 20,
      unitPrice: 100000,
      supplier: 'VinFast Parts'
    },
    {
      id: '11',
      name: 'Bulong ốc vít VF8',
      partNumber: 'VF8-BOLT-011',
      category: 'Bulong',
      brand: 'VinFast',
      compatibleModel: 'VF8',
      initialQuantity: 100,
      usedQuantity: 80,
      currentStock: 20,
      unitPrice: 50000,
      supplier: 'VinFast Parts'
    },
    {
      id: '12',
      name: 'Dây curoa VF8',
      partNumber: 'VF8-BELT-012',
      category: 'Dây curoa',
      brand: 'VinFast',
      compatibleModel: 'VF8',
      initialQuantity: 15,
      usedQuantity: 10,
      currentStock: 5,
      unitPrice: 200000,
      supplier: 'VinFast Parts'
    },
    {
      id: '13',
      name: 'Ắc quy VF8',
      partNumber: 'VF8-BAT-013',
      category: 'Ắc quy',
      brand: 'VinFast',
      compatibleModel: 'VF8',
      initialQuantity: 10,
      usedQuantity: 5,
      currentStock: 5,
      unitPrice: 2000000,
      supplier: 'VinFast Parts'
    },
    {
      id: '14',
      name: 'Cầu chì VF8',
      partNumber: 'VF8-FUSE-014',
      category: 'Cầu chì',
      brand: 'VinFast',
      compatibleModel: 'VF8',
      initialQuantity: 30,
      usedQuantity: 20,
      currentStock: 10,
      unitPrice: 50000,
      supplier: 'VinFast Parts'
    },
    {
      id: '15',
      name: 'Dây điện VF8',
      partNumber: 'VF8-WIRE-015',
      category: 'Dây điện',
      brand: 'VinFast',
      compatibleModel: 'VF8',
      initialQuantity: 25,
      usedQuantity: 15,
      currentStock: 10,
      unitPrice: 150000,
      supplier: 'VinFast Parts'
    },
    {
      id: '16',
      name: 'Bộ điều khiển VF8',
      partNumber: 'VF8-CTRL-016',
      category: 'Điều khiển',
      brand: 'VinFast',
      compatibleModel: 'VF8',
      initialQuantity: 8,
      usedQuantity: 3,
      currentStock: 5,
      unitPrice: 3000000,
      supplier: 'VinFast Parts'
    },
    // VF9 parts
    {
      id: '17',
      name: 'Phụ tùng thay thế VF9',
      partNumber: 'VF9-PART-017',
      category: 'Phụ tùng',
      brand: 'VinFast',
      compatibleModel: 'VF9',
      initialQuantity: 20,
      usedQuantity: 15,
      currentStock: 5,
      unitPrice: 500000,
      supplier: 'VinFast Parts'
    },
    {
      id: '18',
      name: 'Gioăng phớt VF9',
      partNumber: 'VF9-SEAL-018',
      category: 'Gioăng',
      brand: 'VinFast',
      compatibleModel: 'VF9',
      initialQuantity: 50,
      usedQuantity: 30,
      currentStock: 20,
      unitPrice: 100000,
      supplier: 'VinFast Parts'
    },
    {
      id: '19',
      name: 'Bulong ốc vít VF9',
      partNumber: 'VF9-BOLT-019',
      category: 'Bulong',
      brand: 'VinFast',
      compatibleModel: 'VF9',
      initialQuantity: 100,
      usedQuantity: 80,
      currentStock: 20,
      unitPrice: 50000,
      supplier: 'VinFast Parts'
    },
    {
      id: '20',
      name: 'Dây curoa VF9',
      partNumber: 'VF9-BELT-020',
      category: 'Dây curoa',
      brand: 'VinFast',
      compatibleModel: 'VF9',
      initialQuantity: 15,
      usedQuantity: 10,
      currentStock: 5,
      unitPrice: 200000,
      supplier: 'VinFast Parts'
    },
    {
      id: '21',
      name: 'Ắc quy VF9',
      partNumber: 'VF9-BAT-021',
      category: 'Ắc quy',
      brand: 'VinFast',
      compatibleModel: 'VF9',
      initialQuantity: 10,
      usedQuantity: 5,
      currentStock: 5,
      unitPrice: 2000000,
      supplier: 'VinFast Parts'
    },
    {
      id: '22',
      name: 'Cầu chì VF9',
      partNumber: 'VF9-FUSE-022',
      category: 'Cầu chì',
      brand: 'VinFast',
      compatibleModel: 'VF9',
      initialQuantity: 30,
      usedQuantity: 20,
      currentStock: 10,
      unitPrice: 50000,
      supplier: 'VinFast Parts'
    },
    {
      id: '23',
      name: 'Dây điện VF9',
      partNumber: 'VF9-WIRE-023',
      category: 'Dây điện',
      brand: 'VinFast',
      compatibleModel: 'VF9',
      initialQuantity: 25,
      usedQuantity: 15,
      currentStock: 10,
      unitPrice: 150000,
      supplier: 'VinFast Parts'
    },
    {
      id: '24',
      name: 'Bộ điều khiển VF9',
      partNumber: 'VF9-CTRL-024',
      category: 'Điều khiển',
      brand: 'VinFast',
      compatibleModel: 'VF9',
      initialQuantity: 8,
      usedQuantity: 3,
      currentStock: 5,
      unitPrice: 3000000,
      supplier: 'VinFast Parts'
    },
    // VFE34 parts
    {
      id: '25',
      name: 'Phụ tùng thay thế VFe34',
      partNumber: 'VFE34-PART-025',
      category: 'Phụ tùng',
      brand: 'VinFast',
      compatibleModel: 'VFE34',
      initialQuantity: 20,
      usedQuantity: 15,
      currentStock: 5,
      unitPrice: 500000,
      supplier: 'VinFast Parts'
    },
    {
      id: '26',
      name: 'Gioăng phớt VFe34',
      partNumber: 'VFE34-SEAL-026',
      category: 'Gioăng',
      brand: 'VinFast',
      compatibleModel: 'VFE34',
      initialQuantity: 50,
      usedQuantity: 30,
      currentStock: 20,
      unitPrice: 100000,
      supplier: 'VinFast Parts'
    },
    {
      id: '27',
      name: 'Bulong ốc vít VFe34',
      partNumber: 'VFE34-BOLT-027',
      category: 'Bulong',
      brand: 'VinFast',
      compatibleModel: 'VFE34',
      initialQuantity: 100,
      usedQuantity: 80,
      currentStock: 20,
      unitPrice: 50000,
      supplier: 'VinFast Parts'
    },
    {
      id: '28',
      name: 'Dây curoa VFe34',
      partNumber: 'VFE34-BELT-028',
      category: 'Dây curoa',
      brand: 'VinFast',
      compatibleModel: 'VFE34',
      initialQuantity: 15,
      usedQuantity: 10,
      currentStock: 5,
      unitPrice: 200000,
      supplier: 'VinFast Parts'
    },
    {
      id: '29',
      name: 'Ắc quy VFe34',
      partNumber: 'VFE34-BAT-029',
      category: 'Ắc quy',
      brand: 'VinFast',
      compatibleModel: 'VFE34',
      initialQuantity: 10,
      usedQuantity: 5,
      currentStock: 5,
      unitPrice: 2000000,
      supplier: 'VinFast Parts'
    },
    {
      id: '30',
      name: 'Cầu chì VFe34',
      partNumber: 'VFE34-FUSE-030',
      category: 'Cầu chì',
      brand: 'VinFast',
      compatibleModel: 'VFE34',
      initialQuantity: 30,
      usedQuantity: 20,
      currentStock: 10,
      unitPrice: 50000,
      supplier: 'VinFast Parts'
    },
    {
      id: '31',
      name: 'Dây điện VFe34',
      partNumber: 'VFE34-WIRE-031',
      category: 'Dây điện',
      brand: 'VinFast',
      compatibleModel: 'VFE34',
      initialQuantity: 25,
      usedQuantity: 15,
      currentStock: 10,
      unitPrice: 150000,
      supplier: 'VinFast Parts'
    },
    {
      id: '32',
      name: 'Bộ điều khiển VFe34',
      partNumber: 'VFE34-CTRL-032',
      category: 'Điều khiển',
      brand: 'VinFast',
      compatibleModel: 'VFE34',
      initialQuantity: 8,
      usedQuantity: 3,
      currentStock: 5,
      unitPrice: 3000000,
      supplier: 'VinFast Parts'
    }
  ];

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