import { bookingApi } from '@/lib/bookingUtils';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

export function useAvailableSlots() {
  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(undefined);

  const { data: workingHoursData, isLoading: isLoadingHours } = useQuery({
    queryKey: ['workingHours'],
    queryFn: () => bookingApi.getWorkingHours(),
  });

  const { data: slots, isLoading: isLoadingSlots, refetch: refetchSlots } = useQuery({
    queryKey: ['availableSlots'],
    queryFn: () => bookingApi.getAvailableSlots(),
  });

  const workingHours = useMemo(() => workingHoursData?.enumValue || [], [workingHoursData?.enumValue]);

  const availableDates = useMemo(() => {
    if (!slots) return [];
    return slots.map(slot => {
      const [year, month, day] = slot.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      date.setHours(0, 0, 0, 0);
      return date;
    });
  }, [slots]);

  const availableDateStrings = useMemo(() => {
    if (!slots) return new Set<string>();
    return new Set(slots.map(slot => slot.date));
  }, [slots]);

  const memoizedSlots = useMemo(() => slots || [], [slots]);

  const defaultCalendarMonth = useMemo(() => {
    if (availableDates.length > 0) {
      return availableDates[0];
    }
    return new Date();
  }, [availableDates]);

  // Set calendar month when availableDates change
  useEffect(() => {
    if (availableDates.length > 0 && !calendarMonth) {
      setCalendarMonth(availableDates[0]);
    }
  }, [availableDates, calendarMonth]);

  return {
    workingHours,
    slots: memoizedSlots,
    availableDates,
    availableDateStrings,
    calendarMonth,
    setCalendarMonth,
    defaultCalendarMonth,
    isLoading: isLoadingHours || isLoadingSlots,
    refetchSlots,
  };
}

