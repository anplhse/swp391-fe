import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { bookTimeSlot, getAvailableTimeSlots, getNextAvailableDates, isTimeSlotAvailable } from '@/lib/bookingUtils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  Battery,
  Calendar as CalendarIcon,
  Car,
  CheckCircle,
  CheckCircle2,
  Clock,
  Shield,
  Wrench,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BookingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [nextAvailableDates, setNextAvailableDates] = useState<string[]>([]);

  const services = [
    {
      id: 'maintenance',
      name: 'Bảo dưỡng định kỳ',
      description: 'Kiểm tra tổng quát hệ thống xe điện',
      price: '2,500,000 VND',
      duration: '2-3 giờ',
      icon: Wrench
    },
    {
      id: 'battery',
      name: 'Kiểm tra pin',
      description: 'Chẩn đoán và bảo dưỡng hệ thống pin',
      price: '1,800,000 VND',
      duration: '1-2 giờ',
      icon: Battery
    },
    {
      id: 'software',
      name: 'Cập nhật phần mềm',
      description: 'Cập nhật firmware và phần mềm xe',
      price: '500,000 VND',
      duration: '30-60 phút',
      icon: Zap
    },
    {
      id: 'inspection',
      name: 'Kiểm tra an toàn',
      description: 'Kiểm tra hệ thống phanh và an toàn',
      price: '1,200,000 VND',
      duration: '1-2 giờ',
      icon: Shield
    }
  ];

  const vehicleModels = [
    { id: 'vf8', name: 'VinFast VF8', type: 'SUV' },
    { id: 'vf9', name: 'VinFast VF9', type: 'SUV' },
    { id: 'vfe34', name: 'VinFast VF e34', type: 'Sedan' },
    { id: 'vf5', name: 'VinFast VF5', type: 'Hatchback' }
  ];

  // Load next available dates on component mount
  useEffect(() => {
    const dates = getNextAvailableDates();
    setNextAvailableDates(dates);
  }, []);

  // Update available time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      // Use local date string to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;


      const slots = getAvailableTimeSlots(dateString);
      const times = slots.map(slot => slot.time);
      setAvailableTimeSlots(times);
      setSelectedTime(''); // Reset selected time when date changes
    }
  }, [selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedVehicle || !selectedDate || !selectedTime) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin đặt lịch",
        variant: "destructive"
      });
      return;
    }

    // Check if the selected time slot is still available
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    if (!isTimeSlotAvailable(dateString, selectedTime)) {
      toast({
        title: "Khung giờ đã hết chỗ",
        description: "Khung giờ này đã được đặt bởi khách hàng khác, vui lòng chọn khung giờ khác",
        variant: "destructive"
      });
      return;
    }

    const selectedServiceData = services.find(s => s.id === selectedService);
    const selectedVehicleData = vehicleModels.find(v => v.id === selectedVehicle);

    if (selectedServiceData && selectedVehicleData) {
      // Book the time slot
      const bookingSuccess = bookTimeSlot(dateString, selectedTime);
      if (!bookingSuccess) {
        toast({
          title: "Đặt lịch thất bại",
          description: "Khung giờ này không còn khả dụng, vui lòng chọn khung giờ khác",
          variant: "destructive"
        });
        return;
      }

      // Create booking data (only plain data, no React components)
      const bookingData = {
        id: `BK${Date.now()}`,
        service: {
          id: selectedServiceData.id,
          name: selectedServiceData.name,
          price: selectedServiceData.price,
          duration: selectedServiceData.duration,
          description: selectedServiceData.description
        },
        vehicle: {
          id: selectedVehicle,
          name: selectedVehicleData.name,
          plate: (document.getElementById('plate') as HTMLInputElement)?.value || '',
          model: selectedVehicleData.name
        },
        date: dateString,
        time: selectedTime,
        status: 'pending' as const,
        center: 'Trung tâm bảo dưỡng Hà Nội',
        notes: (document.querySelector('textarea') as HTMLTextAreaElement)?.value || '',
        createdAt: new Date().toISOString(),
        estimatedDuration: selectedServiceData.duration
      };

      // Persist booking to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem('bookings') || '[]');
        const updated = Array.isArray(existing) ? [...existing, bookingData] : [bookingData];
        localStorage.setItem('bookings', JSON.stringify(updated));
      } catch (_) {
        localStorage.setItem('bookings', JSON.stringify([bookingData]));
      }

      toast({
        title: "Đặt lịch thành công!",
        description: "Lịch hẹn đã được tạo, vui lòng chờ xác nhận",
      });

      navigate('/customer/booking-status', {
        state: { bookingData }
      });
    }
  };

  return (
    <DashboardLayout title="Đặt lịch bảo dưỡng" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/customer')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Đặt lịch bảo dưỡng</h2>
            <p className="text-muted-foreground">Chọn dịch vụ và thời gian phù hợp</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Service */}
          <Card>
            <CardHeader>
              <CardTitle>Chọn dịch vụ</CardTitle>
              <CardDescription>Lựa chọn loại dịch vụ bảo dưỡng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => {
                  const IconComponent = service.icon;
                  return (
                    <div
                      key={service.id}
                      className={cn(
                        "border rounded-lg p-4 cursor-pointer transition-all hover:border-primary",
                        selectedService === service.id && "border-primary bg-primary/5"
                      )}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{service.price}</Badge>
                            <span className="text-sm text-muted-foreground">{service.duration}</span>
                          </div>
                        </div>
                        {selectedService === service.id && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Select Vehicle */}
          <Card>
            <CardHeader>
              <CardTitle>Chọn mẫu xe</CardTitle>
              <CardDescription>Lựa chọn mẫu xe cần bảo dưỡng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mẫu xe của bạn" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleModels.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        <span>{vehicle.name}</span>
                        <Badge variant="outline" className="ml-2">{vehicle.type}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plate">Biển số xe</Label>
                  <Input id="plate" placeholder="30A-123.45" />
                </div>
                <div>
                  <Label htmlFor="year">Năm sản xuất</Label>
                  <Input id="year" type="number" placeholder="2024" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Select Date & Time */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Chọn ngày</CardTitle>
                <CardDescription>Lựa chọn ngày muốn bảo dưỡng</CardDescription>
              </CardHeader>
              <CardContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      key={nextAvailableDates.join(',')}
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        // Use local date string to avoid timezone issues
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const dateString = `${year}-${month}-${day}`;


                        // Disable past dates
                        if (date < today) return true;

                        // If we have available dates loaded, only allow those dates
                        if (nextAvailableDates.length > 0) {
                          return !nextAvailableDates.includes(dateString);
                        }

                        // If no available dates loaded yet, allow all future dates
                        return false;
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chọn giờ</CardTitle>
                <CardDescription>
                  {selectedDate
                    ? "Lựa chọn khung giờ phù hợp"
                    : "Vui lòng chọn ngày trước"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableTimeSlots.length > 0 ? (
                      availableTimeSlots.map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant={selectedTime === time ? "default" : "outline"}
                          className="justify-center"
                          onClick={() => setSelectedTime(time)}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          {time}
                        </Button>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8">
                        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Ngày này đã hết lịch trống
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Vui lòng chọn ngày khác
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Vui lòng chọn ngày trước
                    </p>
                  </div>
                )}

                {/* Show slot availability info */}
                {selectedDate && availableTimeSlots.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-green-700">
                        Còn {availableTimeSlots.length} khung giờ trống
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Ghi chú thêm</CardTitle>
              <CardDescription>Mô tả tình trạng xe hoặc yêu cầu đặc biệt</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ví dụ: Xe có tiếng ồn lạ ở bánh trước, pin sạc chậm..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/customer')}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="electric" className="flex-1">
              Xác nhận đặt lịch
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}