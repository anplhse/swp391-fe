import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  Package,
  Shield,
  Smartphone,
  Wrench
} from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface PaymentItem {
  id: string;
  name: string;
  type: 'service' | 'package' | 'maintenance';
  price: number;
  quantity: number;
  description: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank' | 'wallet';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  fee: number;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const user = { email: 'customer@example.com', role: 'customer', userType: 'customer' };

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data - in real app, this would come from location state or API
  const paymentItems: PaymentItem[] = location.state?.items || [
    {
      id: '1',
      name: 'Bảo dưỡng định kỳ',
      type: 'service',
      price: 2500000,
      quantity: 1,
      description: 'Kiểm tra tổng quát hệ thống xe điện'
    },
    {
      id: '2',
      name: 'Gói Cao cấp',
      type: 'package',
      price: 25000000,
      quantity: 1,
      description: 'Gói dịch vụ bảo dưỡng 12 tháng'
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'visa',
      name: 'Thẻ Visa/Mastercard',
      type: 'card',
      icon: CreditCard,
      description: 'Thanh toán bằng thẻ tín dụng/ghi nợ',
      fee: 0
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      type: 'wallet',
      icon: Smartphone,
      description: 'Thanh toán qua ví điện tử MoMo',
      fee: 0
    },
    {
      id: 'bank',
      name: 'Chuyển khoản ngân hàng',
      type: 'bank',
      icon: Building2,
      description: 'Chuyển khoản qua ngân hàng',
      fee: 0
    }
  ];

  const subtotal = paymentItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod);
  const fee = selectedMethod?.fee || 0;
  const total = subtotal + fee;

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Chưa chọn phương thức thanh toán",
        description: "Vui lòng chọn phương thức thanh toán",
        variant: "destructive"
      });
      return;
    }

    if (selectedPaymentMethod === 'visa' && (!cardNumber || !expiryDate || !cvv || !cardholderName)) {
      toast({
        title: "Thông tin thẻ chưa đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin thẻ",
        variant: "destructive"
      });
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: "Chưa đồng ý điều khoản",
        description: "Vui lòng đồng ý với điều khoản sử dụng",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Thanh toán thành công!",
        description: "Đơn hàng của bạn đã được xử lý",
      });
      // If purchase originated from packages, attach package to the selected vehicle
      if (location.state?.from === 'packages' && location.state?.items?.length) {
        const vehicleId: string | undefined = location.state?.vehicleId;
        // In real app, this would save to API
        console.log('Payment completed for vehicle:', vehicleId);
      }
      navigate('/customer/vehicles');
    }, 3000);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'service':
        return <Wrench className="w-5 h-5" />;
      case 'package':
        return <Package className="w-5 h-5" />;
      case 'maintenance':
        return <Car className="w-5 h-5" />;
      default:
        return <Wrench className="w-5 h-5" />;
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <DashboardLayout title="" user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Form */}
          <div className="space-y-6">
            {/* Payment Items */}
            <Card>
              <CardHeader>
                <CardTitle>Đơn hàng</CardTitle>
                <CardDescription>Chi tiết các dịch vụ và gói đã chọn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                        {getItemIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm">Số lượng: {item.quantity}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.type === 'service' ? 'Dịch vụ' :
                              item.type === 'package' ? 'Gói' : 'Bảo dưỡng'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{(item.price * item.quantity).toLocaleString('vi-VN')} VND</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Phương thức thanh toán</CardTitle>
                <CardDescription>Chọn cách thức thanh toán phù hợp</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const IconComponent = method.icon;
                      return (
                        <div key={method.id} className="flex items-center space-x-3">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                              <IconComponent className="w-5 h-5" />
                              <div className="flex-1">
                                <h3 className="font-medium">{method.name}</h3>
                                <p className="text-sm text-muted-foreground">{method.description}</p>
                              </div>
                              {method.fee === 0 && (
                                <Badge variant="secondary" className="text-xs">Miễn phí</Badge>
                              )}
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Card Details */}
            {selectedPaymentMethod === 'visa' && (
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin thẻ</CardTitle>
                  <CardDescription>Nhập thông tin thẻ tín dụng/ghi nợ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Số thẻ</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Ngày hết hạn</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Tên chủ thẻ</Label>
                    <Input
                      id="cardholderName"
                      placeholder="NGUYEN VAN A"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Terms and Conditions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    Tôi đồng ý với{' '}
                    <a href="#" className="text-primary hover:underline">
                      Điều khoản sử dụng
                    </a>{' '}
                    và{' '}
                    <a href="#" className="text-primary hover:underline">
                      Chính sách bảo mật
                    </a>{' '}
                    của EV Service Center
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {paymentItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>{(item.price * item.quantity).toLocaleString('vi-VN')} VND</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính:</span>
                    <span>{subtotal.toLocaleString('vi-VN')} VND</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Phí thanh toán:</span>
                    <span>{fee.toLocaleString('vi-VN')} VND</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng cộng:</span>
                    <span>{total.toLocaleString('vi-VN')} VND</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing || !selectedPaymentMethod || !agreeToTerms}
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Thanh toán {total.toLocaleString('vi-VN')} VND
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Thanh toán được bảo mật và mã hóa</span>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Bảo mật thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Mã hóa SSL 256-bit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Tuân thủ tiêu chuẩn PCI DSS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Không lưu trữ thông tin thẻ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Hỗ trợ hoàn tiền 100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
