import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

  // Check if redirected back with success parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast.success('EV Service Center', {
        description: 'Cảm ơn bạn đã liên hệ! Chúng tôi đã nhận được thông tin và sẽ phản hồi sớm nhất.',
        duration: 5000,
      });
      // Remove success parameter from URL
      window.history.replaceState({}, '', '/contact');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

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

        // Reset form
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
    <div className="min-h-screen text-foreground relative overflow-x-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(-45deg, hsl(14, 100%, 68%), hsl(26, 100%, 74%), hsl(16, 100%, 78%), hsl(24, 100%, 83%))',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      `}</style>

      {/* Header */}
      <header className="w-full bg-white relative z-30 rounded-b-3xl shadow-xl pt-4 pb-4">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 relative z-30 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-2 rounded-2xl shadow-lg border border-gray-200"
            style={{
              boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span className="font-sans font-semibold text-gray-800">VinFast Service Workshop</span>
          </div>
          <div className="flex items-center gap-3 relative z-30">
            <Button
              onClick={() => navigate('/login')}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-14 relative z-20">
        <h1 className="text-3xl md:text-4xl font-sans font-bold mb-4 text-center text-gray-900"
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          CHÚNG TÔI CÓ THỂ GIÚP GÌ CHO BẠN?
        </h1>
        <p className="text-center text-gray-700 mb-12 text-lg">
          Luôn sẵn sàng tiếp nhận các yêu cầu từ trợ giúp và giải đáp mọi thắc mắc từ Khách hàng.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Contact Methods */}
          <div className="space-y-4">
            <div className="bg-card border border-gray-200 rounded-2xl p-6 shadow-2xl">
              <p className="text-gray-700 font-sans font-medium mb-6">
                Những câu hỏi vẫn chưa giải đáp được thắc mắc của bạn?
              </p>
              <h3 className="text-xl font-sans font-bold mb-6 text-gray-900">LIÊN HỆ NGAY VỚI CHÚNG TÔI!</h3>

              {/* Zalo Button */}
              <a
                href="https://zalo.me/0396727248"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-sans font-semibold py-4 px-6 rounded-xl mb-4 flex items-center justify-between shadow-lg hover:shadow-2xl transition-smooth"
              >
                <span>Nhắn tin qua Zalo</span>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">Z</span>
                </div>
              </a>

              {/* Hotline Button */}
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-sans font-semibold py-4 px-6 rounded-xl mb-4 flex items-center justify-between shadow-lg hover:shadow-2xl transition-smooth">
                <div>
                  <div>Gọi ngay hotline</div>
                  <div className="text-sm">0396727248</div>
                </div>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600">📞</span>
                </div>
              </button>

              {/* Messenger Button */}
              <a
                href="https://m.me/tran.tuan.895160"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-sans font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transition-smooth flex items-center justify-between"
              >
                <span>Nhắn tin qua Messenger</span>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-600">💬</span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200">
            <form
              className="space-y-4"
              onSubmit={handleSubmit}
            >
              <div>
                <Input
                  name="Họ tên"
                  placeholder="Họ và tên của bạn"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
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
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <Input
                  name="Số điện thoại"
                  placeholder="Số điện thoại của bạn"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <select
                  name="Dịch vụ"
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-md px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
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
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-none"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-sans font-bold py-3 rounded-xl shadow-lg hover:shadow-2xl transition-smooth"
              >
                GỬI NGAY CHO CHÚNG TÔI
              </Button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-sans font-bold text-center mb-8 text-gray-900"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            CÂU HỎI THƯỜNG GẶP
          </h2>
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: 'Làm thế nào để đặt lịch bảo dưỡng xe điện?', a: 'Bạn có thể đặt lịch trực tuyến qua website, gọi hotline, hoặc nhắn tin qua Zalo/Messenger. Hệ thống sẽ tự động nhắc lịch bảo dưỡng định kỳ mỗi 10.000 km hoặc 6 tháng.' },
                { q: 'Trung tâm có kiểm tra sức khỏe pin (SoH) không?', a: 'Có, chúng tôi cung cấp dịch vụ kiểm tra sức khỏe pin chuyên sâu với thiết bị hiện đại. Bạn sẽ nhận được báo cáo chi tiết về tình trạng pin và khuyến nghị bảo dưỡng.' },
                { q: 'Thời gian bảo dưỡng một xe điện mất bao lâu?', a: 'Bảo dưỡng định kỳ thường mất từ 1-2 giờ. Đối với sửa chữa phức tạp hơn, chúng tôi sẽ thông báo thời gian cụ thể và bạn có thể theo dõi tiến độ theo thời gian thực qua app.' },
                { q: 'Có cần đặt cọc khi đặt lịch không?', a: 'Không cần đặt cọc trước. Bạn chỉ thanh toán sau khi hoàn tất dịch vụ và hài lòng với chất lượng.' },
                { q: 'Trung tâm có cung cấp xe thay thế trong thời gian sửa chữa không?', a: 'Có, đối với các trường hợp sửa chữa lâu (trên 1 ngày), chúng tôi cung cấp dịch vụ xe thay thế để bạn không bị gián đoạn công việc và sinh hoạt.' }
              ].map((faq, i) => (
                <AccordionItem key={i} value={`item-${i + 1}`}>
                  <AccordionTrigger className="text-left font-sans font-semibold text-gray-900">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>
    </div>
  );
}


