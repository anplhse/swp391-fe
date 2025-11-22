import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="w-full border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-gradient-to-r from-secondary/50 to-secondary px-4 py-2 rounded-2xl shadow-xl border border-border">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5 text-primary"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span className="font-semibold text-foreground">
              VinFast Service Workshop
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/about" className="hover:text-foreground">Giới thiệu</a>
            <a href="/services" className="hover:text-foreground">Dịch vụ</a>
            <a href="/pricing" className="hover:text-foreground">Bảng giá</a>
            <a href="/blog" className="hover:text-foreground">Blog</a>
            <a href="/contact" className="hover:text-foreground">Liên hệ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate('/login')} className="px-4">Đăng nhập</Button>
            <Button variant="outline" onClick={() => navigate('/login', { state: { openRegister: true } })} className="px-4">Đăng ký</Button>
          </div>
        </div>
      </header>

      {/* Hero image centered with top padding */}
      <section className="mx-auto max-w-6xl px-4 pt-6 md:pt-20">
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

      {/* Bỏ mục Giải pháp theo yêu cầu */}

      {/* Remove Pricing section per request */}

        {/* Testimonials Section */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div
          className="space-y-8"
          style={{ animation: "fadeInUp 2.2s ease-out" }}
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4"
            style={{
              textShadow: "0 4px 20px hsl(var(--foreground) / 0.2)",
            }}
          >
            Đánh Giá
          </h2>

          <div className="flex flex-col md:flex-row gap-14 items-stretch">
            <div className="flex-1 group bg-card backdrop-blur-sm rounded-3xl p-4 shadow-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105 border-2 border-card hover:border-primary/30 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shadow-lg">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-base">
                    Anh Minh
                  </h4>
                  <p className="text-sm text-muted-foreground">Chủ xe VF8</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-3.5 h-3.5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed italic">
                "Đặt lịch siêu nhanh, không phải chờ đợi. Tôi yên tâm hơn nhiều
                khi biết xe đang được xử lý!"
              </p>
            </div>

            <div className="flex-1 group bg-card backdrop-blur-sm rounded-3xl p-4 shadow-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105 border-2 border-card hover:border-primary/30 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shadow-lg">
                  T
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-base">
                    Chị Trâm
                  </h4>
                  <p className="text-sm text-muted-foreground">Chủ xe VF9</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-3.5 h-3.5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed italic">
                "Theo dõi tiến độ realtime quá tiện! Không còn lo lắng xe đang ở
                đâu nữa."
              </p>
            </div>

            <div className="flex-1 group bg-card backdrop-blur-sm rounded-3xl p-4 shadow-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105 border-2 border-card hover:border-primary/30 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shadow-lg">
                  H
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-base">
                    Anh Hùng
                  </h4>
                  <p className="text-sm text-muted-foreground">Chủ xe VF5</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-3.5 h-3.5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed italic">
                "Lưu trữ lịch sử bảo dưỡng rất chuyên nghiệp. Khi bán xe lại giữ
                được giá tốt!"
              </p>
            </div>
          </div>
        </div>
        </section>


      {/* Footer (multi-column like carCRM) */}
      <footer id="contact" className="border-t bg-card/50 mt-24">
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
              <p className="text-sm text-muted-foreground"> Nền tảng quản lý bảo dưỡng xe VinFast</p>
            </div>
            <div className="md:pl-20">
              <h4 className="font-sans font-semibold mb-3 pt-1">Thông tin</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground">Giới thiệu</a></li>
                <li><a href="/pricing" className="hover:text-foreground">Bảng giá</a></li>
                <li><a href="/blog" className="hover:text-foreground">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans font-semibold mb-3 pt-1">Chức năng</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/services" className="hover:text-foreground">Đặt lịch</a></li>
                <li><a href="/services" className="hover:text-foreground">Tiếp nhận xe</a></li>
                <li><a href="/services" className="hover:text-foreground">Theo dõi tiến độ sửa chữa</a></li>
                <li><a href="/services" className="hover:text-foreground">Quản lý xe của khách</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans font-semibold mb-3 pt-1">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/contact" className="hover:text-foreground">Form liên hệ</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-4 text-xs text-muted-foreground">© {new Date().getFullYear()} VinFast Service Workshop</div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
