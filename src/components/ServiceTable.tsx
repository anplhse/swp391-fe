import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Clock, Edit, Plus, Trash2, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number | string;
  compatibleVehicles: string[];
  category: string;
  status?: 'active' | 'inactive';
}

interface ServiceTableProps {
  services: Service[];
  mode: 'management' | 'selection';
  selectedServices?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onEdit?: (service: Service) => void;
  onDelete?: (serviceId: string) => void;
  onAdd?: () => void;
  showActions?: boolean;
  showSelection?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
}

const serviceCategories = [
  { value: 'maintenance', label: 'Bảo dưỡng' },
  { value: 'repair', label: 'Sửa chữa' },
  { value: 'inspection', label: 'Kiểm tra' },
  { value: 'cleaning', label: 'Vệ sinh' },
  { value: 'upgrade', label: 'Nâng cấp' }
];

export function ServiceTable({
  services,
  mode,
  selectedServices = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onAdd,
  showActions = true,
  showSelection = false,
  searchQuery = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10
}: ServiceTableProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);

  // Filter services based on search query and status
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Search filter
    if (localSearchQuery.trim()) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(localSearchQuery.toLowerCase())
      );
    }

    // Status filter
    if (localStatusFilter !== 'all' && mode === 'management') {
      filtered = filtered.filter(service => service.status === localStatusFilter);
    }

    return filtered;
  }, [services, localSearchQuery, localStatusFilter, mode]);

  // Paginate filtered services
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredServices.slice(startIndex, endIndex);
  }, [filteredServices, currentPage, itemsPerPage]);

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setLocalStatusFilter(value);
    onStatusFilterChange?.(value);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    const allIds = paginatedServices.map(service => service.id);
    const newSelection = [...new Set([...selectedServices, ...allIds])];
    onSelectionChange(newSelection);
  };

  const handleDeselectAll = () => {
    if (!onSelectionChange) return;
    const currentPageIds = paginatedServices.map(service => service.id);
    const newSelection = selectedServices.filter(id => !currentPageIds.includes(id));
    onSelectionChange(newSelection);
  };

  const handleServiceToggle = (serviceId: string) => {
    if (!onSelectionChange) return;
    const isSelected = selectedServices.includes(serviceId);
    if (isSelected) {
      onSelectionChange(selectedServices.filter(id => id !== serviceId));
    } else {
      onSelectionChange([...selectedServices, serviceId]);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (duration: number | string) => {
    if (typeof duration === 'string') return duration;
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">Hoạt động</Badge>
    ) : (
      <Badge variant="secondary">Tạm dừng</Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const cat = serviceCategories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const allCurrentPageSelected = paginatedServices.every(service =>
    selectedServices.includes(service.id)
  );

  const someCurrentPageSelected = paginatedServices.some(service =>
    selectedServices.includes(service.id)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredServices.length);

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            value={localSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm kiếm dịch vụ..."
            className="w-64"
          />
          {mode === 'management' && (
            <Select value={localStatusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Tạm dừng</SelectItem>
              </SelectContent>
            </Select>
          )}
          {showSelection && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={paginatedServices.length === 0}
              >
                Chọn tất cả
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={paginatedServices.length === 0}
              >
                Bỏ chọn tất cả
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {showSelection && selectedServices.length > 0 && (
            <Badge variant="secondary" className="text-sm">
              Đã chọn {selectedServices.length} dịch vụ
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            Hiển thị {startIndex + 1}-{endIndex} trong {filteredServices.length} dịch vụ
          </span>
          {showActions && onAdd && (
            <Button onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm dịch vụ
            </Button>
          )}
          {totalPages > 1 && onPageChange && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Services Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {showSelection && (
                <TableHead className="w-12">
                  <div className="flex items-center justify-center">
                    <div className={cn(
                      "w-4 h-4 border-2 rounded flex items-center justify-center transition-colors cursor-pointer",
                      allCurrentPageSelected ? "bg-primary border-primary text-primary-foreground" :
                        someCurrentPageSelected ? "bg-primary/50 border-primary text-primary-foreground" :
                          "border-muted-foreground"
                    )}
                      onClick={() => {
                        if (allCurrentPageSelected) {
                          handleDeselectAll();
                        } else {
                          handleSelectAll();
                        }
                      }}
                    >
                      {allCurrentPageSelected && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {someCurrentPageSelected && !allCurrentPageSelected && (
                        <div className="w-2 h-2 bg-primary rounded-sm" />
                      )}
                    </div>
                  </div>
                </TableHead>
              )}
              <TableHead>Tên dịch vụ</TableHead>
              {mode === 'management' && <TableHead>Loại</TableHead>}
              <TableHead>Giá</TableHead>
              <TableHead>Thời gian</TableHead>
              {mode === 'management' && <TableHead>Xe tương thích</TableHead>}
              {mode === 'management' && <TableHead>Trạng thái</TableHead>}
              {showSelection && <TableHead>Trạng thái</TableHead>}
              {showActions && <TableHead className="text-right">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedServices.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <TableRow
                  key={service.id}
                  className={cn(
                    showSelection && "cursor-pointer hover:bg-muted/50",
                    isSelected ? "bg-primary/5" : ""
                  )}
                  onClick={showSelection ? () => handleServiceToggle(service.id) : undefined}
                >
                  {showSelection && (
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <div className={cn(
                          "w-4 h-4 border-2 rounded flex items-center justify-center transition-colors",
                          isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                        )}>
                          {isSelected && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {service.description}
                      </div>
                    </div>
                  </TableCell>
                  {mode === 'management' && (
                    <TableCell>
                      <Badge variant="outline">
                        {getCategoryLabel(service.category)}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    {formatPrice(service.price)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(service.duration)}
                    </div>
                  </TableCell>
                  {mode === 'management' && (
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {service.compatibleVehicles.map((vehicle) => (
                          <Badge key={vehicle} variant="secondary" className="text-xs">
                            {vehicle}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  )}
                  {mode === 'management' && (
                    <TableCell>
                      {getStatusBadge(service.status)}
                    </TableCell>
                  )}
                  {showSelection && (
                    <TableCell>
                      {isSelected ? (
                        <Badge variant="default" className="text-xs">
                          Đã chọn
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Chưa chọn
                        </Badge>
                      )}
                    </TableCell>
                  )}
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(service)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(service.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {paginatedServices.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Wrench className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Không tìm thấy dịch vụ phù hợp</p>
        </div>
      )}
    </div>
  );
}
