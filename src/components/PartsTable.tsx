import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Minus, Plus, PlusCircle, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
  currentStock: number; // Số lượng hiện tại (từ API quantity)
  unitPrice: number; // Giá đơn vị (từ API currentUnitPrice)
  status: 'active' | 'inactive'; // Trạng thái (từ API status)
}

interface PartsTableProps {
  parts: Part[];
  onEdit: (part: Part) => void;
  onDelete: (partId: string) => void;
  onAdd: () => void;
  onIncreaseStock?: (partId: string, amount: number) => void;
  onDecreaseStock?: (partId: string, amount: number) => void;
  showActions?: boolean;
}

// Filter form schema
const filtersSchema = z.object({
  search: z.string().optional(),
  category: z.string().default('all'),
  status: z.enum(['all', 'active', 'inactive']).default('all')
});
type FiltersForm = z.infer<typeof filtersSchema>;

export function PartsTable({
  parts,
  onEdit,
  onDelete,
  onAdd,
  onIncreaseStock,
  onDecreaseStock,
  showActions = true
}: PartsTableProps) {
  const filtersForm = useForm<FiltersForm>({
    resolver: zodResolver(filtersSchema),
    defaultValues: { search: '', category: 'all', status: 'all' }
  });

  const watchFilters = filtersForm.watch();
  const debouncedSearch = useDebounce(watchFilters.search || '', 300);

  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      const term = debouncedSearch.toLowerCase().trim();
      const matchesSearch = !term ||
        part.name.toLowerCase().includes(term) ||
        part.partNumber.toLowerCase().includes(term) ||
        part.manufacturer.toLowerCase().includes(term);

      const matchesCategory = watchFilters.category === 'all' || part.category === watchFilters.category;
      const matchesStatus = watchFilters.status === 'all' || part.status === watchFilters.status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [parts, debouncedSearch, watchFilters.category, watchFilters.status]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredParts.length / pageSize);

  const paginatedParts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredParts.slice(startIndex, startIndex + pageSize);
  }, [filteredParts, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, watchFilters.category, watchFilters.status]);


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Đang sử dụng</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Ngưng</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex items-center justify-between">
        <Form {...filtersForm}>
          <form className="flex items-center gap-3">
            <FormField name="search" control={filtersForm.control} render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input className="pl-9 pr-10 w-64" placeholder="Tìm kiếm phụ tùng..." {...field} />
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => field.onChange('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )} />
            <FormField name="category" control={filtersForm.control} render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Lọc">Lọc</SelectItem>
                    <SelectItem value="Dung dịch & Hóa chất">Dung dịch & Hóa chất</SelectItem>
                    <SelectItem value="Pin & Ắc quy">Pin & Ắc quy</SelectItem>
                    <SelectItem value="Gạt mưa">Gạt mưa</SelectItem>
                    <SelectItem value="Lốp xe">Lốp xe</SelectItem>
                    <SelectItem value="Phanh">Phanh</SelectItem>
                    <SelectItem value="Điều hòa">Điều hòa</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <FormField name="status" control={filtersForm.control} render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang sử dụng</SelectItem>
                    <SelectItem value="inactive">Ngưng</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
          </form>
        </Form>
        {showActions && (
          <div className="flex gap-2">
            <Button onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm phụ tùng
            </Button>
          </div>
        )}
      </div>

      {/* Parts Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Thương hiệu</TableHead>
              <TableHead>Model xe</TableHead>
              <TableHead>Tồn/Đã dùng/Tổng</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              {showActions && <TableHead className="text-right">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 8 : 7} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy phụ tùng nào
                </TableCell>
              </TableRow>
            ) : (
              paginatedParts.map(part => (
                <TableRow key={part.id}>
                  <TableCell>{part.name}</TableCell>
                  <TableCell>{part.partNumber}</TableCell>
                  <TableCell>{part.category}</TableCell>
                  <TableCell>{part.manufacturer}</TableCell>
                  <TableCell>
                    {part.compatibleModel ? (
                      <Badge variant="secondary" className="text-xs">
                        {part.compatibleModel}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        <div className="font-medium text-green-600">{part.currentStock}</div>
                        <div className="text-xs text-muted-foreground">
                          Đã dùng: {part.usedQuantity} / Tổng: {part.initialQuantity}
                        </div>
                      </div>
                      {showActions && onIncreaseStock && onDecreaseStock && (
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => onIncreaseStock(part.id, 1)}
                            title="Tăng số lượng"
                          >
                            <PlusCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => onDecreaseStock(part.id, 1)}
                            disabled={part.currentStock <= 0}
                            title="Giảm số lượng"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(part.unitPrice)}</TableCell>
                  <TableCell>{getStatusBadge(part.status)}</TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => onEdit(part)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onDelete(part.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
