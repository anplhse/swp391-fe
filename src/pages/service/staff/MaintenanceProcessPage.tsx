import { MaintenanceProcessTable } from '@/components/MaintenanceProcessTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { bookingApi } from '@/lib/bookingUtils';
import { showApiErrorToast } from '@/lib/responseHandler';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

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

export default function MaintenanceProcessPage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isStarting, setIsStarting] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const loadTasks = useCallback(async () => {
    try {
      const bookings = await bookingApi.getAllBookings();
      
      // Filter bookings that are PAID (ready to start) or IN_PROGRESS
      const maintenanceTasks = bookings
        .filter(b => ['PAID', 'IN_PROGRESS'].includes(b.bookingStatus))
        .map(b => {
          const dt = b.scheduleDateTime?.value || '';
          const toStatus = (s: string): MaintenanceTask['status'] => {
            const normalized = (s || '').toUpperCase();
            if (normalized === 'IN_PROGRESS') return 'in_progress';
            if (normalized === 'PAID') return 'pending';
            return 'pending';
          };

          return {
            id: String(b.id),
            bookingId: b.id,
            vehiclePlate: b.vehicleVin,
            vehicleModel: b.vehicleModel,
            customerName: b.customerName,
            serviceType: (b.catalogDetails || []).map(c => c.serviceName).join(', ') || 'Bảo dưỡng',
            technician: b.assignedTechnicianName || 'Chưa phân công',
            status: toStatus(b.bookingStatus),
            progress: b.bookingStatus === 'IN_PROGRESS' ? 50 : 0,
            startTime: b.bookingStatus === 'IN_PROGRESS' ? b.updatedAt : undefined,
            services: (b.catalogDetails || []).map(c => ({
              id: c.id,
              name: c.serviceName,
              description: c.description,
            })),
            notes: '',
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

    setIsStarting(prev => ({ ...prev, [taskId]: true }));

    try {
      await bookingApi.startMaintenance(task.bookingId);
      
      toast({
        title: 'Thành công',
        description: `Đã bắt đầu bảo dưỡng cho booking #${task.bookingId}`,
      });

      // Reload tasks to get updated status
      await loadTasks();
    } catch (error) {
      console.error('Failed to start maintenance:', error);
      showApiErrorToast(error, toast, 'Không thể bắt đầu bảo dưỡng');
    } finally {
      setIsStarting(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleCompleteTask = (taskId: string) => {
    // TODO: Implement complete maintenance API
    toast({
      title: 'Chức năng đang phát triển',
      description: 'API hoàn thành bảo dưỡng đang được phát triển',
    });
  };

  const handleViewDetails = (task: MaintenanceTask) => {
    setSelectedTask(task);
  };

  return (
    <div className="space-y-6">
      <MaintenanceProcessTable
        tasks={tasks}
        onStartTask={handleStartTask}
        onCompleteTask={handleCompleteTask}
        onViewDetails={handleViewDetails}
        showActions={true}
      />

      {/* Task Details Modal */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{selectedTask.serviceType}</DialogTitle>
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
    </div>
  );
}