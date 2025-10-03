export default function Blog() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="rounded-xl p-6 bg-card border shadow">
            <h3 className="font-semibold mb-2">Cập nhật phiên bản mới</h3>
            <p className="text-sm text-muted-foreground">Các cải tiến giúp tối ưu vận hành gara.</p>
          </article>
          <article className="rounded-xl p-6 bg-card border shadow">
            <h3 className="font-semibold mb-2">Kinh nghiệm quản lý kho phụ tùng</h3>
            <p className="text-sm text-muted-foreground">Giảm thất thoát, tăng hiệu quả.</p>
          </article>
          <article className="rounded-xl p-6 bg-card border shadow">
            <h3 className="font-semibold mb-2">Tự động hóa chăm sóc khách hàng</h3>
            <p className="text-sm text-muted-foreground">Nâng cao trải nghiệm và doanh thu.</p>
          </article>
        </div>
      </main>
    </div>
  );
}


