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
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
      `}</style>

      <main className="mx-auto max-w-6xl px-4 py-14 relative z-20">
        {/* Title Section */}
        <div className="text-center mb-16 md:mb-20">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 text-primary-foreground"
            style={{ 
              letterSpacing: '-0.02em',
              textShadow: '0 4px 12px rgba(0,0,0,0.2)'
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
            { icon: 'M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5', badge: 'Dịch vụ Hỗ trợ', title: 'Thay Lọc Gió Cabin (Điều Hòa)', desc: 'Giúp không khí trong xe luôn sạch, loại bỏ bụi mịn và mùi khó chịu, tăng hiệu quả làm mát.', price: '200.000', border: 'border-primary', bg: 'bg-gradient-to-br from-primary to-primary', badgeBg: 'bg-primary/10', badgeText: 'text-primary', priceColor: 'text-primary' }
          ].map((service, i) => (
            <div key={i} className={`bg-card rounded-2xl p-8 shadow-2xl hover:shadow-2xl transition-smooth hover:-translate-y-2 border-t-4 ${service.border}`}>
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
                <p className="text-sm text-muted-foreground mb-2">Giá tham khảo</p>
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
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-xl transition-smooth hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Đặt lịch ngay
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-card text-foreground font-bold rounded-xl shadow-lg hover:shadow-xl transition-smooth hover:-translate-y-1 border-2 border-border"
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


