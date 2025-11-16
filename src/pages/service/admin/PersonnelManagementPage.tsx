import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { showApiErrorToast, showApiResponseToast } from '@/lib/responseHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, Phone, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Schema validation
const employeeSchema = z.object({
  name: z.string().min(1, 'Tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
  roleDisplayName: z.string().min(1, 'Vai trò là bắt buộc'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'admin' | 'staff' | 'technician';
  roleDisplayName?: string;
  department?: string;
  position?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  hireDate?: string;
  salary?: number;
  workingHours?: {
    start: string;
    end: string;
    days: string[];
  };
  certifications?: {
    name: string;
    issuedBy: string;
    expiryDate: string;
    status: 'valid' | 'expired' | 'expiring';
  }[];
  performance?: {
    rating: number;
    completedTasks: number;
    customerRating: number;
    lastReview: string;
  };
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt?: string;
  lastLogin?: string | null;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      roleDisplayName: ''
    }
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const users = await apiClient.getAllUsers();
        if (!mounted) return;
        // Lọc chỉ lấy staff, technician, admin (không lấy customer)
        const staffUsers = users.filter(u =>
          u.roleDisplayName === 'Nhân viên' ||
          u.roleDisplayName === 'Kỹ thuật viên' ||
          u.roleDisplayName === 'Quản trị viên'
        );
        const mapped: Employee[] = staffUsers.map(u => ({
          id: String(u.id),
          name: u.fullName,
          email: u.email,
          phone: u.phoneNumber,
          roleDisplayName: u.roleDisplayName,
          role: u.roleDisplayName === 'Quản trị viên' ? 'admin' :
            u.roleDisplayName === 'Kỹ thuật viên' ? 'technician' : 'staff',
          status: (u.status as Employee['status']) ?? 'ACTIVE',
          createdAt: u.createdAt,
          lastLogin: u.lastLogin
        }));
        setEmployees(mapped);
      } catch (e) {
        console.error('Failed to load employees', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    form.reset({
      name: '',
      email: '',
      phone: '',
      roleDisplayName: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    form.reset({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      roleDisplayName: employee.roleDisplayName || ''
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (editingEmployee) {
        // Cập nhật tài khoản - cho phép cập nhật tên và số điện thoại
        const userId = parseInt(editingEmployee.id);
        if (isNaN(userId)) {
          throw new Error('ID tài khoản không hợp lệ');
        }

        await apiClient.updateUserProfile(userId, {
          fullName: data.name,
          phoneNumber: data.phone
        });

        toast({
          title: "Cập nhật thành công",
          description: "Thông tin nhân viên đã được cập nhật."
        });
      } else {
        // Thêm tài khoản mới cho staff/technician
        // Generate secure random password (user will need to reset password on first login)
        // Password format: 12 lowercase + 4 uppercase + 2 numbers + 2 special chars = 20 chars
        const generateSecurePassword = (): string => {
          const lowercase = 'abcdefghijklmnopqrstuvwxyz';
          const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          const numbers = '0123456789';
          const special = '!@#$%^&*';

          const getRandomChar = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

          let password = '';
          // Add 12 lowercase
          for (let i = 0; i < 12; i++) {
            password += getRandomChar(lowercase);
          }
          // Add 4 uppercase
          for (let i = 0; i < 4; i++) {
            password += getRandomChar(uppercase);
          }
          // Add 2 numbers
          for (let i = 0; i < 2; i++) {
            password += getRandomChar(numbers);
          }
          // Add 2 special chars
          for (let i = 0; i < 2; i++) {
            password += getRandomChar(special);
          }

          // Shuffle the password
          return password.split('').sort(() => Math.random() - 0.5).join('');
        };

        const randomPassword = generateSecurePassword();

        await apiClient.createUserProfile({
          email: data.email,
          fullName: data.name,
          phoneNumber: data.phone,
          roleDisplayName: data.roleDisplayName,
          password: randomPassword
        });

        toast({
          title: "Thêm nhân viên thành công",
          description: "Tài khoản mới đã được thêm vào hệ thống."
        });
      }

      // Reload danh sách
      const users = await apiClient.getAllUsers();
      const staffUsers = users.filter(u =>
        u.roleDisplayName === 'Nhân viên' ||
        u.roleDisplayName === 'Kỹ thuật viên' ||
        u.roleDisplayName === 'Quản trị viên'
      );
      const mapped: Employee[] = staffUsers.map(u => ({
        id: String(u.id),
        name: u.fullName,
        email: u.email,
        phone: u.phoneNumber,
        roleDisplayName: u.roleDisplayName,
        role: u.roleDisplayName === 'Quản trị viên' ? 'admin' :
          u.roleDisplayName === 'Kỹ thuật viên' ? 'technician' : 'staff',
        status: (u.status as Employee['status']) ?? 'ACTIVE',
        createdAt: u.createdAt,
        lastLogin: u.lastLogin
      }));
      setEmployees(mapped);

      setIsDialogOpen(false);
    } catch (error: unknown) {
      console.error('Failed to save employee', error);
      showApiErrorToast(error, toast, editingEmployee ? "Không thể cập nhật thông tin. Vui lòng thử lại." : "Không thể thêm nhân viên. Vui lòng thử lại.");
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.includes(searchTerm);

    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || String(employee.status).toLowerCase() === statusFilter;

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

  const activeEmployees = filteredEmployees.filter(emp => emp.status === 'active' || emp.status === 'ACTIVE');
  const expiringCertifications = employees.filter(emp =>
    emp.certifications && emp.certifications.some(cert => cert.status === 'expiring' || cert.status === 'expired')
  );

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Quản lý nhân sự</h1>
            <p className="text-muted-foreground">Quản lý thông tin nhân viên, ca làm việc và chứng chỉ</p>
          </div>
          <Button onClick={handleAddEmployee}>
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
                    {employee.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {employee.address}
                      </div>
                    )}
                    {employee.salary && (
                      <div className="text-sm">
                        <span className="font-medium">Lương:</span> {formatSalary(employee.salary)}
                      </div>
                    )}
                    {employee.hireDate && (
                      <div className="text-sm">
                        <span className="font-medium">Ngày vào làm:</span> {new Date(employee.hireDate).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                    {employee.performance?.rating && (
                      <div className="text-sm">
                        <span className="font-medium">Đánh giá:</span> {employee.performance.rating}/5
                      </div>
                    )}
                    {employee.createdAt && (
                      <div className="text-sm">
                        <span className="font-medium">Ngày tạo:</span> {new Date(employee.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditEmployee(employee)}>
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
                    {employee.certifications && employee.certifications.map((cert, idx) => (
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

      {/* Add/Edit Employee Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Cập nhật thông tin nhân viên' : 'Thêm nhân viên mới'}
            </DialogTitle>
            <DialogDescription>
              {editingEmployee
                ? 'Có thể cập nhật tên và số điện thoại. Email và vai trò không thể thay đổi.'
                : 'Thêm nhân viên mới vào hệ thống'
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {editingEmployee ? (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên nhân viên" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <Input value={editingEmployee.email} disabled readOnly className="bg-muted" />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số điện thoại" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <FormLabel>Vai trò</FormLabel>
                    <Input value={editingEmployee.roleDisplayName || ''} disabled readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Trạng thái</FormLabel>
                    <Input value={String(editingEmployee.status)} disabled readOnly className="bg-muted" />
                  </div>
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Nhập email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số điện thoại" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="roleDisplayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vai trò *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Nhân viên">Nhân viên</SelectItem>
                            <SelectItem value="Kỹ thuật viên">Kỹ thuật viên</SelectItem>
                            <SelectItem value="Quản trị viên">Quản trị viên</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">
                  {editingEmployee ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
