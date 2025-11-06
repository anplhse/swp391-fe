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

// Schema validation
const customerSchema = z.object({
  name: z.string().min(1, 'Tên khách hàng là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
  status: z.enum(['active', 'inactive'])
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
      name: '',
      email: '',
      phone: '',
      status: 'active'
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


  const handleAddCustomer = () => {
    setEditingCustomer(null);
    form.reset({
      name: '',
      email: '',
      phone: '',
      status: 'active'
    });
    setIsDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    form.reset({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status
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

  const onSubmit = (data: CustomerFormData) => {
    const customerData: Customer = {
      id: editingCustomer ? editingCustomer.id : (customers.length + 1).toString(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar: editingCustomer?.avatar,
      roleDisplayName: editingCustomer?.roleDisplayName,
      createdAt: editingCustomer?.createdAt || new Date().toISOString(),
      lastLogin: editingCustomer?.lastLogin || null,
      status: data.status
    };

    if (editingCustomer) {
      setCustomers(customers.map(customer =>
        customer.id === editingCustomer.id ? customerData : customer
      ));
      toast({
        title: "Cập nhật khách hàng thành công",
        description: "Thông tin khách hàng đã được cập nhật."
      });
    } else {
      setCustomers([...customers, customerData]);
      toast({
        title: "Thêm khách hàng thành công",
        description: "Khách hàng mới đã được thêm vào hệ thống."
      });
    }

    setIsDialogOpen(false);
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
        rightAction={(
          <div className="flex items-center gap-2">
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
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                Trước
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                Sau
              </Button>
            </div>
          </div>
        )}
      />

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? 'Cập nhật thông tin khách hàng'
                : 'Thêm khách hàng mới vào hệ thống'
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên khách hàng *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên khách hàng" {...field} />
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="inactive">Không hoạt động</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">
                  {editingCustomer ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
