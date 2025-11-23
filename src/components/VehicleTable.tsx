import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Car, Eye, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  model: string;
  battery: number | null;
  nextService: string;
  mileage: number | null;
  color: string;
  vin: string;
  purchaseDate: string;
  // Optional fields for staff mode
  owner?: string;
  ownerPhone?: string;
  lastService?: string;
  apiVehicle?: unknown;
}

interface VehicleTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: string) => void;
  onView?: (vehicleId: string) => void;
  onBook?: (vehicle: Vehicle) => void;
  showActions?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  mode?: 'customer' | 'staff';
  rightAction?: ReactNode;
}

export function VehicleTable({
  vehicles,
  onEdit,
  onDelete,
  onView,
  onBook,
  showActions = true,
  searchQuery,
  onSearchChange,
  mode = 'customer',
  rightAction
}: VehicleTableProps) {
  const filterSchema = z.object({
    search: z.string().optional(),
  });
  type FilterForm = z.infer<typeof filterSchema>;

  const filterForm = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: searchQuery || '' }
  });

  const watchFilters = filterForm.watch();
  const debouncedSearchTerm = useDebounce(watchFilters.search || '', 300);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      return !debouncedSearchTerm.trim() ||
        vehicle.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        vehicle.vin.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    });
  }, [vehicles, debouncedSearchTerm]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredVehicles.length / pageSize);

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredVehicles.slice(startIndex, startIndex + pageSize);
  }, [filteredVehicles, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);


  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex items-center justify-between">
        <Form {...filterForm}>
          <form className="flex items-center gap-3">
            <FormField
              name="search"
              control={filterForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Tìm kiếm xe..."
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          onSearchChange?.(e.target.value);
                        }}
                        className="pl-10 pr-10 w-64"
                      />
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange('');
                            onSearchChange?.('');
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
          </form>
        </Form>
        <div className="flex items-center gap-2">
          {rightAction}
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {mode === 'customer' ? (
                <>
                  <TableHead className="px-4">Tên xe</TableHead>
                  <TableHead className="px-4">Model</TableHead>
                  <TableHead className="px-4">VIN</TableHead>
                  <TableHead className="px-4">Biển số</TableHead>
                  <TableHead className="px-4">Pin</TableHead>
                  <TableHead className="px-4">Số km</TableHead>
                  <TableHead className="px-4">Màu</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="px-4">Khách hàng</TableHead>
                  <TableHead className="px-4">Model</TableHead>
                  <TableHead className="px-4">VIN</TableHead>
                  <TableHead className="px-4">Biển số</TableHead>
                  <TableHead className="px-4">Pin</TableHead>
                  <TableHead className="px-4">Số km</TableHead>
                  <TableHead className="px-4">Màu</TableHead>
                  <TableHead className="px-4">Ngày mua</TableHead>
                </>
              )}
              {showActions && <TableHead className="text-right pr-8 px-4">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? (mode === 'customer' ? 8 : 7) : (mode === 'customer' ? 7 : 6)} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy xe nào
                </TableCell>
              </TableRow>
            ) : (
              paginatedVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  {mode === 'customer' ? (
                    <>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-primary" />
                          <span className="font-medium">{vehicle.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <span className="font-medium">{vehicle.model}</span>
                      </TableCell>
                      <TableCell className="px-4 pr-1 w-[200px]">
                        <span className="font-mono text-xs truncate block" title={vehicle.vin}>{vehicle.vin}</span>
                      </TableCell>
                      <TableCell className="px-4">
                        <span className="font-medium">{vehicle.plate}</span>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{vehicle.battery == null ? '—' : `${vehicle.battery}%`}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <span className="font-medium">{vehicle.mileage == null ? '—' : `${vehicle.mileage.toLocaleString()} km`}</span>
                      </TableCell>
                      <TableCell className="px-4">
                        <span className="font-medium">{vehicle.color}</span>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="px-4">{vehicle.owner || '—'}</TableCell>
                      <TableCell className="px-4">{vehicle.model}</TableCell>
                      <TableCell className="px-4">
                        <span className="font-mono text-xs truncate block" title={vehicle.vin}>{vehicle.vin}</span>
                      </TableCell>
                      <TableCell className="px-4">{vehicle.plate}</TableCell>
                      <TableCell className="px-4">{vehicle.battery == null ? '—' : `${vehicle.battery}%`}</TableCell>
                      <TableCell className="px-4">{vehicle.mileage == null ? '—' : `${Number(vehicle.mileage).toLocaleString()} km`}</TableCell>
                      <TableCell className="px-4">{vehicle.color || '—'}</TableCell>
                      <TableCell className="px-4">{vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toLocaleDateString('vi-VN') : '—'}</TableCell>
                    </>
                  )}
                  {showActions && (
                    <TableCell className="text-right pr-8 pl-0 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {mode === 'customer' && onBook && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onBook(vehicle)}
                            title="Đặt lịch"
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                        )}
                        {onView && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(vehicle.id)}
                            title="Chi tiết"
                            className="px-2"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
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
