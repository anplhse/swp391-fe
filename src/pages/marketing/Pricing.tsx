import { Button } from '@/components/ui/button';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Bảng giá</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl p-6 bg-card border shadow text-center">
            <h3 className="font-semibold mb-1">Gói Cơ bản</h3>
            <p className="text-sm text-muted-foreground mb-4">Phù hợp gara nhỏ</p>
            <div className="text-2xl font-bold mb-4">Liên hệ</div>
            <Button variant="secondary">Tư vấn</Button>
          </div>
          <div className="rounded-xl p-6 bg-card border shadow text-center">
            <h3 className="font-semibold mb-1">Gói Chuyên nghiệp</h3>
            <p className="text-sm text-muted-foreground mb-4">Gara vừa và lớn</p>
            <div className="text-2xl font-bold mb-4">Liên hệ</div>
            <Button variant="secondary">Tư vấn</Button>
          </div>
          <div className="rounded-xl p-6 bg-card border shadow text-center">
            <h3 className="font-semibold mb-1">Gói Doanh nghiệp</h3>
            <p className="text-sm text-muted-foreground mb-4">Tùy chỉnh theo yêu cầu</p>
            <div className="text-2xl font-bold mb-4">Liên hệ</div>
            <Button variant="secondary">Tư vấn</Button>
          </div>
        </div>
      </main>
    </div>
  );
}


