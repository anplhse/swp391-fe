import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function About() {
  const navigate = useNavigate();

  // Handle scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollProgress = document.getElementById('scroll-progress');
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      
      if (scrollProgress) {
        scrollProgress.style.width = scrollPercent + '%';
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        @keyframes glow { from { text-shadow: 0 4px 20px hsl(var(--foreground) / 0.3); } to { text-shadow: 0 4px 30px hsl(var(--foreground) / 0.4), 0 0 60px hsl(var(--primary-foreground) / 0.5); } }
        @keyframes floatSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <header className="w-full bg-card relative z-30 rounded-b-3xl shadow-xl pt-4 pb-4 border-b-2 border-primary/30">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 relative z-30 bg-secondary px-4 py-2 rounded-2xl shadow-lg border border-border"
            style={{
              boxShadow: 'var(--shadow-md), inset 0 1px 0 hsl(var(--primary-foreground) / 0.5)',
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

      {/* Top Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-primary-foreground/20 z-50">
        <div 
          id="scroll-progress"
          className="h-full bg-gradient-to-r from-primary to-accent shadow-lg transition-all duration-150"
          style={{ width: '0%' }}
        ></div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-14 space-y-24 md:space-y-32 relative z-20">
        <div className="text-center space-y-4 mb-4 md:mb-6" style={{ animation: 'fadeInUp 1s ease-out' }}>
          <h1 
            className="text-5xl md:text-7xl font-bold text-primary-foreground mb-4 inline-block"
            style={{ 
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
              letterSpacing: '-0.03em',
              textShadow: '0 4px 20px hsl(var(--foreground) / 0.3), 0 0 40px hsl(var(--primary-foreground) / 0.3)',
              animation: 'glow 2s ease-in-out infinite alternate, floatSlow 6s ease-in-out infinite'
            }}
          >
            Giới thiệu
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 font-medium max-w-2xl mx-auto" style={{ animation: 'fadeInUp 1.2s ease-out' }}>
            Nền tảng bảo dưỡng xe điện thông minh
          </p>
        </div>
        
        <div className="space-y-28 md:space-y-36 relative z-20 -mt-16 md:-mt-20">
          <div className="bg-card/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-border/50 hover:shadow-[0_20px_60px_hsl(var(--foreground)/0.3)] transition-all duration-500 hover:scale-[1.01]" style={{ animation: 'fadeInUp 1.4s ease-out' }}>
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-hover flex items-center justify-center flex-shrink-0 shadow-xl" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
                <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  Nền tảng web quản lý toàn diện
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Hệ thống quản lý dịch vụ bảo dưỡng xe điện - Đặt lịch online, theo dõi tiến độ, quản lý lịch sử và thanh toán tự động.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="group bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl p-7 shadow-lg border-2 border-primary/30 hover:shadow-2xl hover:border-primary transition-all duration-500 hover:-translate-y-3 hover:scale-105 cursor-pointer" style={{ animation: 'fadeInUp 1.6s ease-out' }}>
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                  <svg className="w-7 h-7 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-foreground mb-3 text-xl group-hover:text-primary transition-colors">⚡ Đặt lịch nhanh</h4>
                <p className="text-muted-foreground text-base leading-relaxed">Đặt lịch online 24/7, xác nhận ngay</p>
              </div>

              <div className="group bg-gradient-to-br from-accent/10 to-accent/20 rounded-2xl p-7 shadow-lg border-2 border-accent/30 hover:shadow-2xl hover:border-accent transition-all duration-500 hover:-translate-y-3 hover:scale-105 cursor-pointer" style={{ animation: 'fadeInUp 1.8s ease-out' }}>
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                  <svg className="w-7 h-7 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-foreground mb-3 text-xl group-hover:text-accent transition-colors">🔍 Theo dõi tiến độ</h4>
                <p className="text-muted-foreground text-base leading-relaxed">Cập nhật trạng thái từng bước</p>
              </div>

              <div className="group bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl p-7 shadow-lg border-2 border-primary/30 hover:shadow-2xl hover:border-primary transition-all duration-500 hover:-translate-y-3 hover:scale-105 cursor-pointer" style={{ animation: 'fadeInUp 2s ease-out' }}>
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                  <svg className="w-7 h-7 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-foreground mb-3 text-xl group-hover:text-primary transition-colors">📋 Quản lý hồ sơ</h4>
                <p className="text-muted-foreground text-base leading-relaxed">Lưu trữ lịch sử bảo dưỡng hoàn chỉnh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile App Demo Section */}
        <div className="mt-40 md:mt-52 relative">
          <div className="relative h-80 bg-gradient-to-b from-blue-100 to-blue-50 rounded-3xl overflow-hidden shadow-2xl">
            {/* Mobile App Mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animation: 'floatSlow 6s ease-in-out infinite' }}>
              <div className="w-48 h-96 bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] shadow-2xl p-2">
                <div className="w-full h-full bg-card rounded-[2rem] overflow-hidden">
                  <div className="h-7 bg-gradient-to-r from-primary to-accent flex items-center justify-between px-4">
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-primary-foreground rounded-full"></div>)}
                    </div>
                    <span className="text-[10px] text-primary-foreground font-bold">100%</span>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="text-center">
                      <h4 className="text-sm font-bold text-foreground">Theo dõi Tiến độ</h4>
                      <p className="text-[10px] text-muted-foreground">VF8 - 51A-123.45</p>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      {[
                        { icon: '✓', bg: 'bg-primary', title: 'Tiếp nhận xe', sub: 'Hoàn thành 09:30', opacity: 'opacity-100' },
                        { icon: '●', bg: 'bg-primary animate-pulse', title: 'Đang kiểm tra', sub: 'KTV: Nguyễn Văn A', opacity: 'opacity-100' },
                        { icon: '○', bg: 'bg-gray-300', title: 'Bảo dưỡng', sub: 'Dự kiến: 45 phút', opacity: 'opacity-50' },
                        { icon: '○', bg: 'bg-gray-300', title: 'Hoàn tất', sub: 'Chờ xử lý', opacity: 'opacity-50' }
                      ].map((step, i) => (
                        <div key={i} className={`flex items-center gap-3 ${step.opacity}`}>
                          <div className={`w-8 h-8 rounded-full ${step.bg} flex items-center justify-center text-primary-foreground text-xs font-bold shadow-md`}>
                            {step.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-foreground">{step.title}</p>
                            <p className="text-[10px] text-muted-foreground">{step.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-gradient-to-r from-primary to-accent rounded-xl py-2.5 text-center shadow-lg">
                      <span className="text-xs text-primary-foreground font-bold">Xem chi tiết</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full"></div>
              </div>
            </div>

            {/* Trees - Realistic style with planters */}
            {/* Tree 1 with planter */}
            <div className="absolute bottom-32 left-[30%] z-15">
              <svg width="90" height="126" viewBox="0 0 150 210" className="drop-shadow-2xl">
                {/* Flower planter */}
                <ellipse cx="75" cy="200" rx="35" ry="8" fill="#8B4513" opacity="0.3"/>
                <path d="M45 195 Q42 200 45 205 L105 205 Q108 200 105 195 Z" fill="#CD853F"/>
                <path d="M48 195 Q46 200 48 205 L102 205 Q104 200 102 195 Z" fill="#DEB887"/>
                <ellipse cx="75" cy="195" rx="27" ry="6" fill="#8B7355"/>
                {/* Soil */}
                <ellipse cx="75" cy="192" rx="25" ry="5" fill="#654321"/>
                
                {/* Trunk */}
                <path d="M66 135 L72 200 L78 200 L84 135 Q75 132 66 135" fill="#654321" />
                <rect x="69" y="135" width="12" height="65" fill="#7D5A3D" opacity="0.6"/>
                
                {/* Foliage - natural canopy */}
                <ellipse cx="75" cy="105" rx="54" ry="48" fill="#2D5016" opacity="0.8"/>
                <ellipse cx="75" cy="84" rx="48" ry="42" fill="#3A6B1F"/>
                <ellipse cx="75" cy="66" rx="42" ry="36" fill="#4A8C2A"/>
                <ellipse cx="75" cy="54" rx="33" ry="30" fill="#5FA836"/>
                {/* Light spots */}
                <ellipse cx="84" cy="75" rx="18" ry="15" fill="#7BC142" opacity="0.7"/>
                <ellipse cx="60" cy="90" rx="15" ry="12" fill="#6FB037" opacity="0.6"/>
              </svg>
            </div>

            {/* Tree 2 with planter */}
            <div className="absolute bottom-32 left-[42%] z-15">
              <svg width="86" height="122" viewBox="0 0 144 204" className="drop-shadow-2xl">
                <ellipse cx="72" cy="194" rx="33" ry="8" fill="#8B4513" opacity="0.3"/>
                <path d="M43 189 Q40 194 43 199 L101 199 Q104 194 101 189 Z" fill="#CD853F"/>
                <path d="M46 189 Q44 194 46 199 L98 199 Q100 194 98 189 Z" fill="#DEB887"/>
                <ellipse cx="72" cy="189" rx="26" ry="6" fill="#8B7355"/>
                <ellipse cx="72" cy="186" rx="24" ry="5" fill="#654321"/>
                
                <path d="M63 129 L69 194 L75 194 L81 129 Q72 126 63 129" fill="#5C4033" />
                <rect x="66" y="129" width="12" height="65" fill="#6D4C41" opacity="0.6"/>
                
                <ellipse cx="72" cy="99" rx="51" ry="45" fill="#2D5016" opacity="0.8"/>
                <ellipse cx="72" cy="81" rx="45" ry="39" fill="#3A6B1F"/>
                <ellipse cx="72" cy="63" rx="39" ry="33" fill="#4A8C2A"/>
                <ellipse cx="72" cy="51" rx="30" ry="27" fill="#5FA836"/>
                <ellipse cx="81" cy="72" rx="15" ry="12" fill="#7BC142" opacity="0.7"/>
                <ellipse cx="57" cy="84" rx="12" ry="9" fill="#6FB037" opacity="0.6"/>
              </svg>
            </div>

            {/* Modern VinFast EV Car 1 - Silver/White */}
            <div 
              className="absolute bottom-16 left-0 z-30"
              style={{
                animation: 'driveCar1 15s linear infinite',
              }}
            >
              <svg width="100" height="50" viewBox="0 0 100 50" className="drop-shadow-2xl">
                {/* Car shadow */}
                <ellipse cx="50" cy="48" rx="35" ry="3" fill="rgba(0,0,0,0.2)" />
                
                {/* Main body - sleek SUV design */}
                <path d="M15,30 L20,25 L35,20 L55,20 L70,25 L85,30 L85,35 L15,35 Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5"/>
                
                {/* Roof/cabin */}
                <path d="M28,20 L35,15 L60,15 L68,20 Z" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.5"/>
                
                {/* Windows with reflection */}
                <rect x="32" y="16" width="12" height="7" rx="1" fill="#60A5FA" opacity="0.6"/>
                <rect x="50" y="16" width="14" height="7" rx="1" fill="#60A5FA" opacity="0.6"/>
                
                {/* Front lights */}
                <ellipse cx="80" cy="28" rx="3" ry="2" fill="#FCD34D"/>
                <ellipse cx="80" cy="32" rx="3" ry="2" fill="#FCA5A5"/>
                
                {/* V logo on front (VinFast style) */}
                <path d="M78,24 L80,27 L82,24" stroke="#DC2626" strokeWidth="1.5" fill="none"/>
                
                {/* Wheels - modern alloy design */}
                <circle cx="28" cy="37" r="6" fill="#1F2937"/>
                <circle cx="28" cy="37" r="4" fill="#374151"/>
                <circle cx="28" cy="37" r="2" fill="#6B7280"/>
                <circle cx="70" cy="37" r="6" fill="#1F2937"/>
                <circle cx="70" cy="37" r="4" fill="#374151"/>
                <circle cx="70" cy="37" r="2" fill="#6B7280"/>
                
                {/* Wheel spokes */}
                <line x1="26" y1="35" x2="30" y2="39" stroke="#9CA3AF" strokeWidth="0.5"/>
                <line x1="26" y1="39" x2="30" y2="35" stroke="#9CA3AF" strokeWidth="0.5"/>
                <line x1="68" y1="35" x2="72" y2="39" stroke="#9CA3AF" strokeWidth="0.5"/>
                <line x1="68" y1="39" x2="72" y2="35" stroke="#9CA3AF" strokeWidth="0.5"/>
                
                {/* EV Badge */}
                <circle cx="22" cy="28" r="4" fill="#10B981" opacity="0.9"/>
                <text x="22" y="30" fontSize="5" fill="white" textAnchor="middle" fontWeight="bold">⚡</text>
              </svg>
            </div>

            {/* Modern VinFast EV Car 2 - Blue */}
            <div 
              className="absolute bottom-16 left-0 z-30"
              style={{
                animation: 'driveCar2 20s linear infinite',
                animationDelay: '5s',
              }}
            >
              <svg width="100" height="50" viewBox="0 0 100 50" className="drop-shadow-2xl">
                <ellipse cx="50" cy="48" rx="35" ry="3" fill="rgba(0,0,0,0.2)" />
                <path d="M15,30 L20,25 L35,20 L55,20 L70,25 L85,30 L85,35 L15,35 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="0.5"/>
                <path d="M28,20 L35,15 L60,15 L68,20 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="0.5"/>
                <rect x="32" y="16" width="12" height="7" rx="1" fill="#93C5FD" opacity="0.7"/>
                <rect x="50" y="16" width="14" height="7" rx="1" fill="#93C5FD" opacity="0.7"/>
                <ellipse cx="80" cy="28" rx="3" ry="2" fill="#FCD34D"/>
                <ellipse cx="80" cy="32" rx="3" ry="2" fill="#FCA5A5"/>
                <path d="M78,24 L80,27 L82,24" stroke="#DC2626" strokeWidth="1.5" fill="none"/>
                <circle cx="28" cy="37" r="6" fill="#1F2937"/>
                <circle cx="28" cy="37" r="4" fill="#374151"/>
                <circle cx="28" cy="37" r="2" fill="#6B7280"/>
                <circle cx="70" cy="37" r="6" fill="#1F2937"/>
                <circle cx="70" cy="37" r="4" fill="#374151"/>
                <circle cx="70" cy="37" r="2" fill="#6B7280"/>
                <line x1="26" y1="35" x2="30" y2="39" stroke="#9CA3AF" strokeWidth="0.5"/>
                <line x1="26" y1="39" x2="30" y2="35" stroke="#9CA3AF" strokeWidth="0.5"/>
                <line x1="68" y1="35" x2="72" y2="39" stroke="#9CA3AF" strokeWidth="0.5"/>
                <line x1="68" y1="39" x2="72" y2="35" stroke="#9CA3AF" strokeWidth="0.5"/>
                <circle cx="22" cy="28" r="4" fill="#10B981" opacity="0.9"/>
                <text x="22" y="30" fontSize="5" fill="white" textAnchor="middle" fontWeight="bold">⚡</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-40 md:mt-52 space-y-8" style={{ animation: 'fadeInUp 2.2s ease-out' }}>
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground text-center mb-24" style={{ 
            textShadow: '0 4px 20px hsl(var(--foreground) / 0.3)',
            animation: 'glow 3s ease-in-out infinite alternate'
          }}>
            Khách hàng nói gì về chúng tôi
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-card/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 border-2 border-border/50 hover:border-primary">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">Anh Minh</h4>
                  <p className="text-sm text-muted-foreground">Chủ xe VF8</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed italic">"Đặt lịch siêu nhanh, không phải chờ đợi. Tôi yên tâm hơn nhiều khi biết xe đang được xử lý!"</p>
            </div>

            <div className="group bg-card/95 backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-border/50 hover:border-accent">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                  T
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">Chị Trâm</h4>
                  <p className="text-sm text-muted-foreground">Chủ xe VF9</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed italic">"Theo dõi tiến độ realtime quá tiện! Không còn lo lắng xe đang ở đâu nữa."</p>
            </div>

            <div className="group bg-card/95 backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-border/50 hover:border-primary">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                  H
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">Anh Hùng</h4>
                  <p className="text-sm text-muted-foreground">Chủ xe VF5</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed italic">"Lưu trữ lịch sử bảo dưỡng rất chuyên nghiệp. Khi bán xe lại giữ được giá tốt!"</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-40 md:mt-52 mb-12" style={{ animation: 'fadeInUp 2.4s ease-out' }}>
          <div className="bg-primary rounded-3xl p-12 md:p-16 shadow-2xl text-center hover:shadow-[0_30px_70px_hsl(var(--primary)/0.4)] transition-all duration-500 hover:scale-[1.02]">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6" style={{ 
              textShadow: '0 2px 8px hsl(var(--foreground) / 0.2)'
            }}>
              Sẵn sàng trải nghiệm?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Đăng ký ngay hôm nay và quản lý xe điện của bạn một cách thông minh nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => navigate('/login')}
                className="bg-card text-primary hover:bg-muted font-bold px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-0"
              >
                🚀 Bắt đầu ngay
              </Button>
              <Button 
                onClick={() => navigate('/services')}
                className="bg-card/30 backdrop-blur-sm text-primary-foreground hover:bg-card hover:text-primary font-bold px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-0"
              >
                📖 Tìm hiểu thêm
              </Button>
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



