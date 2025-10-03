import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="w-full border-b bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span className="font-semibold">EV Service Center</span>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate('/login')}>Đăng nhập</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-14 space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold">Giới thiệu</h1>
        <p className="text-muted-foreground md:text-lg max-w-3xl">
          Nền tảng quản lý gara ô tô toàn diện: chuẩn hóa quy trình, tối ưu chi phí nhân sự và vận hành,
          sẵn sàng mở rộng quy mô. Phù hợp gara sửa chữa, detailing, đại lý chính hãng, salon xe cũ.
        </p>
      </main>
    </div>
  );
}


