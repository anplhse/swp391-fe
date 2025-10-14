import { PartsTable } from '@/components/PartsTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
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
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  supplier: string;
  lastRestocked: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  location: string;
  description?: string;
}

interface RestockRequest {
  id: string;
  partId: string;
  partName: string;
  currentStock: number;
  requestedQuantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'ordered';
  requestedBy: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

export default function PartsManagementPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);
  const [isPartDialogOpen, setIsPartDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const { toast } = useToast();


  const partSchema = z.object({
    name: z.string().min(1, 'Tên phụ tùng là bắt buộc'),
    partNumber: z.string().min(1, 'Mã phụ tùng là bắt buộc'),
    category: z.string().min(1, 'Danh mục là bắt buộc'),
    brand: z.string().min(1, 'Thương hiệu là bắt buộc'),
    currentStock: z.string().min(1).refine(v => !isNaN(Number(v)) && Number(v) >= 0, 'Số lượng không hợp lệ'),
    minStock: z.string().min(1).refine(v => !isNaN(Number(v)) && Number(v) >= 0, 'Số lượng không hợp lệ'),
    maxStock: z.string().min(1).refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Số lượng không hợp lệ'),
    unitPrice: z.string().min(1).refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Giá không hợp lệ'),
    supplier: z.string().min(1, 'Nhà cung cấp là bắt buộc'),
    location: z.string().min(1, 'Vị trí là bắt buộc')
  });
  type PartFormData = z.infer<typeof partSchema>;

  const requestSchema = z.object({
    partId: z.string().min(1, 'Chọn phụ tùng'),
    requestedQuantity: z.string().min(1).refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Số lượng không hợp lệ'),
    reason: z.string().min(1, 'Lý do là bắt buộc')
  });
  type RequestFormData = z.infer<typeof requestSchema>;

  const partForm = useForm<PartFormData>({ resolver: zodResolver(partSchema), defaultValues: { name: '', partNumber: '', category: '', brand: '', currentStock: '0', minStock: '0', maxStock: '1', unitPrice: '0', supplier: '', location: '' } });
  const requestForm = useForm<RequestFormData>({ resolver: zodResolver(requestSchema), defaultValues: { partId: '', requestedQuantity: '1', reason: '' } });

  useEffect(() => {
    // Mock data for parts
    const mockParts: Part[] = [
      {
        id: '1',
        name: 'Pin Lithium-ion 60kWh',
        partNumber: 'BAT-60KWH-001',
        category: 'Pin',
        brand: 'CATL',
        currentStock: 5,
        minStock: 3,
        maxStock: 20,
        unitPrice: 15000000,
        supplier: 'CATL Vietnam',
        lastRestocked: '2024-01-15',
        status: 'in_stock',
        location: 'Kho A - Kệ 1',
        description: 'Pin lithium-ion 60kWh cho xe điện VinFast VF8'
      },
      {
        id: '2',
        name: 'Động cơ điện 150kW',
        partNumber: 'MOT-150KW-002',
        category: 'Động cơ',
        brand: 'Bosch',
        currentStock: 2,
        minStock: 2,
        maxStock: 10,
        unitPrice: 25000000,
        supplier: 'Bosch Vietnam',
        lastRestocked: '2024-01-10',
        status: 'low_stock',
        location: 'Kho B - Kệ 3',
        description: 'Động cơ điện 150kW cho xe điện hạng trung'
      },
      {
        id: '3',
        name: 'Bộ sạc nhanh 50kW',
        partNumber: 'CHG-50KW-003',
        category: 'Sạc',
        brand: 'ABB',
        currentStock: 0,
        minStock: 1,
        maxStock: 5,
        unitPrice: 8000000,
        supplier: 'ABB Vietnam',
        lastRestocked: '2023-12-20',
        status: 'out_of_stock',
        location: 'Kho C - Kệ 2',
        description: 'Bộ sạc nhanh 50kW cho trạm sạc'
      },
      {
        id: '4',
        name: 'Cảm biến nhiệt độ pin',
        partNumber: 'SEN-TEMP-004',
        category: 'Cảm biến',
        brand: 'Honeywell',
        currentStock: 15,
        minStock: 5,
        maxStock: 50,
        unitPrice: 500000,
        supplier: 'Honeywell Vietnam',
        lastRestocked: '2024-01-20',
        status: 'in_stock',
        location: 'Kho A - Kệ 5',
        description: 'Cảm biến nhiệt độ cho hệ thống pin'
      }
    ];

    // Mock data for restock requests
    const mockRestockRequests: RestockRequest[] = [
      {
        id: '1',
        partId: '2',
        partName: 'Động cơ điện 150kW',
        currentStock: 2,
        requestedQuantity: 5,
        reason: 'Sắp hết hàng, cần bổ sung cho dự án sắp tới',
        status: 'pending',
        requestedBy: 'Kỹ thuật viên A',
        requestedDate: '2024-01-24'
      },
      {
        id: '2',
        partId: '3',
        partName: 'Bộ sạc nhanh 50kW',
        currentStock: 0,
        requestedQuantity: 3,
        reason: 'Hết hàng, cần gấp cho khách hàng',
        status: 'approved',
        requestedBy: 'Kỹ thuật viên B',
        requestedDate: '2024-01-23',
        approvedBy: 'Quản lý kho',
        approvedDate: '2024-01-23'
      }
    ];

    setParts(mockParts);
    setRestockRequests(mockRestockRequests);
  }, []);


  const handleAddPart = () => {
    setEditingPart(null);
    partForm.reset({ name: '', partNumber: '', category: '', brand: '', currentStock: '0', minStock: '0', maxStock: '1', unitPrice: '0', supplier: '', location: '' });
    setIsPartDialogOpen(true);
  };

  const handleEditPart = (part: Part) => {
    setEditingPart(part);
    partForm.reset({
      name: part.name,
      partNumber: part.partNumber,
      category: part.category,
      brand: part.brand,
      currentStock: String(part.currentStock),
      minStock: String(part.minStock),
      maxStock: String(part.maxStock),
      unitPrice: String(part.unitPrice),
      supplier: part.supplier,
      location: part.location
    });
    setIsPartDialogOpen(true);
  };

  const handleDeletePart = (partId: string) => {
    setParts(prev => prev.filter(p => p.id !== partId));
  };

  const handleRequestRestock = () => {
    setSelectedPart(null);
    requestForm.reset({ partId: '', requestedQuantity: '1', reason: '' });
    setIsRequestDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PartsTable
        parts={parts}
        onEdit={handleEditPart}
        onDelete={handleDeletePart}
        onAdd={handleAddPart}
        onRequestRestock={handleRequestRestock}
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
              const next: Part = {
                id: editingPart ? editingPart.id : String(parts.length + 1),
                name: data.name,
                partNumber: data.partNumber,
                category: data.category,
                brand: data.brand,
                currentStock: Number(data.currentStock),
                minStock: Number(data.minStock),
                maxStock: Number(data.maxStock),
                unitPrice: Number(data.unitPrice),
                supplier: data.supplier,
                lastRestocked: editingPart?.lastRestocked || new Date().toISOString().split('T')[0],
                status: 'in_stock',
                location: data.location,
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
              <div className="grid grid-cols-3 gap-4">
                <FormField control={partForm.control} name="currentStock" render={({ field }) => (
                  <FormItem><FormLabel>Tồn hiện tại *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={partForm.control} name="minStock" render={({ field }) => (
                  <FormItem><FormLabel>Tồn tối thiểu *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={partForm.control} name="maxStock" render={({ field }) => (
                  <FormItem><FormLabel>Tồn tối đa *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={partForm.control} name="unitPrice" render={({ field }) => (
                  <FormItem><FormLabel>Giá *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={partForm.control} name="supplier" render={({ field }) => (
                  <FormItem><FormLabel>Nhà cung cấp *</FormLabel><FormControl><Input {...field} placeholder="Nhà cung cấp" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={partForm.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Vị trí *</FormLabel><FormControl><Input {...field} placeholder="Vị trí trong kho" /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPartDialogOpen(false)}>Hủy</Button>
                <Button type="submit">Lưu</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Restock Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo yêu cầu nhập kho</DialogTitle>
            <DialogDescription>Nhập số lượng cần bổ sung và lý do</DialogDescription>
          </DialogHeader>
          <Form {...requestForm}>
            <form onSubmit={requestForm.handleSubmit((data) => {
              const part = parts.find(p => p.id === data.partId);
              if (!part) return;
              const req: RestockRequest = {
                id: String(restockRequests.length + 1),
                partId: part.id,
                partName: part.name,
                currentStock: part.currentStock,
                requestedQuantity: Number(data.requestedQuantity),
                reason: data.reason,
                status: 'pending',
                requestedBy: 'Nhân viên kho',
                requestedDate: new Date().toISOString().split('T')[0]
              };
              setRestockRequests(prev => [req, ...prev]);
              setIsRequestDialogOpen(false);
              toast({ title: 'Đã tạo yêu cầu nhập' });
            })} className="space-y-4">
              <FormField control={requestForm.control} name="partId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phụ tùng *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phụ tùng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {parts.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={requestForm.control} name="requestedQuantity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng *</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={requestForm.control} name="reason" render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Lý do nhập thêm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRequestDialogOpen(false)}>Hủy</Button>
                <Button type="submit">Tạo</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
