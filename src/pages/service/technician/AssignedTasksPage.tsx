import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Car, CheckCircle, ClipboardList, Clock, Pause, Play, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AssignedTask {
  id: string;
  vehiclePlate: string;
  customerName: string;
  serviceType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
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

  useEffect(() => {
    // Tasks should be loaded from API
    // TODO: Load tasks from API
    setTasks([]);
  }, []);

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
        return <Badge className="bg-orange-500">Cao</Badge>;
      case 'medium':
        return <Badge variant="default">Trung bình</Badge>;
      case 'low':
        return <Badge variant="secondary">Thấp</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge variant="secondary">Đã giao</Badge>;
      case 'in_progress':
        return <Badge variant="destructive">Đang thực hiện</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">Tạm dừng</Badge>;
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
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
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

  const handlePauseTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: 'paused' as const }
          : task
      )
    );
  };

  const handleResumeTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: 'in_progress' as const }
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
            actualDuration: task.estimatedDuration
          }
          : task
      )
    );
  };

  const assignedTasks = filteredTasks.filter(task => task.status === 'assigned');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress' || task.status === 'paused');
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
            <SelectItem value="assigned">Đã giao</SelectItem>
            <SelectItem value="in_progress">Đang thực hiện</SelectItem>
            <SelectItem value="paused">Tạm dừng</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="assigned" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assigned">Đã giao ({assignedTasks.length})</TabsTrigger>
          <TabsTrigger value="in_progress">Đang thực hiện ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="space-y-4">
          <div className="grid gap-4">
            {assignedTasks.map((task) => (
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
                    <Button size="sm" onClick={() => handleStartTask(task.id)}>
                      <Play className="w-4 h-4 mr-1" />
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
                    {task.status === 'in_progress' ? (
                      <Button size="sm" onClick={() => handlePauseTask(task.id)}>
                        <Pause className="w-4 h-4 mr-1" />
                        Tạm dừng
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleResumeTask(task.id)}>
                        <Play className="w-4 h-4 mr-1" />
                        Tiếp tục
                      </Button>
                    )}
                    <Button size="sm" onClick={() => handleCompleteTask(task.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" />
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
