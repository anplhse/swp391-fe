import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen text-foreground relative overflow-hidden"
      style={{
        background: 'linear-gradient(-45deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--chart-4)), hsl(var(--chart-3)))',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}
    >
      <style>{`
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
      `}</style>

      {/* Header Navigation */}
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
            <button onClick={() => navigate('/blog')} className="text-foreground/80 hover:text-primary font-medium transition-colors">
              Blog
            </button>
            <button onClick={() => navigate('/contact')} className="text-foreground/80 hover:text-primary font-medium transition-colors">
              Liên hệ
            </button>
          </nav>
          
          <div className="flex items-center gap-3 relative z-30">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="font-semibold px-6 py-2 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
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

      <main className="mx-auto max-w-6xl px-4 py-14 relative z-20">
        {/* Title Section */}
        <div className="text-center mb-16 md:mb-20">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 text-primary-foreground"
            style={{ 
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
              letterSpacing: '-0.02em',
              textShadow: '0 4px 12px hsl(var(--foreground)/0.2)'
            }}
          >
            Bảng giá Dịch vụ Tham khảo
          </h1>
          <p className="text-primary-foreground/90 text-lg font-medium">
            Minh bạch chi phí - An tâm bảo dưỡng
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 md:mb-32">
          {[
            { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', badge: 'Dịch vụ Phổ thông', title: 'Kiểm Tra Tổng Quát Xe', desc: 'Kiểm tra toàn diện xe, hệ thống điện, phanh, lốp, cập nhật phần mềm (nếu có) theo chuẩn hãng.', price: '300.000', border: 'border-primary', bg: 'bg-primary', badgeBg: 'bg-primary/10', badgeText: 'text-primary', priceColor: 'text-primary' },
            { icon: 'M13 10V3L4 14h7v7l9-11h-7z', badge: 'Dịch vụ Đặc thù EV', title: 'Bảo Dưỡng Hệ Thống Làm Mát Pin', desc: 'Kiểm tra hệ thống làm mátx pin, đảm bảo nhiệt độ hoạt động tối ưu và an toàn cho pin cao áp.', price: '350.000', border: 'border-accent', bg: 'bg-accent', badgeBg: 'bg-accent/10', badgeText: 'text-accent', priceColor: 'text-accent' },
            { icon: 'M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5', badge: 'Dịch vụ Hỗ trợ', title: 'Thay Lọc Gió Cabin (Điều Hòa)', desc: 'Giúp không khí trong xe luôn sạch, loại bỏ bụi mịn và mùi khó chịu, tăng hiệu quả làm mát.', price: '200.000', border: 'border-primary', bg: 'bg-gradient-to-br from-orange-500 to-orange-600', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700', priceColor: 'text-orange-600' }
          ].map((service, i) => (
            <div key={i} className={`bg-card rounded-2xl p-8 shadow-2xl hover:shadow-[0_20px_60px_hsl(var(--foreground)/0.15)] transition-all duration-300 hover:-translate-y-2 border-t-4 ${service.border}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-16 h-16 ${service.bg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                  </svg>
                </div>
                <div>
                  <span className={`inline-block ${service.badgeBg} ${service.badgeText} text-xs font-bold px-3 py-1 rounded-full mb-2`}>
                    {service.badge}
                  </span>
                  <h3 className="font-bold text-xl text-foreground">{service.title}</h3>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">{service.desc}</p>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground/70 mb-2">Giá tham khảo</p>
                <p className={`text-3xl font-bold ${service.priceColor}`}>{service.price} <span className="text-lg">VNĐ</span></p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-10 shadow-2xl max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Sẵn sàng trải nghiệm dịch vụ chuyên nghiệp?
            </h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Đặt lịch ngay hôm nay và nhận ưu đãi đặc biệt cho khách hàng mới
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/customer/booking"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Đặt lịch ngay
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-card text-foreground font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-border"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Liên hệ tư vấn
              </a>
            </div>
          </div>
        </div>
      </main>

      <div className="relative z-20">
      {/* Footer */}
      <footer id="contact" className="border-t bg-background">
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
}


