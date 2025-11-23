import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { authService } from '@/lib/auth';
import { bookingApi } from '@/lib/bookingUtils';
import { showApiErrorToast, showApiResponseToast } from '@/lib/responseHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle, Clock, Play, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface MaintenanceStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  duration: number; // minutes
  actualDuration?: number;
  notes?: string;
  tools: string[];
}

interface MaintenanceTask {
  id: string;
  jobId: number;
  bookingId: number;
  vehiclePlate: string;
  customerName: string;
  serviceType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  startTime?: string;
  estimatedEndTime?: string;
  actualEndTime?: string;
  steps: MaintenanceStep[];
  notes?: string;
}

export default function MaintenanceProcessPage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const { toast } = useToast();

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
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isStarting, setIsStarting] = useState<{ [key: string]: boolean }>({});
  const [isCompleting, setIsCompleting] = useState<{ [key: string]: boolean }>({});

  const loadTasks = useCallback(async () => {
    try {
      const currentUser = authService.getAuthState().user;
      if (!currentUser || !currentUser.id) {
        console.error('User not found or missing ID');
        return;
      }

      // Get technician-specific tasks (backend handles permission logic)
      const jobs = await bookingApi.getTechnicianTasks(currentUser.id);

      // Load booking details for each job to get vehicle and customer info
      const tasksWithDetails = await Promise.all(
        jobs.map(async (job) => {
          try {
            const booking = await bookingApi.getBookingById(job.bookingId);

            const toStatus = (s: string): MaintenanceTask['status'] => {
              const normalized = (s || '').toUpperCase();
              if (normalized === 'IN_PROGRESS') return 'in_progress';
              if (normalized === 'COMPLETED') return 'completed';
              if (normalized === 'PENDING') return 'pending';
              return 'pending';
            };

            const progress = job.status === 'COMPLETED' ? 100 :
              job.status === 'IN_PROGRESS' ? 50 : 0;

            return {
              id: String(job.id),
              jobId: job.id,
              bookingId: job.bookingId,
              vehiclePlate: booking.vehicleVin,
              customerName: booking.customerName,
              serviceType: (booking.catalogDetails || []).map(c => c.serviceName).join(', ') || 'Bảo dưỡng',
              status: toStatus(job.status),
              progress: progress,
              startTime: job.startTime || undefined,
              estimatedEndTime: job.estEndTime || undefined,
              actualEndTime: job.actualEndTime || undefined,
              steps: [],
              notes: job.notes || '',
            };
          } catch (error) {
            console.error(`Failed to load booking ${job.bookingId}:`, error);
            // Return task with minimal info if booking load fails
            const toStatus = (s: string): MaintenanceTask['status'] => {
              const normalized = (s || '').toUpperCase();
              if (normalized === 'IN_PROGRESS') return 'in_progress';
              if (normalized === 'COMPLETED') return 'completed';
              if (normalized === 'PENDING') return 'pending';
              return 'pending';
            };
            return {
              id: String(job.id),
              jobId: job.id,
              bookingId: job.bookingId,
              vehiclePlate: `Booking #${job.bookingId}`,
              customerName: 'N/A',
              serviceType: 'Bảo dưỡng',
              status: toStatus(job.status),
              progress: job.status === 'COMPLETED' ? 100 : job.status === 'IN_PROGRESS' ? 50 : 0,
              startTime: job.startTime || undefined,
              estimatedEndTime: job.estEndTime || undefined,
              actualEndTime: job.actualEndTime || undefined,
              steps: [],
              notes: job.notes || '',
            };
          }
        })
      );

      setTasks(tasksWithDetails);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      showApiErrorToast(error, toast, 'Không thể tải danh sách công việc');
    }
  }, [toast]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = (watchFilters.status || 'all') === 'all' || task.status === watchFilters.status;
      const matchesSearch = !debouncedSearchTerm.trim() ||
        task.vehiclePlate.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        task.customerName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        task.serviceType.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tasks, watchFilters.status, debouncedSearchTerm]);

  const totalPages = Math.ceil(filteredTasks.length / pageSize);
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTasks.slice(startIndex, startIndex + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, watchFilters.status]);

  const handleStartTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.jobId) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy job ID.',
        variant: 'destructive',
      });
      return;
    }

    setIsStarting(prev => ({ ...prev, [taskId]: true }));

    try {
      await bookingApi.startJob(task.jobId);

      showApiResponseToast({ message: 'Đã bắt đầu công việc' }, toast, 'Đã bắt đầu công việc');

      // Reload tasks to get updated status
      await loadTasks();
    } catch (error) {
      console.error('Failed to start job:', error);
      showApiErrorToast(error, toast, 'Không thể bắt đầu công việc');
    } finally {
      setIsStarting(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.jobId) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy job ID.',
        variant: 'destructive',
      });
      return;
    }

    setIsCompleting(prev => ({ ...prev, [taskId]: true }));

    try {
      await bookingApi.completeJob(task.jobId);

      showApiResponseToast({ message: 'Đã hoàn thành công việc' }, toast, 'Đã hoàn thành công việc');

      // Reload tasks to get updated status
      await loadTasks();
    } catch (error) {
      console.error('Failed to complete job:', error);
      showApiErrorToast(error, toast, 'Không thể hoàn thành công việc');
    } finally {
      setIsCompleting(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleStartStep = (taskId: string, stepId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
          ...task,
          steps: task.steps.map(step =>
            step.id === stepId
              ? { ...step, status: 'in_progress' as const }
              : step
          )
        }
        : task
    ));
  };

  const handleCompleteStep = (taskId: string, stepId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
          ...task,
          steps: task.steps.map(step =>
            step.id === stepId
              ? { ...step, status: 'completed' as const, actualDuration: step.duration }
              : step
          )
        }
        : task
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Form {...filterForm}>
          <form className="flex items-center gap-3">
            <FormField
              name="search"
              control={filterForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Tìm kiếm..."
                        {...field}
                        className="w-64 pr-10"
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job ID</TableHead>
            <TableHead>Dịch vụ</TableHead>
            <TableHead>Xe</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Tiến độ</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedTasks.length > 0 ? (
            paginatedTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">#{task.jobId}</TableCell>
                <TableCell className="font-medium">{task.serviceType}</TableCell>
                <TableCell>{task.vehiclePlate}</TableCell>
                <TableCell>{task.customerName}</TableCell>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={task.progress} className="h-2 w-20" />
                    <span className="text-sm text-muted-foreground">{task.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {task.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartTask(task.id)}
                        disabled={isStarting[task.id]}
                      >
                        {isStarting[task.id] ? 'Đang xử lý...' : 'Bắt đầu'}
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={isCompleting[task.id]}
                      >
                        {isCompleting[task.id] ? 'Đang xử lý...' : 'Hoàn thành'}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setSelectedTask(task)}>
                      Chi tiết
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedTask.serviceType}</h2>
              <Button variant="outline" onClick={() => setSelectedTask(null)}>
                Đóng
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Xe</Label>
                  <p className="font-medium">{selectedTask.vehiclePlate}</p>
                </div>
                <div>
                  <Label>Khách hàng</Label>
                  <p className="font-medium">{selectedTask.customerName}</p>
                </div>
              </div>

              <div>
                <Label>Tiến độ</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={selectedTask.progress} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground">{selectedTask.progress}%</span>
                </div>
              </div>

              <div>
                <Label>Các bước thực hiện</Label>
                <div className="space-y-2 mt-2">
                  {selectedTask.steps.map((step) => (
                    <div key={step.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStepStatusIcon(step.status)}
                          <span className="font-medium">{step.name}</span>
                        </div>
                        <div className="flex gap-2">
                          {step.status === 'pending' && (
                            <Button size="sm" onClick={() => handleStartStep(selectedTask.id, step.id)}>
                              <Play className="w-4 h-4 mr-1" />
                              Bắt đầu
                            </Button>
                          )}
                          {step.status === 'in_progress' && (
                            <Button size="sm" onClick={() => handleCompleteStep(selectedTask.id, step.id)}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Hoàn thành
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Thời gian: {step.duration} phút</span>
                        {step.actualDuration && (
                          <span>Thực tế: {step.actualDuration} phút</span>
                        )}
                      </div>
                      <div className="mt-2">
                        <Label className="text-xs">Dụng cụ cần thiết:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {step.tools.map((tool, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Ghi chú</Label>
                <Textarea
                  placeholder="Thêm ghi chú về quá trình thực hiện..."
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}