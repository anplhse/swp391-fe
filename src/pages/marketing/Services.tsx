import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Services() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen text-foreground relative overflow-hidden"
      style={{
        background: 'linear-gradient(-45deg, hsl(14, 100%, 68%), hsl(26, 100%, 74%), hsl(16, 100%, 78%), hsl(24, 100%, 83%))',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
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
        
        @keyframes glow {
          from {
            text-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.3);
          }
          to {
            text-shadow: 0 4px 30px rgba(0,0,0,0.4), 0 0 60px rgba(255,255,255,0.5), 0 0 80px rgba(255,200,100,0.4);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(50px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        @keyframes wiggle {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-5deg);
          }
          75% {
            transform: rotate(5deg);
          }
        }
      `}</style>
      
      {/* Decorative clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 left-[5%] w-48 h-24">
          <svg viewBox="0 0 200 60" fill="white">
            <ellipse cx="50" cy="30" rx="50" ry="20" />
            <ellipse cx="100" cy="25" rx="60" ry="25" />
            <ellipse cx="150" cy="30" rx="50" ry="20" />
          </svg>
        </div>
        <div className="absolute top-32 right-[10%] w-56 h-28">
          <svg viewBox="0 0 200 60" fill="white">
            <ellipse cx="50" cy="30" rx="45" ry="18" />
            <ellipse cx="95" cy="28" rx="55" ry="22" />
            <ellipse cx="145" cy="32" rx="45" ry="18" />
          </svg>
        </div>
      </div>
      
      <main className="mx-auto max-w-6xl px-4 py-14 relative z-20">
        {/* Hero Section */}
        <div className="mb-16 text-center" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 relative inline-block">
            <span 
              className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
              style={{ animation: 'glow 2s ease-in-out infinite alternate' }}
            >
              Dịch Vụ
            </span>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-white/40 rounded-full"></div>
          </h1>
          <p className="text-white/90 text-xl md:text-2xl mt-8 font-medium drop-shadow-lg max-w-3xl mx-auto" style={{ animation: 'fadeInUp 1s ease-out' }}>
            Trải nghiệm dịch vụ bảo dưỡng xe điện thông minh - Tiện lợi, minh bạch, chuyên nghiệp
          </p>
        </div>

        {/* Services Title */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ 
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            animation: 'fadeInUp 1.4s ease-out'
          }}>
            Dịch vụ của chúng tôi
          </h2>
          <p className="text-white/80 text-lg" style={{ animation: 'fadeInUp 1.5s ease-out' }}>
            Giải pháp toàn diện cho xe điện của bạn
          </p>
        </div>

        {/* Top 3 features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="group rounded-2xl p-7 bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-[0_20px_60px_rgba(255,100,0,0.3)] transition-all duration-500 cursor-pointer hover:-translate-y-3 hover:scale-105 border-t-4 border-primary relative overflow-hidden" style={{ animation: 'bounceIn 1s ease-out' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{ animation: 'shimmer 2s infinite' }}></div>
            <div className="mb-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="font-bold mb-3 text-xl text-gray-900 group-hover:text-orange-600 transition-colors duration-300 relative z-10">
              Đặt lịch hẹn <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 font-black group-hover:animate-pulse">24/7</span>
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300 relative z-10">
              Chủ động chọn dịch vụ, xem khung giờ còn trống và đặt hẹn bất cứ lúc nào, kể cả nửa đêm. Không cần chờ điện thoại.
            </p>
          </div>

          <div className="group rounded-2xl p-7 bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-[0_20px_60px_rgba(255,100,0,0.3)] transition-all duration-500 cursor-pointer hover:-translate-y-3 hover:scale-105 border-t-4 border-accent relative overflow-hidden" style={{ animation: 'bounceIn 1.2s ease-out' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{ animation: 'shimmer 2s infinite' }}></div>
            <div className="mb-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="font-bold mb-3 text-xl text-gray-900 group-hover:text-orange-600 transition-colors duration-300 relative z-10">
              Theo dõi tiến độ <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 font-black group-hover:animate-pulse">Real-time</span>
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300 relative z-10">
              Biết chính xác xe đang ở trạng thái nào (Chẩn đoán, Đang sửa, Chờ phụ tùng, Hoàn tất) ngay trên app.
            </p>
          </div>

          <div className="group rounded-2xl p-7 bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-[0_20px_60px_rgba(255,100,0,0.3)] transition-all duration-500 cursor-pointer hover:-translate-y-3 hover:scale-105 border-t-4 border-orange-400 relative overflow-hidden" style={{ animation: 'bounceIn 1.4s ease-out' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{ animation: 'shimmer 2s infinite' }}></div>
            <div className="mb-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="font-bold mb-3 text-xl text-gray-900 group-hover:text-orange-600 transition-colors duration-300 relative z-10">Sổ Bảo Dưỡng Điện Tử</h3>
            <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300 relative z-10">
              Lưu trữ lịch sử sửa chữa, bảo dưỡng, thay linh kiện. Không lo mất sổ, giúp giữ giá xe khi bán lại.
            </p>
          </div>
        </div>

        {/* Bottom 2 features centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <div className="group rounded-2xl p-7 bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-[0_20px_60px_rgba(255,126,95,0.3)] transition-all duration-500 cursor-pointer hover:-translate-y-3 hover:scale-105 border-t-4 border-primary relative overflow-hidden" style={{ animation: 'slideInLeft 1s ease-out' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="mb-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
            <h3 className="font-bold mb-3 text-xl text-gray-900 group-hover:text-primary transition-colors duration-300 relative z-10">Tư vấn & Báo giá Trực tuyến</h3>
            <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300 relative z-10">
              Chat với Cố vấn Dịch vụ, hỏi đáp kỹ thuật và nhận báo giá ước tính trước khi mang xe đến.
            </p>
          </div>

          <div className="group rounded-2xl p-7 bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-[0_20px_60px_rgba(254,180,123,0.3)] transition-all duration-500 cursor-pointer hover:-translate-y-3 hover:scale-105 border-t-4 border-accent relative overflow-hidden" style={{ animation: 'slideInRight 1s ease-out' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="mb-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <h3 className="font-bold mb-3 text-xl text-gray-900 group-hover:text-accent transition-colors duration-300 relative z-10">Nhắc lịch & Ưu đãi Thành viên</h3>
            <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300 relative z-10">
              Nhận thông báo khi xe sắp đến kỳ bảo dưỡng và là người đầu tiên nhận ưu đãi dành cho thành viên.
            </p>
          </div>
        </div>

        {/* Process Section */}
        <div className="mt-20 mb-16" style={{ animation: 'fadeInUp 2.8s ease-out' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            Quy trình đơn giản
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Đăng ký tài khoản</h4>
              <p className="text-sm text-gray-600">Tạo tài khoản nhanh chóng với email hoặc số điện thoại</p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Chọn dịch vụ</h4>
              <p className="text-sm text-gray-600">Xem danh sách dịch vụ và chọn dịch vụ phù hợp</p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Đặt lịch hẹn</h4>
              <p className="text-sm text-gray-600">Chọn ngày giờ thuận tiện và xác nhận đặt lịch</p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                4
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Theo dõi tiến độ</h4>
              <p className="text-sm text-gray-600">Cập nhật trạng thái xe của bạn theo thời gian thực</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 mb-12" style={{ animation: 'fadeInUp 3s ease-out' }}>
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl p-12 md:p-16 shadow-2xl text-center hover:shadow-[0_30px_70px_rgba(0,0,0,0.4)] transition-all duration-500 hover:scale-[1.02]">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ 
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              Sẵn sàng trải nghiệm?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Đăng ký ngay hôm nay và trải nghiệm dịch vụ bảo dưỡng xe điện chuyên nghiệp
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => navigate('/login')}
                className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
              >
                🚀 Đăng ký ngay
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/about')}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-600 font-bold px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
              >
                📖 Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


