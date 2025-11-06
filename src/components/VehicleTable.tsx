import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Car, Eye, Search } from 'lucide-react';
import { useState, type ReactNode } from 'react';

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
  const [localSearchTerm, setLocalSearchTerm] = useState(searchQuery || '');

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(localSearchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm xe..."
              value={localSearchTerm}
              onChange={(e) => {
                setLocalSearchTerm(e.target.value);
                onSearchChange?.(e.target.value);
              }}
              className="pl-10 w-64"
            />
          </div>
        </div>
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
                  <TableHead className="px-4">Biển số</TableHead>
                  <TableHead className="px-4">Thông tin xe</TableHead>
                  <TableHead className="px-4">Chủ xe</TableHead>
                  <TableHead className="px-4">Số km</TableHead>
                  <TableHead className="px-4">Dịch vụ cuối</TableHead>
                  <TableHead className="px-4">Dịch vụ tiếp</TableHead>
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
              filteredVehicles.map((vehicle) => (
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
                      <TableCell className="font-medium px-4">{vehicle.plate}</TableCell>
                      <TableCell className="px-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{vehicle.name}</span>
                          <span className="text-sm text-muted-foreground">{vehicle.model}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{vehicle.owner || '—'}</span>
                          <span className="text-sm text-muted-foreground">{vehicle.ownerPhone || ''}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">{vehicle.mileage == null ? '—' : `${vehicle.mileage.toLocaleString()} km`}</TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{vehicle.lastService ? new Date(vehicle.lastService).toLocaleDateString('vi-VN') : '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{vehicle.nextService ? new Date(vehicle.nextService).toLocaleDateString('vi-VN') : '—'}</span>
                        </div>
                      </TableCell>
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
    </div>
  );
}
