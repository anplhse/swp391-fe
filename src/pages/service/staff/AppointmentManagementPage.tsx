import { AppointmentTable } from '@/components/AppointmentTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface Appointment {
  id: string;
  services: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
  }>;
  vehicle: {
    id: string;
    name: string;
    plate: string;
    model: string;
    year?: string;
  };
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  center: string;
  technician?: string;
  notes?: string;
  createdAt: string;
  estimatedDuration: string;
  paymentStatus?: string;
  totalAmount?: number;
}

export default function AppointmentManagementPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const { toast } = useToast();

  const appointmentSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
    technician: z.string().optional(),
    notes: z.string().optional()
  });
  type AppointmentFormData = z.infer<typeof appointmentSchema>;

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { status: 'pending', technician: '', notes: '' }
  });


  useEffect(() => {
    // Mock data
    const mockAppointments: Appointment[] = [
      {
        id: 'BK2025001',
        services: [{
          id: 'maintenance',
          name: 'Bảo dưỡng định kỳ',
          description: 'Kiểm tra tổng quát hệ thống xe điện',
          price: 2500000,
          duration: '2-3 giờ'
        }],
        vehicle: {
          id: 'vf8',
          name: 'VinFast VF8',
          plate: '30A-12345',
          model: 'VF8 Plus',
          year: '2024'
        },
        date: '2025-09-15',
        time: '09:00',
        status: 'pending',
        center: 'Trung tâm bảo dưỡng Hà Nội',
        notes: 'Xe có tiếng ồn lạ ở bánh trước',
        createdAt: '2025-01-10T10:30:00Z',
        estimatedDuration: '2-3 giờ',
        paymentStatus: 'pending',
        totalAmount: 0
      },
      {
        id: 'BK2025002',
        services: [{
          id: 'battery',
          name: 'Kiểm tra pin',
          description: 'Chẩn đoán và bảo dưỡng hệ thống pin',
          price: 1800000,
          duration: '1-2 giờ'
        }, {
          id: 'software',
          name: 'Cập nhật phần mềm',
          description: 'Cập nhật firmware và phần mềm xe',
          price: 500000,
          duration: '30-60 phút'
        }],
        vehicle: {
          id: 'vf9',
          name: 'VinFast VF9',
          plate: '29B-67890',
          model: 'VF9 Plus',
          year: '2024'
        },
        date: '2025-09-16',
        time: '14:00',
        status: 'confirmed',
        center: 'Trung tâm bảo dưỡng Hà Nội',
        technician: 'Kỹ thuật viên A',
        notes: 'Pin sạc chậm',
        createdAt: '2025-01-11T14:20:00Z',
        estimatedDuration: '1-2 giờ, 30-60 phút',
        paymentStatus: 'pending',
        totalAmount: 0
      },
      {
        id: 'BK2025003',
        services: [{
          id: 'inspection',
          name: 'Kiểm tra an toàn',
          description: 'Kiểm tra hệ thống phanh và an toàn',
          price: 1200000,
          duration: '1-2 giờ'
        }],
        vehicle: {
          id: 'vfe34',
          name: 'VinFast VF e34',
          plate: '51C-11111',
          model: 'VF e34',
          year: '2023'
        },
        date: '2025-09-17',
        time: '10:30',
        status: 'in_progress',
        center: 'Trung tâm bảo dưỡng Hà Nội',
        technician: 'Kỹ thuật viên B',
        notes: 'Kiểm tra hệ thống phanh',
        createdAt: '2025-01-12T09:15:00Z',
        estimatedDuration: '1-2 giờ',
        paymentStatus: 'pending',
        totalAmount: 0
      },
      {
        id: 'BK2025004',
        services: [{
          id: 'maintenance',
          name: 'Bảo dưỡng định kỳ',
          description: 'Kiểm tra tổng quát hệ thống xe điện',
          price: 2500000,
          duration: '2-3 giờ'
        }, {
          id: 'battery',
          name: 'Kiểm tra pin',
          description: 'Chẩn đoán và bảo dưỡng hệ thống pin',
          price: 1800000,
          duration: '1-2 giờ'
        }],
        vehicle: {
          id: 'vf5',
          name: 'VinFast VF5',
          plate: '43D-22222',
          model: 'VF5',
          year: '2024'
        },
        date: '2025-09-18',
        time: '08:00',
        status: 'completed',
        center: 'Trung tâm bảo dưỡng Hà Nội',
        technician: 'Kỹ thuật viên C',
        notes: 'Bảo dưỡng toàn diện',
        createdAt: '2025-01-13T16:45:00Z',
        estimatedDuration: '2-3 giờ, 1-2 giờ',
        paymentStatus: 'pending',
        totalAmount: 4300000
      }
    ];
    setAppointments(mockAppointments);
  }, []);


  const handleConfirm = (id: string) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === id ? { ...apt, status: 'confirmed' as const } : apt
      )
    );
  };

  const handleCancel = (id: string) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
      )
    );
  };


  const openEdit = (apt: Appointment) => {
    setEditing(apt);
    form.reset({ status: apt.status, technician: apt.technician || '', notes: apt.notes || '' });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: AppointmentFormData) => {
    if (!editing) return;
    const next = appointments.map(a => a.id === editing.id ? { ...a, status: data.status, technician: data.technician, notes: data.notes } : a);
    setAppointments(next);
    setIsDialogOpen(false);
    toast({ title: 'Cập nhật lịch hẹn thành công' });
  };

  return (
    <div className="space-y-6">
      <AppointmentTable
        appointments={appointments}
        onEdit={openEdit}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        showActions={true}
      />
      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật lịch hẹn</DialogTitle>
            <DialogDescription>Chỉnh sửa trạng thái, kỹ thuật viên và ghi chú</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Chờ xác nhận</SelectItem>
                        <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                        <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="technician"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kỹ thuật viên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên kỹ thuật viên" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Input placeholder="Ghi chú cho lịch hẹn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit">Lưu</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
