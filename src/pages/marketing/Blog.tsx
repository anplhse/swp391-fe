export default function Blog() {
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* Decorative clouds */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl" style={{ animation: 'float 6s ease-in-out infinite' }}></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-white/20 rounded-full blur-3xl" style={{ animation: 'float 8s ease-in-out infinite 1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-white/20 rounded-full blur-3xl" style={{ animation: 'float 7s ease-in-out infinite 2s' }}></div>
      
      <main className="mx-auto max-w-7xl px-4 py-14 relative z-20">
        {/* Hero Section */}
        <div className="mb-16 text-center" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
          <div className="inline-block mb-4">
            <span className="px-5 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full border border-white/30 shadow-lg">
              📚 Kiến thức xe điện
            </span>
          </div>
          <h1 
            className="text-5xl md:text-7xl font-black mb-5 text-white"
            style={{ 
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
              letterSpacing: '-0.03em',
              textShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.1)',
              animation: 'pulse 3s ease-in-out infinite'
            }}
          >
            Blog
          </h1>
          <p className="text-white/95 text-xl mt-5 font-medium max-w-2xl mx-auto leading-relaxed">
            Cập nhật kiến thức mới nhất về bảo dưỡng, công nghệ và mẹo sử dụng xe điện hiệu quả
          </p>
        </div>

        {/* Featured Post */}
        <div className="mb-16" style={{ animation: 'fadeInUp 1.2s ease-out' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
            <h2 className="text-3xl font-bold text-white">Bài Viết Nổi Bật</h2>
          </div>
          <a 
            href="http://cartimes.tapchicongthuong.vn/6-meo-giup-keo-dai-tuoi-tho-pin-xe-dien-mot-cach-hieu-qua-16642.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-3xl overflow-hidden bg-white shadow-2xl hover:shadow-[0_25px_80px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-2"
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 min-h-[300px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ animation: 'shimmer 2s infinite' }}></div>
                <svg className="w-32 h-32 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="p-10">
                <div className="mb-4">
                  <span className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                    ⚡ Bảo dưỡng
                  </span>
                </div>
                <h3 className="font-bold text-3xl text-gray-900 mb-4 leading-tight group-hover:text-orange-600 transition-colors duration-300">
                  6 Mẹo Kéo Dài Tuổi Thọ Pin Xe Điện Hiệu Quả
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Hướng dẫn chi tiết cách sạc và bảo quản để tối ưu hóa tuổi thọ pin xe điện, giúp bạn tiết kiệm chi phí và nâng cao hiệu suất sử dụng.
                </p>
                <div className="flex items-center text-orange-600 font-semibold group-hover:gap-3 gap-2 transition-all duration-300">
                  Đọc ngay
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Section Title */}
        <div className="mb-8" style={{ animation: 'fadeInUp 1.4s ease-out' }}>
          <h2 className="text-3xl font-bold text-white">Bài Viết Mới Nhất</h2>
        </div>

        {/* Grid layout - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <a 
            href="https://vinfastauto.com/vn_vi/bao-duong-o-to-dien" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group rounded-2xl p-7 bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-[0_20px_60px_rgba(255,126,95,0.3)] transition-all duration-500 cursor-pointer hover:-translate-y-3 border-t-4 border-primary flex flex-col relative overflow-hidden"
            style={{ animation: 'fadeInUp 1.6s ease-out' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ animation: 'shimmer 2s infinite' }}></div>
            <div className="mb-4 relative z-10">
              <span className="inline-block bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                📋 Hướng dẫn
              </span>
            </div>
            <h3 className="font-bold mb-3 text-lg text-gray-900 leading-tight min-h-[4.5rem] group-hover:text-primary transition-colors duration-300 relative z-10">
              Bảo Dưỡng Xe Điện: Hướng Dẫn Chi Tiết
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 relative z-10">Các bước bảo dưỡng định kỳ và kiểm tra xe điện chuyên nghiệp.</p>
          </a>

          <a 
            href="https://vinfastauto.com/vn_vi/chi-phi-su-dung-xe-dien" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group rounded-2xl p-7 bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-[0_20px_60px_rgba(255,126,95,0.3)] transition-all duration-500 cursor-pointer hover:-translate-y-3 border-t-4 border-accent flex flex-col relative overflow-hidden"
            style={{ animation: 'fadeInUp 1.8s ease-out' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ animation: 'shimmer 2s infinite' }}></div>
            <div className="mb-4 relative z-10">
              <span className="inline-block bg-accent text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                💰 Chi phí
              </span>
            </div>
            <h3 className="font-bold mb-3 text-lg text-gray-900 leading-tight min-h-[4.5rem] group-hover:text-primary transition-colors duration-300 relative z-10">
              Chi Phí Sử Dụng Xe Điện: So Sánh & Phân Tích
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 relative z-10">So sánh chi phí sạc và bảo dưỡng xe điện với xe xăng.</p>
          </a>

          <a 
            href="https://osakar.com.vn/tin-tuc/sac-xe-dien-qua-dem-co-sao-khong/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group rounded-2xl p-7 bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-[0_20px_60px_rgba(255,126,95,0.3)] transition-all duration-500 cursor-pointer hover:-translate-y-3 border-t-4 border-accent flex flex-col relative overflow-hidden"
            style={{ animation: 'fadeInUp 2s ease-out' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ animation: 'shimmer 2s infinite' }}></div>
            <div className="mb-4 relative z-10">
              <span className="inline-block bg-accent text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                🔒 An toàn
              </span>
            </div>
            <h3 className="font-bold mb-3 text-lg text-gray-900 leading-tight min-h-[4.5rem] group-hover:text-primary transition-colors duration-300 relative z-10">
              Sạc Xe Điện Qua Đêm Có An Toàn?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 relative z-10">Giải đáp lo ngại phổ biến về an toàn khi sạc qua đêm.</p>
          </a>

          <a 
            href="https://thanhnien.vn/vi-sao-lop-o-to-dien-thuong-mon-nhanh-hon-lop-xe-xang-18525051509160644.htm" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group rounded-2xl p-7 bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-[0_20px_60px_rgba(255,126,95,0.3)] transition-all duration-500 cursor-pointer hover:-translate-y-3 border-t-4 border-primary flex flex-col relative overflow-hidden"
            style={{ animation: 'fadeInUp 2.2s ease-out' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ animation: 'shimmer 2s infinite' }}></div>
            <div className="mb-4 relative z-10">
              <span className="inline-block bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                🔧 Linh kiện
              </span>
            </div>
            <h3 className="font-bold mb-3 text-lg text-gray-900 leading-tight min-h-[4.5rem] group-hover:text-primary transition-colors duration-300 relative z-10">
              Vì Sao Lốp Xe Điện Mòn Nhanh Hơn?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 relative z-10">Nguyên nhân và cách chọn lốp phù hợp cho xe điện.</p>
          </a>

          <a 
            href="https://vinfastauto.com/vn_vi/so-sanh-xe-dien-va-xe-xang-ve-kha-nang-cap-nhat-phan-mem" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group rounded-2xl p-7 bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-[0_20px_60px_rgba(255,126,95,0.3)] transition-all duration-500 cursor-pointer hover:-translate-y-3 border-t-4 border-accent flex flex-col relative overflow-hidden"
            style={{ animation: 'fadeInUp 2.4s ease-out' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ animation: 'shimmer 2s infinite' }}></div>
            <div className="mb-4 relative z-10">
              <span className="inline-block bg-accent text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                💻 Công nghệ
              </span>
            </div>
            <h3 className="font-bold mb-3 text-lg text-gray-900 leading-tight min-h-[4.5rem] group-hover:text-primary transition-colors duration-300 relative z-10">
              Xe Điện vs Xe Xăng: Cập Nhật OTA
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 relative z-10">Tính năng cập nhật từ xa và ưu điểm của xe điện.</p>
          </a>

          <a 
            href="https://vinfastauto.com/vn_vi/cong-nghe-sac-nhanh"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl p-7 bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-[0_20px_60px_rgba(255,126,95,0.3)] transition-all duration-500 cursor-pointer hover:-translate-y-3 border-t-4 border-primary flex flex-col relative overflow-hidden"
            style={{ animation: 'fadeInUp 2.6s ease-out' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ animation: 'shimmer 2s infinite' }}></div>
            <div className="mb-4 relative z-10">
              <span className="inline-block bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                ⚡ Sạc pin
              </span>
            </div>
            <h3 className="font-bold mb-3 text-lg text-gray-900 leading-tight min-h-[4.5rem] group-hover:text-primary transition-colors duration-300 relative z-10">
              Công Nghệ Sạc Nhanh Cho Xe Điện
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 relative z-10">Tìm hiểu về các công nghệ sạc nhanh hiện đại và cách tối ưu thời gian sạc.</p>
          </a>
        </div>

        {/* View All Button - CTA */}
        <div className="flex justify-center">
          <a 
            href="https://vinfastauto.com/vn_vi/tin-tuc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative px-8 py-4 bg-white text-gray-900 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 inline-block"
          >
            <span className="relative z-10 flex items-center gap-2">
              Xem tất cả bài viết
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-primary rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Xem tất cả bài viết
              <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </a>
        </div>
      </main>
    </div>
  );
}


