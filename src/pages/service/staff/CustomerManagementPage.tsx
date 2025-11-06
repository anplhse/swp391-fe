import { CustomerTable } from '@/components/CustomerTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Schema validation - chỉ cho phép cập nhật số điện thoại
const customerSchema = z.object({
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
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
  const { toast } = useToast();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      phone: ''
    }
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const users = await apiClient.getAllUsers();
        if (!mounted) return;
        const mapped: Customer[] = users.map(u => ({
          id: String(u.id),
          name: u.fullName,
          email: u.email,
          phone: u.phoneNumber,
          roleDisplayName: u.roleDisplayName,
          createdAt: u.createdAt,
          lastLogin: u.lastLogin,
          status: (u.status as any) ?? 'ACTIVE'
        }));
        setCustomers(mapped);
      } catch (e) {
        console.error('Failed to load user profiles', e);
      }
    })();
    return () => { mounted = false; };
  }, []);


  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    form.reset({
      phone: customer.phone
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
    if (!editingCustomer) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật tài khoản không tồn tại.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Cập nhật tài khoản - chỉ cho phép cập nhật số điện thoại
      const userId = parseInt(editingCustomer.id);
      if (isNaN(userId)) {
        throw new Error('ID tài khoản không hợp lệ');
      }

      await apiClient.updateUserProfile(userId, {
        phoneNumber: data.phone
      });

      toast({
        title: "Cập nhật thành công",
        description: "Số điện thoại đã được cập nhật."
      });

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
        status: (u.status as any) ?? 'ACTIVE'
      }));
      setCustomers(mapped);

      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to update user profile', error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật số điện thoại. Vui lòng thử lại.",
        variant: "destructive"
      });
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
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
              Trước
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
              Sau
            </Button>
          </div>
        )}
      />

      {/* Edit Customer Dialog - Staff chỉ có quyền chỉnh sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Cập nhật số điện thoại
            </DialogTitle>
            <DialogDescription>
              Chỉ có thể cập nhật số điện thoại. Các thông tin khác không thể thay đổi.
            </DialogDescription>
          </DialogHeader>
          {editingCustomer && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Tên khách hàng</FormLabel>
                  <Input value={editingCustomer.name} disabled readOnly className="bg-muted" />
                </div>
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
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">
                    Cập nhật
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
