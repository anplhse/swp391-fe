import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Package,
  Star
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ServicePackagesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = { email: 'customer@example.com', role: 'customer', userType: 'customer' };

  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const vehicles = [
    { id: 'vf8', name: 'VinFast VF8', plate: '30A-12345' },
    { id: 'vf9', name: 'VinFast VF9', plate: '29B-67890' },
    { id: 'vfe34', name: 'VinFast VF e34', plate: '51C-11111' }
  ];

  const packages = [
    {
      id: 'basic',
      name: 'Gói Cơ bản',
      price: '15,000,000 VND',
      duration: '12 tháng',
      services: ['Bảo dưỡng định kỳ (4 lần/năm)', 'Kiểm tra pin (2 lần/năm)', 'Cập nhật phần mềm'],
      popular: false,
      savings: '2,000,000 VND'
    },
    {
      id: 'premium',
      name: 'Gói Cao cấp',
      price: '25,000,000 VND',
      duration: '12 tháng',
      services: ['Bảo dưỡng định kỳ (6 lần/năm)', 'Kiểm tra pin (4 lần/năm)', 'Cập nhật phần mềm', 'Kiểm tra an toàn', 'Hỗ trợ khẩn cấp 24/7'],
      popular: true,
      savings: '5,000,000 VND'
    },
    {
      id: 'vip',
      name: 'Gói VIP',
      price: '40,000,000 VND',
      duration: '12 tháng',
      services: ['Bảo dưỡng không giới hạn', 'Kiểm tra pin hàng tháng', 'Cập nhật phần mềm ưu tiên', 'Kiểm tra an toàn', 'Hỗ trợ khẩn cấp 24/7', 'Thay thế linh kiện miễn phí', 'Dịch vụ tận nhà'],
      popular: false,
      savings: '10,000,000 VND'
    }
  ];

  const currentPackages = [
    {
      id: 1,
      name: 'Gói Cao cấp',
      startDate: '2025-01-15',
      endDate: '2026-01-15',
      progress: 65,
      servicesUsed: 4,
      totalServices: 6,
      status: 'active'
    }
  ];

  const handlePurchase = (packageId: string) => {
    if (!selectedVehicleId) {
      toast({ title: 'Chọn xe trước', description: 'Vui lòng chọn xe để gán gói dịch vụ.', variant: 'destructive' });
      return;
    }
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      const paymentItems = [{
        id: pkg.id,
        name: pkg.name,
        type: 'package' as const,
        price: parseInt(pkg.price.replace(/[^\d]/g, '')),
        quantity: 1,
        description: pkg.services.join(', ')
      }];

      navigate('/customer/payment', {
        state: {
          items: paymentItems,
          from: 'packages',
          vehicleId: selectedVehicleId
        }
      });
    }
  };

  const handleRenewal = () => {
    toast({
      title: "Gia hạn gói dịch vụ",
      description: "Chúng tôi sẽ liên hệ để xác nhận gia hạn",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="ml-auto flex items-center gap-3">
          <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
            <SelectTrigger id="vehicle" className="w-56">
              <SelectValue placeholder={vehicles.length ? 'Chọn xe để gán gói' : 'Chưa có xe nào'} />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map(v => (
                <SelectItem key={v.id} value={v.id}>{v.name} • {v.plate}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => navigate('/customer/vehicles')}>Quản lý xe</Button>
        </div>
      </div>

      {/* Current Package */}
      {currentPackages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Gói dịch vụ hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPackages.map((pkg) => (
              <div key={pkg.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(pkg.startDate).toLocaleDateString('vi-VN')} - {new Date(pkg.endDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={pkg.status === 'active' ? 'default' : 'secondary'}>
                      {pkg.status === 'active' ? 'Đang hoạt động' : 'Hết hạn'}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Còn {Math.ceil((new Date(pkg.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} ngày
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Dịch vụ đã sử dụng:</span>
                    <span className="font-medium">{pkg.servicesUsed}/{pkg.totalServices}</span>
                  </div>
                  <Progress value={pkg.progress} className="h-2" />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleRenewal}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Gia hạn gói
                  </Button>
                  <Button variant="outline">
                    <Bell className="w-4 h-4 mr-2" />
                    Nhắc nhở gia hạn
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Packages */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Các gói dịch vụ có sẵn</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={cn(
              "relative transition-all hover:shadow-lg",
              pkg.popular && "border-primary ring-2 ring-primary/20",
              selectedPackage === pkg.id && "border-primary bg-primary/5"
            )}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Phổ biến nhất
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">{pkg.price}</div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm text-muted-foreground">{pkg.duration}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Tiết kiệm {pkg.savings}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {pkg.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={pkg.popular ? "electric" : "outline"}
                  className="w-full"
                  onClick={() => handlePurchase(pkg.id)}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Mua gói này
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Renewal Reminder */}
      <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Bell className="w-5 h-5" />
            Nhắc nhở gia hạn
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-700 dark:text-amber-300">
          <p>Gói dịch vụ của bạn sẽ hết hạn sau 45 ngày. Gia hạn ngay để tiếp tục nhận được dịch vụ tốt nhất!</p>
          <Button variant="outline" className="mt-3 border-amber-300 text-amber-800 hover:bg-amber-100">
            Gia hạn ngay
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}