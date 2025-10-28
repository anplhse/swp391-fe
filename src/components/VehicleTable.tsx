import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Calendar, Car, Edit, Eye, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  model: string;
  year: number;
  battery: number;
  nextService: string;
  status: 'healthy' | 'warning' | 'critical';
  mileage: number;
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
  statusFilter?: string;
  onStatusFilterChange?: (filter: string) => void;
  mode?: 'customer' | 'staff';
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
  statusFilter,
  onStatusFilterChange,
  mode = 'customer'
}: VehicleTableProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchQuery || '');
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter || 'all');

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(localSearchTerm.toLowerCase());

    const matchesStatus = localStatusFilter === 'all' || vehicle.status === localStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Bình thường</Badge>;
      case 'warning':
        return <Badge variant="destructive">Cần bảo dưỡng</Badge>;
      case 'critical':
        return <Badge variant="destructive">Khẩn cấp</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

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
          <Select value={localStatusFilter} onValueChange={(value) => {
            setLocalStatusFilter(value);
            onStatusFilterChange?.(value);
          }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="healthy">Bình thường</SelectItem>
              <SelectItem value="warning">Cần bảo dưỡng</SelectItem>
              <SelectItem value="critical">Khẩn cấp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {mode === 'customer' ? (
                <>
                  <TableHead>Tên xe</TableHead>
                  <TableHead>Biển số</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Năm</TableHead>
                  <TableHead>Pin</TableHead>
                  <TableHead>Số km</TableHead>
                  <TableHead>Màu</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </>
              ) : (
                <>
                  <TableHead>Biển số</TableHead>
                  <TableHead>Thông tin xe</TableHead>
                  <TableHead>Chủ xe</TableHead>
                  <TableHead>Số km</TableHead>
                  <TableHead>Dịch vụ cuối</TableHead>
                  <TableHead>Dịch vụ tiếp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </>
              )}
              {showActions && <TableHead className="text-right">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? (mode === 'customer' ? 10 : 8) : (mode === 'customer' ? 9 : 7)} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy xe nào
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  {mode === 'customer' ? (
                    <>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-primary" />
                          <span className="font-medium">{vehicle.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{vehicle.plate}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{vehicle.model}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{Number.isFinite(vehicle.year) ? vehicle.year : ''}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{vehicle.battery}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{Number.isFinite(vehicle.mileage) ? vehicle.mileage.toLocaleString() : '0'} km</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{vehicle.color}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{vehicle.vin}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(vehicle.status)}
                          {vehicle.status === 'warning' && (
                            <div className="flex items-center gap-1 text-xs text-destructive">
                              <AlertCircle className="w-3 h-3" />
                              <span>Cần bảo dưỡng</span>
                            </div>
                          )}
                          {vehicle.status === 'critical' && (
                            <div className="flex items-center gap-1 text-xs text-destructive">
                              <AlertCircle className="w-3 h-3" />
                              <span>Khẩn cấp</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{vehicle.plate}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{vehicle.name}</span>
                          <span className="text-sm text-muted-foreground">Năm {vehicle.year}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{vehicle.owner || '—'}</span>
                          <span className="text-sm text-muted-foreground">{vehicle.ownerPhone || ''}</span>
                        </div>
                      </TableCell>
                      <TableCell>{Number.isFinite(vehicle.mileage) ? vehicle.mileage.toLocaleString() : '0'} km</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{vehicle.lastService ? new Date(vehicle.lastService).toLocaleDateString('vi-VN') : '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{vehicle.nextService ? new Date(vehicle.nextService).toLocaleDateString('vi-VN') : '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    </>
                  )}
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(vehicle)}
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(vehicle.id)}
                          title="Xóa"
                        >
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
    </div>
  );
}
