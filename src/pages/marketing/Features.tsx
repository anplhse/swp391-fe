export default function Features() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Chức năng</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-xl p-6 bg-card border shadow">
            <h3 className="font-semibold mb-1">Đặt lịch</h3>
            <p className="text-sm text-muted-foreground">Đặt lịch online, hiển thị khung giờ trống.</p>
          </div>
          <div className="rounded-xl p-6 bg-card border shadow">
            <h3 className="font-semibold mb-1">Tiếp nhận xe</h3>
            <p className="text-sm text-muted-foreground">Tạo phiếu, checklist EV, phân công kỹ thuật viên.</p>
          </div>
          <div className="rounded-xl p-6 bg-card border shadow">
            <h3 className="font-semibold mb-1">Theo dõi tiến độ sửa chữa</h3>
            <p className="text-sm text-muted-foreground">Trạng thái chờ → đang làm → hoàn tất theo thời gian thực.</p>
          </div>
          <div className="rounded-xl p-6 bg-card border shadow">
            <h3 className="font-semibold mb-1">Quản lý xe của khách</h3>
            <p className="text-sm text-muted-foreground">Hồ sơ khách, thông tin xe (VIN), lịch sử bảo dưỡng.</p>
          </div>
        </div>
      </main>
    </div>
  );
}


