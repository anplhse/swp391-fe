import { MaintenanceProcessTable } from '@/components/MaintenanceProcessTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MaintenanceTask {
  id: string;
  vehiclePlate: string;
  customerName: string;
  serviceType: string;
  technician: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  startTime?: string;
  estimatedEndTime?: string;
  actualEndTime?: string;
  steps: {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    duration: number;
  }[];
  notes?: string;
}

export default function MaintenanceProcessPage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  useEffect(() => {
    // Tasks should be loaded from API
    // TODO: Load tasks from API
    setTasks([]);
  }, []);

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

  const handleStartTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: 'in_progress' as const, startTime: new Date().toISOString() }
        : task
    ));
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: 'completed' as const, progress: 100, actualEndTime: new Date().toISOString() }
        : task
    ));
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
                <h4 className="font-medium text-sm text-muted-foreground mb-3">Các bước thực hiện</h4>
                <div className="space-y-3">
                  {selectedTask.steps.map((step) => (
                    <div key={step.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        {getStepStatusIcon(step.status)}
                        <span className="font-medium">{step.name}</span>
                        <Badge variant={step.status === 'completed' ? 'default' : step.status === 'in_progress' ? 'secondary' : 'outline'}>
                          {step.status === 'completed' ? 'Hoàn thành' : step.status === 'in_progress' ? 'Đang thực hiện' : 'Chờ xử lý'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Thời gian dự kiến: {step.duration} phút</span>
                        {step.status === 'completed' && (
                          <span className="text-green-600">✓ Đã hoàn thành</span>
                        )}
                      </div>
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