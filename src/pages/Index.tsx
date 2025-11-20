import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen text-foreground relative overflow-hidden"
      style={{
        background: 'linear-gradient(-45deg, hsl(var(--chart-5)), hsl(var(--chart-4)), hsl(var(--chart-3)), hsl(var(--muted)))',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}
    >
      <style>{`
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>

      {/* Decorative clouds */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-chart-2/30 rounded-full blur-3xl z-10" style={{ animation: 'float 6s ease-in-out infinite' }}></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-accent/30 rounded-full blur-3xl z-10" style={{ animation: 'float 8s ease-in-out infinite 1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-chart-5/30 rounded-full blur-3xl z-10" style={{ animation: 'float 7s ease-in-out infinite 2s' }}></div>

      {/* Header */}
      <header className="w-full bg-card relative z-30 rounded-b-3xl shadow-xl pt-4 pb-4 border-b-2 border-primary/30">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 relative z-30 bg-secondary px-4 py-2 rounded-2xl shadow-lg border border-border"
            style={{
              boxShadow: '0 4px 6px hsl(var(--foreground)/0.1), 0 1px 3px hsl(var(--foreground)/0.08), inset 0 1px 0 hsl(var(--primary-foreground)/0.5)',
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span className="font-semibold text-foreground">VinFast Service Workshop</span>
          </div>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/about')} className="text-foreground/80 hover:text-primary font-medium transition-colors">
              Giới thiệu
            </button>
            <button onClick={() => navigate('/services')} className="text-foreground/80 hover:text-primary font-medium transition-colors">
              Dịch vụ
            </button>
            <button onClick={() => navigate('/pricing')} className="text-foreground/80 hover:text-primary font-medium transition-colors">
              Bảng giá
            </button>
            <button onClick={() => navigate('/blog')} className="text-foreground/80 hover:text-primary font-medium transition-colors">
              Blog
            </button>
            <button onClick={() => navigate('/contact')} className="text-foreground/80 hover:text-primary font-medium transition-colors">
              Liên hệ
            </button>
          </nav>
          
          <div className="flex items-center gap-3 relative z-30">
            <Button 
              onClick={() => navigate('/login')}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Đăng nhập
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login', { state: { openRegister: true } })}
              className="font-semibold px-6 py-2 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </header>

      <div className="relative z-20">
      {/* Hero image centered with top padding */}
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

      {/* Remove About section per request */}

      {/* Services */}
      <section id="features" className="relative z-20">
        <div className="mx-auto max-w-[90rem] px-4 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-3">Dịch vụ nổi bật</h2>
          <div className="w-24 h-0.5 bg-accent mx-auto mb-10 rounded-full"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-8">
            <div className="rounded-2xl p-6 bg-card shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <img src="/f.jpg" alt="Đặt lịch" className="w-full h-40 md:h-44 object-cover rounded-xl mb-5" width="640" height="224" loading="lazy" />
              <h3 className="text-xl font-semibold mb-2">Đặt lịch</h3>
              <p className="text-base text-muted-foreground">Đặt lịch online, hiển thị khung giờ trống theo thời gian thực.</p>
            </div>
            <div className="rounded-2xl p-6 bg-card shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <img src="/e.jpg" alt="Tiếp nhận xe" className="w-full h-40 md:h-44 object-cover rounded-xl mb-5" width="640" height="224" loading="lazy" />
              <h3 className="text-xl font-semibold mb-2">Tiếp nhận xe</h3>
              <p className="text-base text-muted-foreground">Tiếp nhận yêu cầu, tạo phiếu, checklist EV minh bạch.</p>
            </div>
            <div className="rounded-2xl p-6 bg-card shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <img src="/d.jpg" alt="Theo dõi tiến độ" className="w-full h-40 md:h-44 object-cover rounded-xl mb-5" width="640" height="224" loading="lazy" />
              <h3 className="text-xl font-semibold mb-2">Theo dõi tiến độ sửa chữa</h3>
              <p className="text-base text-muted-foreground">Trạng thái chờ → đang làm → hoàn tất theo thời gian thực.</p>
            </div>
            <div className="rounded-2xl p-6 bg-card shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <img src="/c.jpg" alt="Quản lý xe của khách" className="w-full h-40 md:h-44 object-cover rounded-xl mb-5" width="640" height="224" loading="lazy" />
              <h3 className="text-xl font-semibold mb-2">Quản lý xe của khách</h3>
              <p className="text-base text-muted-foreground">Hồ sơ khách, thông tin xe, lịch sử bảo dưỡng.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bỏ mục Giải pháp theo yêu cầu */}

      {/* Remove Pricing section per request */}

      {/* Feedbacks from customers */}
      <section id="feedbacks" className="relative z-20">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-3">Đánh giá</h2>
          <div className="w-24 h-0.5 bg-accent mx-auto mb-8 rounded-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="rounded-2xl p-7 bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-3">
                <img src="/c.jpg" alt="Anh Minh" className="w-12 h-12 rounded-full object-cover" width="48" height="48" loading="lazy" />
                <div>
                  <div className="font-semibold">Anh Minh</div>
                  <div className="text-xs text-muted-foreground">Chủ gara EV</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Theo dõi tiến độ rõ ràng, khách hàng của tôi rất hài lòng.</p>
            </div>
            <div className="rounded-2xl p-7 bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-3">
                <img src="/d.jpg" alt="Bích Trâm" className="w-12 h-12 rounded-full object-cover" width="48" height="48" loading="lazy" />
                <div>
                  <div className="font-semibold">Bích Trâm</div>
                  <div className="text-xs text-muted-foreground">Khách hàng</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Đặt lịch nhanh, có nhắc lịch bảo dưỡng nên mình không bỏ sót.</p>
            </div>
            <div className="rounded-2xl p-7 bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-3">
                <img src="/e.jpg" alt="Cường Kỹ thuật" className="w-12 h-12 rounded-full object-cover" width="48" height="48" loading="lazy" />
                <div>
                  <div className="font-semibold">Cường Kỹ thuật</div>
                  <div className="text-xs text-muted-foreground">Technician</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Checklist rõ ràng, phân công công việc rất mượt.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (multi-column like carCRM) */}
      <footer id="contact" className="border-t bg-card/50 relative z-20">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                </div>
                <span className="font-semibold">VinFast Service Workshop</span>
              </div>
              <p className="text-sm text-muted-foreground">Nền tảng quản lý gara ô tô toàn diện.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Thông tin</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground">Giới thiệu</a></li>
                <li><a href="/pricing" className="hover:text-foreground">Bảng giá</a></li>
                <li><a href="/blog" className="hover:text-foreground">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Chức năng</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/services" className="hover:text-foreground">Đặt lịch</a></li>
                <li><a href="/services" className="hover:text-foreground">Tiếp nhận xe</a></li>
                <li><a href="/services" className="hover:text-foreground">Theo dõi tiến độ sửa chữa</a></li>
                <li><a href="/services" className="hover:text-foreground">Quản lý xe của khách</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/contact" className="hover:text-foreground">Form liên hệ</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-4 text-xs text-muted-foreground">© {new Date().getFullYear()} VinFast Service Workshop</div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Index;
