import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  PauseCircle,
  PlayCircle,
  Settings,
  Wrench
} from 'lucide-react';

export default function TechnicianDashboard() {

  // Mock assigned tasks
  const currentTasks = [
    {
      id: 'BK2025001',
      customer: 'Nguyễn Văn A',
      vehicle: 'VinFast VF8 - 30A-12345',
      service: 'Bảo dưỡng định kỳ',
      startTime: '09:00',
      estimatedDuration: 150, // minutes
      progress: 50,
      status: 'in-progress' as const,
      priority: 'normal' as const
    }
  ];

  const pendingTasks = [
    {
      id: 'BK2025002',
      customer: 'Trần Thị B',
      vehicle: 'VinFast VF9 - 29B-67890',
      service: 'Kiểm tra pin',
      scheduledTime: '14:00',
      estimatedDuration: 120,
      priority: 'normal'
    }
  ];

  const completedToday = [
    {
      id: 'BK2025003',
      customer: 'Lê Văn C',
      vehicle: 'VinFast VF e34 - 51C-11111',
      service: 'Kiểm tra an toàn',
      completedTime: '10:30',
      duration: 90
    }
  ];

  const toolsStatus = [
    { name: 'Máy kiểm tra pin', status: 'available', location: 'Bay 1' },
    { name: 'Thiết bị chẩn đoán', status: 'in-use', location: 'Bay 2' },
    { name: 'Máy nâng xe', status: 'available', location: 'Bay 3' },
    { name: 'Bộ công cụ EV', status: 'maintenance', location: 'Kho' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">Chào buổi sáng!</h2>
        <p className="text-white/80">
          Bạn có {currentTasks.length} công việc đang thực hiện và {pendingTasks.length} công việc chờ xử lý.
        </p>
      </div>

      {/* Work Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentTasks.length}</p>
                <p className="text-sm text-muted-foreground">Đang thực hiện</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingTasks.length}</p>
                <p className="text-sm text-muted-foreground">Chờ xử lý</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedToday.length}</p>
                <p className="text-sm text-muted-foreground">Hoàn thành hôm nay</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Khẩn cấp</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Task */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Công việc hiện tại
            </CardTitle>
            <CardDescription>
              Các công việc đang được thực hiện
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentTasks.length > 0 ? (
              <div className="space-y-4">
                {currentTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{task.service}</h3>
                        <p className="text-sm text-muted-foreground">{task.customer}</p>
                        <p className="text-sm text-muted-foreground">{task.vehicle}</p>
                      </div>
                      <Badge variant="secondary">Đang thực hiện</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Tiến độ:</span>
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Bắt đầu: {task.startTime}</span>
                      <span>Dự kiến: {task.estimatedDuration} phút</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="success">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Tiếp tục
                      </Button>
                      <Button size="sm" variant="warning">
                        <PauseCircle className="w-4 h-4 mr-2" />
                        Tạm dừng
                      </Button>
                      <Button size="sm" variant="electric">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Hoàn thành
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Không có công việc nào đang thực hiện</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Công việc chờ xử lý
            </CardTitle>
            <CardDescription>
              Các công việc được phân công
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{task.service}</h3>
                    <p className="text-sm text-muted-foreground">{task.customer}</p>
                    <p className="text-sm text-muted-foreground">{task.vehicle}</p>
                  </div>
                  <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                    {task.priority === 'high' ? 'Khẩn cấp' : 'Thường'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Lịch hẹn: {task.scheduledTime}</span>
                  <span>Dự kiến: {task.estimatedDuration} phút</span>
                </div>

                <Button size="sm" variant="electric" className="w-full">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Bắt đầu công việc
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completed Today */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Hoàn thành hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedToday.map((task) => (
                <div key={task.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <h3 className="font-medium">{task.service}</h3>
                    <p className="text-sm text-muted-foreground">{task.customer}</p>
                    <p className="text-sm text-muted-foreground">{task.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Hoàn thành
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {task.completedTime} • {task.duration} phút
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tools Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Trạng thái thiết bị
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {toolsStatus.map((tool, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-sm text-muted-foreground">{tool.location}</p>
                  </div>
                  <Badge variant={
                    tool.status === 'available' ? 'default' :
                      tool.status === 'in-use' ? 'warning' : 'destructive'
                  }>
                    {tool.status === 'available' ? 'Sẵn sàng' :
                      tool.status === 'in-use' ? 'Đang dùng' : 'Bảo trì'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}