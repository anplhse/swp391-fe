import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  Filter,
  History,
  MapPin,
  Search,
  Wrench
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ServiceHistoryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = { email: 'customer@example.com', role: 'customer', userType: 'customer' };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const serviceHistory = [
    {
      id: 'SV2025001',
      service: 'Bảo dưỡng định kỳ',
      date: '2025-08-20',
      center: 'Trung tâm bảo dưỡng Hà Nội',
      technician: 'Nguyễn Văn A',
      status: 'completed',
      cost: '2,500,000 VND',
      vehicle: 'VinFast VF8 - 30A-123.45',
      details: {
        checkIn: '08:00',
        checkOut: '11:30',
        services: ['Kiểm tra pin', 'Thay dầu phanh', 'Cập nhật phần mềm'],
        notes: 'Xe trong tình trạng tốt, đã thay dầu phanh theo lịch định kỳ'
      }
    },
    {
      id: 'SV2025002',
      service: 'Thay lốp xe',
      date: '2025-07-10',
      center: 'Trung tâm bảo dưỡng TP.HCM',
      technician: 'Trần Văn B',
      status: 'completed',
      cost: '1,800,000 VND',
      vehicle: 'VinFast VF8 - 30A-123.45',
      details: {
        checkIn: '14:00',
        checkOut: '15:45',
        services: ['Thay 4 lốp xe mới', 'Cân bằng lốp'],
        notes: 'Lốp cũ đã mòn 80%, được thay mới hoàn toàn'
      }
    },
    {
      id: 'SV2025003',
      service: 'Kiểm tra pin',
      date: '2025-09-25',
      center: 'Trung tâm bảo dưỡng Hà Nội',
      technician: 'Lê Văn C',
      status: 'in_progress',
      cost: '1,200,000 VND',
      vehicle: 'VinFast VF8 - 30A-123.45',
      details: {
        checkIn: '09:00',
        checkOut: null,
        services: ['Kiểm tra dung lượng pin', 'Chẩn đoán hệ thống sạc'],
        notes: 'Đang tiến hành kiểm tra chi tiết hệ thống pin'
      }
    },
    {
      id: 'SV2025004',
      service: 'Cập nhật phần mềm',
      date: '2025-09-30',
      center: 'Trung tâm bảo dưỡng Đà Nẵng',
      technician: 'Chưa phân công',
      status: 'pending',
      cost: '500,000 VND',
      vehicle: 'VinFast VF8 - 30A-123.45',
      details: {
        checkIn: null,
        checkOut: null,
        services: ['Cập nhật firmware mới nhất'],
        notes: 'Lịch hẹn đã được xác nhận, chờ ngày thực hiện'
      }
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" />Hoàn thành</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Đang bảo dưỡng</Badge>;
      case 'pending':
        return <Badge variant="outline" className="gap-1"><AlertCircle className="w-3 h-3" />Chờ thực hiện</Badge>;
      default:
        return null;
    }
  };

  const filteredHistory = serviceHistory.filter(item => {
    const matchesSearch = item.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCost = serviceHistory
    .filter(item => item.status === 'completed')
    .reduce((sum, item) => sum + parseInt(item.cost.replace(/[^\d]/g, '')), 0);

  const handleViewDetails = (serviceId: string) => {
    toast({
      title: "Chi tiết dịch vụ",
      description: `Xem chi tiết dịch vụ ${serviceId}`,
    });
  };

  const handleDownloadInvoice = (serviceId: string) => {
    toast({
      title: "Tải hóa đơn",
      description: `Đang tải hóa đơn ${serviceId}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4"></div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{serviceHistory.filter(s => s.status === 'completed').length}</p>
                <p className="text-sm text-muted-foreground">Dịch vụ hoàn thành</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCost.toLocaleString('vi-VN')} VND</p>
                <p className="text-sm text-muted-foreground">Tổng chi phí</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{serviceHistory.filter(s => s.status !== 'completed').length}</p>
                <p className="text-sm text-muted-foreground">Đang xử lý</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên dịch vụ hoặc mã..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="in_progress">Đang bảo dưỡng</SelectItem>
                <SelectItem value="pending">Chờ thực hiện</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Service History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Lịch sử dịch vụ
          </CardTitle>
          <CardDescription>
            Danh sách các dịch vụ đã sử dụng và đang thực hiện
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredHistory.map((service) => (
              <div key={service.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{service.service}</h3>
                      {getStatusBadge(service.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">Mã: {service.id}</p>
                    <p className="text-sm text-muted-foreground">{service.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{service.cost}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(service.date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{service.center}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-muted-foreground" />
                    <span>KTV: {service.technician}</span>
                  </div>
                </div>

                {service.details.checkIn && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Nhận xe: {service.details.checkIn}</span>
                    </div>
                    {service.details.checkOut && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Trả xe: {service.details.checkOut}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(service.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Chi tiết
                  </Button>
                  {service.status === 'completed' && (
                    <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(service.id)}>
                      <Download className="w-4 h-4 mr-2" />
                      Tải hóa đơn
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Không tìm thấy lịch sử dịch vụ nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}