// Utility functions for booking management

export interface TimeSlot {
  id: string;
  time: string;
  date: string;
  center: string;
  isAvailable: boolean;
  technician?: string;
  maxCapacity: number;
  currentBookings: number;
}

export interface Booking {
  id: string;
  serviceId: string;
  vehicleId: string;
  date: string;
  time: string;
  center: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  customerId: string;
  technician?: string;
  createdAt: string;
}

// Generate time slots for September 2025
const generateTimeSlotsForSeptember = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const times = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  const center = 'Trung tâm bảo dưỡng Hà Nội';

  // Generate slots for each day in September 2025
  for (let day = 1; day <= 30; day++) {
    const date = `2025-09-${day.toString().padStart(2, '0')}`;

    times.forEach(time => {
      // Random availability (80% chance of being available)
      const isAvailable = Math.random() > 0.2;
      const currentBookings = isAvailable ? Math.floor(Math.random() * 3) : 3;

      slots.push({
        id: `slot_2025_09_${day.toString().padStart(2, '0')}_${time.replace(':', '_')}`,
        time,
        date,
        center,
        isAvailable,
        maxCapacity: 3,
        currentBookings
      });
    });
  }

  return slots;
};

// Mock data for available time slots
export const availableTimeSlots: TimeSlot[] = generateTimeSlotsForSeptember();

// Get available time slots for a specific date
export const getAvailableTimeSlots = (date: string, center: string = 'Trung tâm bảo dưỡng Hà Nội'): TimeSlot[] => {
  return availableTimeSlots.filter(slot =>
    slot.date === date &&
    slot.center === center &&
    slot.isAvailable &&
    slot.currentBookings < slot.maxCapacity
  );
};

// Check if a specific time slot is available
export const isTimeSlotAvailable = (date: string, time: string, center: string = 'Trung tâm bảo dưỡng Hà Nội'): boolean => {
  const slot = availableTimeSlots.find(s =>
    s.date === date &&
    s.time === time &&
    s.center === center
  );

  return slot ? slot.isAvailable && slot.currentBookings < slot.maxCapacity : false;
};

// Book a time slot
export const bookTimeSlot = (date: string, time: string, center: string = 'Trung tâm bảo dưỡng Hà Nội'): boolean => {
  const slot = availableTimeSlots.find(s =>
    s.date === date &&
    s.time === time &&
    s.center === center
  );

  if (slot && slot.isAvailable && slot.currentBookings < slot.maxCapacity) {
    slot.currentBookings += 1;
    if (slot.currentBookings >= slot.maxCapacity) {
      slot.isAvailable = false;
    }
    return true;
  }

  return false;
};

// Cancel a time slot booking
export const cancelTimeSlot = (date: string, time: string, center: string = 'Trung tâm bảo dưỡng Hà Nội'): boolean => {
  const slot = availableTimeSlots.find(s =>
    s.date === date &&
    s.time === time &&
    s.center === center
  );

  if (slot && slot.currentBookings > 0) {
    slot.currentBookings -= 1;
    if (slot.currentBookings < slot.maxCapacity) {
      slot.isAvailable = true;
    }
    return true;
  }

  return false;
};

// Get time slots grouped by date
export const getTimeSlotsByDate = (startDate: string, endDate: string, center: string = 'Trung tâm bảo dưỡng Hà Nội') => {
  const slots = availableTimeSlots.filter(slot =>
    slot.center === center &&
    slot.date >= startDate &&
    slot.date <= endDate
  );

  const grouped: { [date: string]: TimeSlot[] } = {};
  slots.forEach(slot => {
    if (!grouped[slot.date]) {
      grouped[slot.date] = [];
    }
    grouped[slot.date].push(slot);
  });

  return grouped;
};

// Get next available dates
export const getNextAvailableDates = (center: string = 'Trung tâm bảo dưỡng Hà Nội', limit: number = 7): string[] => {
  // Get unique dates from available time slots that have available slots
  const availableDates = new Set<string>();

  availableTimeSlots.forEach(slot => {
    if (slot.center === center &&
      slot.isAvailable &&
      slot.currentBookings < slot.maxCapacity) {
      availableDates.add(slot.date);
    }
  });

  // Convert to array and sort
  const sortedDates = Array.from(availableDates).sort();


  // Return limited number of dates
  return sortedDates.slice(0, limit);
};
