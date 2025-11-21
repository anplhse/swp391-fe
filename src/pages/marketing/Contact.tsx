import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast.success('EV Service Center', {
        description: 'Cảm ơn bạn đã liên hệ! Chúng tôi đã nhận được thông tin và sẽ phản hồi sớm nhất.',
        duration: 5000,
      });
      window.history.replaceState({}, '', '/contact');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    toast.info('EV Service Center', {
      description: 'Đang gửi thông tin... Vui lòng đợi trong giây lát.',
      duration: 3000,
    });

    try {
      const response = await fetch('https://formsubmit.co/ajax/dengocrong123@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          'Họ tên': formData.name,
          'Email': formData.email,
          'Số điện thoại': formData.phone,
          'Dịch vụ': formData.service,
          'Yêu cầu': formData.message,
        })
      });

      if (response.ok) {
        toast.success('EV Service Center', {
          description: 'Cảm ơn bạn đã liên hệ! Chúng tôi đã nhận được thông tin và sẽ phản hồi sớm nhất.',
          duration: 5000,
        });

        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          message: ''
        });
      } else {
        throw new Error('Gửi thất bại');
      }
    } catch (error) {
      toast.error('EV Service Center', {
        description: 'Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ trực tiếp qua Zalo: 0396727248',
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="w-full border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-secondary px-4 py-2 rounded-2xl shadow-lg border">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span className="font-semibold text-foreground">VinFast Service Workshop</span>
          </div>
          <div className="flex items-center gap-3 relative z-30">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="font-semibold px-6 py-2 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105"
            >
              Trang chủ
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-14">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            CHÚNG TÔI CÓ THỂ GIÚP GÌ CHO BẠN?
          </h1>
          <p className="text-muted-foreground text-lg">
            Luôn sẵn sàng tiếp nhận các yêu cầu từ trợ giúp và giải đáp mọi thắc mắc từ Khách hàng.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Contact Methods */}
          <div className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardDescription>
                  Những câu hỏi vẫn chưa giải đáp được thắc mắc của bạn?
                </CardDescription>
                <CardTitle>LIÊN HỆ NGAY VỚI CHÚNG TÔI!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Zalo Button */}
                <Button
                  asChild
                  className="w-full"
                  size="lg"
                >
                  <a
                    href="https://zalo.me/0396727248"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between"
                  >
                    <span>Nhắn tin qua Zalo</span>
                    <span className="text-xl">📱</span>
                  </a>
                </Button>

                {/* Hotline Button */}
                <Button
                  variant="secondary"
                  className="w-full"
                  size="lg"
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div>Gọi ngay hotline</div>
                      <div className="text-sm">0396727248</div>
                    </div>
                    <span className="text-xl">📞</span>
                  </div>
                </Button>

                {/* Messenger Button */}
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <a
                    href="https://m.me/tran.tuan.895160"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between"
                  >
                    <span>Nhắn tin qua Messenger</span>
                    <span className="text-xl">💬</span>
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Contact Form */}
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Input
                    name="Họ tên"
                    placeholder="Họ và tên của bạn"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Input
                    name="Email"
                    placeholder="Email của bạn"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    name="Số điện thoại"
                    placeholder="Số điện thoại của bạn"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <select
                    name="Dịch vụ"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  >
                    <option value="">—Vui lòng chọn—</option>
                    <option value="Dịch vụ sửa chữa">Dịch vụ sửa chữa</option>
                    <option value="Bảo dưỡng định kỳ">Bảo dưỡng định kỳ</option>
                    <option value="Linh kiện phụ tùng">Linh kiện phụ tùng</option>
                    <option value="Tư vấn">Tư vấn</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <Textarea
                    name="Yêu cầu"
                    placeholder="Yêu cầu của bạn (Nếu có)..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="resize-none"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  GỬI NGAY CHO CHÚNG TÔI
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            CÂU HỎI THƯỜNG GẶP
          </h2>
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {[
                  { q: 'Làm thế nào để đặt lịch bảo dưỡng xe điện?', a: 'Bạn có thể đặt lịch trực tuyến qua website, gọi hotline, hoặc nhắn tin qua Zalo/Messenger. Hệ thống sẽ tự động nhắc lịch bảo dưỡng định kỳ mỗi 10.000 km hoặc 6 tháng.' },
                  { q: 'Trung tâm có kiểm tra sức khỏe pin (SoH) không?', a: 'Có, chúng tôi cung cấp dịch vụ kiểm tra sức khỏe pin chuyên sâu với thiết bị hiện đại. Bạn sẽ nhận được báo cáo chi tiết về tình trạng pin và khuyến nghị bảo dưỡng.' },
                  { q: 'Thời gian bảo dưỡng một xe điện mất bao lâu?', a: 'Bảo dưỡng định kỳ thường mất từ 1-2 giờ. Đối với sửa chữa phức tạp hơn, chúng tôi sẽ thông báo thời gian cụ thể và bạn có thể theo dõi tiến độ theo thời gian thực qua app.' },
                  { q: 'Có cần đặt cọc khi đặt lịch không?', a: 'Không cần đặt cọc trước. Bạn chỉ thanh toán sau khi hoàn tất dịch vụ và hài lòng với chất lượng.' },
                  { q: 'Trung tâm có cung cấp xe thay thế trong thời gian sửa chữa không?', a: 'Có, đối với các trường hợp sửa chữa lâu (trên 1 ngày), chúng tôi cung cấp dịch vụ xe thay thế để bạn không bị gián đoạn công việc và sinh hoạt.' }
                ].map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i + 1}`}>
                    <AccordionTrigger className="text-left font-semibold">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
