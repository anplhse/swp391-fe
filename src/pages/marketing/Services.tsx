import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Services() {
  const navigate = useNavigate();
  const [hoveredVehicle, setHoveredVehicle] = useState<number | null>(null);

  return (
    <div
      className="min-h-screen text-foreground relative overflow-hidden"
      style={{
        background:
          "linear-gradient(-45deg, hsl(var(--chart-5)), hsl(var(--chart-4)), hsl(var(--chart-3)), hsl(var(--muted)))",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
      }}
    >
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        .transition-smooth { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
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

      {/* Header */}
      <header className="w-full border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-gradient-to-r from-secondary/50 to-secondary px-4 py-2 rounded-2xl shadow-xl border border-border">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span className="font-semibold text-foreground">VinFast Service Workshop</span>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/about" className="hover:text-foreground">Giới thiệu</a>
            <a href="/services" className="hover:text-foreground">Dịch vụ</a>
            <a href="/pricing" className="hover:text-foreground">Bảng giá</a>
            <a href="/blog" className="hover:text-foreground">Blog</a>
            <a href="/contact" className="hover:text-foreground">Liên hệ</a>
          </nav>

          <div className="flex items-center gap-3 relative z-30">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="font-semibold px-6 py-2 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
            >
              Trang chủ
            </Button>
            <Button
              onClick={() => navigate("/login")}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-14 relative z-20">
        {/* Hero Section */}
        <div
          className="mb-12 md:mb-16 text-center"
          style={{ animation: "fadeInUp 0.8s ease-out" }}
        >
          <h1
            className="text-5xl md:text-7xl font-bold text-foreground mb-4 inline-block"
            style={{
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
              letterSpacing: "-0.03em",
              textShadow: "0 4px 20px rgba(0,0,0,0.2)",
              animation: "floatSlow 6s ease-in-out infinite",
            }}
          >
            Dịch Vụ
          </h1>
        </div>
        {/* Top 3 features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 md:mb-16">
          <div
            className="group rounded-2xl p-7 bg-card backdrop-blur-sm shadow-2xl hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-3 hover:scale-105 border-2 border-card hover:border-primary/30 relative overflow-hidden"
            style={{ animation: "bounceIn 1s ease-out" }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-card/50 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500"
              style={{ animation: "shimmer 2s infinite" }}
            ></div>
            <div className="mb-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <svg
                  className="w-7 h-7 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-bold mb-3 text-xl text-foreground group-hover:text-primary transition-colors duration-300 relative z-10">
              Đặt lịch hẹn{" "}
              <span className="text-primary font-black">24/7</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300 relative z-10">
              Chủ động chọn dịch vụ, xem khung giờ còn trống và đặt hẹn bất cứ
              lúc nào, kể cả nửa đêm. Không cần chờ điện thoại.
            </p>
          </div>

          <div
            className="group rounded-2xl p-7 bg-card backdrop-blur-sm shadow-2xl hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-3 hover:scale-105 border-2 border-card hover:border-primary/30 relative overflow-hidden"
            style={{ animation: "bounceIn 1.2s ease-out" }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-card/50 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500"
              style={{ animation: "shimmer 2s infinite" }}
            ></div>
            <div className="mb-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <svg
                  className="w-7 h-7 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-bold mb-3 text-xl text-foreground group-hover:text-primary transition-colors duration-300 relative z-10">
              Theo dõi tiến độ
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300 relative z-10">
              Biết chính xác xe đang ở trạng thái nào (Chẩn đoán, Đang sửa, Chờ
              phụ tùng, Hoàn tất) ngay trên app.
            </p>
          </div>

          <div
            className="group rounded-2xl p-7 bg-card backdrop-blur-sm shadow-2xl hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-3 hover:scale-105 border-2 border-card hover:border-primary/30 relative overflow-hidden"
            style={{ animation: "bounceIn 1.4s ease-out" }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-card/50 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500"
              style={{ animation: "shimmer 2s infinite" }}
            ></div>
            <div className="mb-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <svg
                  className="w-7 h-7 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-bold mb-3 text-xl text-foreground group-hover:text-primary transition-colors duration-300 relative z-10">
              Sổ Bảo Dưỡng Điện Tử
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300 relative z-10">
              Lưu trữ lịch sử sửa chữa, bảo dưỡng, thay linh kiện. Không lo mất
              sổ, giúp giữ giá xe khi bán lại.
            </p>
          </div>
        </div>

        {/* Bottom 2 features centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20 md:mb-28">
          <div
            className="group rounded-2xl p-7 bg-card backdrop-blur-sm shadow-2xl hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-3 hover:scale-105 border-2 border-card hover:border-primary/30 relative overflow-hidden"
            style={{ animation: "slideInLeft 1s ease-out" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-card/50 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="mb-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <svg
                  className="w-7 h-7 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-bold mb-3 text-xl text-foreground group-hover:text-primary transition-colors duration-300 relative z-10">
              Tư vấn & Báo giá Trực tuyến
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300 relative z-10">
              Chat với Cố vấn Dịch vụ, hỏi đáp kỹ thuật và nhận báo giá ước tính
              trước khi mang xe đến.
            </p>
          </div>

          <div
            className="group rounded-2xl p-7 bg-card backdrop-blur-sm shadow-2xl hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-3 hover:scale-105 border-2 border-card hover:border-primary/30 relative overflow-hidden"
            style={{ animation: "slideInRight 1s ease-out" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-card/50 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="mb-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <svg
                  className="w-7 h-7 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-bold mb-3 text-xl text-foreground group-hover:text-accent transition-colors relative z-10">
              Nhắc lịch & Ưu đãi Thành viên
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors relative z-10">
              Nhận thông báo khi xe sắp đến kỳ bảo dưỡng và là người đầu tiên
              nhận ưu đãi dành cho thành viên.
            </p>
          </div>
        </div>

        {/* Featured Vehicle Models Section */}
        <div
          className="mt-28 md:mt-40 mb-20 md:mb-28"
          style={{ animation: "fadeInUp 2.4s ease-out" }}
        >
          <div className="text-center mb-16 md:mb-20">
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-3"
              style={{
                textShadow: "0 4px 20px hsl(var(--foreground) / 0.2)",
              }}
            >
              Dòng Xe Điển Hình
            </h2>
            <p className="text-muted-foreground text-lg">
              Một số dòng xe VinFast chúng tôi sửa chữa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                model: "VF 3",
                brand: "VinFast",
                seats: 4,
                batteryCapacity: 18.64,
                range: 210,
                acceleration: 0.5,
                power: 32,
                weight: 1090,
                imageUrl:
                  "https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf3-do.png",
              },
              {
                model: "VF 5 Plus",
                brand: "VinFast",
                seats: 5,
                batteryCapacity: 37.23,
                range: 326,
                acceleration: 0.5,
                power: 100,
                weight: 1360,
                imageUrl:
                  "https://vinfastbinhthanh.com/wp-content/uploads/2024/01/vinfast_vf5_trang-768x768.webp",
              },
              {
                model: "VF 6",
                brand: "VinFast",
                seats: 5,
                batteryCapacity: 59.6,
                range: 399,
                acceleration: 0.5,
                power: 150,
                weight: 1550,
                imageUrl:
                  "https://i.pinimg.com/736x/1c/d6/c8/1cd6c8d23d8815f29ebd852f158e3119.jpg",
              },
              {
                model: "VF 7",
                brand: "VinFast",
                seats: 5,
                batteryCapacity: 75.3,
                range: 431,
                acceleration: 0.42,
                power: 260,
                weight: 2025,
                imageUrl:
                  "https://i.pinimg.com/736x/e3/c9/ae/e3c9aeed275f2b3efcf0f4e008a9992b.jpg",
              },
              {
                model: "VF 8",
                brand: "VinFast",
                seats: 5,
                batteryCapacity: 87.7,
                range: 471,
                acceleration: 0.43,
                power: 300,
                weight: 2605,
                imageUrl:
                  "https://i.pinimg.com/736x/8d/1d/43/8d1d4386aa53db78fa935b4ff4b67161.jpg",
              },
              {
                model: "VF 9",
                brand: "VinFast",
                seats: 7,
                batteryCapacity: 92,
                range: 438,
                acceleration: 0.43,
                power: 300,
                weight: 2830,
                imageUrl:
                  "https://i.pinimg.com/736x/43/e9/17/43e917f48fe53c38185bd39cf750d6d6.jpg",
              },
            ].map((vehicle, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden bg-card/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 group border-2 border-card hover:border-primary/30"
              >
                <div
                  className="relative h-48 bg-gradient-to-br from-muted to-muted overflow-hidden cursor-pointer"
                  onMouseEnter={() => setHoveredVehicle(index)}
                  onMouseLeave={() => setHoveredVehicle(null)}
                >
                  <img
                    src={vehicle.imageUrl}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                  />

                  {/* Overlay Info - Show on hover */}
                  {hoveredVehicle === index && (
                    <div className="absolute inset-0 bg-foreground/75 backdrop-blur-sm p-4 flex flex-col justify-end animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                          <div>
                            <p className="text-muted-foreground">Сố chỗ ngồi</p>
                            <p className="font-extrabold text-foreground">
                              {vehicle.seats} chỗ
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Pin</p>
                            <p className="font-extrabold text-foreground">
                              {vehicle.batteryCapacity} kWh
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Quãng đường</p>
                            <p className="font-extrabold text-foreground">
                              {vehicle.range} km
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Công suất</p>
                            <p className="font-extrabold text-foreground">
                              {vehicle.power} kW
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Tăng tốc</p>
                            <p className="font-extrabold text-foreground">
                              {vehicle.acceleration}s (0-100km/h)
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Trọng lượng</p>
                            <p className="font-extrabold text-foreground">
                              {vehicle.weight} kg
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5 bg-card">
                  <h3 className="text-xl font-bold text-foreground">
                    {vehicle.model}
                  </h3>
                  <p className="text-muted-foreground">{vehicle.brand}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              onClick={() => navigate("/solutions")}
              className="bg-card text-primary hover:bg-card/90 font-bold px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-smooth hover:scale-110"
            >
              🚗 Xem tất cả dòng xe
            </Button>
          </div>
        </div>

        {/* Process Section */}
        <div
          className="mt-28 md:mt-40 mb-16 md:mb-20"
          style={{ animation: "fadeInUp 2.8s ease-out" }}
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16 md:mb-20"
            style={{ textShadow: "0 4px 20px hsl(var(--foreground) / 0.2)" }}
          >
            Quy trình đơn giản
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "Đăng ký tài khoản",
                desc: "Tạo tài khoản nhanh chóng với email hoặc số điện thoại",
              },
              {
                title: "Chọn dịch vụ",
                desc: "Xem danh sách dịch vụ và chọn dịch vụ phù hợp",
              },
              {
                title: "Đặt lịch hẹn",
                desc: "Chọn ngày giờ thuận tiện và xác nhận đặt lịch",
              },
              {
                title: "Theo dõi tiến độ",
                desc: "Cập nhật trạng thái xe của bạn theo thời gian thực",
              },
            ].map((step, i) => (
              <div
                key={i}
                className=" bg-card backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 border-2 border-card hover:border-primary/30"
              >
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {i + 1}
                </div>
                <h4 className="font-bold text-foreground mb-2 text-lg">
                  {step.title}
                </h4>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div
          className="mt-20 md:mt-24 mb-12"
          style={{ animation: "fadeInUp 3s ease-out" }}
        >
          <div className="bg-card backdrop-blur-sm rounded-3xl p-12 md:p-16 shadow-2xl text-center hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border-2 border-card">
            <h2
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
              style={{
                textShadow: "0 2px 8px hsl(var(--foreground) / 0.1)",
              }}
            >
              Sẵn sàng trải nghiệm dịch vụ chuyên nghiệp?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Đặt lịch ngay hôm nay và nhận ưu đãi đặc biệt cho khách hàng mới
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate("/login")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-smooth hover:scale-110"
              >
                📅 Đặt lịch ngay
              </Button>
              <Button
                onClick={() => navigate("/contact")}
                variant="outline"
                className="bg-card text-foreground hover:bg-secondary/50 border-2 border-border font-bold px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-smooth hover:scale-110"
              >
                ✉️ Liên hệ tư vấn
              </Button>
            </div>
          </div>
        </div>
      </main>

      <div className="relative z-20">
        {/* Footer (multi-column like carCRM) */}
        <footer id="contact" className="border-t bg-card/50">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-primary"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                    </svg>
                  </div>
                  <span className="font-sans font-semibold">
                    VinFast Service Workshop
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {" "}
                  Nền tảng quản lý bảo dưỡng xe VinFast
                </p>
              </div>
              <div className="md:pl-20">
                <h4 className="font-sans font-semibold mb-3 pt-1">Thông tin</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="/about" className="hover:text-foreground">
                      Giới thiệu
                    </a>
                  </li>
                  <li>
                    <a href="/pricing" className="hover:text-foreground">
                      Bảng giá
                    </a>
                  </li>
                  <li>
                    <a href="/blog" className="hover:text-foreground">
                      Blog
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-sans font-semibold mb-3 pt-1">Chức năng</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="/services" className="hover:text-foreground">
                      Đặt lịch
                    </a>
                  </li>
                  <li>
                    <a href="/services" className="hover:text-foreground">
                      Tiếp nhận xe
                    </a>
                  </li>
                  <li>
                    <a href="/services" className="hover:text-foreground">
                      Theo dõi tiến độ sửa chữa
                    </a>
                  </li>
                  <li>
                    <a href="/services" className="hover:text-foreground">
                      Quản lý xe của khách
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-sans font-semibold mb-3 pt-1">Liên hệ</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="/contact" className="hover:text-foreground">
                      Form liên hệ
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t pt-4 text-xs text-muted-foreground">
              © {new Date().getFullYear()} VinFast Service Workshop
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
