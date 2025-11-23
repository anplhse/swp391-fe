import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';

export function useTimeSlots(
  workingHours: string[],
  slots: Array<{ date: string; bookedHours: number[] }>,
  selectedDate: Date | undefined
) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const hourStringToNumber = useCallback((hourStr: string): number => {
    return parseInt(hourStr.split(':')[0], 10);
  }, []);

  const loadTimeSlots = useCallback(
    async (date: Date) => {
      if (!workingHours.length) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const dateKey = format(date, 'yyyy-MM-dd');

      const daySlot = slots.find(s => s.date === dateKey);
      const bookedHours = daySlot?.bookedHours || [];
      const bookedHoursSet = new Set(bookedHours);

      const available: string[] = [];
      for (const hour of workingHours) {
        const hourNum = hourStringToNumber(hour);
        if (bookedHoursSet.has(hourNum)) {
          continue;
        }
        available.push(hour);
      }

      setAvailableTimeSlots(available);
      setIsLoading(false);
    },
    [workingHours, slots, hourStringToNumber]
  );

  // Auto-load time slots when date, workingHours, or slots change
  useEffect(() => {
    if (selectedDate) {
      if (!workingHours.length) {
        setAvailableTimeSlots([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const dateKey = format(selectedDate, 'yyyy-MM-dd');

      const daySlot = slots.find(s => s.date === dateKey);
      const bookedHours = daySlot?.bookedHours || [];
      const bookedHoursSet = new Set(bookedHours);

      const available: string[] = [];
      for (const hour of workingHours) {
        const hourNum = parseInt(hour.split(':')[0], 10);
        if (bookedHoursSet.has(hourNum)) {
          continue;
        }
        available.push(hour);
      }

      setAvailableTimeSlots(available);
      setIsLoading(false);
    } else {
      setAvailableTimeSlots([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, workingHours, slots]);

  return {
    availableTimeSlots,
    isLoading,
    loadTimeSlots,
  };
}

