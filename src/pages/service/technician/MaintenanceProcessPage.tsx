import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Car, CheckCircle, Clock, Play, Settings, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MaintenanceStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  duration: number; // minutes
  actualDuration?: number;
  notes?: string;
  tools: string[];
  safetyChecks: string[];
  qualityChecks: string[];
}

interface MaintenanceTask {
  id: string;
  vehiclePlate: string;
  customerName: string;
  serviceType: string;
  status: 'pending' | 'in_progress' | 'paused' | 'completed';
  progress: number;
  startTime?: string;
  estimatedDuration: number;
  actualDuration?: number;
  steps: MaintenanceStep[];
  currentStepId?: string;
  notes?: string;
  safetyIssues: string[];
  qualityIssues: string[];
}

export default function MaintenanceProcessPage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [stepNotes, setStepNotes] = useState('');
  const [taskNotes, setTaskNotes] = useState('');

  useEffect(() => {
    // Mock data
    const mockTasks: MaintenanceTask[] = [
      {
        id: '1',
        vehiclePlate: '30A-12345',
        customerName: 'Nguyễn Văn A',
        serviceType: 'Bảo dưỡng định kỳ',
        status: 'in_progress',
        progress: 65,
        startTime: '2024-01-25T09:00:00',
        estimatedDuration: 120,
        currentStepId: '1-2',
        steps: [
          {
            id: '1-1',
            name: 'Kiểm tra tổng thể',
            description: 'Kiểm tra bên ngoài và bên trong xe',
            status: 'completed',
            duration: 15,
            actualDuration: 12,
            notes: 'Xe trong tình trạng tốt, không có vết trầy xước',
            tools: ['Đèn pin', 'Gương soi', 'Bộ dụng cụ cơ bản'],
            safetyChecks: ['Kiểm tra phanh tay', 'Kiểm tra đèn báo hiệu'],
            qualityChecks: ['Kiểm tra độ sạch sẽ', 'Kiểm tra tình trạng nội thất']
          },
          {
            id: '1-2',
            name: 'Kiểm tra hệ thống pin',
            description: 'Kiểm tra tình trạng pin và hệ thống sạc',
            status: 'in_progress',
            duration: 30,
            tools: ['Máy chẩn đoán pin', 'Đồng hồ đo điện', 'Thiết bị an toàn'],
            safetyChecks: ['Tắt nguồn điện', 'Đeo găng tay cách điện', 'Kiểm tra rò rỉ'],
            qualityChecks: ['Đo dung lượng pin', 'Kiểm tra tốc độ sạc', 'Kiểm tra nhiệt độ']
          },
          {
            id: '1-3',
            name: 'Kiểm tra động cơ',
            description: 'Kiểm tra động cơ điện và hệ thống truyền động',
            status: 'pending',
            duration: 20,
            tools: ['Máy chẩn đoán OBD', 'Bộ dụng cụ chuyên dụng'],
            safetyChecks: ['Tắt động cơ', 'Kiểm tra dây curoa', 'Kiểm tra rò rỉ dầu'],
            qualityChecks: ['Kiểm tra tiếng ồn', 'Kiểm tra rung động', 'Kiểm tra hiệu suất']
          },
          {
            id: '1-4',
            name: 'Kiểm tra hệ thống điện',
            description: 'Kiểm tra hệ thống điện cao áp và phụ kiện',
            status: 'pending',
            duration: 25,
            tools: ['Đồng hồ đo điện', 'Máy kiểm tra cách điện'],
            safetyChecks: ['Tắt nguồn điện', 'Kiểm tra cách điện', 'Kiểm tra nối đất'],
            qualityChecks: ['Kiểm tra điện áp', 'Kiểm tra dòng điện', 'Kiểm tra tần số']
          }
        ],
        notes: 'Khách hàng yêu cầu kiểm tra kỹ hệ thống pin',
        safetyIssues: [],
        qualityIssues: []
      },
      {
        id: '2',
        vehiclePlate: '29B-67890',
        customerName: 'Trần Thị B',
        serviceType: 'Sửa chữa hệ thống pin',
        status: 'pending',
        progress: 0,
        estimatedDuration: 180,
        steps: [
          {
            id: '2-1',
            name: 'Chẩn đoán lỗi',
            description: 'Sử dụng thiết bị chẩn đoán để xác định lỗi',
            status: 'pending',
            duration: 30,
            tools: ['Máy chẩn đoán pin', 'Máy đo điện áp', 'Thiết bị an toàn'],
            safetyChecks: ['Tắt nguồn điện', 'Đeo găng tay cách điện', 'Kiểm tra rò rỉ'],
            qualityChecks: ['Đo điện áp pin', 'Kiểm tra dòng điện', 'Kiểm tra nhiệt độ']
          },
          {
            id: '2-2',
            name: 'Tháo rời hệ thống pin',
            description: 'Tháo rời và kiểm tra từng cell pin',
            status: 'pending',
            duration: 60,
            tools: ['Bộ dụng cụ chuyên dụng', 'Thiết bị nâng', 'Thiết bị an toàn'],
            safetyChecks: ['Tắt nguồn điện', 'Tháo pin an toàn', 'Kiểm tra rò rỉ'],
            qualityChecks: ['Kiểm tra từng cell', 'Đo điện áp cell', 'Kiểm tra dung lượng']
          },
          {
            id: '2-3',
            name: 'Sửa chữa/Thay thế',
            description: 'Sửa chữa hoặc thay thế cell pin bị lỗi',
            status: 'pending',
            duration: 90,
            tools: ['Bộ dụng cụ chuyên dụng', 'Cell pin thay thế', 'Thiết bị hàn'],
            safetyChecks: ['Thao tác an toàn', 'Kiểm tra kết nối', 'Kiểm tra rò rỉ'],
            qualityChecks: ['Kiểm tra kết nối', 'Đo điện áp', 'Kiểm tra dung lượng']
          }
        ],
        safetyIssues: [],
        qualityIssues: []
      }
    ];
    setTasks(mockTasks);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Chờ xử lý</Badge>;
      case 'in_progress':
        return <Badge variant="destructive">Đang thực hiện</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">Tạm dừng</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Hoàn thành</Badge>;
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

  const handleStartStep = (taskId: string, stepId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
            ...task,
            status: 'in_progress' as const,
            currentStepId: stepId,
            steps: task.steps.map(step =>
              step.id === stepId
                ? { ...step, status: 'in_progress' as const }
                : step
            )
          }
          : task
      )
    );
  };

  const handleCompleteStep = (taskId: string, stepId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
            ...task,
            steps: task.steps.map(step =>
              step.id === stepId
                ? {
                  ...step,
                  status: 'completed' as const,
                  notes: stepNotes,
                  actualDuration: step.duration
                }
                : step
            ),
            progress: Math.round((task.steps.filter(s => s.status === 'completed').length + 1) / task.steps.length * 100)
          }
          : task
      )
    );
    setStepNotes('');
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
            ...task,
            status: 'completed' as const,
            progress: 100,
            actualDuration: task.estimatedDuration,
            notes: taskNotes
          }
          : task
      )
    );
    setTaskNotes('');
    setSelectedTask(null);
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress' || task.status === 'paused');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <DashboardLayout user={{ email: 'technician@service.com', role: 'technician', userType: 'service' }}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Quy trình bảo dưỡng</h1>
            <p className="text-muted-foreground">Thực hiện và theo dõi quy trình bảo dưỡng chi tiết</p>
          </div>
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
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={() => setSelectedTask(task)}>
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
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={() => setSelectedTask(task)}>
                        Tiếp tục
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

        {/* Task Detail Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedTask.serviceType}</h2>
                <Button variant="outline" onClick={() => setSelectedTask(null)}>
                  Đóng
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Biển số:</span> {selectedTask.vehiclePlate}
                  </div>
                  <div>
                    <span className="font-medium">Khách hàng:</span> {selectedTask.customerName}
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedTask.steps.map((step) => (
                    <Card key={step.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStepStatusIcon(step.status)}
                            <CardTitle className="text-lg">{step.name}</CardTitle>
                          </div>
                          <Badge variant={step.status === 'completed' ? 'default' : step.status === 'in_progress' ? 'destructive' : 'secondary'}>
                            {step.status === 'completed' ? 'Hoàn thành' : step.status === 'in_progress' ? 'Đang thực hiện' : 'Chờ xử lý'}
                          </Badge>
                        </div>
                        <CardDescription>{step.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Thời gian dự kiến:</span> {step.duration} phút
                          </div>
                          {step.actualDuration && (
                            <div>
                              <span className="font-medium">Thời gian thực tế:</span> {step.actualDuration} phút
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Dụng cụ cần thiết:</div>
                          <div className="flex flex-wrap gap-1">
                            {step.tools.map((tool, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{tool}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Kiểm tra an toàn:</div>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {step.safetyChecks.map((check, idx) => (
                              <li key={idx}>{check}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Kiểm tra chất lượng:</div>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {step.qualityChecks.map((check, idx) => (
                              <li key={idx}>{check}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`step-notes-${step.id}`}>Ghi chú bước này:</Label>
                          <Textarea
                            id={`step-notes-${step.id}`}
                            placeholder="Nhập ghi chú cho bước này..."
                            value={stepNotes}
                            onChange={(e) => setStepNotes(e.target.value)}
                          />
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
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-notes">Ghi chú tổng thể:</Label>
                  <Textarea
                    id="task-notes"
                    placeholder="Nhập ghi chú tổng thể cho công việc..."
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleCompleteTask(selectedTask.id)}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Hoàn thành công việc
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTask(null)}>
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
