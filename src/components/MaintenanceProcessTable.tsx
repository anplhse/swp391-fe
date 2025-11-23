import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface MaintenanceTask {
  id: string;
  bookingId: number;
  jobId?: number;
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
  onAssignTechnician?: (task: MaintenanceTask) => void;
  showActions?: boolean;
}

export function MaintenanceProcessTable({
  tasks,
  onStartTask,
  onCompleteTask,
  onViewDetails,
  onAssignTechnician,
  showActions = true
}: MaintenanceProcessTableProps) {
  const filterSchema = z.object({
    search: z.string().optional(),
    status: z.string().optional(),
  });
  type FilterForm = z.infer<typeof filterSchema>;

  const filterForm = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: '', status: 'all' }
  });

  const watchFilters = filterForm.watch();
  const debouncedSearchTerm = useDebounce(watchFilters.search || '', 300);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = (watchFilters.status || 'all') === 'all' || task.status === watchFilters.status;
      const matchesSearch = !debouncedSearchTerm.trim() ||
        task.vehiclePlate.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        task.customerName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        task.serviceType.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        task.technician.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tasks, watchFilters.status, debouncedSearchTerm]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = filteredTasks.length > 0 ? Math.ceil(filteredTasks.length / pageSize) : 1;

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTasks.slice(startIndex, startIndex + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, watchFilters.status]);


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Chờ xử lý</Badge>;
      case 'assigned':
        return <Badge variant="default" className="bg-purple-500">Đã phân công</Badge>;
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
                        placeholder="Tìm kiếm..."
                        {...field}
                        className="pl-10 pr-10 w-64"
                      />
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
              )}
            />
            <FormField
              name="status"
              control={filterForm.control}
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="pending">Chờ xử lý</SelectItem>
                      <SelectItem value="assigned">Đã phân công</SelectItem>
                      <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      {/* Maintenance Tasks Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Đơn</TableHead>
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
              paginatedTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">#{task.jobId || task.bookingId}</TableCell>
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
                        {task.status === 'pending' && task.technician === 'Chưa phân công' && onAssignTechnician && (
                          <Button size="sm" variant="secondary" onClick={() => onAssignTechnician(task)}>
                            Gán KTV
                          </Button>
                        )}
                        {(task.status === 'pending' && task.technician !== 'Chưa phân công') || task.status === 'assigned' ? (
                          <Button size="sm" onClick={() => onStartTask(task.id)}>
                            Bắt đầu
                          </Button>
                        ) : null}
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

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
