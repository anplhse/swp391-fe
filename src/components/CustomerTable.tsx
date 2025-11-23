import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Edit, Mail, Phone, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onAdd: () => void;
  showActions?: boolean;
  filters?: ReactNode;
  rightAction?: ReactNode;
}

export function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onAdd,
  showActions = true,
  filters,
  rightAction
}: CustomerTableProps) {
  const filterSchema = z.object({
    search: z.string().optional(),
  });
  type FilterForm = z.infer<typeof filterSchema>;

  const filterForm = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: '' }
  });

  const watchFilters = filterForm.watch();
  const debouncedSearchTerm = useDebounce(watchFilters.search || '', 300);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      !debouncedSearchTerm.trim() ||
      customer.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      customer.phone.includes(debouncedSearchTerm)
    );
  }, [customers, debouncedSearchTerm]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(startIndex, startIndex + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case 'INACTIVE':
      case 'inactive':
        return <Badge variant="secondary">Không hoạt động</Badge>;
      case 'ARCHIVED':
        return <Badge variant="outline">Đã lưu trữ</Badge>;
      default:
        return <Badge variant="secondary">Không rõ</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="flex items-center justify-between">
        <Form {...filterForm}>
          <form className="flex items-center gap-3">
            <FormField
              name="search"
              control={filterForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Tìm kiếm tài khoản..."
                        {...field}
                        className="pl-10 pr-10 w-64"
                      />
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => field.onChange('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            {filters}
          </form>
        </Form>
        {rightAction && <div className="flex items-center gap-3">{rightAction}</div>}
      </div>

      {/* Customers Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Đăng nhập cuối</TableHead>
              {showActions && <TableHead className="text-right">Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy khách hàng nào
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {customer.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {customer.phone}
                    </div>
                  </TableCell>
                  <TableCell>{customer.roleDisplayName || '—'}</TableCell>
                  <TableCell>
                    {getStatusBadge(customer.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.lastLogin ? new Date(customer.lastLogin).toLocaleString('vi-VN') : '—'}
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(customer)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(customer.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
