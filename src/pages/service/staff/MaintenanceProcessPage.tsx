import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  useEffect(() => {
    // Mock data
    const mockTasks: MaintenanceTask[] = [
      {
        id: '1',
        vehiclePlate: '30A-12345',
        customerName: 'Nguyễn Văn A',
        serviceType: 'Bảo dưỡng định kỳ',
        technician: 'Kỹ thuật viên A',
        status: 'in_progress',
        progress: 60,
        startTime: '2024-01-25T09:00:00',
        estimatedEndTime: '2024-01-25T11:00:00',
        steps: [
          { id: '1', name: 'Kiểm tra động cơ', description: 'Kiểm tra tổng thể động cơ', status: 'completed', duration: 30 },
          { id: '2', name: 'Thay dầu', description: 'Thay dầu động cơ', status: 'in_progress', duration: 20 },
          { id: '3', name: 'Kiểm tra phanh', description: 'Kiểm tra hệ thống phanh', status: 'pending', duration: 25 }
        ]
      },
      {
        id: '2',
        vehiclePlate: '51C-67890',
        customerName: 'Lê Thị B',
        serviceType: 'Sửa chữa hệ thống điện',
        technician: 'Kỹ thuật viên B',
        status: 'pending',
        progress: 0,
        steps: [
          { id: '1', name: 'Chẩn đoán lỗi', description: 'Kiểm tra hệ thống điện', status: 'pending', duration: 45 },
          { id: '2', name: 'Sửa chữa', description: 'Sửa chữa các lỗi phát hiện', status: 'pending', duration: 60 },
          { id: '3', name: 'Kiểm tra lại', description: 'Kiểm tra hoạt động sau sửa chữa', status: 'pending', duration: 15 }
        ]
      },
      {
        id: '3',
        vehiclePlate: '29B-11111',
        customerName: 'Trần Văn C',
        serviceType: 'Thay thế phụ tùng',
        technician: 'Kỹ thuật viên C',
        status: 'completed',
        progress: 100,
        startTime: '2024-01-24T14:00:00',
        actualEndTime: '2024-01-24T16:30:00',
        steps: [
          { id: '1', name: 'Tháo lắp cũ', description: 'Tháo phụ tùng cũ', status: 'completed', duration: 30 },
          { id: '2', name: 'Lắp mới', description: 'Lắp phụ tùng mới', status: 'completed', duration: 45 },
          { id: '3', name: 'Kiểm tra', description: 'Kiểm tra hoạt động', status: 'completed', duration: 15 }
        ],
        notes: 'Phụ tùng thay thế hoạt động tốt'
      }
    ];
    setTasks(mockTasks);
  }, []);

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
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesSearch = searchTerm === '' ||
      task.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.technician.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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

  return (
    <DashboardLayout user={{ email: 'staff@service.com', role: 'staff', userType: 'service' }}>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dịch vụ</TableHead>
              <TableHead>Xe</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Kỹ thuật viên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tiến độ</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
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
                <TableCell>
                  <div className="flex gap-2">
                    {task.status === 'pending' && (
                      <Button size="sm" onClick={() => handleStartTask(task.id)}>
                        Bắt đầu
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button size="sm" onClick={() => handleCompleteTask(task.id)}>
                        Hoàn thành
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setSelectedTask(task)}>
                      Chi tiết
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

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
    </DashboardLayout>
  );
}