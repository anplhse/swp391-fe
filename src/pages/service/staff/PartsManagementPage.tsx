import { PartsTable } from '@/components/PartsTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface Part {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  brand: string;
  compatibleModel: string; // Model xe tương thích
  initialQuantity: number; // Số lượng ban đầu nhập vào
  usedQuantity: number; // Số lượng đã sử dụng
  currentStock: number; // Số lượng hiện tại = initialQuantity - usedQuantity
  minStock: number;
  maxStock: number;
  unitPrice: number;
  supplier: string;
  lastRestocked: string;
  status: 'active' | 'inactive'; // Trạng thái sử dụng (đang sử dụng/ngưng)
  location: string;
  description?: string;
}

// Helper function to extract category from partNumber (fallback if API doesn't provide)
const extractCategory = (partNumber: string): string => {
  const partNum = partNumber.toUpperCase();
  if (partNum.includes('FIL')) return 'Lọc';
  if (partNum.includes('FLD') || partNum.includes('FLUID')) return 'Dầu/Chất lỏng';
  if (partNum.includes('BAT')) return 'Pin';
  if (partNum.includes('WPR')) return 'Gạt mưa';
  if (partNum.includes('TIRE')) return 'Lốp';
  if (partNum.includes('BRAKE')) return 'Phanh';
  if (partNum.includes('AC') || partNum.includes('ACG')) return 'Điều hòa';
  return 'Khác';
};

// Helper function to extract compatible model from description
const extractCompatibleModel = (description?: string): string => {
  if (!description) return '';
  const desc = description.toUpperCase();
  if (desc.includes('VF 3') || desc.includes('VF3')) return 'VF 3';
  if (desc.includes('VF 5') || desc.includes('VF5')) return 'VF 5';
  if (desc.includes('VF 6') || desc.includes('VF6')) return 'VF 6';
  if (desc.includes('VF 7') || desc.includes('VF7')) return 'VF 7';
  if (desc.includes('VF 8') || desc.includes('VF8')) return 'VF 8';
  if (desc.includes('VF 9') || desc.includes('VF9')) return 'VF 9';
  if (desc.includes('VF E34') || desc.includes('VFE34')) return 'VF e34';
  return '';
};

export default function PartsManagementPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [isPartDialogOpen, setIsPartDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const { toast } = useToast();

  const vehicleTypes = [
    { value: 'VF5', label: 'VF5 (Hatchback)' },
    { value: 'VF8', label: 'VF8 (SUV)' },
    { value: 'VF9', label: 'VF9 (SUV)' },
    { value: 'VFE34', label: 'VFE34 (Sedan)' }
  ];


  const partSchema = z.object({
    name: z.string().min(1, 'Tên phụ tùng là bắt buộc'),
    partNumber: z.string().min(1, 'Mã phụ tùng là bắt buộc'),
    category: z.string().min(1, 'Danh mục là bắt buộc'),
    brand: z.string().min(1, 'Thương hiệu là bắt buộc'),
    compatibleModel: z.string().min(1, 'Phải chọn model xe'),
    initialQuantity: z.string().min(1).refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Số lượng ban đầu phải lớn hơn 0'),
    unitPrice: z.string().min(1).refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Giá không hợp lệ'),
    supplier: z.string().min(1, 'Nhà cung cấp là bắt buộc')
  });
  type PartFormData = z.infer<typeof partSchema>;

  const partForm = useForm<PartFormData>({ resolver: zodResolver(partSchema), defaultValues: { name: '', partNumber: '', category: '', brand: '', compatibleModel: '', initialQuantity: '1', unitPrice: '0', supplier: '' } });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const apiParts = await apiClient.getParts();
        if (!mounted) return;
        
        // Map API response to UI interface
        const mappedParts: Part[] = apiParts.map((apiPart) => {
          const currentStock = apiPart.quantity;
          const usedQuantity = apiPart.used; // Use 'used' from API
          const initialQuantity = apiPart.all; // Use 'all' from API (total quantity)
          const minStock = Math.max(1, Math.floor(initialQuantity * 0.2)); // 20% of initial
          
          // Map status from API (ACTIVE/INACTIVE) to active/inactive
          const status: 'active' | 'inactive' = apiPart.status === 'ACTIVE' ? 'active' : 'inactive';
          
          // Use category from API (already available)
          const category = apiPart.category || extractCategory(apiPart.partNumber);
          
          // Extract compatible model from vehicleModelsEnum
          let compatibleModel = '';
          if (apiPart.vehicleModelsEnum && apiPart.vehicleModelsEnum.enumValue.length > 0) {
            // Join all models or take the first one
            compatibleModel = apiPart.vehicleModelsEnum.enumValue
              .map(model => model.replace('VinFast ', '')) // Remove "VinFast " prefix
              .join(', ');
          } else {
            // Fallback to extraction from description if enum not available
            compatibleModel = extractCompatibleModel(apiPart.description);
          }
          
          return {
            id: String(apiPart.id),
            name: apiPart.name,
            partNumber: apiPart.partNumber,
            category: category,
            brand: apiPart.manufacturer,
            compatibleModel: compatibleModel,
            initialQuantity: initialQuantity,
            usedQuantity: usedQuantity,
            currentStock: currentStock,
            minStock: minStock,
            maxStock: initialQuantity * 2,
            unitPrice: apiPart.currentUnitPrice,
            supplier: '', // Not available in API
            lastRestocked: apiPart.createdAt ? apiPart.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
            status: status, // Trạng thái sử dụng (active/inactive)
            location: 'Kho chính',
            description: apiPart.description,
          };
        });
        
        setParts(mappedParts);
      } catch (error) {
        console.error('Error loading parts:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách phụ tùng',
          variant: 'destructive',
        });
      }
    })();
    
    return () => {
      mounted = false;
    };
  }, [toast]);


  const handleAddPart = () => {
    setEditingPart(null);
    partForm.reset({ name: '', partNumber: '', category: '', brand: '', compatibleModel: '', initialQuantity: '1', unitPrice: '0', supplier: '' });
    setIsPartDialogOpen(true);
  };

  const handleEditPart = (part: Part) => {
    setEditingPart(part);
    partForm.reset({
      name: part.name,
      partNumber: part.partNumber,
      category: part.category,
      brand: part.brand,
      compatibleModel: part.compatibleModel || '',
      initialQuantity: String(part.initialQuantity),
      unitPrice: String(part.unitPrice),
      supplier: part.supplier
    });
    setIsPartDialogOpen(true);
  };

  const handleDeletePart = (partId: string) => {
    setParts(prev => prev.filter(p => p.id !== partId));
  };

  // Function để sử dụng phụ tùng (gọi từ dịch vụ)
  const usePart = (partId: string, quantity: number) => {
    setParts(prev => prev.map(part => {
      if (part.id === partId) {
        const newUsedQuantity = part.usedQuantity + quantity;
        const newCurrentStock = part.initialQuantity - newUsedQuantity;
        return {
          ...part,
          usedQuantity: newUsedQuantity,
          currentStock: newCurrentStock,
          status: newCurrentStock > 0 ?
            (newCurrentStock <= part.minStock ? 'low_stock' : 'in_stock') :
            'out_of_stock'
        };
      }
      return part;
    }));
  };


  return (
    <div className="space-y-6">
      <PartsTable
        parts={parts}
        onEdit={handleEditPart}
        onDelete={handleDeletePart}
        onAdd={handleAddPart}
        showActions={true}
      />

      {/* Add/Edit Part Dialog */}
      <Dialog open={isPartDialogOpen} onOpenChange={setIsPartDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPart ? 'Chỉnh sửa phụ tùng' : 'Thêm phụ tùng mới'}</DialogTitle>
            <DialogDescription>{editingPart ? 'Cập nhật thông tin phụ tùng' : 'Thêm phụ tùng mới vào kho'}</DialogDescription>
          </DialogHeader>
          <Form {...partForm}>
            <form onSubmit={partForm.handleSubmit((data) => {
              const initialQuantity = Number(data.initialQuantity);
              const usedQuantity = editingPart ? editingPart.usedQuantity : 0;
              const currentStock = initialQuantity - usedQuantity;
              const next: Part = {
                id: editingPart ? editingPart.id : String(parts.length + 1),
                name: data.name,
                partNumber: data.partNumber,
                category: data.category,
                brand: data.brand,
                compatibleModel: data.compatibleModel,
                initialQuantity: initialQuantity,
                usedQuantity: usedQuantity,
                currentStock: currentStock,
                minStock: Math.max(1, Math.floor(initialQuantity * 0.2)), // 20% của số lượng ban đầu
                maxStock: initialQuantity * 2, // Gấp đôi số lượng ban đầu
                unitPrice: Number(data.unitPrice),
                supplier: data.supplier,
                lastRestocked: new Date().toISOString().split('T')[0],
                status: currentStock > 0 ? (currentStock <= Math.max(1, Math.floor(initialQuantity * 0.2)) ? 'low_stock' : 'in_stock') : 'out_of_stock',
                location: 'Kho chính',
                description: editingPart?.description
              };
              setParts(prev => editingPart ? prev.map(p => p.id === editingPart.id ? next : p) : [...prev, next]);
              setIsPartDialogOpen(false);
              toast({ title: editingPart ? 'Cập nhật phụ tùng thành công' : 'Thêm phụ tùng thành công' });
            })} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={partForm.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Tên *</FormLabel><FormControl><Input {...field} placeholder="Tên phụ tùng" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={partForm.control} name="partNumber" render={({ field }) => (
                  <FormItem><FormLabel>Mã *</FormLabel><FormControl><Input {...field} placeholder="Mã phụ tùng" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={partForm.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Danh mục *</FormLabel><FormControl><Input {...field} placeholder="Danh mục" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={partForm.control} name="brand" render={({ field }) => (
                  <FormItem><FormLabel>Thương hiệu *</FormLabel><FormControl><Input {...field} placeholder="Thương hiệu" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={partForm.control} name="compatibleModel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Model xe tương thích *</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      {vehicleTypes.map((vehicleType) => (
                        <div key={vehicleType.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={vehicleType.value}
                            name="compatibleModel"
                            value={vehicleType.value}
                            checked={field.value === vehicleType.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="border-gray-300"
                          />
                          <label htmlFor={vehicleType.value} className="text-sm font-medium">
                            {vehicleType.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={partForm.control} name="initialQuantity" render={({ field }) => (
                  <FormItem><FormLabel>Số lượng ban đầu *</FormLabel><FormControl><Input type="number" {...field} placeholder="Số lượng nhập từ nhà cung cấp" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={partForm.control} name="unitPrice" render={({ field }) => (
                  <FormItem><FormLabel>Giá đơn vị (VNĐ) *</FormLabel><FormControl><Input type="number" {...field} placeholder="Giá mỗi phụ tùng" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={partForm.control} name="supplier" render={({ field }) => (
                <FormItem><FormLabel>Nhà cung cấp *</FormLabel><FormControl><Input {...field} placeholder="Tên nhà cung cấp" /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPartDialogOpen(false)}>Hủy</Button>
                <Button type="submit">Lưu</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </div >
  );
}
