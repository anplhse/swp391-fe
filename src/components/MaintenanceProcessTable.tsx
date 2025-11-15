import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface MaintenanceTask {
  id: string;
  bookingId: number;
  vehiclePlate: string;
  vehicleModel: string;
  customerName: string;
  serviceType: string;
  technician: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  startTime?: string;
  estimatedEndTime?: string;
  actualEndTime?: string;
  services: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  invoiceStatus?: string;
  notes?: string;
}

interface MaintenanceProcessTableProps {
  tasks: MaintenanceTask[];
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onViewDetails: (task: MaintenanceTask) => void;
  showActions?: boolean;
}

export function MaintenanceProcessTable({
  tasks,
  onStartTask,
  onCompleteTask,
  onViewDetails,
  showActions = true
}: MaintenanceProcessTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesSearch = searchTerm === '' ||
      task.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.technician.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Chờ xử lý</Badge>;
      case 'in_progress':
        return <Badge variant="default">Đang thực hiện</Badge>;
      case 'completed':
        return <Badge variant="outline">Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary">Chờ xử lý</Badge>;
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
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="in_progress">Đang thực hiện</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Maintenance Tasks Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dịch vụ</TableHead>
              <TableHead>Xe</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Kỹ thuật viên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tiến độ</TableHead>
              {showActions && <TableHead>Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy nhiệm vụ nào
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.serviceType}</TableCell>
                  <TableCell>{task.vehiclePlate}</TableCell>
                  <TableCell>{task.customerName}</TableCell>
                  <TableCell>{task.technician}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={task.progress} className="h-2 w-20" />
                      <span className="text-sm text-muted-foreground">{task.progress}%</span>
                    </div>
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex gap-2">
                        {task.status === 'pending' && (
                          <Button size="sm" onClick={() => onStartTask(task.id)}>
                            Bắt đầu
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button size="sm" onClick={() => onCompleteTask(task.id)}>
                            Hoàn thành
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => onViewDetails(task)}>
                          Chi tiết
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
