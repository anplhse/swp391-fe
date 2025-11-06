import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { bookTimeSlot, getAvailableTimeSlots, getNextAvailableDates, isTimeSlotAvailable } from '@/lib/bookingUtils';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { createColumnHelper } from '@tanstack/react-table';
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

// Service type for React Table
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  compatibleVehicles: string[];
  relatedParts: Record<string, string[]>; // Model -> Parts mapping
  category?: string;
  status?: string;
}

// Column helper for React Table
const columnHelper = createColumnHelper<Service>();

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
  } | null>(() => {
    // Load vinData from localStorage on mount with error handling
    try {
      const savedVinData = localStorage.getItem('bookingVinData');
      return savedVinData ? JSON.parse(savedVinData) : null;
    } catch (error) {
      console.warn('Failed to parse vinData from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('bookingVinData');
      return null;
    }
  });
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
        description: 'Không thể tra cứu thông tin xe với mã VIN này. VIN có thể chưa được đăng ký trong hệ thống.',
        variant: 'destructive'
      });
    }
  }, [form, toast]);

  // Pre-fill VIN if navigated from vehicle profile or edit mode
  useEffect(() => {
    if (location.state?.preselectVin) {
      form.setValue('vin', location.state.preselectVin);
      // Tự động hiển thị thông tin xe mà không cần tra cứu
      if (location.state?.preselectVehicle) {
        const vehicle = location.state.preselectVehicle;
        setVinData({
          vin: location.state.preselectVin,
          brand: vehicle.brand || '',
          model: vehicle.model || '',
          year: vehicle.year || '',
          plate: vehicle.plate || '',
          type: 'electric'
        });
        form.setValue('plate', vehicle.plate || '');
        form.setValue('year', vehicle.year || '');
        form.setValue('model', vehicle.model || '');
      }
    }

    // Pre-fill form data if in edit mode
    if (location.state?.editMode && location.state?.existingBooking) {
      const booking = location.state.existingBooking;

      // Pre-fill VIN and vehicle data
      if (booking.vehicle) {
        form.setValue('vin', booking.vehicle.vin);
        setVinData({
          vin: booking.vehicle.vin,
          brand: booking.vehicle.brand || '',
          model: booking.vehicle.model || '',
          year: booking.vehicle.year?.toString() || '',
          plate: booking.vehicle.plate || '',
          type: 'electric'
        });
        form.setValue('plate', booking.vehicle.plate || '');
        form.setValue('year', booking.vehicle.year?.toString() || '');
        form.setValue('model', booking.vehicle.model || '');
      }

      // Pre-fill selected services
      if (booking.services && booking.services.length > 0) {
        const serviceIds = booking.services.map(service => service.id);
        form.setValue('services', serviceIds);
      }

      // Pre-fill selected date and time
      if (booking.date) {
        form.setValue('selectedDate', new Date(booking.date));
      }
      if (booking.time) {
        form.setValue('selectedTimeSlot', booking.time);
      }

      // Pre-fill notes
      if (booking.notes) {
        form.setValue('notes', booking.notes);
      }
    }
  }, [location.state, form]);

  // Pre-fill form fields when vinData is loaded from localStorage
  useEffect(() => {
    if (vinData && !location.state?.preselectVin && !location.state?.editMode) {
      form.setValue('vin', vinData.vin);
      form.setValue('plate', vinData.plate || '');
      form.setValue('year', vinData.year || '');
      form.setValue('model', vinData.model || '');
    }
  }, [vinData, form, location.state]);

  // Save vinData to localStorage whenever it changes
  useEffect(() => {
    if (vinData) {
      localStorage.setItem('bookingVinData', JSON.stringify(vinData));
    } else {
      localStorage.removeItem('bookingVinData');
    }
  }, [vinData]);

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

  // Lọc dịch vụ theo model xe từ VIN
  const visibleServices = useMemo(() => {
    if (!vinData?.model) return [];

    return services.filter(service =>
      service.compatibleVehicles.includes(vinData.model) ||
      service.compatibleVehicles.includes('All')
    );
  }, [services, vinData?.model]);

  // Local state for search and pagination (giống ServiceTable)
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return visibleServices;
    return visibleServices.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [visibleServices, searchQuery]);

  // Paginate filtered services
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredServices.slice(startIndex, endIndex);
  }, [filteredServices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  // Selection handlers (giống ServiceTable)
  const selectedServices = form.watch('services') || [];

  const handleSelectAll = () => {
    const allIds = paginatedServices.map(service => service.id);
    const newSelection = [...new Set([...selectedServices, ...allIds])];
    form.setValue('services', newSelection);
  };

  const handleDeselectAll = () => {
    const currentPageIds = paginatedServices.map(service => service.id);
    const newSelection = selectedServices.filter(id => !currentPageIds.includes(id));
    form.setValue('services', newSelection);
  };

  const handleServiceToggle = (serviceId: string) => {
    const isSelected = selectedServices.includes(serviceId);
    if (isSelected) {
      form.setValue('services', selectedServices.filter(id => id !== serviceId));
    } else {
      form.setValue('services', [...selectedServices, serviceId]);
    }
  };

  const allCurrentPageSelected = paginatedServices.every(service =>
    selectedServices.includes(service.id)
  );

  const someCurrentPageSelected = paginatedServices.some(service =>
    selectedServices.includes(service.id)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredServices.length);

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

      // Calculate total price and selected services
      const selectedServices = services.filter(s => data.services.includes(s.id));
      const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
      const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

      // Generate booking ID
      const bookingId = `BK${Date.now()}`;

      // Create booking data
      const bookingData = {
        id: bookingId,
        vehicle: {
          vin: data.vin,
          brand: vinData?.brand || 'N/A',
          model: vinData?.model || 'N/A',
          year: vinData?.year || new Date().getFullYear()
        },
        services: selectedServices.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration
        })),
        date: dateString,
        time: data.selectedTimeSlot,
        notes: data.notes || '',
        totalAmount: totalPrice,
        estimatedDuration: totalDuration,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };

      // Save booking data to localStorage
      localStorage.setItem('latestBooking', JSON.stringify(bookingData));

      // Show success message
      toast({
        title: 'Đặt lịch thành công!',
        description: 'Đang chuyển đến trang xác nhận...'
      });

      // Clear localStorage and navigate to confirmation page
      localStorage.removeItem('bookingVinData');
      navigate('/customer/booking/confirmation', {
        state: { bookingData }
      });
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

  const isEditMode = location.state?.editMode;

  // Dynamic title and description based on VIN status and edit mode
  const getPageContent = () => {
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
      description: `Xe: ${vinData.brand} ${vinData.model} (${vinData.year}) - VIN: ${vinData.vin}`
    };
  };

  const pageContent = getPageContent();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{pageContent.title}</h1>
        <p className="text-muted-foreground mt-2">
          {pageContent.description}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* VIN Input Section - chỉ hiện khi chưa có VIN data */}
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
                  onClick={() => handleVinLookup(form.getValues('vin'))}
                  disabled={!form.getValues('vin')}
                >
                  Tra cứu VIN
                </Button>
              </div>
            </div>
          )}

          {/* Vehicle Info Display - chỉ hiện khi đã có VIN data */}
          {vinData && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Car className="w-6 h-6" />
                Thông tin xe
              </h2>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Mã VIN:</span>
                    <p className="font-medium">{vinData.vin}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Biển số:</span>
                    <p className="font-medium">{vinData.plate || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Model:</span>
                    <p className="font-medium">{vinData.model || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Năm sản xuất:</span>
                    <p className="font-medium">{vinData.year || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Hãng xe:</span>
                    <p className="font-medium">{vinData.brand || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Loại xe:</span>
                    <p className="font-medium">{vinData.type || 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVinData(null);
                      form.setValue('vin', '');
                      form.setValue('services', []);
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                  >
                    Thay đổi VIN
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Service Selection - chỉ hiện khi có VIN data */}
          {vinData && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Wrench className="w-6 h-6" />
                Chọn dịch vụ
              </h2>

              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-4">
                      {/* Search and Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm dịch vụ..."
                            className="w-64"
                          />
                          {/* Đã bỏ nút Chọn tất cả / Bỏ chọn tất cả vì đã có tickbox */}
                        </div>

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
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                              >
                                Trước
                              </Button>
                              <span className="text-sm text-muted-foreground">
                                Trang {currentPage} / {totalPages}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                              >
                                Sau
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Services Table */}
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <div className="flex items-center justify-center">
                                  <div className={cn(
                                    "w-4 h-4 border-2 rounded flex items-center justify-center transition-colors cursor-pointer",
                                    allCurrentPageSelected ? "bg-primary border-primary text-primary-foreground" :
                                      someCurrentPageSelected ? "bg-primary/50 border-primary text-primary-foreground" :
                                        "border-muted-foreground"
                                  )}
                                    onClick={() => {
                                      if (allCurrentPageSelected) {
                                        handleDeselectAll();
                                      } else {
                                        handleSelectAll();
                                      }
                                    }}
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
                              {/* Bỏ cột Trạng thái đã chọn */}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedServices.map((service) => {
                              const isSelected = selectedServices.includes(service.id);
                              return (
                                <TableRow
                                  key={service.id}
                                  className={cn(
                                    "cursor-pointer hover:bg-muted/50",
                                    isSelected ? "bg-primary/5" : ""
                                  )}
                                  onClick={() => handleServiceToggle(service.id)}
                                >
                                  <TableCell>
                                    <div className="flex items-center justify-center">
                                      <div className={cn(
                                        "w-4 h-4 border-2 rounded flex items-center justify-center transition-colors",
                                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                                      )}>
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
                                      <div className="text-sm text-muted-foreground">
                                        {service.description}
                                      </div>
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
                                      {(() => {
                                        const modelParts = vinData?.model ? service.relatedParts?.[vinData.model] : null;
                                        if (!modelParts || modelParts.length === 0) {
                                          return (
                                            <span className="text-xs text-muted-foreground">
                                              Không có phụ tùng
                                            </span>
                                          );
                                        }
                                        return (
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
                                        );
                                      })()}
                                    </div>
                                  </TableCell>
                                  {/* Bỏ hiển thị trạng thái đã chọn */}
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
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Booking Details - chỉ hiện khi có VIN data */}
          {vinData && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" />
                Chi tiết đặt lịch
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Date & Time */}
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
                                const isSameDay = (a: Date, b: Date) => (
                                  a.getFullYear() === b.getFullYear() &&
                                  a.getMonth() === b.getMonth() &&
                                  a.getDate() === b.getDate()
                                );
                                return date < today || !availableDates.some(d => isSameDay(d, date));
                              }}
                              initialFocus
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

                {/* Right Column - Notes */}
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

          {/* Submit Button */}
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
