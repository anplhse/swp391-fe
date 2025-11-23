import { PartsTable } from '@/components/PartsTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { showApiErrorToast } from '@/lib/responseHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface Part {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  manufacturer: string; // Nhà cung cấp (từ API manufacturer)
  compatibleModel: string; // Model xe tương thích (extract từ vehicleModelsEnum)
  initialQuantity: number; // Số lượng ban đầu (từ API all)
  usedQuantity: number; // Số lượng đã sử dụng (từ API used)
  reserved: number; // Số lượng đã đặt (từ API reserved)
  currentStock: number; // Số lượng hiện tại (từ API quantity)
  unitPrice: number; // Giá đơn vị (từ API currentUnitPrice)
  status: 'active' | 'inactive'; // Trạng thái (từ API status)
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

export default function PartsManagementPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [isPartDialogOpen, setIsPartDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [partCategories, setPartCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const { toast } = useToast();

  const partSchema = z.object({
    name: z.string().min(1, 'Tên phụ tùng là bắt buộc'),
    partNumber: z.string().min(1, 'Mã phụ tùng là bắt buộc'),
    category: z.string().min(1, 'Danh mục là bắt buộc'),
    initialQuantity: z.string().min(1).refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Số lượng ban đầu phải lớn hơn 0'),
    unitPrice: z.string().min(1).refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Giá không hợp lệ'),
    manufacturer: z.string().min(1, 'Nhà cung cấp là bắt buộc')
  });
  type PartFormData = z.infer<typeof partSchema>;

  const partForm = useForm<PartFormData>({ resolver: zodResolver(partSchema), defaultValues: { name: '', partNumber: '', category: '', initialQuantity: '1', unitPrice: '0', manufacturer: '' } });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await apiClient.getPartCategories();
        setPartCategories(categoriesData.enumValue);
      } catch (error) {
        console.error('Failed to load part categories:', error);
        showApiErrorToast(error, toast, 'Không thể tải danh sách danh mục phụ tùng');
        // Fallback to default categories
        setPartCategories(['Lọc', 'Dung dịch & Hóa chất', 'Pin & Ắc quy', 'Gạt mưa', 'Lốp xe', 'Phanh', 'Điện & Điện tử', 'Hệ thống treo', 'Linh kiện điều hòa', 'Khác']);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, [toast]);

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
          }

          return {
            id: String(apiPart.id),
            name: apiPart.name,
            partNumber: apiPart.partNumber,
            category: category,
            manufacturer: apiPart.manufacturer || '',
            compatibleModel: compatibleModel,
            initialQuantity: initialQuantity,
            usedQuantity: usedQuantity,
            reserved: apiPart.reserved,
            currentStock: currentStock,
            unitPrice: apiPart.currentUnitPrice,
            status: status,
          };
        });

        setParts(mappedParts);
      } catch (error) {
        console.error('Error loading parts:', error);
        showApiErrorToast(error, toast, 'Không thể tải danh sách phụ tùng');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [toast]);


  const handleAddPart = () => {
    setEditingPart(null);
    partForm.reset({ name: '', partNumber: '', category: '', initialQuantity: '1', unitPrice: '0', manufacturer: '' });
    setIsPartDialogOpen(true);
  };

  const handleEditPart = (part: Part) => {
    setEditingPart(part);
    partForm.reset({
      name: part.name,
      partNumber: part.partNumber,
      category: part.category,
      initialQuantity: String(part.initialQuantity),
      unitPrice: String(part.unitPrice),
      manufacturer: part.manufacturer
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
          // Keep the original status (active/inactive), don't change it based on stock
        };
      }
      return part;
    }));
  };


  const handleIncreaseStock = async (partId: string, amount: number) => {
    try {
      await apiClient.increasePartStock(Number(partId), amount);
      // Reload parts to get updated data
      const apiParts = await apiClient.getParts();
      const mappedParts: Part[] = apiParts.map((apiPart) => {
        const currentStock = apiPart.quantity;
        const usedQuantity = apiPart.used;
        const initialQuantity = apiPart.all;
        const status: 'active' | 'inactive' = apiPart.status === 'ACTIVE' ? 'active' : 'inactive';
        const category = apiPart.category || extractCategory(apiPart.partNumber);
        let compatibleModel = '';
        if (apiPart.vehicleModelsEnum && apiPart.vehicleModelsEnum.enumValue.length > 0) {
          compatibleModel = apiPart.vehicleModelsEnum.enumValue
            .map(model => model.replace('VinFast ', ''))
            .join(', ');
        }
        return {
          id: String(apiPart.id),
          name: apiPart.name,
          partNumber: apiPart.partNumber,
          category: category,
          manufacturer: apiPart.manufacturer || '',
          compatibleModel: compatibleModel,
          initialQuantity: initialQuantity,
          usedQuantity: usedQuantity,
          reserved: apiPart.reserved,
          currentStock: currentStock,
          unitPrice: apiPart.currentUnitPrice,
          status: status,
        };
      });
      setParts(mappedParts);
      toast({ title: 'Tăng số lượng phụ tùng thành công' });
    } catch (error) {
      console.error('Failed to increase stock:', error);
      showApiErrorToast(error, toast, 'Không thể tăng số lượng phụ tùng. Vui lòng thử lại.');
    }
  };

  const handleDecreaseStock = async (partId: string, amount: number) => {
    try {
      await apiClient.decreasePartStock(Number(partId), amount);
      // Reload parts to get updated data
      const apiParts = await apiClient.getParts();
      const mappedParts: Part[] = apiParts.map((apiPart) => {
        const currentStock = apiPart.quantity;
        const usedQuantity = apiPart.used;
        const initialQuantity = apiPart.all;
        const status: 'active' | 'inactive' = apiPart.status === 'ACTIVE' ? 'active' : 'inactive';
        const category = apiPart.category || extractCategory(apiPart.partNumber);
        let compatibleModel = '';
        if (apiPart.vehicleModelsEnum && apiPart.vehicleModelsEnum.enumValue.length > 0) {
          compatibleModel = apiPart.vehicleModelsEnum.enumValue
            .map(model => model.replace('VinFast ', ''))
            .join(', ');
        }
        return {
          id: String(apiPart.id),
          name: apiPart.name,
          partNumber: apiPart.partNumber,
          category: category,
          manufacturer: apiPart.manufacturer || '',
          compatibleModel: compatibleModel,
          initialQuantity: initialQuantity,
          usedQuantity: usedQuantity,
          reserved: apiPart.reserved,
          currentStock: currentStock,
          unitPrice: apiPart.currentUnitPrice,
          status: status,
        };
      });
      setParts(mappedParts);
      toast({ title: 'Giảm số lượng phụ tùng thành công' });
    } catch (error) {
      console.error('Failed to decrease stock:', error);
      showApiErrorToast(error, toast, 'Không thể giảm số lượng phụ tùng. Vui lòng thử lại.');
    }
  };

  return (
    <div className="space-y-6">
      <PartsTable
        parts={parts}
        onEdit={handleEditPart}
        onDelete={handleDeletePart}
        onAdd={handleAddPart}
        onIncreaseStock={handleIncreaseStock}
        onDecreaseStock={handleDecreaseStock}
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
            <form onSubmit={partForm.handleSubmit(async (data) => {
              if (editingPart) {
                // Update part via API
                try {
                  await apiClient.updatePart(Number(editingPart.id), {
                    name: data.name,
                    partNumber: data.partNumber,
                    manufacturer: data.manufacturer,
                    category: data.category,
                    currentUnitPrice: Number(data.unitPrice),
                    quantity: Number(data.initialQuantity),
                    reserved: editingPart.reserved, // Keep existing reserved
                    used: editingPart.usedQuantity, // Keep existing used
                  });

                  // Reload parts to get the updated part with all details
                  const apiParts = await apiClient.getParts();
                  const mappedParts: Part[] = apiParts.map((apiPart) => {
                    const currentStock = apiPart.quantity;
                    const usedQuantity = apiPart.used;
                    const initialQuantity = apiPart.all;
                    const status: 'active' | 'inactive' = apiPart.status === 'ACTIVE' ? 'active' : 'inactive';
                    const category = apiPart.category || extractCategory(apiPart.partNumber);
                    let compatibleModel = '';
                    if (apiPart.vehicleModelsEnum && apiPart.vehicleModelsEnum.enumValue.length > 0) {
                      compatibleModel = apiPart.vehicleModelsEnum.enumValue
                        .map(model => model.replace('VinFast ', ''))
                        .join(', ');
                    }
                    return {
                      id: String(apiPart.id),
                      name: apiPart.name,
                      partNumber: apiPart.partNumber,
                      category: category,
                      manufacturer: apiPart.manufacturer || '',
                      compatibleModel: compatibleModel,
                      initialQuantity: initialQuantity,
                      usedQuantity: usedQuantity,
                      reserved: apiPart.reserved,
                      currentStock: currentStock,
                      unitPrice: apiPart.currentUnitPrice,
                      status: status,
                    };
                  });
                  setParts(mappedParts);
                  setIsPartDialogOpen(false);
                  toast({ title: 'Cập nhật phụ tùng thành công' });
                } catch (error) {
                  console.error('Failed to update part:', error);
                  showApiErrorToast(error, toast, 'Không thể cập nhật phụ tùng. Vui lòng thử lại.');
                }
              } else {
                // Create new part via API
                try {
                  const newPart = await apiClient.createPart({
                    name: data.name,
                    partNumber: data.partNumber,
                    manufacturer: data.manufacturer,
                    category: data.category,
                    currentUnitPrice: Number(data.unitPrice),
                    quantity: Number(data.initialQuantity),
                  });

                  // Reload parts to get the new part with all details
                  const apiParts = await apiClient.getParts();
                  const mappedParts: Part[] = apiParts.map((apiPart) => {
                    const currentStock = apiPart.quantity;
                    const usedQuantity = apiPart.used;
                    const initialQuantity = apiPart.all;
                    const status: 'active' | 'inactive' = apiPart.status === 'ACTIVE' ? 'active' : 'inactive';
                    const category = apiPart.category || extractCategory(apiPart.partNumber);
                    let compatibleModel = '';
                    if (apiPart.vehicleModelsEnum && apiPart.vehicleModelsEnum.enumValue.length > 0) {
                      compatibleModel = apiPart.vehicleModelsEnum.enumValue
                        .map(model => model.replace('VinFast ', ''))
                        .join(', ');
                    }
                    return {
                      id: String(apiPart.id),
                      name: apiPart.name,
                      partNumber: apiPart.partNumber,
                      category: category,
                      manufacturer: apiPart.manufacturer || '',
                      compatibleModel: compatibleModel,
                      initialQuantity: initialQuantity,
                      usedQuantity: usedQuantity,
                      reserved: apiPart.reserved,
                      currentStock: currentStock,
                      unitPrice: apiPart.currentUnitPrice,
                      status: status,
                    };
                  });
                  setParts(mappedParts);
                  setIsPartDialogOpen(false);
                  toast({ title: 'Thêm phụ tùng thành công' });
                } catch (error) {
                  console.error('Failed to create part:', error);
                  showApiErrorToast(error, toast, 'Không thể thêm phụ tùng. Vui lòng thử lại.');
                }
              }
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
                  <FormItem>
                    <FormLabel>Danh mục *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCategories}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingCategories ? "Đang tải..." : "Chọn danh mục"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {partCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={partForm.control} name="initialQuantity" render={({ field }) => (
                  <FormItem><FormLabel>Số lượng ban đầu *</FormLabel><FormControl><Input type="number" {...field} placeholder="Số lượng nhập từ nhà cung cấp" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={partForm.control} name="unitPrice" render={({ field }) => (
                  <FormItem><FormLabel>Giá đơn vị (VNĐ) *</FormLabel><FormControl><Input type="number" {...field} placeholder="Giá mỗi phụ tùng" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={partForm.control} name="manufacturer" render={({ field }) => (
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
