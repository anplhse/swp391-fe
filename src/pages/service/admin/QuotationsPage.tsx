import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Download, Edit, FileText, Plus, Search, Send, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Quotation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleInfo: {
    plate: string;
    brand: string;
    model: string;
    year: number;
  };
  services: {
    id: string;
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  parts: {
    id: string;
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  labor: {
    hours: number;
    rate: number;
    total: number;
  };
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdDate: string;
  validUntil: string;
  sentDate?: string;
  acceptedDate?: string;
  notes?: string;
  terms: string;
}

interface Invoice {
  id: string;
  quotationId: string;
  customerName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Mock data for quotations
    const mockQuotations: Quotation[] = [
      {
        id: 'QUO-001',
        customerName: 'Nguyễn Văn A',
        customerEmail: 'nguyenvana@email.com',
        customerPhone: '0123456789',
        vehicleInfo: {
          plate: '30A-12345',
          brand: 'VinFast',
          model: 'VF8',
          year: 2023
        },
        services: [
          {
            id: '1',
            name: 'Bảo dưỡng định kỳ',
            description: 'Kiểm tra tổng thể xe điện, hệ thống pin, động cơ',
            quantity: 1,
            unitPrice: 500000,
            total: 500000
          }
        ],
        parts: [
          {
            id: '1',
            name: 'Dầu phanh',
            description: 'Dầu phanh chuyên dụng cho xe điện',
            quantity: 2,
            unitPrice: 150000,
            total: 300000
          }
        ],
        labor: {
          hours: 2,
          rate: 200000,
          total: 400000
        },
        subtotal: 1200000,
        tax: 120000,
        discount: 0,
        total: 1320000,
        status: 'sent',
        createdDate: '2024-01-25',
        validUntil: '2024-02-01',
        sentDate: '2024-01-25',
        notes: 'Khách hàng yêu cầu kiểm tra kỹ hệ thống pin',
        terms: 'Thanh toán trong vòng 7 ngày kể từ ngày gửi báo giá'
      },
      {
        id: 'QUO-002',
        customerName: 'Trần Thị B',
        customerEmail: 'tranthib@email.com',
        customerPhone: '0987654321',
        vehicleInfo: {
          plate: '29B-67890',
          brand: 'Tesla',
          model: 'Model 3',
          year: 2022
        },
        services: [
          {
            id: '1',
            name: 'Sửa chữa hệ thống pin',
            description: 'Sửa chữa và thay thế cell pin bị lỗi',
            quantity: 1,
            unitPrice: 1500000,
            total: 1500000
          }
        ],
        parts: [
          {
            id: '1',
            name: 'Cell pin 3.7V',
            description: 'Cell pin lithium-ion 3.7V',
            quantity: 4,
            unitPrice: 500000,
            total: 2000000
          }
        ],
        labor: {
          hours: 3,
          rate: 250000,
          total: 750000
        },
        subtotal: 4250000,
        tax: 425000,
        discount: 100000,
        total: 4575000,
        status: 'accepted',
        createdDate: '2024-01-24',
        validUntil: '2024-01-31',
        sentDate: '2024-01-24',
        acceptedDate: '2024-01-25',
        notes: 'Pin bị lỗi cell, cần thay thế ngay',
        terms: 'Thanh toán 50% trước khi bắt đầu, 50% còn lại khi hoàn thành'
      },
      {
        id: 'QUO-003',
        customerName: 'Lê Văn C',
        customerEmail: 'levanc@email.com',
        customerPhone: '0369852147',
        vehicleInfo: {
          plate: '51C-11111',
          brand: 'BYD',
          model: 'Atto 3',
          year: 2023
        },
        services: [
          {
            id: '1',
            name: 'Kiểm tra hệ thống điện',
            description: 'Kiểm tra toàn bộ hệ thống điện cao áp',
            quantity: 1,
            unitPrice: 300000,
            total: 300000
          }
        ],
        parts: [],
        labor: {
          hours: 1.5,
          rate: 200000,
          total: 300000
        },
        subtotal: 600000,
        tax: 60000,
        discount: 0,
        total: 660000,
        status: 'draft',
        createdDate: '2024-01-26',
        validUntil: '2024-02-02',
        notes: 'Kiểm tra định kỳ',
        terms: 'Thanh toán khi hoàn thành dịch vụ'
      }
    ];

    // Mock data for invoices
    const mockInvoices: Invoice[] = [
      {
        id: 'INV-001',
        quotationId: 'QUO-001',
        customerName: 'Nguyễn Văn A',
        amount: 1320000,
        status: 'sent',
        createdDate: '2024-01-25',
        dueDate: '2024-02-01',
        paymentMethod: 'bank_transfer'
      },
      {
        id: 'INV-002',
        quotationId: 'QUO-002',
        customerName: 'Trần Thị B',
        amount: 4575000,
        status: 'paid',
        createdDate: '2024-01-25',
        dueDate: '2024-02-01',
        paidDate: '2024-01-26',
        paymentMethod: 'credit_card'
      }
    ];

    setQuotations(mockQuotations);
    setInvoices(mockInvoices);
  }, []);

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch =
      quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.vehicleInfo.plate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Nháp</Badge>;
      case 'sent':
        return <Badge className="bg-blue-500">Đã gửi</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">Đã chấp nhận</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Từ chối</Badge>;
      case 'expired':
        return <Badge variant="outline">Hết hạn</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Nháp</Badge>;
      case 'sent':
        return <Badge className="bg-blue-500">Đã gửi</Badge>;
      case 'paid':
        return <Badge className="bg-green-500">Đã thanh toán</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Quá hạn</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const draftQuotations = filteredQuotations.filter(q => q.status === 'draft');
  const sentQuotations = filteredQuotations.filter(q => q.status === 'sent');
  const acceptedQuotations = filteredQuotations.filter(q => q.status === 'accepted');

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Báo giá & hóa đơn</h1>
            <p className="text-muted-foreground">Quản lý báo giá và hóa đơn cho khách hàng</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo báo giá
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm báo giá..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="sent">Đã gửi</SelectItem>
              <SelectItem value="accepted">Đã chấp nhận</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
              <SelectItem value="expired">Hết hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="quotations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="quotations">Báo giá ({filteredQuotations.length})</TabsTrigger>
            <TabsTrigger value="invoices">Hóa đơn ({invoices.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="quotations" className="space-y-4">
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">Tất cả ({filteredQuotations.length})</TabsTrigger>
                <TabsTrigger value="draft">Nháp ({draftQuotations.length})</TabsTrigger>
                <TabsTrigger value="sent">Đã gửi ({sentQuotations.length})</TabsTrigger>
                <TabsTrigger value="accepted">Đã chấp nhận ({acceptedQuotations.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="grid gap-4">
                  {filteredQuotations.map((quotation) => (
                    <Card key={quotation.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">{quotation.id}</CardTitle>
                          </div>
                          {getStatusBadge(quotation.status)}
                        </div>
                        <CardDescription>
                          {quotation.customerName} - {quotation.vehicleInfo.plate}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Khách hàng:</span> {quotation.customerName}
                          </div>
                          <div>
                            <span className="font-medium">SĐT:</span> {quotation.customerPhone}
                          </div>
                          <div>
                            <span className="font-medium">Xe:</span> {quotation.vehicleInfo.brand} {quotation.vehicleInfo.model} ({quotation.vehicleInfo.year})
                          </div>
                          <div>
                            <span className="font-medium">Biển số:</span> {quotation.vehicleInfo.plate}
                          </div>
                          <div>
                            <span className="font-medium">Ngày tạo:</span> {new Date(quotation.createdDate).toLocaleDateString('vi-VN')}
                          </div>
                          <div>
                            <span className="font-medium">Hết hạn:</span> {new Date(quotation.validUntil).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div className="text-2xl font-bold">{formatCurrency(quotation.total)}</div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Dịch vụ:</span> {quotation.services.length} dịch vụ
                          {quotation.parts.length > 0 && `, ${quotation.parts.length} phụ tùng`}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Chỉnh sửa
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Tải xuống
                          </Button>
                          {quotation.status === 'draft' && (
                            <Button size="sm">
                              <Send className="w-4 h-4 mr-1" />
                              Gửi
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="draft" className="space-y-4">
                <div className="grid gap-4">
                  {draftQuotations.map((quotation) => (
                    <Card key={quotation.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">{quotation.id}</CardTitle>
                          </div>
                          {getStatusBadge(quotation.status)}
                        </div>
                        <CardDescription>
                          {quotation.customerName} - {quotation.vehicleInfo.plate}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-2xl font-bold">{formatCurrency(quotation.total)}</div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Chỉnh sửa
                          </Button>
                          <Button size="sm">
                            <Send className="w-4 h-4 mr-1" />
                            Gửi
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Xóa
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="sent" className="space-y-4">
                <div className="grid gap-4">
                  {sentQuotations.map((quotation) => (
                    <Card key={quotation.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">{quotation.id}</CardTitle>
                          </div>
                          {getStatusBadge(quotation.status)}
                        </div>
                        <CardDescription>
                          {quotation.customerName} - {quotation.vehicleInfo.plate}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-2xl font-bold">{formatCurrency(quotation.total)}</div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Gửi lúc:</span> {quotation.sentDate ? new Date(quotation.sentDate).toLocaleString('vi-VN') : 'N/A'}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Tải xuống
                          </Button>
                          <Button variant="outline" size="sm">
                            <Send className="w-4 h-4 mr-1" />
                            Gửi lại
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="accepted" className="space-y-4">
                <div className="grid gap-4">
                  {acceptedQuotations.map((quotation) => (
                    <Card key={quotation.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">{quotation.id}</CardTitle>
                          </div>
                          {getStatusBadge(quotation.status)}
                        </div>
                        <CardDescription>
                          {quotation.customerName} - {quotation.vehicleInfo.plate}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-2xl font-bold">{formatCurrency(quotation.total)}</div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Chấp nhận lúc:</span> {quotation.acceptedDate ? new Date(quotation.acceptedDate).toLocaleString('vi-VN') : 'N/A'}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Tải xuống
                          </Button>
                          <Button size="sm">
                            Tạo hóa đơn
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <div className="grid gap-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{invoice.id}</CardTitle>
                      </div>
                      {getInvoiceStatusBadge(invoice.status)}
                    </div>
                    <CardDescription>
                      {invoice.customerName} - Báo giá: {invoice.quotationId}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-2xl font-bold">{formatCurrency(invoice.amount)}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Ngày tạo:</span> {new Date(invoice.createdDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div>
                        <span className="font-medium">Hạn thanh toán:</span> {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                      </div>
                      {invoice.paidDate && (
                        <div>
                          <span className="font-medium">Thanh toán:</span> {new Date(invoice.paidDate).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                      {invoice.paymentMethod && (
                        <div>
                          <span className="font-medium">Phương thức:</span> {invoice.paymentMethod}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Tải xuống
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="w-4 h-4 mr-1" />
                        Gửi
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Quotation Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Tạo báo giá mới</h2>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Đóng
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Tên khách hàng</Label>
                    <Input id="customerName" placeholder="Nhập tên khách hàng" />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input id="customerEmail" type="email" placeholder="Nhập email" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerPhone">Số điện thoại</Label>
                    <Input id="customerPhone" placeholder="Nhập số điện thoại" />
                  </div>
                  <div>
                    <Label htmlFor="vehiclePlate">Biển số xe</Label>
                    <Input id="vehiclePlate" placeholder="Nhập biển số xe" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="vehicleBrand">Thương hiệu</Label>
                    <Input id="vehicleBrand" placeholder="VinFast, Tesla, BYD..." />
                  </div>
                  <div>
                    <Label htmlFor="vehicleModel">Mẫu xe</Label>
                    <Input id="vehicleModel" placeholder="VF8, Model 3, Atto 3..." />
                  </div>
                  <div>
                    <Label htmlFor="vehicleYear">Năm sản xuất</Label>
                    <Input id="vehicleYear" type="number" placeholder="2023" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea id="notes" placeholder="Nhập ghi chú cho báo giá..." />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button>
                    <Plus className="w-4 h-4 mr-1" />
                    Tạo báo giá
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
