const routes = {
  // Public routes
  home: '/',
  login: '/login',
  unauthorized: '/unauthorized',
  about: '/about',
  services: '/services',
  solutions: '/solutions',
  pricing: '/pricing',
  blog: '/blog',
  contact: '/contact',

  // Customer routes
  customer: {
    dashboard: '/customer',
    booking: '/customer/booking',
    bookings: '/customer/bookings',
    bookingStatus: '/customer/booking-status',
    packages: '/customer/packages',
    history: '/customer/history',
    vehicles: '/customer/vehicles',
    vehicleDetail: (vehicleId: string) => `/customer/vehicle/${vehicleId}`,
    payment: '/customer/payment',
  },

  // Service Center routes
  service: {
    // Staff routes
    staff: {
      dashboard: '/service/staff',
      customers: '/service/customers',
      vehicles: '/service/vehicles',
      appointments: '/service/appointments',
      services: '/service/services',
      maintenance: '/service/maintenance',
      parts: '/service/parts',
      vehicleModels: '/service/vehicle-models',
    },

    // Technician routes
    technician: {
      dashboard: '/service/technician',
      assignedTasks: '/service/assigned-tasks',
      maintenanceProcess: '/service/maintenance-process',
      vehicleStatus: '/service/vehicle-status',
    },

    // Admin routes
    admin: {
      dashboard: '/service/admin',
      personnel: '/service/personnel',
      finance: '/service/finance',
      reports: '/service/reports',
      quotations: '/service/quotations',
    },
  },
};

export default routes;