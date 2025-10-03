import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Contact() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Liên hệ</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-xl p-6 bg-card border shadow">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" placeholder="Nguyễn Văn A" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Điện thoại</Label>
                <Input id="phone" placeholder="09xx xxx xxx" />
              </div>
              <Button className="mt-2">Gửi</Button>
            </div>
          </div>
          <div className="rounded-xl p-6 bg-card border shadow">
            <p className="text-muted-foreground">Zalo: 0983.813.813</p>
            <p className="text-muted-foreground">Facebook, Youtube, Twitter</p>
          </div>
        </div>
      </main>
    </div>
  );
}


