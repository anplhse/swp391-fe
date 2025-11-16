import { CustomerTable } from '@/components/CustomerTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { showApiErrorToast, showApiResponseToast } from '@/lib/responseHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Schema validation - cho phép cập nhật tên và số điện thoại, hoặc tạo mới với email, role và password
const customerSchema = z.object({
  fullName: z.string().min(1, 'Tên khách hàng là bắt buộc'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  roleDisplayName: z.string().min(1, 'Vai trò là bắt buộc').optional().or(z.literal('')),
  password: z.string().min(1, 'Mật khẩu là bắt buộc').optional().or(z.literal('')),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  roleDisplayName?: string;
  createdAt?: string;
  lastLogin?: string | null;
  status: 'active' | 'inactive' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      roleDisplayName: '',
      password: ''
    }
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [users, roles] = await Promise.all([
          apiClient.getAllUsers(),
          apiClient.getUserProfileRoles()
        ]);
        if (!mounted) return;
        const mapped: Customer[] = users.map(u => ({
          id: String(u.id),
          name: u.fullName,
          email: u.email,
          phone: u.phoneNumber,
          roleDisplayName: u.roleDisplayName,
          createdAt: u.createdAt,
          lastLogin: u.lastLogin,
          status: (u.status as Customer['status']) ?? 'ACTIVE'
        }));
        setCustomers(mapped);
        setAvailableRoles(roles.enumValue || []);
      } catch (e) {
        console.error('Failed to load user profiles or roles', e);
      }
    })();
    return () => { mounted = false; };
  }, []);


  const handleAddCustomer = () => {
    setEditingCustomer(null);
    form.reset({
      fullName: '',
      phone: '',
      email: '',
      roleDisplayName: '',
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    form.reset({
      fullName: customer.name,
      phone: customer.phone,
      email: '',
      roleDisplayName: ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers(customers.filter(customer => customer.id !== customerId));
    toast({
      title: "Xóa khách hàng thành công",
      description: "Khách hàng đã được xóa khỏi hệ thống."
    });
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (editingCustomer) {
        // Cập nhật tài khoản - cho phép cập nhật tên và số điện thoại
        const userId = parseInt(editingCustomer.id);
        if (isNaN(userId)) {
          throw new Error('ID tài khoản không hợp lệ');
        }

        const response = await apiClient.updateUserProfile(userId, {
          fullName: data.fullName,
          phoneNumber: data.phone
        });

        showApiResponseToast(response, toast, "Thông tin khách hàng đã được cập nhật.");
      } else {
        // Tạo tài khoản mới
        if (!data.email || !data.roleDisplayName || !data.password) {
          toast({
            title: "Lỗi",
            description: "Email, vai trò và mật khẩu là bắt buộc khi tạo tài khoản mới.",
            variant: "destructive"
          });
          return;
        }

        const response = await apiClient.createUserProfile({
          email: data.email,
          fullName: data.fullName,
          phoneNumber: data.phone,
          roleDisplayName: data.roleDisplayName,
          password: data.password
        });

        showApiResponseToast(response, toast, "Tài khoản mới đã được tạo.");
      }

      // Reload danh sách để lấy dữ liệu mới nhất
      const users = await apiClient.getAllUsers();
      const mapped: Customer[] = users.map(u => ({
        id: String(u.id),
        name: u.fullName,
        email: u.email,
        phone: u.phoneNumber,
        roleDisplayName: u.roleDisplayName,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        status: (u.status as Customer['status']) ?? 'ACTIVE'
      }));
      setCustomers(mapped);

      setIsDialogOpen(false);
    } catch (error: unknown) {
      console.error('Failed to update user profile', error);
      showApiErrorToast(error, toast, "Không thể cập nhật thông tin. Vui lòng thử lại.");
    }
  };


  // Derived lists for filters and pagination
  const uniqueRoles = Array.from(new Set(customers.map(c => c.roleDisplayName).filter(Boolean))) as string[];
  const filtered = customers.filter(c =>
    (roleFilter !== 'ALL' ? c.roleDisplayName === roleFilter : true) &&
    (statusFilter !== 'ALL' ? String(c.status) === statusFilter : true)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  return (
    <div className="space-y-6">
      <CustomerTable
        customers={pageItems}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
        onAdd={handleAddCustomer}
        showActions={true}
        filters={(
          <>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                {uniqueRoles.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
        rightAction={(
          <div className="flex items-center gap-2">
            <Button onClick={handleAddCustomer}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm tài khoản
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
              Trước
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
              Sau
            </Button>
          </div>
        )}
      />

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Cập nhật thông tin khách hàng' : 'Thêm tài khoản mới'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? 'Có thể cập nhật tên và số điện thoại. Email và vai trò không thể thay đổi.'
                : 'Tạo tài khoản mới cho khách hàng hoặc kỹ thuật viên.'
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
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
              {editingCustomer ? (
                <>
                  <div className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <Input value={editingCustomer.email} disabled readOnly className="bg-muted" />
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
                    <Input value={editingCustomer.roleDisplayName || ''} disabled readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Trạng thái</FormLabel>
                    <Input value={editingCustomer.status} disabled readOnly className="bg-muted" />
                  </div>
                </>
              ) : (
                <>
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
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Nhập mật khẩu" {...field} />
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
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
                  {editingCustomer ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
