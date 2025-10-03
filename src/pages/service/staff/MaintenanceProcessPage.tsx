import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Car, CheckCircle, Clock, Settings, User, Wrench } from 'lucide-react';
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
          {
            id: '1-1',
            name: 'Kiểm tra tổng thể',
            description: 'Kiểm tra bên ngoài và bên trong xe',
            status: 'completed',
            duration: 15
          },
          {
            id: '1-2',
            name: 'Kiểm tra hệ thống pin',
            description: 'Kiểm tra tình trạng pin và hệ thống sạc',
            status: 'in_progress',
            duration: 30
          },
          {
            id: '1-3',
            name: 'Kiểm tra động cơ',
            description: 'Kiểm tra động cơ điện và hệ thống truyền động',
            status: 'pending',
            duration: 20
          },
          {
            id: '1-4',
            name: 'Kiểm tra hệ thống điện',
            description: 'Kiểm tra hệ thống điện cao áp và phụ kiện',
            status: 'pending',
            duration: 25
          }
        ],
        notes: 'Xe trong tình trạng tốt, cần thay dầu phanh'
      },
      {
        id: '2',
        vehiclePlate: '29B-67890',
        customerName: 'Trần Thị B',
        serviceType: 'Sửa chữa hệ thống pin',
        technician: 'Kỹ thuật viên B',
        status: 'pending',
        progress: 0,
        steps: [
          {
            id: '2-1',
            name: 'Chẩn đoán lỗi',
            description: 'Sử dụng thiết bị chẩn đoán để xác định lỗi',
            status: 'pending',
            duration: 30
          },
          {
            id: '2-2',
            name: 'Tháo rời hệ thống pin',
            description: 'Tháo rời và kiểm tra từng cell pin',
            status: 'pending',
            duration: 60
          },
          {
            id: '2-3',
            name: 'Sửa chữa/Thay thế',
            description: 'Sửa chữa hoặc thay thế cell pin bị lỗi',
            status: 'pending',
            duration: 90
          },
          {
            id: '2-4',
            name: 'Lắp ráp và kiểm tra',
            description: 'Lắp ráp lại và kiểm tra hoạt động',
            status: 'pending',
            duration: 45
          }
        ]
      },
      {
        id: '3',
        vehiclePlate: '51C-11111',
        customerName: 'Lê Văn C',
        serviceType: 'Kiểm tra hệ thống điện',
        technician: 'Kỹ thuật viên C',
        status: 'completed',
        progress: 100,
        startTime: '2024-01-24T10:30:00',
        estimatedEndTime: '2024-01-24T12:00:00',
        actualEndTime: '2024-01-24T11:45:00',
        steps: [
          {
            id: '3-1',
            name: 'Kiểm tra tổng thể',
            description: 'Kiểm tra bên ngoài và bên trong xe',
            status: 'completed',
            duration: 15
          },
          {
            id: '3-2',
            name: 'Kiểm tra hệ thống pin',
            description: 'Kiểm tra tình trạng pin và hệ thống sạc',
            status: 'completed',
            duration: 30
          },
          {
            id: '3-3',
            name: 'Kiểm tra động cơ',
            description: 'Kiểm tra động cơ điện và hệ thống truyền động',
            status: 'completed',
            duration: 20
          },
          {
            id: '3-4',
            name: 'Kiểm tra hệ thống điện',
            description: 'Kiểm tra hệ thống điện cao áp và phụ kiện',
            status: 'completed',
            duration: 25
          }
        ],
        notes: 'Tất cả hệ thống hoạt động bình thường'
      }
    ];
    setTasks(mockTasks);
  }, []);

  const filteredTasks = tasks.filter(task =>
    statusFilter === 'all' || task.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Chờ xử lý</Badge>;
      case 'in_progress':
        return <Badge variant="destructive">Đang thực hiện</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleStartTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
            ...task,
            status: 'in_progress' as const,
            startTime: new Date().toISOString(),
            progress: 0
          }
          : task
      )
    );
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
            ...task,
            status: 'completed' as const,
            progress: 100,
            actualEndTime: new Date().toISOString()
          }
          : task
      )
    );
  };

  const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  return (
    <DashboardLayout user={{ email: 'staff@service.com', role: 'staff', userType: 'service' }}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Quy trình bảo dưỡng</h1>
            <p className="text-muted-foreground">Theo dõi và quản lý quy trình bảo dưỡng xe</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
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

        <Tabs defaultValue="in_progress" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Chờ xử lý ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="in_progress">Đang thực hiện ({inProgressTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Hoàn thành ({completedTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-4">
              {pendingTasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{task.serviceType}</CardTitle>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Car className="w-4 h-4" />
                          {task.vehiclePlate}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {task.customerName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Wrench className="w-4 h-4" />
                          {task.technician}
                        </div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Các bước thực hiện:</div>
                      {task.steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-2 text-sm">
                          {getStepStatusIcon(step.status)}
                          <span className={step.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                            {step.name}
                          </span>
                          <span className="text-muted-foreground">({step.duration} phút)</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={() => handleStartTask(task.id)}>
                        Bắt đầu
                      </Button>
                      <Button variant="outline" size="sm">
                        Chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4">
            <div className="grid gap-4">
              {inProgressTasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{task.serviceType}</CardTitle>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Car className="w-4 h-4" />
                          {task.vehiclePlate}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {task.customerName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Wrench className="w-4 h-4" />
                          {task.technician}
                        </div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Tiến độ</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Các bước thực hiện:</div>
                      {task.steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-2 text-sm">
                          {getStepStatusIcon(step.status)}
                          <span className={step.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                            {step.name}
                          </span>
                          <span className="text-muted-foreground">({step.duration} phút)</span>
                        </div>
                      ))}
                    </div>
                    {task.notes && (
                      <div className="text-sm bg-muted p-2 rounded">
                        <span className="font-medium">Ghi chú:</span> {task.notes}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={() => handleCompleteTask(task.id)}>
                        Hoàn thành
                      </Button>
                      <Button variant="outline" size="sm">
                        Chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid gap-4">
              {completedTasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{task.serviceType}</CardTitle>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Car className="w-4 h-4" />
                          {task.vehiclePlate}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {task.customerName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Wrench className="w-4 h-4" />
                          {task.technician}
                        </div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Các bước thực hiện:</div>
                      {task.steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-2 text-sm">
                          {getStepStatusIcon(step.status)}
                          <span className={step.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                            {step.name}
                          </span>
                          <span className="text-muted-foreground">({step.duration} phút)</span>
                        </div>
                      ))}
                    </div>
                    {task.notes && (
                      <div className="text-sm bg-muted p-2 rounded">
                        <span className="font-medium">Ghi chú:</span> {task.notes}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Hoàn thành lúc:</span> {task.actualEndTime ? new Date(task.actualEndTime).toLocaleString('vi-VN') : 'N/A'}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        Chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
