export default function Solutions() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-14 space-y-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Giải pháp</h1>
          <p className="text-muted-foreground max-w-3xl">
            Bám sát yêu cầu nghiệp vụ bảo dưỡng EV cho cả khách hàng và trung tâm dịch vụ (Staff, Technician, Admin).
          </p>
        </div>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="rounded-xl p-6 bg-card border shadow">
            <h2 className="text-xl font-semibold mb-3">1) Cho Khách hàng (Customer)</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Theo dõi xe & nhắc nhở: nhắc bảo dưỡng định kỳ, nhắc thanh toán/gia hạn gói.</li>
              <li>Đặt lịch dịch vụ: đặt lịch bảo dưỡng/sửa chữa online, chọn trung tâm dịch vụ & loại dịch vụ.</li>
              <li>Nhận xác nhận & thông báo trạng thái (chờ → đang bảo dưỡng → hoàn tất).</li>
              <li>Quản lý hồ sơ & chi phí: lưu lịch sử bảo dưỡng, chi phí theo từng lần.</li>
              <li>Thanh toán online (e-wallet, banking,…).</li>
            </ul>
          </div>

          <div className="rounded-xl p-6 bg-card border shadow">
            <h2 className="text-xl font-semibold mb-3">2) Cho Trung tâm dịch vụ (Staff/Technician/Admin)</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Quản lý khách hàng & xe: hồ sơ khách, thông tin xe (VIN, lịch sử).</li>
              <li>Quản lý lịch hẹn & dịch vụ: tiếp nhận yêu cầu, lập lịch, phân công, quản lý trạng thái chờ.</li>
              <li>Phiếu tiếp nhận, checklist EV, ghi nhận tình trạng.</li>
              <li>Quản lý quy trình bảo dưỡng: theo dõi tiến độ từng xe (chờ → đang làm → hoàn tất).</li>
              <li>Quản lý phụ tùng: tồn kho, nhu cầu thay thế, cảnh báo mức tối thiểu.</li>
              <li>Quản lý nhân sự: phân công kỹ thuật viên, theo dõi năng lực & thời gian làm việc.</li>
              <li>Chứng chỉ chuyển môn EV & tiêu chuẩn an toàn.</li>
              <li>Tài chính & báo cáo: thống kê chi phí/doanh thu theo dịch vụ/khách, công nợ.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}


