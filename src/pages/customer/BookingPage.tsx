import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { bookTimeSlot, getAvailableTimeSlots, getNextAvailableDates, isTimeSlotAvailable } from '@/lib/bookingUtils';
import { getRegisteredVehicles } from '@/lib/sessionStore';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Car,
  Clock,
  Wrench
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const bookingSchema = z.object({
  services: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất một dịch vụ'),
  vehicleModel: z.string().min(1, 'Vui lòng chọn mẫu xe'),
  plate: z.string().min(1, 'Vui lòng nhập biển số xe'),
  year: z.string().min(1, 'Vui lòng nhập năm sản xuất'),
  date: z.date({
    required_error: 'Vui lòng chọn ngày',
  }),
  time: z.string().min(1, 'Vui lòng chọn giờ'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { vehicles?: RegisteredVehicle[]; preselectVehicleId?: string } };
  const { toast } = useToast();
  const user = { email: 'customer@example.com', role: 'customer', userType: 'customer' };
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [nextAvailableDates, setNextAvailableDates] = useState<string[]>([]);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      services: [],
      vehicleModel: '',
      plate: '',
      year: '',
      time: '',
      notes: '',
    },
  });

  const services = [
    {
      id: 'maintenance',
      name: 'Bảo dưỡng định kỳ',
      description: 'Kiểm tra tổng quát hệ thống xe điện',
      price: 2500000,
      duration: '2-3 giờ'
    },
    {
      id: 'battery',
      name: 'Kiểm tra pin',
      description: 'Chẩn đoán và bảo dưỡng hệ thống pin',
      price: 1800000,
      duration: '1-2 giờ'
    },
    {
      id: 'software',
      name: 'Cập nhật phần mềm',
      description: 'Cập nhật firmware và phần mềm xe',
      price: 500000,
      duration: '30-60 phút'
    },
    {
      id: 'inspection',
      name: 'Kiểm tra an toàn',
      description: 'Kiểm tra hệ thống phanh và an toàn',
      price: 1200000,
      duration: '1-2 giờ'
    }
  ];

  type RegisteredVehicle = { id: string; name: string; type: string; plate?: string; year?: string };
  // Danh sách xe khách hàng đã đăng ký (nhận từ trang vehicles qua navigation state)
  const registeredVehicles: RegisteredVehicle[] = Array.isArray(location.state?.vehicles)
    ? (location.state?.vehicles as RegisteredVehicle[])
    : getRegisteredVehicles();
  const preselectVehicleId = location.state?.preselectVehicleId;

  // Bản đồ dịch vụ phù hợp theo model xe
  const compatibleServicesByModel: Record<string, string[]> = {
    vf8: ['maintenance', 'battery', 'software', 'inspection'],
    vf9: ['maintenance', 'battery', 'software', 'inspection'],
    vfe34: ['maintenance', 'software', 'inspection'],
    vf5: ['maintenance', 'software', 'inspection']
  };

  // Dùng danh sách xe đã đăng ký để hiển thị trong Select
  const vehicleModels = registeredVehicles.map(v => ({ id: v.id, name: v.name, type: v.type }));

  // Load next available dates on component mount
  useEffect(() => {
    const dates = getNextAvailableDates();
    setNextAvailableDates(dates);
  }, []);

  // Watch for date changes to update available time slots
  const watchedDate = form.watch('date');
  const watchedServices = form.watch('services');
  const watchedVehicleModel = form.watch('vehicleModel');

  useEffect(() => {
    if (watchedDate) {
      const year = watchedDate.getFullYear();
      const month = String(watchedDate.getMonth() + 1).padStart(2, '0');
      const day = String(watchedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const slots = getAvailableTimeSlots(dateString);
      const times = slots.map(slot => slot.time);
      setAvailableTimeSlots(times);
      form.setValue('time', ''); // Reset selected time when date changes
    }
  }, [watchedDate, form]);

  // Preselect vehicle if provided from navigation
  useEffect(() => {
    if (preselectVehicleId) {
      form.setValue('vehicleModel', preselectVehicleId);
    }
  }, [preselectVehicleId, form]);

  // Khi chọn mẫu xe đã đăng ký, tự động fill biển số/năm nếu có
  useEffect(() => {
    if (watchedVehicleModel) {
      const v = registeredVehicles.find(rv => rv.id === watchedVehicleModel);
      if (v) {
        if (!form.getValues('plate')) form.setValue('plate', v.plate || '');
        if (!form.getValues('year')) form.setValue('year', v.year || '');
      }
    }
  }, [watchedVehicleModel, form, registeredVehicles]);

  // Calculate total amount (for display only, not for payment)
  const totalAmount = watchedServices.reduce((total, serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return total + (service?.price || 0);
  }, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const onSubmit = (data: BookingFormData) => {
    // Check if the selected time slot is still available
    const year = data.date.getFullYear();
    const month = String(data.date.getMonth() + 1).padStart(2, '0');
    const day = String(data.date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    if (!isTimeSlotAvailable(dateString, data.time)) {
      toast({
        title: "Khung giờ đã hết chỗ",
        description: "Khung giờ này đã được đặt bởi khách hàng khác, vui lòng chọn khung giờ khác",
        variant: "destructive"
      });
      return;
    }

    const selectedVehicleData = vehicleModels.find(v => v.id === data.vehicleModel);

    if (selectedVehicleData) {
      // Book the time slot
      const bookingSuccess = bookTimeSlot(dateString, data.time);
      if (!bookingSuccess) {
        toast({
          title: "Đặt lịch thất bại",
          description: "Khung giờ này không còn khả dụng, vui lòng chọn khung giờ khác",
          variant: "destructive"
        });
        return;
      }

      const selectedServicesData = data.services.map(serviceId =>
        services.find(s => s.id === serviceId)
      ).filter(Boolean);

      // Create booking data
      const bookingData = {
        id: `BK${Date.now()}`,
        services: selectedServicesData.map(service => ({
          id: service?.id || '',
          name: service?.name || '',
          price: service?.price || 0,
          duration: service?.duration || '',
          description: service?.description || ''
        })),
        vehicle: {
          id: data.vehicleModel,
          name: selectedVehicleData.name,
          plate: data.plate,
          model: selectedVehicleData.name,
          year: data.year
        },
        date: dateString,
        time: data.time,
        status: 'pending' as const,
        center: 'Trung tâm bảo dưỡng Hà Nội',
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
        estimatedDuration: selectedServicesData.length > 0
          ? selectedServicesData.map(s => s?.duration).join(', ')
          : '2-3 giờ',
        // Payment will be created after service completion
        paymentStatus: 'pending',
        totalAmount: 0 // Will be calculated after service completion
      };

      // In real app, this would be sent to API
      console.log('Booking created:', bookingData);

      toast({
        title: "Đặt lịch thành công!",
        description: "Yêu cầu đặt lịch đã được gửi, trung tâm sẽ xác nhận trong vòng 24h",
      });

      navigate('/customer/booking-status', {
        state: { bookingData }
      });
    }
  };

  // Nếu khách hàng chưa có xe đã đăng ký, hiển thị CTA đăng ký xe trước
  if (registeredVehicles.length === 0) {
    return (
      <DashboardLayout title="" user={user}>
        <div className="mx-auto max-w-2xl p-6 border rounded-xl bg-card">
          <h2 className="text-xl font-semibold mb-2">Bạn chưa đăng ký xe</h2>
          <p className="text-muted-foreground mb-4">Vui lòng đăng ký xe trước khi đặt lịch để chúng tôi đề xuất dịch vụ phù hợp với mẫu xe của bạn.</p>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/customer/vehicles')}>
              Đăng ký xe ngay
            </Button>
            <Button variant="outline" onClick={() => navigate('/customer')}>Quay lại</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Lọc dịch vụ theo mẫu xe đã chọn (nếu có)
  const visibleServices = watchedVehicleModel
    ? services.filter(s => (compatibleServicesByModel[watchedVehicleModel] || []).includes(s.id))
    : [];

  return (
    <DashboardLayout title="" user={user}>
      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Thông tin</TableHead>
                    <TableHead>Giá trị</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Service Selection */}
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Dịch vụ
                      </div>
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="services"
                        render={({ field }) => (
                          <FormItem>
                            <div className="space-y-3">
                              {!watchedVehicleModel && (
                                <div className="text-sm text-muted-foreground">Vui lòng chọn mẫu xe để xem dịch vụ phù hợp.</div>
                              )}
                              {watchedVehicleModel && visibleServices.map((service) => (
                                <div
                                  key={service.id}
                                  className={cn(
                                    "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:border-primary",
                                    field.value?.includes(service.id) && "border-primary bg-primary/5"
                                  )}
                                  onClick={() => {
                                    const currentServices = field.value || [];
                                    const isSelected = currentServices.includes(service.id);
                                    if (isSelected) {
                                      field.onChange(currentServices.filter(id => id !== service.id));
                                    } else {
                                      field.onChange([...currentServices, service.id]);
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={field.value?.includes(service.id) || false}
                                      onChange={() => { }}
                                      className="w-4 h-4"
                                    />
                                    <div>
                                      <div className="font-medium">{service.name}</div>
                                      <div className="text-sm text-muted-foreground">{service.description}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant="secondary">{formatPrice(service.price)}</Badge>
                                    <div className="text-xs text-muted-foreground mt-1">{service.duration}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Vehicle Model */}
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        Mẫu xe
                      </div>
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="vehicleModel"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Chọn mẫu xe" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {vehicleModels.map((vehicle) => (
                                  <SelectItem key={vehicle.id} value={vehicle.id}>
                                    <div className="flex items-center gap-2">
                                      <span>{vehicle.name}</span>
                                      <Badge variant="outline">{vehicle.type}</Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Plate Number */}
                  <TableRow>
                    <TableCell className="font-medium">Biển số xe</TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="plate"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="30A-123.45" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Year */}
                  <TableRow>
                    <TableCell className="font-medium">Năm sản xuất</TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="2024" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Date */}
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Ngày bảo dưỡng
                      </div>
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy")
                                    ) : (
                                      <span>Chọn ngày</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);

                                    // Disable past dates
                                    if (date < today) return true;

                                    // Only allow September 2025
                                    const year = date.getFullYear();
                                    const month = date.getMonth() + 1;

                                    if (year !== 2025 || month !== 9) return true;

                                    return false;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Time */}
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Giờ bảo dưỡng
                      </div>
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="grid grid-cols-2 gap-2">
                                {availableTimeSlots.length > 0 ? (
                                  availableTimeSlots.map((time) => (
                                    <Button
                                      key={time}
                                      type="button"
                                      variant={field.value === time ? "default" : "outline"}
                                      className="justify-center"
                                      onClick={() => field.onChange(time)}
                                    >
                                      <Clock className="w-4 h-4 mr-2" />
                                      {time}
                                    </Button>
                                  ))
                                ) : (
                                  <div className="col-span-2 text-center py-8">
                                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                      {watchedDate ? "Ngày này đã hết lịch trống" : "Vui lòng chọn ngày trước"}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Notes */}
                  <TableRow>
                    <TableCell className="font-medium">Ghi chú thêm</TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Ví dụ: Xe có tiếng ồn lạ ở bánh trước, pin sạc chậm..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Service Summary */}
                  {watchedServices.length > 0 && (
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold text-lg">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-5 h-5" />
                          Tóm tắt dịch vụ
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {watchedServices.length} dịch vụ đã chọn
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Chờ xác nhận từ trung tâm
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/customer')}>
                Hủy bỏ
              </Button>
              <Button type="submit" variant="electric" className="flex-1">
                Xác nhận đặt lịch
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}