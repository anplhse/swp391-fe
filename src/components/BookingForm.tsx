import { ServiceTable } from '@/components/ServiceTable';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const bookingSchema = z.object({
  services: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất một dịch vụ'),
  vin: z.string().min(6, 'Vui lòng nhập mã VIN hợp lệ'),
  plate: z.string().optional(),
  year: z.string().optional(),
  model: z.string().optional(),
  selectedDate: z.date({
    required_error: 'Vui lòng chọn ngày bảo dưỡng'
  }),
  selectedTimeSlot: z.string().min(1, 'Vui lòng chọn khung giờ'),
  notes: z.string().optional()
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  compatibleVehicles: string[];
  category: string;
}

interface BookingFormProps {
  services: Service[];
}

export function BookingForm({ services }: BookingFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Form setup
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      services: [],
      vin: '',
      plate: '',
      year: '',
      model: '',
      selectedDate: undefined,
      selectedTimeSlot: '',
      notes: ''
    }
  });

  // State
  const [vinData, setVinData] = useState<{
    vin: string;
    brand: string;
    model: string;
    year: string;
    plate?: string;
    type?: string;
  } | null>(null);
  const [isLoadingVin, setIsLoadingVin] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

  // Get selected date and time slot from form
  const selectedDate = form.watch('selectedDate');
  const selectedTimeSlot = form.watch('selectedTimeSlot');

  const loadTimeSlots = useCallback(async (date: Date) => {
    setIsLoadingTimeSlots(true);
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const timeSlots = getAvailableTimeSlots(dateString);
      setAvailableTimeSlots(timeSlots.map(slot => slot.time));

      // Reset selected time slot if not available
      const currentTimeSlot = form.getValues('selectedTimeSlot');
      if (currentTimeSlot && !timeSlots.some(slot => slot.time === currentTimeSlot)) {
        form.setValue('selectedTimeSlot', '');
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải khung giờ khả dụng',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingTimeSlots(false);
    }
  }, [form, toast]);

  const handleVinLookup = useCallback(async (vin: string) => {
    if (!vin.trim()) return;

    // Check if VIN is registered
    const registeredVehicles = getRegisteredVehicles();
    const isRegistered = registeredVehicles.some(v => v.vin === vin.toUpperCase());

    if (!isRegistered) {
      toast({
        title: 'Lỗi',
        description: 'Mã VIN này chưa được đăng ký trong hệ thống',
        variant: 'destructive'
      });
      return;
    }

    setIsLoadingVin(true);
    try {
      const vehicleData = await apiClient.getVehicleByVin(vin);
      setVinData(vehicleData);

      // Auto-fill form with vehicle data
      form.setValue('plate', vehicleData.plate || '');
      form.setValue('year', vehicleData.year || '');
      form.setValue('model', vehicleData.model || '');

      toast({
        title: 'Thành công',
        description: 'Đã tìm thấy thông tin xe'
      });
    } catch (error) {
      console.error('VIN lookup error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tra cứu thông tin xe với mã VIN này',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingVin(false);
    }
  }, [form, toast]);

  // Pre-fill VIN if navigated from vehicle profile
  useEffect(() => {
    if (location.state?.preselectVin) {
      form.setValue('vin', location.state.preselectVin);
      handleVinLookup(location.state.preselectVin);
    }
    if (location.state?.preselectVehicle) {
      const vehicle = location.state.preselectVehicle;
      form.setValue('plate', vehicle.plate || '');
      form.setValue('year', vehicle.year || '');
      form.setValue('model', vehicle.model || '');
    }
  }, [location.state, form, handleVinLookup]);

  // Load available dates on mount
  useEffect(() => {
    const loadAvailableDates = async () => {
      try {
        const dateStrings = getNextAvailableDates('Trung tâm bảo dưỡng Hà Nội', 30); // Next 30 days
        const dates = dateStrings.map(dateStr => new Date(dateStr));
        setAvailableDates(dates);
      } catch (error) {
        console.error('Error loading available dates:', error);
      }
    };
    loadAvailableDates();
  }, []);

  // Load time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(selectedDate);
    }
  }, [selectedDate, loadTimeSlots]);

  // Filter services based on vehicle model from VIN
  const allowedServiceIds = useMemo(() => {
    if (!vinData?.model) return services.map(s => s.id);

    return services
      .filter(service =>
        service.compatibleVehicles.includes(vinData.model) ||
        service.compatibleVehicles.includes('All')
      )
      .map(s => s.id);
  }, [services, vinData?.model]);

  // Lọc dịch vụ theo model từ VIN (nếu có)
  const visibleServices = useMemo(() => services.filter(s => allowedServiceIds.includes(s.id)), [services, allowedServiceIds]);

  const totalPages = Math.ceil(visibleServices.length / 6);

  const onSubmit = async (data: BookingFormData) => {
    try {
      const dateString = format(data.selectedDate, 'yyyy-MM-dd');

      // Check if time slot is still available
      const isAvailable = isTimeSlotAvailable(dateString, data.selectedTimeSlot);
      if (!isAvailable) {
        toast({
          title: 'Lỗi',
          description: 'Khung giờ đã được đặt trước, vui lòng chọn khung giờ khác',
          variant: 'destructive'
        });
        return;
      }

      // Book the time slot
      const success = bookTimeSlot(dateString, data.selectedTimeSlot);
      if (!success) {
        toast({
          title: 'Lỗi',
          description: 'Không thể đặt lịch, vui lòng thử lại',
          variant: 'destructive'
        });
        return;
      }

      // Calculate total price
      const selectedServices = services.filter(s => data.services.includes(s.id));
      const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);

      // Show success message
      toast({
        title: 'Đặt lịch thành công!',
        description: `Tổng cộng: ${new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(totalPrice)}`
      });

      // Navigate to customer dashboard
      navigate('/customer');
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể đặt lịch, vui lòng thử lại',
        variant: 'destructive'
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* VIN Input Section - ở đầu trang */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Car className="w-5 h-5" />
              Thông tin xe
            </h2>
            <div className="flex gap-3">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nhập mã VIN xe (VD: RL4A1234567890ABCD)"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="button"
                onClick={() => handleVinLookup(form.getValues('vin'))}
                disabled={isLoadingVin || !form.getValues('vin')}
              >
                {isLoadingVin ? 'Đang tra cứu...' : 'Tra cứu VIN'}
              </Button>
            </div>
          </div>

          {/* Service Selection Section - chỉ hiện khi có VIN data */}
          {vinData && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Chọn dịch vụ
              </h2>

              {/* Service Selection Table */}
              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <FormItem>
                    <ServiceTable
                      services={visibleServices}
                      mode="selection"
                      selectedServices={field.value || []}
                      onSelectionChange={field.onChange}
                      showActions={false}
                      showSelection={true}
                      itemsPerPage={6}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Booking Details Section */}
          {vinData && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Thông tin</TableHead>
                    <TableHead>Giá trị</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
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
                        name="selectedDate"
                        render={({ field }) => (
                          <FormItem>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
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
                                    return date < today || !availableDates.some(d =>
                                      d.getTime() === date.getTime()
                                    );
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

                  {/* Time Slot */}
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Khung giờ
                      </div>
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="selectedTimeSlot"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {isLoadingTimeSlots ? (
                                  <div className="col-span-full text-center py-4 text-muted-foreground">
                                    Đang tải khung giờ...
                                  </div>
                                ) : availableTimeSlots.length === 0 ? (
                                  <div className="col-span-full text-center py-4 text-muted-foreground">
                                    <AlertCircle className="w-4 h-4 mx-auto mb-1" />
                                    Không có khung giờ khả dụng
                                  </div>
                                ) : (
                                  availableTimeSlots.map((slot) => (
                                    <Button
                                      key={slot}
                                      type="button"
                                      variant={field.value === slot ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => field.onChange(slot)}
                                      className="justify-start"
                                    >
                                      {slot}
                                    </Button>
                                  ))
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Vehicle Info */}
                  <TableRow>
                    <TableCell className="font-medium">Biển số xe</TableCell>
                    <TableCell>{vinData.plate || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Năm sản xuất</TableCell>
                    <TableCell>{vinData.year || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Model</TableCell>
                    <TableCell>{vinData.model || 'N/A'}</TableCell>
                  </TableRow>

                  {/* Notes */}
                  <TableRow>
                    <TableCell className="font-medium">Ghi chú</TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Ghi chú thêm (tùy chọn)"
                                className="min-h-[80px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {/* Submit Button */}
          {vinData && (
            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Đặt lịch bảo dưỡng
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
