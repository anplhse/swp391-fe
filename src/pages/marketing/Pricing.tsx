export default function Pricing() {
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
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>

      <main className="mx-auto max-w-6xl px-4 py-14 relative z-20">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
            style={{ 
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
              letterSpacing: '-0.02em',
              textShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            Bảng giá Dịch vụ Tham khảo
          </h1>
          <p className="text-white/90 text-lg font-medium">
            Minh bạch chi phí - An tâm bảo dưỡng
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Service 1 - Kiểm tra tổng quát */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 border-t-4 border-primary">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-2">
                  Dịch vụ Phổ thông
                </span>
                <h3 className="font-bold text-xl text-gray-900">
                  Kiểm Tra Tổng Quát Xe
                </h3>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              Kiểm tra toàn diện xe, hệ thống điện, phanh, lốp, cập nhật phần mềm (nếu có) theo chuẩn hãng.
            </p>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Giá tham khảo</p>
              <p className="text-3xl font-bold text-primary">300.000 <span className="text-lg">VNĐ</span></p>
            </div>
          </div>

          {/* Service 2 - Bảo dưỡng pin */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 border-t-4 border-accent">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="inline-block bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full mb-2">
                  Dịch vụ Đặc thù EV
                </span>
                <h3 className="font-bold text-xl text-gray-900">
                  Bảo Dưỡng Hệ Thống Làm Mát Pin
                </h3>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              Kiểm tra hệ thống làm mátx pin, đảm bảo nhiệt độ hoạt động tối ưu và an toàn cho pin cao áp.
            </p>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Giá tham khảo</p>
              <p className="text-3xl font-bold text-accent">350.000 <span className="text-lg">VNĐ</span></p>
              <p className="text-xs tet-gray-500 mt-1 italic">Chưa bao gồm dung dịch</p>
            </div>
          </div>

          {/* Service 3 - Thay lọc gió */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 border-t-4 border-primary">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <div>
                <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                  Dịch vụ Hỗ trợ
                </span>
                <h3 className="font-bold text-xl text-gray-900">
                  Thay Lọc Gió Cabin (Điều Hòa)
                </h3>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              Giúp không khí trong xe luôn sạch, loại bỏ bụi mịn và mùi khó chịu, tăng hiệu quả làm mát.
            </p>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Giá tham khảo</p>
              <p className="text-3xl font-bold text-orange-600">200.000 <span className="text-lg">VNĐ</span></p>
              <p className="text-xs text-gray-500 mt-1 italic">Trọn gói</p>
            </div>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg max-w-4xl mx-auto mb-12">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-700 leading-relaxed">
              <span className="font-semibold">Lưu ý:</span> Giá trên là giá tham khảo cho các hạng mục cơ bản, chưa bao gồm VAT và có thể thay đổi tùy theo dòng xe. Vui lòng{' '}
              <a href="/contact" className="text-orange-600 font-semibold hover:text-orange-700 underline">
                Liên hệ Tư vấn
              </a>
              {' '}để nhận báo giá chính xác nhất.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-10 shadow-2xl max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Sẵn sàng trải nghiệm dịch vụ chuyên nghiệp?
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Đặt lịch ngay hôm nay và nhận ưu đãi đặc biệt cho khách hàng mới
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/customer/booking"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Đặt lịch ngay
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-200"
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
    </div>
  );
}


