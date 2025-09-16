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

// Mock data for available time slots
export const availableTimeSlots: TimeSlot[] = [
  // Ngày 16/09/2025
  {
    id: 'slot_2025_09_16_08_00',
    time: '08:00',
    date: '2025-09-16',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 1
  },
  {
    id: 'slot_2025_09_16_09_00',
    time: '09:00',
    date: '2025-09-16',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: false,
    maxCapacity: 3,
    currentBookings: 3
  },
  {
    id: 'slot_2025_09_16_10_00',
    time: '10:00',
    date: '2025-09-16',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  },
  {
    id: 'slot_2025_09_16_11_00',
    time: '11:00',
    date: '2025-09-16',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 1
  },
  {
    id: 'slot_2025_09_16_13_00',
    time: '13:00',
    date: '2025-09-16',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  },
  {
    id: 'slot_2025_09_16_14_00',
    time: '14:00',
    date: '2025-09-16',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: false,
    maxCapacity: 3,
    currentBookings: 3
  },
  {
    id: 'slot_2025_09_16_15_00',
    time: '15:00',
    date: '2025-09-16',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 2
  },
  {
    id: 'slot_2025_09_16_16_00',
    time: '16:00',
    date: '2025-09-16',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  },
  // Ngày 17/09/2025
  {
    id: 'slot_2025_09_17_08_00',
    time: '08:00',
    date: '2025-09-17',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  },
  {
    id: 'slot_2025_09_17_09_00',
    time: '09:00',
    date: '2025-09-17',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 1
  },
  {
    id: 'slot_2025_09_17_10_00',
    time: '10:00',
    date: '2025-09-17',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: false,
    maxCapacity: 3,
    currentBookings: 3
  },
  {
    id: 'slot_2025_09_17_11_00',
    time: '11:00',
    date: '2025-09-17',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  },
  {
    id: 'slot_2025_09_17_13_00',
    time: '13:00',
    date: '2025-09-17',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 1
  },
  {
    id: 'slot_2025_09_17_14_00',
    time: '14:00',
    date: '2025-09-17',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  },
  {
    id: 'slot_2025_09_17_15_00',
    time: '15:00',
    date: '2025-09-17',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: false,
    maxCapacity: 3,
    currentBookings: 3
  },
  {
    id: 'slot_2025_09_17_16_00',
    time: '16:00',
    date: '2025-09-17',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  },
  // Ngày 18/09/2025
  {
    id: 'slot_2025_09_18_08_00',
    time: '08:00',
    date: '2025-09-18',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  },
  {
    id: 'slot_2025_09_18_09_00',
    time: '09:00',
    date: '2025-09-18',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  },
  {
    id: 'slot_2025_09_18_10_00',
    time: '10:00',
    date: '2025-09-18',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  },
  {
    id: 'slot_2025_09_18_11_00',
    time: '11:00',
    date: '2025-09-18',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  },
  {
    id: 'slot_2025_09_18_13_00',
    time: '13:00',
    date: '2025-09-18',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  },
  {
    id: 'slot_2025_09_18_14_00',
    time: '14:00',
    date: '2025-09-18',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  },
  {
    id: 'slot_2025_09_18_15_00',
    time: '15:00',
    date: '2025-09-18',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  },
  {
    id: 'slot_2025_09_18_16_00',
    time: '16:00',
    date: '2025-09-18',
    center: 'Trung tâm bảo dưỡng Hà Nội',
    isAvailable: true,
    maxCapacity: 3,
    currentBookings: 0
  }
];

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
