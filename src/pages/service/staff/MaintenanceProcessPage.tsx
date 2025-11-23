import { MaintenanceProcessTable } from '@/components/MaintenanceProcessTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { bookingApi } from '@/lib/bookingUtils';
import { showApiErrorToast, showApiResponseToast } from '@/lib/responseHandler';
import { AlertCircle, CheckCircle, Clock, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface MaintenanceTask {
  id: string;
  bookingId: number;
  jobId?: number;
  vehiclePlate: string;
  vehicleModel: string;
  customerName: string;
  serviceType: string;
  technician: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
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
  scheduleDateTime?: string;
}

interface AvailableTechnician {
  id: number;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  role: string;
  status: string;
}

export default function MaintenanceProcessPage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isStarting, setIsStarting] = useState<{ [key: string]: boolean }>({});
  const [isCompleting, setIsCompleting] = useState<{ [key: string]: boolean }>({});
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<MaintenanceTask | null>(null);
  const [availableTechnicians, setAvailableTechnicians] = useState<AvailableTechnician[]>([]);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  const loadTasks = useCallback(async () => {
    try {
      // Load both bookings and jobs
      const [bookings, jobs] = await Promise.all([
        bookingApi.getAllBookings(),
        bookingApi.getJobs()
      ]);

      // Create a map of bookingId -> job for quick lookup
      const jobsMap = new Map(jobs.map(job => [job.bookingId, job]));

      // Create a set of bookingIds that have jobs (for filtering)
      const bookingIdsWithJobs = new Set(jobs.map(job => job.bookingId));

      // Filter bookings:
      // 1. PAID/ASSIGNED bookings (to assign work) - chưa có job hoặc job PENDING
      // 2. Bookings with jobs that are PENDING, IN_PROGRESS, or COMPLETED (to start/complete)
      const maintenanceTasks = bookings
        .filter(b => {
          const job = jobsMap.get(b.id);
          // Include if:
          // - Booking is PAID or ASSIGNED (for assigning work)
          // - Booking has a job with status PENDING, IN_PROGRESS, or COMPLETED (for start/complete)
          if (['PAID', 'ASSIGNED'].includes(b.bookingStatus)) {
            return true; // Always show PAID/ASSIGNED bookings
          }
          if (job && ['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(job.status)) {
            return true; // Show bookings with active jobs
          }
          return false;
        })
        .map(b => {
          const dt = b.scheduleDateTime?.value || '';
          const job = jobsMap.get(b.id);

          // Use job status if available, otherwise use booking status
          // Map booking status to frontend status
          const toBookingStatus = (s: string): MaintenanceTask['status'] => {
            const normalized = (s || '').toUpperCase();
            if (normalized === 'IN_PROGRESS') return 'in_progress';
            if (normalized === 'MAINTENANCE_COMPLETE') return 'completed';
            if (normalized === 'ASSIGNED') return 'assigned';
            if (normalized === 'PENDING') return 'pending';
            if (normalized === 'PAID') return 'pending';
            return 'pending';
          };

          // Map job status to frontend status
          const toJobStatus = (s: string): MaintenanceTask['status'] => {
            const normalized = (s || '').toUpperCase();
            if (normalized === 'IN_PROGRESS') return 'in_progress';
            if (normalized === 'COMPLETED') return 'completed';
            if (normalized === 'PENDING') return 'pending';
            return 'pending';
          };

          // Determine status:
          // - If booking is PAID: status = 'pending' (chưa phân công)
          // - If booking is ASSIGNED and has job: use job status (PENDING -> 'pending', IN_PROGRESS -> 'in_progress', COMPLETED -> 'completed')
          // - If booking is ASSIGNED and no job: status = 'assigned' (đã phân công nhưng chưa tạo job)
          const bookingStatus = toBookingStatus(b.bookingStatus);
          const jobStatus = job ? toJobStatus(job.status) : null;

          // Priority: job status > assigned status > booking status
          let status: MaintenanceTask['status'];
          if (jobStatus) {
            status = jobStatus; // Use job status if job exists
          } else if (bookingStatus === 'assigned') {
            status = 'assigned'; // Booking assigned but no job yet
          } else {
            status = bookingStatus; // Use booking status (PAID -> 'pending')
          }

          const progress = job?.status === 'COMPLETED' ? 100 :
            job?.status === 'IN_PROGRESS' ? 50 : 0;

          return {
            id: job ? String(job.id) : String(b.id), // Use job ID if available, otherwise booking ID
            bookingId: b.id,
            jobId: job?.id,
            vehiclePlate: b.vehicleVin,
            vehicleModel: b.vehicleModel,
            customerName: b.customerName,
            serviceType: (b.catalogDetails || []).map(c => c.serviceName).join(', ') || 'Bảo dưỡng',
            technician: job?.technicianName || b.technicianName || b.assignedTechnicianName || 'Chưa phân công',
            status: status,
            progress: progress,
            startTime: job?.startTime || (b.bookingStatus === 'IN_PROGRESS' ? b.updatedAt : undefined),
            estimatedEndTime: job?.estEndTime || undefined,
            actualEndTime: job?.actualEndTime || undefined,
            services: (b.catalogDetails || []).map(c => ({
              id: c.id,
              name: c.serviceName,
              description: c.description,
            })),
            scheduleDateTime: b.scheduleDateTime?.value,
            notes: job?.notes || '',
          };
        });

      setTasks(maintenanceTasks);
    } catch (error) {
      console.error('Failed to load maintenance tasks:', error);
      showApiErrorToast(error, toast, 'Không thể tải danh sách quy trình bảo dưỡng');
    }
  }, [toast]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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

  const handleStartTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Need jobId to start job
    if (!task.jobId) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy job ID. Vui lòng gán kỹ thuật viên trước.',
        variant: 'destructive',
      });
      return;
    }

    setIsStarting(prev => ({ ...prev, [taskId]: true }));

    try {
      await bookingApi.startJob(task.jobId);

      toast({
        title: 'Thành công',
        description: `Đã bắt đầu bảo dưỡng cho job #${task.jobId}`,
      });

      // Reload tasks to get updated status
      await loadTasks();
    } catch (error) {
      console.error('Failed to start job:', error);
      showApiErrorToast(error, toast, 'Không thể bắt đầu bảo dưỡng');
    } finally {
      setIsStarting(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Need jobId to complete job
    if (!task.jobId) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy job ID. Vui lòng bắt đầu job trước.',
        variant: 'destructive',
      });
      return;
    }

    setIsCompleting(prev => ({ ...prev, [taskId]: true }));

    try {
      await bookingApi.completeJob(task.jobId);

      toast({
        title: 'Thành công',
        description: `Đã hoàn thành bảo dưỡng cho job #${task.jobId}`,
      });

      // Reload tasks to get updated status
      await loadTasks();
    } catch (error) {
      console.error('Failed to complete job:', error);
      showApiErrorToast(error, toast, 'Không thể hoàn thành bảo dưỡng');
    } finally {
      setIsCompleting(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleViewDetails = (task: MaintenanceTask) => {
    setSelectedTask(task);
  };

  const handleAssignTechnician = async (task: MaintenanceTask) => {
    setTaskToAssign(task);
    setIsAssignDialogOpen(true);
    setSelectedTechnicianId(null);
    setAvailableTechnicians([]);

    // Load available technicians
    if (task.scheduleDateTime) {
      setIsLoadingTechnicians(true);
      try {
        const technicians = await bookingApi.getAvailableTechnicians(task.scheduleDateTime);
        setAvailableTechnicians(technicians);
      } catch (error) {
        console.error('Failed to load available technicians:', error);
        showApiErrorToast(error, toast, 'Không thể tải danh sách kỹ thuật viên');
      } finally {
        setIsLoadingTechnicians(false);
      }
    }
  };

  const handleConfirmAssign = async () => {
    if (!taskToAssign || !selectedTechnicianId) return;

    setIsAssigning(true);
    try {
      const result = await bookingApi.assignTechnician(taskToAssign.bookingId, selectedTechnicianId);

      showApiResponseToast(result, toast, 'Gán kỹ thuật viên thành công');

      setIsAssignDialogOpen(false);
      setTaskToAssign(null);
      setSelectedTechnicianId(null);

      // Reload tasks
      await loadTasks();
    } catch (error) {
      console.error('Failed to assign technician:', error);
      showApiErrorToast(error, toast, 'Không thể gán kỹ thuật viên');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <MaintenanceProcessTable
        tasks={tasks}
        onStartTask={handleStartTask}
        onCompleteTask={handleCompleteTask}
        onViewDetails={handleViewDetails}
        onAssignTechnician={handleAssignTechnician}
        showActions={true}
      />

      {/* Task Details Modal */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{selectedTask.serviceType}</DialogTitle>
              <DialogDescription>
                Chi tiết quy trình bảo dưỡng cho booking #{selectedTask.bookingId}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Xe</h4>
                  <p className="font-medium">{selectedTask.vehiclePlate}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Khách hàng</h4>
                  <p className="font-medium">{selectedTask.customerName}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Tiến độ</h4>
                <div className="flex items-center gap-2">
                  <Progress value={selectedTask.progress} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground">{selectedTask.progress}%</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-3">Dịch vụ</h4>
                <div className="space-y-3">
                  {selectedTask.services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedTask(null)}>
                  Đóng
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Assign Technician Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Gán kỹ thuật viên cho Booking #{taskToAssign?.bookingId}
            </DialogTitle>
            <DialogDescription>
              Chọn kỹ thuật viên để gán công việc bảo dưỡng
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {taskToAssign && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Khách hàng</h4>
                  <p className="font-medium">{taskToAssign.customerName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Xe</h4>
                  <p className="font-medium">{taskToAssign.vehicleModel} - {taskToAssign.vehiclePlate}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Dịch vụ</h4>
                  <p className="font-medium">{taskToAssign.serviceType}</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Kỹ thuật viên có sẵn
              </h4>
              {isLoadingTechnicians ? (
                <div className="flex items-center justify-center py-8 border rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                  <span className="text-sm text-muted-foreground">Đang tải danh sách kỹ thuật viên...</span>
                </div>
              ) : availableTechnicians.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Số điện thoại</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableTechnicians.map((tech) => (
                        <TableRow
                          key={tech.id}
                          className={selectedTechnicianId === tech.id ? 'bg-muted' : 'cursor-pointer hover:bg-muted/50'}
                          onClick={() => setSelectedTechnicianId(tech.id)}
                        >
                          <TableCell>
                            <input
                              type="radio"
                              checked={selectedTechnicianId === tech.id}
                              onChange={() => setSelectedTechnicianId(tech.id)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{tech.fullName}</TableCell>
                          <TableCell className="text-sm">{tech.emailAddress}</TableCell>
                          <TableCell className="text-sm">{tech.phoneNumber}</TableCell>
                          <TableCell>
                            <Badge variant={tech.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {tech.status === 'ACTIVE' ? 'Hoạt động' : tech.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg text-muted-foreground">
                  Không có kỹ thuật viên nào rảnh trong khung giờ này
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleConfirmAssign}
              disabled={!selectedTechnicianId || isAssigning}
            >
              {isAssigning ? 'Đang gán...' : 'Xác nhận gán'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}