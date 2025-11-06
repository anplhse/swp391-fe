import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MapPin, Phone, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'admin' | 'staff' | 'technician';
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
  salary: number;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  certifications: {
    name: string;
    issuedBy: string;
    expiryDate: string;
    status: 'valid' | 'expired' | 'expiring';
  }[];
  performance: {
    rating: number;
    completedTasks: number;
    customerRating: number;
    lastReview: string;
  };
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
  employees: string[];
  maxEmployees: number;
}

export default function PersonnelManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Employees and shifts should be loaded from API
    // TODO: Load employees and shifts from API
    setEmployees([]);
    setShifts([]);
  }, []);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.includes(searchTerm);

    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Hoạt động</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Không hoạt động</Badge>;
      case 'on_leave':
        return <Badge className="bg-yellow-500">Nghỉ phép</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Quản lý</Badge>;
      case 'staff':
        return <Badge variant="default">Nhân viên</Badge>;
      case 'technician':
        return <Badge className="bg-blue-500">Kỹ thuật</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getCertificationStatus = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-500">Còn hiệu lực</Badge>;
      case 'expired':
        return <Badge variant="destructive">Hết hạn</Badge>;
      case 'expiring':
        return <Badge className="bg-yellow-500">Sắp hết hạn</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(salary);
  };

  const activeEmployees = filteredEmployees.filter(emp => emp.status === 'active');
  const expiringCertifications = employees.filter(emp =>
    emp.certifications.some(cert => cert.status === 'expiring' || cert.status === 'expired')
  );

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Quản lý nhân sự</h1>
            <p className="text-muted-foreground">Quản lý thông tin nhân viên, ca làm việc và chứng chỉ</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhân viên
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="admin">Quản lý</SelectItem>
              <SelectItem value="staff">Nhân viên</SelectItem>
              <SelectItem value="technician">Kỹ thuật</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
              <SelectItem value="on_leave">Nghỉ phép</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Nhân viên ({filteredEmployees.length})</TabsTrigger>
            <TabsTrigger value="shifts">Ca làm việc ({shifts.length})</TabsTrigger>
            <TabsTrigger value="certifications">Chứng chỉ ({expiringCertifications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEmployees.map((employee) => (
                <Card key={employee.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{employee.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          {getRoleBadge(employee.role)}
                          {getStatusBadge(employee.status)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">Vị trí:</span> {employee.position}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Phòng ban:</span> {employee.department}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {employee.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {employee.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {employee.address}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Lương:</span> {formatSalary(employee.salary)}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Ngày vào làm:</span> {new Date(employee.hireDate).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Đánh giá:</span> {employee.performance.rating}/5
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Chỉnh sửa
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shifts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {shifts.map((shift) => (
                <Card key={shift.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{shift.name}</CardTitle>
                    <CardDescription>
                      {shift.startTime} - {shift.endTime}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">Ngày làm việc:</span> {shift.days.join(', ')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Nhân viên hiện tại:</span> {shift.employees.length}/{shift.maxEmployees}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Nhân viên:</span>
                      <ul className="list-disc list-inside mt-1">
                        {shift.employees.map(empId => {
                          const emp = employees.find(e => e.id === empId);
                          return <li key={empId}>{emp?.name || 'Không xác định'}</li>;
                        })}
                      </ul>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Chỉnh sửa
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-4">
            <div className="grid gap-4">
              {expiringCertifications.map((employee) => (
                <Card key={employee.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{employee.name}</CardTitle>
                        <CardDescription>{employee.position}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm font-medium">Chứng chỉ:</div>
                    {employee.certifications.map((cert, idx) => (
                      <div key={idx} className="border rounded p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{cert.name}</span>
                          {getCertificationStatus(cert.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Cấp bởi:</span> {cert.issuedBy}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Hết hạn:</span> {new Date(cert.expiryDate).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Gia hạn
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
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
    </div>
  );
}
