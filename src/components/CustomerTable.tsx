import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Car, Edit, Mail, Phone, Plus, Search, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';

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
  rightAction?: ReactNode;
}

export function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onAdd,
  showActions = true,
  rightAction
}: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Tìm kiếm tài khoản..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          {rightAction}
          {showActions && (
            <Button onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm tài khoản
            </Button>
          )}
        </div>
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
              filteredCustomers.map((customer) => (
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
    </div>
  );
}
