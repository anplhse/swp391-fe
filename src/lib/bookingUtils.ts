// Utility functions for booking management
import API from '@/config/API';
import { createErrorFromResponse } from './responseHandler';

const API_BASE_URL = API.API_URL;

// Helper function to make API requests
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint.replace(/^\/+/, '')}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...options.headers,
    },
    ...options,
  };

  // Add token to header if available
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    // Use centralized error handler to extract message from BE
    throw await createErrorFromResponse(response);
  }

  return await response.json();
}

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

// Time slots should be loaded from API
// TODO: Load time slots from API
export const availableTimeSlots: TimeSlot[] = [];

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

// Booking API methods
export const bookingApi = {
  // Create a new booking
  async createBooking(payload: {
    customerId: number;
    vehicleVin: string;
    scheduleDateTime: {
      format: string;
      value: string;
      timezone: string | null;
    };
    catalogDetails: Array<{
      catalogId: number;
      modelId: number;
      description: string;
    }>;
  }): Promise<{
    id: number;
    customerId: number;
    customerName: string;
    vehicleVin: string;
    vehicleModel: string;
    scheduleDateTime: {
      format: string;
      value: string;
      timezone: string | null;
    };
    bookingStatus: string;
    createdAt: string;
    updatedAt: string;
    catalogDetails: Array<{
      id: number;
      catalogId: number;
      serviceName: string;
      description: string;
    }>;
  }> {
    return request('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Get customer bookings
  async getCustomerBookings(customerId: number): Promise<Array<{
    id: number;
    customerId: number;
    customerName: string;
    vehicleVin: string;
    vehicleModel: string;
    scheduleDateTime: {
      format: string;
      value: string;
      timezone: string | null;
    };
    bookingStatus: string;
    createdAt: string;
    updatedAt: string;
    assignedTechnicianId?: number | null;
    assignedTechnicianName?: string | null;
  }>> {
    return request(`/bookings/customer/${customerId}`, {
      method: 'GET',
    });
  },

  // Get booking by ID
  async getBookingById(id: number): Promise<{
    id: number;
    customerId: number;
    customerName: string;
    vehicleVin: string;
    vehicleModel: string;
    scheduleDateTime: {
      format: string;
      value: string;
      timezone: string | null;
    };
    bookingStatus: string;
    createdAt: string;
    updatedAt: string;
    assignedTechnicianId?: number | null;
    assignedTechnicianName?: string | null;
    catalogDetails: Array<{
      id: number;
      catalogId: number;
      serviceName: string;
      description: string;
    }>;
    invoice?: {
      id: number;
      invoiceNumber: string;
      issueDate: string;
      dueDate: string;
      totalAmount: number;
      status: string;
      createdAt: string;
      invoiceLines: Array<{
        id: number;
        itemDescription: string;
        itemType: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }>;
    };
  }> {
    return request(`/bookings/${id}`, {
      method: 'GET',
    });
  },

  // Get working hours
  async getWorkingHours(): Promise<{
    name: string;
    enumValue: string[];
    description: string;
    type: string;
  }> {
    return request('/bookings/working-hours', {
      method: 'GET',
    });
  },

  // Get available slots
  async getAvailableSlots(): Promise<Array<{
    date: string;
    bookedHours: number[];
  }>> {
    return request('/bookings/slots', {
      method: 'GET',
    });
  },

  // Check if booking has enough parts
  async checkBookingParts(bookingId: number): Promise<boolean> {
    return request<boolean>(`/bookings/${bookingId}/check-parts`, {
      method: 'GET',
    });
  },

  // Confirm booking
  async confirmBooking(bookingId: number): Promise<{
    id: number;
    customerId: number;
    customerName: string;
    vehicleVin: string;
    vehicleModel: string;
    scheduleDateTime: {
      format: string;
      value: string;
      timezone: string | null;
    };
    bookingStatus: string;
    createdAt: string;
    updatedAt: string;
    catalogDetails: Array<{
      id: number;
      catalogId: number;
      serviceName: string;
      description: string;
    }>;
    invoice?: {
      id: number;
      invoiceNumber: string;
      issueDate: string;
      dueDate: string;
      totalAmount: number;
      status: string;
      createdAt: string;
      invoiceLines: Array<{
        id: number;
        itemDescription: string;
        itemType: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }>;
    };
  }> {
    return request(`/bookings/${bookingId}/confirm`, {
      method: 'PUT',
    });
  },

  // Reject booking
  async rejectBooking(bookingId: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/bookings/${bookingId}/rejected`, {
      method: 'PUT',
    });
  },

  // Get all bookings (for staff)
  async getAllBookings(): Promise<Array<{
    id: number;
    customerId: number;
    customerName: string;
    vehicleVin: string;
    vehicleModel: string;
    scheduleDateTime: {
      format: string;
      value: string;
      timezone: string | null;
    };
    bookingStatus: string;
    createdAt: string;
    updatedAt: string;
    assignedTechnicianId?: number | null;
    assignedTechnicianName?: string | null;
    catalogDetails?: Array<{
      id: number;
      catalogId: number;
      serviceName: string;
      description: string;
    }>;
  }>> {
    return request('/bookings', {
      method: 'GET',
    });
  },

  // Get all jobs (technician assignments for bookings)
  // JobStatus: UNASSIGNED, PENDING, IN_PROGRESS, COMPLETED
  async getJobs(): Promise<Array<{
    id: number;
    bookingId: number;
    technicianId: number | null;
    technicianName: string | null;
    startTime: string | null;
    estEndTime: string | null;
    actualEndTime: string | null;
    status: 'UNASSIGNED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    notes: string;
    createdAt: string;
    updatedAt: string;
  }>> {
    return request('/jobs', {
      method: 'GET',
    });
  },

  // Create payment for an invoice
  async createPayment(invoiceId: number): Promise<{
    paymentUrl: string;
    orderCode: string;
  }> {
    return request(`/payments/create-payment`, {
      method: 'POST',
      body: JSON.stringify({ invoiceId }),
    });
  },

  // Simulate IPN success (for testing when IPN callback fails)
  async simulateIpnSuccess(orderCode: string): Promise<{
    message: string;
    rspCode: string;
  }> {
    return request(`/payments/simulate-ipn-success?orderCode=${encodeURIComponent(orderCode)}`, {
      method: 'GET',
    });
  },

  async startMaintenance(bookingId: number): Promise<{
    id: number;
    customerId: number;
    customerName: string;
    vehicleVin: string;
    vehicleModel: string;
    scheduleDateTime: {
      format: string;
      value: string;
      timezone: string;
    };
    bookingStatus: string;
    createdAt: string;
    updatedAt: string;
    catalogDetails: Array<{
      id: number;
      catalogId: number;
      serviceName: string;
      description: string;
    }>;
    invoice: {
      id: number;
      invoiceNumber: string;
      issueDate: string;
      dueDate: string;
      totalAmount: number;
      status: string;
      createdAt: string;
      invoiceLines: Array<{
        id: number;
        itemDescription: string;
        itemType: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }>;
    };
  }> {
    return request(`/bookings/${bookingId}/start-maintenance`, {
      method: 'PUT',
    });
  },
};
