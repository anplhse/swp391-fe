import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { bookingApi } from '@/lib/bookingUtils';
import { showApiErrorToast, showApiResponseToast } from '@/lib/responseHandler';
import { AlertCircle, Car, CheckCircle, ClipboardList, Clock, Play, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface AssignedTask {
  id: string;
  jobId: number;
  bookingId: number;
  vehiclePlate: string;
  customerName: string;
  serviceType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unassigned' | 'pending' | 'in_progress' | 'completed';
  progress: number;
  assignedDate: string;
  startTime?: string;
  estimatedDuration: number; // minutes
  actualDuration?: number;
  steps: {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    duration: number;
    notes?: string;
  }[];
  notes?: string;
  tools: string[];
  parts: {
    id: string;
    name: string;
    quantity: number;
    used: number;
  }[];
}

export default function AssignedTasksPage() {
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isStarting, setIsStarting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const loadTasks = useCallback(async () => {
    try {
      const currentUser = authService.getAuthState().user;
      if (!currentUser || !currentUser.id) {
        console.error('User not found or missing ID');
        return;
      }

      // Get technician-specific tasks
      const jobs = await bookingApi.getTechnicianTasks(currentUser.id);

      // Load booking details for each job to get vehicle and customer info
      const tasksWithDetails = await Promise.all(
        jobs.map(async (job) => {
          try {
            const booking = await bookingApi.getBookingById(job.bookingId);

            const toStatus = (s: string): AssignedTask['status'] => {
              const normalized = (s || '').toUpperCase();
              if (normalized === 'UNASSIGNED') return 'unassigned';
              if (normalized === 'PENDING') return 'pending';
              if (normalized === 'IN_PROGRESS') return 'in_progress';
              if (normalized === 'COMPLETED') return 'completed';
              return 'pending';
            };

            const progress = job.status === 'COMPLETED' ? 100 :
              job.status === 'IN_PROGRESS' ? 50 : 0;

            return {
              id: String(job.id),
              jobId: job.id,
              bookingId: job.bookingId,
              vehiclePlate: booking.vehicleVin || `Booking #${job.bookingId}`,
              customerName: booking.customerName || 'N/A',
              serviceType: (booking.catalogDetails || []).map(c => c.serviceName).join(', ') || 'Bảo dưỡng',
              priority: 'medium' as const,
              status: toStatus(job.status),
              progress: progress,
              assignedDate: job.createdAt,
              startTime: job.startTime || undefined,
              estimatedDuration: 60,
              steps: [],
              notes: job.notes,
              tools: [],
              parts: [],
            };
          } catch (error) {
            console.error(`Failed to load booking ${job.bookingId}:`, error);
            // Return task with minimal info if booking load fails
            const toStatus = (s: string): AssignedTask['status'] => {
              const normalized = (s || '').toUpperCase();
              if (normalized === 'UNASSIGNED') return 'unassigned';
              if (normalized === 'PENDING') return 'pending';
              if (normalized === 'IN_PROGRESS') return 'in_progress';
              if (normalized === 'COMPLETED') return 'completed';
              return 'pending';
            };
            return {
              id: String(job.id),
              jobId: job.id,
              bookingId: job.bookingId,
              vehiclePlate: `Booking #${job.bookingId}`,
              customerName: job.technicianName || 'N/A',
              serviceType: job.notes || 'Bảo dưỡng',
              priority: 'medium' as const,
              status: toStatus(job.status),
              progress: job.status === 'COMPLETED' ? 100 : job.status === 'IN_PROGRESS' ? 50 : 0,
              assignedDate: job.createdAt,
              startTime: job.startTime || undefined,
              estimatedDuration: 60,
              steps: [],
              notes: job.notes,
              tools: [],
              parts: [],
            };
          }
        })
      );

      setTasks(tasksWithDetails);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      showApiErrorToast(error, toast, 'Không thể tải danh sách công việc');
    }
  }, [toast]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const filteredTasks = tasks.filter(task => {
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesPriority && matchesStatus;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Khẩn cấp</Badge>;
      case 'high':
        return <Badge className="bg-primary text-primary-foreground">Cao</Badge>;
      case 'medium':
        return <Badge variant="default">Trung bình</Badge>;
      case 'low':
        return <Badge variant="secondary">Thấp</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
      case 'unassigned':
        return <Badge variant="outline">Chưa phân công</Badge>;
      case 'pending':
        return <Badge variant="secondary">Chờ bắt đầu</Badge>;
      case 'in_progress':
        return <Badge variant="destructive">Đang thực hiện</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Hoàn thành</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-primary" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleStartTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setIsStarting(prev => ({ ...prev, [taskId]: true }));

    try {
      const result = await bookingApi.startJob(task.jobId);

      showApiResponseToast(result, toast, 'Đã bắt đầu công việc');

      // Reload tasks to get updated status
      await loadTasks();
    } catch (error) {
      console.error('Failed to start job:', error);
      showApiErrorToast(error, toast, 'Không thể bắt đầu công việc');
    } finally {
      setIsStarting(prev => ({ ...prev, [taskId]: false }));
    }
  };

  // Note: Pause functionality removed as it's not in JobStatus enum
  // JobStatus only has: UNASSIGNED, PENDING, IN_PROGRESS, COMPLETED

  const handleResumeTask = async (taskId: string) => {
    // Resume is same as start
    await handleStartTask(taskId);
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

    try {
      await bookingApi.completeJob(task.jobId);
      showApiResponseToast({ message: 'Đã hoàn thành công việc' }, toast, 'Đã hoàn thành công việc');
      await loadTasks();
    } catch (error) {
      console.error('Failed to complete job:', error);
      showApiErrorToast(error, toast, 'Không thể hoàn thành công việc');
    }
  };

  const pendingTasks = filteredTasks.filter(task => task.status === 'pending' || task.status === 'unassigned');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Công việc được giao</h1>
          <p className="text-muted-foreground">Quản lý và thực hiện các công việc được phân công</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo độ ưu tiên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="urgent">Khẩn cấp</SelectItem>
            <SelectItem value="high">Cao</SelectItem>
            <SelectItem value="medium">Trung bình</SelectItem>
            <SelectItem value="low">Thấp</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="unassigned">Chưa phân công</SelectItem>
            <SelectItem value="pending">Chờ bắt đầu</SelectItem>
            <SelectItem value="in_progress">Đang thực hiện</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
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
                      <ClipboardList className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{task.serviceType}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      {getPriorityBadge(task.priority)}
                      {getStatusBadge(task.status)}
                    </div>
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
                        <Clock className="w-4 h-4" />
                        {task.estimatedDuration} phút
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
                        <span>{step.name}</span>
                        <span className="text-muted-foreground">({step.duration} phút)</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Dụng cụ cần thiết:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.tools.map((tool, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{tool}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Phụ tùng:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.parts.map((part) => (
                        <Badge key={part.id} variant="outline" className="text-xs">
                          {part.name} ({part.quantity})
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleStartTask(task.id)}
                      disabled={isStarting[task.id]}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      {isStarting[task.id] ? 'Đang bắt đầu...' : 'Bắt đầu'}
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
                      <ClipboardList className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{task.serviceType}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      {getPriorityBadge(task.priority)}
                      {getStatusBadge(task.status)}
                    </div>
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
                        <Clock className="w-4 h-4" />
                        {task.estimatedDuration} phút
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
                        {step.notes && (
                          <span className="text-muted-foreground text-xs">- {step.notes}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {task.notes && (
                    <div className="text-sm bg-muted p-2 rounded">
                      <span className="font-medium">Ghi chú:</span> {task.notes}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    {(task.status === 'pending' || task.status === 'unassigned') && (
                      <Button
                        size="sm"
                        onClick={() => handleResumeTask(task.id)}
                        disabled={isStarting[task.id]}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {isStarting[task.id] ? 'Đang bắt đầu...' : 'Bắt đầu'}
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button size="sm" onClick={() => handleCompleteTask(task.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Hoàn thành
                      </Button>
                    )}
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
                      <ClipboardList className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{task.serviceType}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      {getPriorityBadge(task.priority)}
                      {getStatusBadge(task.status)}
                    </div>
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
                        <Clock className="w-4 h-4" />
                        {task.actualDuration || task.estimatedDuration} phút
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
                        {step.notes && (
                          <span className="text-muted-foreground text-xs">- {step.notes}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {task.notes && (
                    <div className="text-sm bg-muted p-2 rounded">
                      <span className="font-medium">Ghi chú:</span> {task.notes}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Hoàn thành lúc:</span> {task.startTime ? new Date(task.startTime).toLocaleString('vi-VN') : 'N/A'}
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
  );
}
