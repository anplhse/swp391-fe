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
    // Appointments should be loaded from API
    // TODO: Load appointments from API
    setAppointments([]);
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
