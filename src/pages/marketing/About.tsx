import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function About() {
  const navigate = useNavigate();

  // Handle scroll progress bars (top and side)
  useEffect(() => {
    const handleScroll = () => {
      const scrollProgress = document.getElementById('scroll-progress');
      const sideScrollProgress = document.getElementById('side-scroll-progress');
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      
      if (scrollProgress) {
        scrollProgress.style.width = scrollPercent + '%';
      }
      if (sideScrollProgress) {
        sideScrollProgress.style.height = scrollPercent + '%';
      }
    };

    // Call once on mount to set initial state
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        
        {/* Floating Clouds - Static for performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-[-10%] w-64 h-32 opacity-30">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 60'%3E%3Cpath fill='%23ffffff' d='M20 40 Q10 40 10 30 Q10 20 20 20 Q20 10 35 10 Q45 10 50 20 Q60 20 60 30 Q60 40 50 40 Z'/%3E%3C/svg%3E" alt="" className="w-full h-full" />
          </div>
          
          <div className="absolute top-20 left-[20%] w-48 h-28 opacity-20">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 60'%3E%3Cpath fill='%23ffffff' d='M25 40 Q15 40 15 30 Q15 20 25 20 Q25 10 40 10 Q50 10 55 20 Q65 20 65 30 Q65 40 55 40 Z'/%3E%3C/svg%3E" alt="" className="w-full h-full" />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes glow {
          from {
            text-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.3);
          }
          to {
            text-shadow: 0 4px 30px rgba(0,0,0,0.4), 0 0 60px rgba(255,255,255,0.5), 0 0 80px rgba(255,200,100,0.4);
          }
        }
        
        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 30px rgba(255,100,0,0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 15px 40px rgba(255,100,0,0.5);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes driveCar1 {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(100vw); }
        }
        
        @keyframes driveCar2 {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(100vw); }
        }
      `}</style>
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
            <span className="font-semibold text-gray-800">EV Service Center</span>
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

      {/* Top Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-white/20 z-50">
        <div 
          id="scroll-progress"
          className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-lg transition-all duration-150"
          style={{ width: '0%' }}
        ></div>
      </div>

      {/* Side Scroll Progress Bar */}
      <div className="fixed right-4 top-20 bottom-6 w-1.5 bg-white/20 rounded-full z-40 overflow-hidden">
        <div 
          id="side-scroll-progress"
          className="w-full bg-gradient-to-b from-orange-500 via-red-500 to-pink-500 rounded-full shadow-lg transition-all duration-150"
          style={{ height: '0%' }}
        ></div>
      </div>
      
      <style>{`
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 12px;
        }
        
        ::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
          border-radius: 10px;
          margin: 10px 0;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, hsl(14, 100%, 68%), hsl(26, 100%, 74%));
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, hsl(14, 100%, 60%), hsl(26, 100%, 68%));
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
        }
        
        ::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, hsl(14, 100%, 50%), hsl(26, 100%, 60%));
        }
        
        /* Firefox Scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: hsl(14, 100%, 68%) rgba(255, 255, 255, 0.2);
        }
      `}</style>

      <main className="mx-auto max-w-6xl px-4 py-14 space-y-12 relative z-20">
        <div className="text-center space-y-4" style={{ animation: 'fadeInUp 1s ease-out' }}>
          <h1 
            className="text-5xl md:text-7xl font-bold text-white mb-4 inline-block"
            style={{ 
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
              letterSpacing: '-0.03em',
              textShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.3)',
              animation: 'glow 2s ease-in-out infinite alternate, floatSlow 6s ease-in-out infinite'
            }}
          >
            Giới thiệu
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto" style={{ animation: 'fadeInUp 1.2s ease-out' }}>
            Nền tảng bảo dưỡng xe điện thông minh
          </p>
        </div>
        
        <div className="space-y-8 relative z-20">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-white/50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-[1.01]" style={{ animation: 'fadeInUp 1.4s ease-out' }}>
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 flex items-center justify-center flex-shrink-0 shadow-xl" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Nền tảng web quản lý toàn diện
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Hệ thống quản lý dịch vụ bảo dưỡng xe điện - Đặt lịch online, theo dõi tiến độ, quản lý lịch sử và thanh toán tự động.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="group bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl p-7 shadow-lg border-2 border-primary/30 hover:shadow-2xl hover:border-primary transition-all duration-500 hover:-translate-y-3 hover:scale-105 cursor-pointer" style={{ animation: 'fadeInUp 1.6s ease-out' }}>
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-3 text-xl group-hover:text-primary transition-colors">⚡ Đặt lịch nhanh</h4>
                <p className="text-gray-700 text-base leading-relaxed">Đặt lịch online 24/7, xác nhận ngay</p>
              </div>

              <div className="group bg-gradient-to-br from-accent/10 to-accent/20 rounded-2xl p-7 shadow-lg border-2 border-accent/30 hover:shadow-2xl hover:border-accent transition-all duration-500 hover:-translate-y-3 hover:scale-105 cursor-pointer" style={{ animation: 'fadeInUp 1.8s ease-out' }}>
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-3 text-xl group-hover:text-accent transition-colors">🔍 Theo dõi tiến độ</h4>
                <p className="text-gray-700 text-base leading-relaxed">Cập nhật trạng thái real-time từng bước</p>
              </div>

              <div className="group bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl p-7 shadow-lg border-2 border-primary/30 hover:shadow-2xl hover:border-primary transition-all duration-500 hover:-translate-y-3 hover:scale-105 cursor-pointer" style={{ animation: 'fadeInUp 2s ease-out' }}>
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-3 text-xl group-hover:text-primary transition-colors">📋 Quản lý hồ sơ</h4>
                <p className="text-gray-700 text-base leading-relaxed">Lưu trữ lịch sử bảo dưỡng hoàn chỉnh</p>
              </div>
            </div>
          </div>
        </div>

        {/* EV Infrastructure Section */}
        <div className="mt-20 relative">
          <div className="relative h-80 bg-gradient-to-b from-gray-100 to-gray-300 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50">
            {/* Sky background */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-blue-50"></div>
            
            {/* Road with perspective */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-600 to-gray-800 shadow-inner">
              {/* Road markings */}
              <div className="absolute top-1/2 left-0 right-0 h-2 flex justify-around">
                <div className="w-16 h-2 bg-yellow-300 rounded"></div>
                <div className="w-16 h-2 bg-yellow-300 rounded"></div>
                <div className="w-16 h-2 bg-yellow-300 rounded"></div>
                <div className="w-16 h-2 bg-yellow-300 rounded"></div>
                <div className="w-16 h-2 bg-yellow-300 rounded"></div>
              </div>
              {/* Road edge lines */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/30"></div>
            </div>

            {/* Mobile App Mockup - Center spotlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30" style={{ animation: 'float 3s ease-in-out infinite' }}>
              <div className="relative">
                {/* Phone Frame - Larger size */}
                <div className="w-48 h-96 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[2.5rem] shadow-2xl p-2 border-3 border-gray-700">
                  {/* Screen */}
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="h-7 bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-between px-4">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      <span className="text-[10px] text-white font-bold">100%</span>
                    </div>
                    
                    {/* App Content - Progress Tracking */}
                    <div className="p-4 space-y-3">
                      {/* Header */}
                      <div className="text-center">
                        <h4 className="text-sm font-bold text-gray-900">Theo dõi Tiến độ</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">VF8 - 51A-123.45</p>
                      </div>
                      
                      {/* Progress Steps */}
                      <div className="space-y-3 mt-4">
                        {/* Step 1 - Completed */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-900">Tiếp nhận xe</p>
                            <p className="text-[10px] text-gray-500">Hoàn thành 09:30</p>
                          </div>
                        </div>
                        
                        {/* Step 2 - In Progress */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 relative shadow-lg">
                            <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-75"></div>
                            <div className="w-3 h-3 bg-white rounded-full relative z-10"></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-orange-600">Đang kiểm tra</p>
                            <p className="text-[10px] text-gray-500">KTV: Nguyễn Văn A</p>
                          </div>
                        </div>
                        
                        {/* Step 3 - Pending */}
                        <div className="flex items-center gap-3 opacity-50">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-900">Bảo dưỡng</p>
                            <p className="text-[10px] text-gray-500">Dự kiến: 45 phút</p>
                          </div>
                        </div>
                        
                        {/* Step 4 - Pending */}
                        <div className="flex items-center gap-3 opacity-50">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-900">Hoàn tất</p>
                            <p className="text-[10px] text-gray-500">Chờ xử lý</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom Button */}
                      <div className="pt-2">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl py-2.5 text-center shadow-lg">
                          <span className="text-xs text-white font-bold">Xem chi tiết</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Home Button */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full"></div>
                </div>
                
                {/* Floating Label */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                  📱 Ứng dụng EV Service Center
                </div>
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
        <div className="mt-16 space-y-8" style={{ animation: 'fadeInUp 2.2s ease-out' }}>
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12" style={{ 
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            animation: 'glow 3s ease-in-out infinite alternate'
          }}>
            Khách hàng nói gì về chúng tôi
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 border-2 border-white/50 hover:border-orange-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Anh Minh</h4>
                  <p className="text-sm text-gray-600">Chủ xe VF8</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed italic">"Đặt lịch siêu nhanh, không phải chờ đợi. Tôi yên tâm hơn nhiều khi biết xe đang được xử lý!"</p>
            </div>

            <div className="group bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-white/50 hover:border-accent">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  T
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Chị Trâm</h4>
                  <p className="text-sm text-gray-600">Chủ xe VF9</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed italic">"Theo dõi tiến độ realtime quá tiện! Không còn lo lắng xe đang ở đâu nữa."</p>
            </div>

            <div className="group bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-white/50 hover:border-primary">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  H
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Anh Hùng</h4>
                  <p className="text-sm text-gray-600">Chủ xe VF5</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed italic">"Lưu trữ lịch sử bảo dưỡng rất chuyên nghiệp. Khi bán xe lại giữ được giá tốt!"</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 mb-12" style={{ animation: 'fadeInUp 2.4s ease-out' }}>
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl p-12 md:p-16 shadow-2xl text-center hover:shadow-[0_30px_70px_rgba(0,0,0,0.4)] transition-all duration-500 hover:scale-[1.02]">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ 
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              Sẵn sàng trải nghiệm?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Đăng ký ngay hôm nay và quản lý xe điện của bạn một cách thông minh nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => navigate('/login')}
                className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
              >
                🚀 Bắt đầu ngay
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/services')}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-600 font-bold px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
              >
                📖 Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-12 pb-8 border-t-2 border-white/30">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">EV Service Center</span>
            </div>
            <div className="flex gap-6 justify-center text-white/80 text-sm">
              <a href="/about" className="hover:text-white transition-colors">Giới thiệu</a>
              <a href="/services" className="hover:text-white transition-colors">Dịch vụ</a>
              <a href="/pricing" className="hover:text-white transition-colors">Bảng giá</a>
              <a href="/contact" className="hover:text-white transition-colors">Liên hệ</a>
            </div>
            <p className="text-white/70 text-sm">
              © 2024 EV Service Center. Nền tảng bảo dưỡng xe điện thông minh.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}



