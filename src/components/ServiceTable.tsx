import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Edit, Plus, Search, Trash2, Wrench, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number | string;
  compatibleVehicles: string[];
  relatedParts: Record<string, string[]>; // Model -> Parts mapping
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
  selectedModel?: string; // Model xe được chọn để hiển thị phụ tùng
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
  itemsPerPage = 10,
  selectedModel
}: ServiceTableProps) {
  const filterSchema = z.object({
    search: z.string().optional(),
    status: z.string().optional(),
  });
  type FilterForm = z.infer<typeof filterSchema>;

  const filterForm = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: searchQuery || '', status: statusFilter || 'all' }
  });

  const watchFilters = filterForm.watch();
  const debouncedSearchQuery = useDebounce(watchFilters.search || '', 300);

  // Filter services based on search query, status, and selected model
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Search filter
    if (debouncedSearchQuery.trim()) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    // Status filter
    const currentStatusFilter = watchFilters.status || statusFilter;
    if (currentStatusFilter !== 'all' && mode === 'management') {
      filtered = filtered.filter(service => service.status === currentStatusFilter);
    }

    // Model filter - only show services compatible with selected model
    if (selectedModel && selectedModel !== 'all') {
      filtered = filtered.filter(service =>
        service.compatibleVehicles.includes(selectedModel)
      );
    }

    return filtered;
  }, [services, debouncedSearchQuery, watchFilters.status, statusFilter, selectedModel, mode]);

  // Internal pagination state if onPageChange is not provided
  const [internalPage, setInternalPage] = useState(1);

  // Calculate totalPages from filtered services
  const calculatedTotalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const effectiveTotalPages = totalPages > 1 ? totalPages : calculatedTotalPages;
  const effectiveCurrentPage = onPageChange ? Math.min(currentPage, effectiveTotalPages || 1) : internalPage;

  // Reset to page 1 when filters change
  useEffect(() => {
    if (!onPageChange) {
      setInternalPage(1);
    }
  }, [debouncedSearchQuery, watchFilters.status, onPageChange]);

  // Paginate filtered services
  const paginatedServices = useMemo(() => {
    const startIndex = (effectiveCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredServices.slice(startIndex, endIndex);
  }, [filteredServices, effectiveCurrentPage, itemsPerPage]);

  const handleSearchChange = (value: string) => {
    filterForm.setValue('search', value);
    onSearchChange?.(value);
  };

  const handleStatusFilterChange = (value: string) => {
    filterForm.setValue('status', value);
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

  const startIndex = (effectiveCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredServices.length);

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex items-center justify-between">
        <Form {...filterForm}>
          <form className="flex items-center gap-4">
            <FormField
              name="search"
              control={filterForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Tìm kiếm dịch vụ..."
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleSearchChange(e.target.value);
                        }}
                        className="pl-10 pr-10 w-64"
                      />
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange('');
                            handleSearchChange('');
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            {mode === 'management' && (
              <FormField
                name="status"
                control={filterForm.control}
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      handleStatusFilterChange(value);
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="inactive">Tạm dừng</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>
        <div className="flex items-center gap-4">
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
          {showActions && onAdd && (
            <Button onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm dịch vụ
            </Button>
          )}
        </div>
      </div>

      {showSelection && selectedServices.length > 0 && (
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            Đã chọn {selectedServices.length} dịch vụ
          </Badge>
        </div>
      )}

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
              {mode === 'management' && <TableHead>Phụ tùng liên quan</TableHead>}
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
                        {(() => {
                          if (!selectedModel) {
                            return (
                              <span className="text-xs text-muted-foreground">
                                Chọn model xe để xem phụ tùng
                              </span>
                            );
                          }

                          if (selectedModel === 'all') {
                            // Hiển thị tất cả phụ tùng của tất cả model
                            const allParts = Object.values(service.relatedParts || {}).flat();
                            if (allParts.length === 0) {
                              return (
                                <span className="text-xs text-muted-foreground">
                                  Không có phụ tùng nào
                                </span>
                              );
                            }

                            return (
                              <>
                                {allParts.slice(0, 3).map((part, index) => (
                                  <Badge key={`${part}-${index}`} variant="secondary" className="text-xs">
                                    {part}
                                  </Badge>
                                ))}
                                {allParts.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{allParts.length - 3} khác
                                  </span>
                                )}
                              </>
                            );
                          }

                          const modelParts = service.relatedParts?.[selectedModel];
                          if (!modelParts || modelParts.length === 0) {
                            return (
                              <span className="text-xs text-muted-foreground">
                                Không có phụ tùng cho {selectedModel}
                              </span>
                            );
                          }

                          return (
                            <>
                              {modelParts.slice(0, 2).map((part) => (
                                <Badge key={part} variant="secondary" className="text-xs">
                                  {part}
                                </Badge>
                              ))}
                              {modelParts.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{modelParts.length - 2} khác
                                </span>
                              )}
                            </>
                          );
                        })()}
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

      {/* Pagination */}
      <TablePagination
        currentPage={effectiveCurrentPage}
        totalPages={effectiveTotalPages}
        onPageChange={(page) => {
          if (onPageChange) {
            onPageChange(page);
          } else {
            setInternalPage(page);
          }
        }}
      />
    </div>
  );
}
