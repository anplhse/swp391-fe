import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useVinLookup, VinData } from '@/hooks/useVinLookup';
import { bookingApi } from '@/lib/bookingUtils';
import { extractErrorMessage } from '@/lib/responseHandler';
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
import { useEffect, useMemo, useState } from 'react';
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

interface BookingFormProps {
  services: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    compatibleVehicles: string[];
    relatedParts: Record<string, string[]>;
    category?: string;
    status?: string;
  }>;
}

export function BookingForm({ services }: BookingFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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

  const { vinData, setVinData, lookupVin, clearVinData } = useVinLookup();
  const {
    workingHours,
    slots,
    availableDates,
    availableDateStrings,
    calendarMonth,
    setCalendarMonth,
    defaultCalendarMonth,
    isLoading: isLoadingSlots,
    refetchSlots,
  } = useAvailableSlots();

  const selectedDate = form.watch('selectedDate');
  const { availableTimeSlots, isLoading: isLoadingTimeSlots, loadTimeSlots } = useTimeSlots(
    workingHours,
    slots,
    selectedDate
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Pre-fill form from location state
  useEffect(() => {
    if (location.state?.preselectVin) {
      form.setValue('vin', location.state.preselectVin);
      if (location.state?.preselectVehicle) {
        const vehicle = location.state.preselectVehicle;
        const mappedVinData: VinData = {
          vin: location.state.preselectVin,
          name: vehicle.name || vehicle.model || '',
          plateNumber: vehicle.plateNumber || vehicle.plate || '',
          color: vehicle.color || '',
          distanceTraveledKm: vehicle.distanceTraveledKm || 0,
          batteryDegradation: vehicle.batteryDegradation || 0,
          purchasedAt: vehicle.purchasedAt || new Date().toISOString(),
          createdAt: vehicle.createdAt || new Date().toISOString(),
          entityStatus: vehicle.entityStatus || 'ACTIVE',
          userId: vehicle.userId || 0,
          username: vehicle.username || '',
          modelId: vehicle.modelId || 0,
          modelName: vehicle.modelName || vehicle.model || ''
        };
        setVinData(mappedVinData);
        form.setValue('plate', mappedVinData.plateNumber);
        form.setValue('model', mappedVinData.modelName);
      }
    }

    if (location.state?.editMode && location.state?.existingBooking) {
      const booking = location.state.existingBooking;
      if (booking.vehicle) {
        form.setValue('vin', booking.vehicle.vin);
        const mappedVinData: VinData = {
          vin: booking.vehicle.vin,
          name: booking.vehicle.name || booking.vehicle.model || '',
          plateNumber: booking.vehicle.plateNumber || booking.vehicle.plate || '',
          color: booking.vehicle.color || '',
          distanceTraveledKm: booking.vehicle.distanceTraveledKm || 0,
          batteryDegradation: booking.vehicle.batteryDegradation || 0,
          purchasedAt: booking.vehicle.purchasedAt || new Date().toISOString(),
          createdAt: booking.vehicle.createdAt || new Date().toISOString(),
          entityStatus: booking.vehicle.entityStatus || 'ACTIVE',
          userId: booking.vehicle.userId || 0,
          username: booking.vehicle.username || '',
          modelId: booking.vehicle.modelId || 0,
          modelName: booking.vehicle.modelName || booking.vehicle.model || ''
        };
        setVinData(mappedVinData);
        form.setValue('plate', mappedVinData.plateNumber);
        form.setValue('model', mappedVinData.modelName);
      }
      if (booking.services) {
        form.setValue('services', booking.services.map((s: { id: string }) => s.id));
      }
      if (booking.date) {
        form.setValue('selectedDate', new Date(booking.date));
      }
      if (booking.time) {
        form.setValue('selectedTimeSlot', booking.time);
      }
      if (booking.notes) {
        form.setValue('notes', booking.notes);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.preselectVin, location.state?.preselectVehicle, location.state?.editMode, location.state?.existingBooking, setVinData]);

  // Pre-fill form when vinData loads
  useEffect(() => {
    if (vinData && !location.state?.preselectVin && !location.state?.editMode) {
      form.setValue('vin', vinData.vin);
      form.setValue('plate', vinData.plateNumber || '');
      form.setValue('model', vinData.modelName || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vinData, location.state?.preselectVin, location.state?.editMode]);

  // Clear time slot if not available
  useEffect(() => {
    const currentTimeSlot = form.getValues('selectedTimeSlot');
    if (currentTimeSlot && !availableTimeSlots.includes(currentTimeSlot)) {
      form.setValue('selectedTimeSlot', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTimeSlots]);

  const handleVinLookup = async () => {
    const vin = form.getValues('vin');
    if (!vin.trim()) return;

    try {
      const vehicleData = await lookupVin(vin);
      if (vehicleData) {
        form.setValue('plate', vehicleData.plateNumber || '');
        form.setValue('model', vehicleData.modelName || '');
      }
    } catch {
      // Error already handled in hook
    }
  };

  const visibleServices = useMemo(() => {
    if (!vinData?.modelName) return [];
    return services.filter(service =>
      service.compatibleVehicles.includes(vinData.modelName) ||
      service.compatibleVehicles.includes('All')
    );
  }, [services, vinData?.modelName]);

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return visibleServices;
    return visibleServices.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [visibleServices, searchQuery]);

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredServices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const selectedServices = form.watch('services') || [];
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredServices.length);

  const handleSelectAll = () => {
    const allIds = paginatedServices.map(service => service.id);
    form.setValue('services', [...new Set([...selectedServices, ...allIds])]);
  };

  const handleDeselectAll = () => {
    const currentPageIds = paginatedServices.map(service => service.id);
    form.setValue('services', selectedServices.filter(id => !currentPageIds.includes(id)));
  };

  const handleServiceToggle = (serviceId: string) => {
    const isSelected = selectedServices.includes(serviceId);
    form.setValue(
      'services',
      isSelected
        ? selectedServices.filter(id => id !== serviceId)
        : [...selectedServices, serviceId]
    );
  };

  const allCurrentPageSelected = paginatedServices.every(service =>
    selectedServices.includes(service.id)
  );

  const someCurrentPageSelected = paginatedServices.some(service =>
    selectedServices.includes(service.id)
  );

  const onSubmit = async (data: BookingFormData) => {
    try {
      const dateString = format(data.selectedDate, 'yyyy-MM-dd');
      const scheduleValue = `${dateString} ${data.selectedTimeSlot}:00`;

      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) as { id?: number } : {};
      const customerId = currentUser?.id;

      const selectedServicesList = services.filter(s => data.services.includes(s.id));
      const catalogDetailsPayload = selectedServicesList.map(s => ({
        catalogId: Number(s.id),
        modelId: vinData?.modelId ?? 0,
        description: s.description || ''
      }));

      try {
        const created = await bookingApi.createBooking({
          customerId: Number(customerId),
          vehicleVin: data.vin,
          scheduleDateTime: {
            format: 'yyyy-MM-dd HH:mm:ss',
            value: scheduleValue,
            timezone: null
          },
          catalogDetails: catalogDetailsPayload
        });

        await refetchSlots();
        if (data.selectedDate) {
          await loadTimeSlots(data.selectedDate);
        }

        if (created?.id) {
          localStorage.setItem('latestBookingId', String(created.id));
        }

        const totalPrice = selectedServicesList.reduce((sum, s) => sum + s.price, 0);
        const totalDuration = selectedServicesList.reduce((sum, s) => sum + s.duration, 0);

        const bookingData = {
          id: `BK${Date.now()}`,
          vehicle: {
            vin: data.vin,
            model: vinData?.modelName || 'N/A'
          },
          services: selectedServicesList.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            price: s.price,
            duration: s.duration
          })),
          date: dateString,
          time: data.selectedTimeSlot,
          notes: data.notes || '',
          totalAmount: totalPrice,
          estimatedDuration: totalDuration,
          status: 'pending' as const,
          createdAt: new Date().toISOString()
        };

        localStorage.setItem('latestBooking', JSON.stringify(bookingData));
        clearVinData();

        toast({
          title: 'Đặt lịch thành công!',
          description: 'Đang chuyển đến trang xác nhận...'
        });

        const latestId = localStorage.getItem('latestBookingId');
        navigate('/customer/booking/confirmation', {
          state: latestId ? { bookingId: Number(latestId) } : { bookingData }
        });
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        toast({
          title: 'Lỗi',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const isEditMode = location.state?.editMode;
  const pageContent = useMemo(() => {
    if (isEditMode) {
      return {
        title: 'Chỉnh sửa lịch hẹn',
        description: 'Cập nhật thông tin lịch hẹn của bạn'
      };
    }
    if (!vinData) {
      return {
        title: 'Đặt lịch bảo dưỡng',
        description: 'Điền thông tin để đặt lịch bảo dưỡng xe'
      };
    }
    return {
      title: 'Chọn dịch vụ và thời gian',
      description: `Xe: ${vinData.modelName} - VIN: ${vinData.vin}`
    };
  }, [isEditMode, vinData]);

  const handleClearVin = () => {
    clearVinData();
    form.setValue('vin', '');
    form.setValue('services', []);
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{pageContent.title}</h1>
        <p className="text-muted-foreground mt-2">{pageContent.description}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {!vinData && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Car className="w-6 h-6" />
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
                  onClick={handleVinLookup}
                  disabled={!form.getValues('vin')}
                >
                  Tra cứu VIN
                </Button>
              </div>
            </div>
          )}

          {vinData && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Car className="w-6 h-6" />
                Thông tin xe
              </h2>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Mã VIN:</span>
                    <p className="font-medium">{vinData.vin}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Biển số:</span>
                    <p className="font-medium">{vinData.plateNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Model:</span>
                    <p className="font-medium">{vinData.modelName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Tên xe:</span>
                    <p className="font-medium">{vinData.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Màu sắc:</span>
                    <p className="font-medium">{vinData.color || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Quãng đường:</span>
                    <p className="font-medium">{vinData.distanceTraveledKm?.toLocaleString() || 'N/A'} km</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Pin:</span>
                    <p className="font-medium">{vinData.batteryDegradation || 'N/A'}%</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Ngày mua:</span>
                    <p className="font-medium">
                      {vinData.purchasedAt
                        ? new Date(vinData.purchasedAt).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Ngày tạo:</span>
                    <p className="font-medium">
                      {vinData.createdAt
                        ? new Date(vinData.createdAt).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Tên người dùng:</span>
                    <p className="font-medium">{vinData.username || 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={handleClearVin}>
                    Thay đổi VIN
                  </Button>
                </div>
              </div>
            </div>
          )}

          {vinData && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Wrench className="w-6 h-6" />
                Chọn dịch vụ
              </h2>

              <FormField
                control={form.control}
                name="services"
                render={() => (
                  <FormItem>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Tìm kiếm dịch vụ..."
                          className="w-64"
                        />
                        <div className="flex items-center gap-4">
                          {selectedServices.length > 0 && (
                            <Badge variant="secondary" className="text-sm">
                              Đã chọn {selectedServices.length} dịch vụ
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            Hiển thị {startIndex + 1}-{endIndex} trong {filteredServices.length} dịch vụ
                          </span>
                          {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Trang {currentPage} / {totalPages}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <div className="flex items-center justify-center">
                                  <div
                                    className={cn(
                                      "w-4 h-4 border-2 rounded flex items-center justify-center transition-colors cursor-pointer",
                                      allCurrentPageSelected
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : someCurrentPageSelected
                                          ? "bg-primary/50 border-primary text-primary-foreground"
                                          : "border-muted-foreground"
                                    )}
                                    onClick={allCurrentPageSelected ? handleDeselectAll : handleSelectAll}
                                  >
                                    {allCurrentPageSelected && (
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                    {someCurrentPageSelected && !allCurrentPageSelected && (
                                      <div className="w-2 h-2 bg-primary rounded-sm" />
                                    )}
                                  </div>
                                </div>
                              </TableHead>
                              <TableHead>Tên dịch vụ</TableHead>
                              <TableHead>Giá</TableHead>
                              <TableHead>Thời gian</TableHead>
                              <TableHead>Phụ tùng liên quan</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedServices.map((service) => {
                              const isSelected = selectedServices.includes(service.id);
                              const modelParts = vinData?.modelName ? service.relatedParts?.[vinData.modelName] : null;
                              return (
                                <TableRow
                                  key={service.id}
                                  className={cn(
                                    "cursor-pointer hover:bg-muted/50",
                                    isSelected && "bg-primary/5"
                                  )}
                                  onClick={() => handleServiceToggle(service.id)}
                                >
                                  <TableCell>
                                    <div className="flex items-center justify-center">
                                      <div
                                        className={cn(
                                          "w-4 h-4 border-2 rounded flex items-center justify-center transition-colors",
                                          isSelected
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : "border-muted-foreground"
                                        )}
                                      >
                                        {isSelected && (
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{service.name}</div>
                                      <div className="text-sm text-muted-foreground">{service.description}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {new Intl.NumberFormat('vi-VN', {
                                      style: 'currency',
                                      currency: 'VND'
                                    }).format(service.price)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {service.duration} phút
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {!modelParts || modelParts.length === 0 ? (
                                        <span className="text-xs text-muted-foreground">Không có phụ tùng</span>
                                      ) : (
                                        <>
                                          {modelParts.slice(0, 2).map((part) => (
                                            <Badge key={part} variant="secondary" className="text-xs">
                                              {part}
                                            </Badge>
                                          ))}
                                          {modelParts.length > 2 && (
                                            <span className="text-xs text-muted-foreground">
                                              +{modelParts.length - 2} khác
                                            </span>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                            {paginatedServices.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                  Không tìm thấy dịch vụ nào.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      <div className="mt-4">
                        <TablePagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {vinData && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" />
                Chi tiết đặt lịch
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="selectedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày bảo dưỡng</FormLabel>
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
                                {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              month={calendarMonth || field.value || defaultCalendarMonth}
                              onMonthChange={setCalendarMonth}
                              defaultMonth={defaultCalendarMonth}
                              classNames={{
                                day_today: "", // Bỏ highlight ngày hiện tại
                              }}
                              modifiersClassNames={{}}
                              disabled={(date) => {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const dateStr = `${year}-${month}-${day}`;

                                // Chỉ hiển thị các ngày có trong availableDateStrings (API đã xử lý logic)
                                return !availableDateStrings.has(dateStr);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="selectedTimeSlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chọn giờ</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-2">
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
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú thêm</FormLabel>
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
                </div>
              </div>
            </div>
          )}

          {vinData && (
            <div className="flex justify-end">
              <Button type="submit" size="lg">
                {isEditMode ? 'Cập nhật lịch hẹn' : 'Đặt lịch bảo dưỡng'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
