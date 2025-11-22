import AuthEventListener from '@/components/AuthEventListener';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ScrollToTop from '@/components/ScrollToTop';
import DefaultLayout from '@/layouts/DefaultLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Public pages
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import Unauthorized from '@/pages/Unauthorized';
import Verify from '@/pages/Verify';
import About from '@/pages/marketing/About';
import Blog from '@/pages/marketing/Blog';
import Contact from '@/pages/marketing/Contact';
import Pricing from '@/pages/marketing/Pricing';
import Services from '@/pages/marketing/Services';
import Solutions from '@/pages/marketing/Solutions';

// Customer pages
import BookingConfirmationPage from '@/pages/customer/BookingConfirmationPage';
import BookingPage from '@/pages/customer/BookingPage';
import BookingStatusPage from '@/pages/customer/BookingStatusPage';
import BookingsAndHistoryPage from '@/pages/customer/BookingsAndHistoryPage';
import CustomerDashboard from '@/pages/customer/CustomerDashboard';
import PaymentResultPage from '@/pages/customer/PaymentResultPage';
import CustomerVehicleManagementPage from '@/pages/customer/VehicleManagementPage';
import VehicleProfilePage from '@/pages/customer/VehicleProfilePage';

// Service center pages
import AdminDashboard from '@/pages/service/AdminDashboard';
import StaffDashboard from '@/pages/service/StaffDashboard';
import TechnicianDashboard from '@/pages/service/TechnicianDashboard';

// Staff pages
import AppointmentManagementPage from '@/pages/service/staff/AppointmentManagementPage';
import CustomerManagementPage from '@/pages/service/staff/CustomerManagementPage';
import StaffMaintenanceProcessPage from '@/pages/service/staff/MaintenanceProcessPage';
import PartsManagementPage from '@/pages/service/staff/PartsManagementPage';
import ServiceManagementPage from '@/pages/service/staff/ServiceManagementPage';
import StaffVehicleManagementPage from '@/pages/service/staff/VehicleManagementPage';
import VehicleModelsPage from '@/pages/service/staff/VehicleModelsPage';

// Technician pages
import AssignedTasksPage from '@/pages/service/technician/AssignedTasksPage';
import TechnicianMaintenanceProcessPage from '@/pages/service/technician/MaintenanceProcessPage';
import VehicleStatusPage from '@/pages/service/technician/VehicleStatusPage';

// Admin pages
import PersonnelManagementPage from '@/pages/service/admin/PersonnelManagementPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop>
        <AuthEventListener />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
          <Route path="/payment-result" element={<PaymentResultPage />} />

        {/* Protected routes with DefaultLayout */}
        <Route path="/" element={<DefaultLayout />}>
          {/* Customer routes */}
            <Route path="customer" element={<ProtectedRoute requiredRole="Khách hàng"><CustomerDashboard /></ProtectedRoute>} />
            <Route path="customer/booking" element={<ProtectedRoute requiredRole="Khách hàng"><BookingPage /></ProtectedRoute>} />
            <Route path="customer/booking/confirmation" element={<ProtectedRoute requiredRole="Khách hàng"><BookingConfirmationPage /></ProtectedRoute>} />
            <Route path="customer/bookings" element={<ProtectedRoute requiredRole="Khách hàng"><BookingsAndHistoryPage /></ProtectedRoute>} />
            <Route path="customer/booking-status" element={<ProtectedRoute requiredRole="Khách hàng"><BookingStatusPage /></ProtectedRoute>} />
            <Route path="customer/vehicles" element={<ProtectedRoute requiredRole="Khách hàng"><CustomerVehicleManagementPage /></ProtectedRoute>} />
            <Route path="customer/vehicle/:vehicleId" element={<ProtectedRoute requiredRole="Khách hàng"><VehicleProfilePage /></ProtectedRoute>} />

          {/* Service Center routes */}
            <Route path="service/staff" element={<ProtectedRoute requiredRole="Nhân viên"><StaffDashboard /></ProtectedRoute>} />
            <Route path="service/customers" element={<ProtectedRoute requiredRole="Nhân viên"><CustomerManagementPage /></ProtectedRoute>} />
            <Route path="service/vehicles" element={<ProtectedRoute requiredRole="Nhân viên"><StaffVehicleManagementPage /></ProtectedRoute>} />
            <Route path="service/appointments" element={<ProtectedRoute requiredRole="Nhân viên"><AppointmentManagementPage /></ProtectedRoute>} />
            <Route path="service/services" element={<ProtectedRoute requiredRole="Nhân viên"><ServiceManagementPage /></ProtectedRoute>} />
            <Route path="service/maintenance" element={<ProtectedRoute requiredRole="Nhân viên"><StaffMaintenanceProcessPage /></ProtectedRoute>} />
            <Route path="service/parts" element={<ProtectedRoute requiredRole="Nhân viên"><PartsManagementPage /></ProtectedRoute>} />
            <Route path="service/vehicle-models" element={<ProtectedRoute requiredRole="Nhân viên"><VehicleModelsPage /></ProtectedRoute>} />

            <Route path="service/technician" element={<ProtectedRoute requiredRole="Kỹ thuật viên"><TechnicianDashboard /></ProtectedRoute>} />
            <Route path="service/assigned-tasks" element={<ProtectedRoute requiredRole="Kỹ thuật viên"><AssignedTasksPage /></ProtectedRoute>} />
            <Route path="service/maintenance-process" element={<ProtectedRoute requiredRole="Kỹ thuật viên"><TechnicianMaintenanceProcessPage /></ProtectedRoute>} />
            <Route path="service/vehicle-status" element={<ProtectedRoute requiredRole="Kỹ thuật viên"><VehicleStatusPage /></ProtectedRoute>} />

            <Route path="service/admin" element={<ProtectedRoute requiredRole="Quản trị viên"><AdminDashboard /></ProtectedRoute>} />
            <Route path="service/personnel" element={<ProtectedRoute requiredRole="Quản trị viên"><PersonnelManagementPage /></ProtectedRoute>} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </ScrollToTop>
    </BrowserRouter>
  );
}
