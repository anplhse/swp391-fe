import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!",
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Lỗi đăng xuất",
        description: "Có lỗi xảy ra khi đăng xuất",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header (giống trang gốc) */}
      <header className="w-full border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-2 rounded-2xl shadow-lg border border-orange-200">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span className="font-sans font-semibold text-gray-800">VinFast Service Workshop</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate('/customer')} className="hover:text-foreground">Trang chủ</button>
            <button onClick={() => navigate('/customer/vehicles')} className="hover:text-foreground">Xe của tôi</button>
            <button onClick={() => navigate('/customer/bookings')} className="hover:text-foreground">Lịch hẹn</button>
            <button onClick={() => navigate('/customer/booking')} className="hover:text-foreground">Đặt lịch</button>
          </nav>
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:block text-sm">
                <span className="font-semibold text-foreground">{user.fullName}</span>
              </div>
            )}
            <Button variant="outline" className="px-4" onClick={handleLogout}>Đăng xuất</Button>
          </div>
        </div>
      </header>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-6 md:pt-8">
        <img
          src="/a.jpg"
          alt="Hình minh họa trung tâm dịch vụ"
          className="w-full h-[42vh] md:h-[65vh] object-cover rounded-xl border bg-card shadow"
          width="1280"
          height="720"
          loading="lazy"
        />
      </section>

      {/* Services */}
      <section id="features" className="bg-muted/30">
        <div className="mx-auto max-w-[90rem] px-4 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-sans font-semibold text-center mb-10">Dịch vụ nổi bật</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-8">
            <div className="rounded-2xl p-6 bg-card border shadow-lg hover:shadow-xl transition-smooth">
              <img src="/f.jpg" alt="Đặt lịch" className="w-full h-40 md:h-44 object-cover rounded-xl mb-5" width="640" height="224" loading="lazy" />
              <h3 className="text-xl font-sans font-semibold mb-2">Đặt lịch</h3>
              <p className="text-base text-muted-foreground">Đặt lịch online, hiển thị khung giờ trống theo thời gian thực.</p>
            </div>
            <div className="rounded-2xl p-6 bg-card border shadow-lg hover:shadow-xl transition-smooth">
              <img src="/e.jpg" alt="Tiếp nhận xe" className="w-full h-40 md:h-44 object-cover rounded-xl mb-5" width="640" height="224" loading="lazy" />
              <h3 className="text-xl font-sans font-semibold mb-2">Tiếp nhận xe</h3>
              <p className="text-base text-muted-foreground">Tiếp nhận yêu cầu, tạo phiếu, checklist EV minh bạch.</p>
            </div>
            <div className="rounded-2xl p-6 bg-card border shadow-lg hover:shadow-xl transition-smooth">
              <img src="/d.jpg" alt="Theo dõi tiến độ" className="w-full h-40 md:h-44 object-cover rounded-xl mb-5" width="640" height="224" loading="lazy" />
              <h3 className="text-xl font-sans font-semibold mb-2">Theo dõi tiến độ sửa chữa</h3>
              <p className="text-base text-muted-foreground">Trạng thái chờ → đang làm → hoàn tất theo thời gian thực.</p>
            </div>
            <div className="rounded-2xl p-6 bg-card border shadow-lg hover:shadow-xl transition-smooth">
              <img src="/c.jpg" alt="Quản lý xe của khách" className="w-full h-40 md:h-44 object-cover rounded-xl mb-5" width="640" height="224" loading="lazy" />
              <h3 className="text-xl font-sans font-semibold mb-2">Quản lý xe của khách</h3>
              <p className="text-base text-muted-foreground">Hồ sơ khách, thông tin xe, lịch sử bảo dưỡng.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="feedbacks">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-sans font-semibold text-center mb-8">Đánh giá</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="rounded-2xl p-7 bg-card border shadow-lg hover:shadow-xl transition-smooth">
              <div className="flex items-center gap-3 mb-3">
                <img src="/c.jpg" alt="Anh Minh" className="w-12 h-12 rounded-full object-cover" width="48" height="48" loading="lazy" />
                <div>
                  <div className="font-sans font-semibold">Anh Minh</div>
                  <div className="text-xs text-muted-foreground">Chủ gara EV</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Theo dõi tiến độ rõ ràng, khách hàng của tôi rất hài lòng.</p>
            </div>
            <div className="rounded-2xl p-7 bg-card border shadow-lg hover:shadow-xl transition-smooth">
              <div className="flex items-center gap-3 mb-3">
                <img src="/d.jpg" alt="Bích Trâm" className="w-12 h-12 rounded-full object-cover" width="48" height="48" loading="lazy" />
                <div>
                  <div className="font-sans font-semibold">Bích Trâm</div>
                  <div className="text-xs text-muted-foreground">Khách hàng</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Đặt lịch nhanh, có nhắc lịch bảo dưỡng nên mình không bỏ sót.</p>
            </div>
            <div className="rounded-2xl p-7 bg-card border shadow-lg hover:shadow-xl transition-smooth">
              <div className="flex items-center gap-3 mb-3">
                <img src="/e.jpg" alt="Cường Kỹ thuật" className="w-12 h-12 rounded-full object-cover" width="48" height="48" loading="lazy" />
                <div>
                  <div className="font-sans font-semibold">Cường Kỹ thuật</div>
                  <div className="text-xs text-muted-foreground">Technician</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Checklist EV rõ ràng, phân công công việc rất mượt.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (giống trang gốc) */}
      <footer id="contact" className="border-t bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                </div>
                <span className="font-sans font-semibold">VinFast Service Workshop</span>
              </div>
              <p className="text-sm text-muted-foreground">Nền tảng quản lý bảo dưỡng xe VinFast</p>
            </div>
            <div>
              <h4 className="font-sans font-semibold mb-3">Thông tin</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate('/customer')} className="hover:text-foreground">Trang chủ</button></li>
                <li><button onClick={() => navigate('/customer/vehicles')} className="hover:text-foreground">Xe của tôi</button></li>
                <li><button onClick={() => navigate('/customer/bookings')} className="hover:text-foreground">Lịch hẹn</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans font-semibold mb-3">Chức năng</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate('/customer/booking')} className="hover:text-foreground">Đặt lịch ngay</button></li>
                <li><button onClick={() => navigate('/customer/bookings')} className="hover:text-foreground">Quản lý lịch hẹn</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans font-semibold mb-3">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Email: dengocrong123@gmail.com</li>
                <li>Hotline: 0396727248</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-4 text-xs text-muted-foreground">© {new Date().getFullYear()} VinFast Service Workshop</div>
        </div>
      </footer>
    </div>
  );
}