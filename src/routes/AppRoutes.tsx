import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import RouteLoader from "../components/RouteLoader";
import DefaultLayout from "../layouts/DefaultLayout";

// Public pages (lazy)
const Index = lazy(() => import("../pages/Index"));
const Login = lazy(() => import("../pages/Login"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Unauthorized = lazy(() => import("../pages/Unauthorized"));
const About = lazy(() => import("../pages/marketing/About"));
const Blog = lazy(() => import("../pages/marketing/Blog"));
const Contact = lazy(() => import("../pages/marketing/Contact"));
const Pricing = lazy(() => import("../pages/marketing/Pricing"));
const Services = lazy(() => import("../pages/marketing/Services"));
const Solutions = lazy(() => import("../pages/marketing/Solutions"));

// Customer pages (lazy)
const BookingPage = lazy(() => import("../pages/customer/BookingPage"));
const BookingConfirmationPage = lazy(() => import("../pages/customer/BookingConfirmationPage"));
const BookingStatusPage = lazy(() => import("../pages/customer/BookingStatusPage"));
const BookingsPage = lazy(() => import("../pages/customer/BookingsPage"));
const CustomerDashboard = lazy(() => import("../pages/customer/CustomerDashboard"));
const PaymentPage = lazy(() => import("../pages/customer/PaymentPage"));
const ServiceHistoryPage = lazy(() => import("../pages/customer/ServiceHistoryPage"));
const CustomerVehicleManagementPage = lazy(() => import("../pages/customer/VehicleManagementPage"));
const VehicleProfilePage = lazy(() => import("../pages/customer/VehicleProfilePage"));

// Service center pages (lazy)
const AdminDashboard = lazy(() => import("../pages/service/AdminDashboard"));
const StaffDashboard = lazy(() => import("../pages/service/StaffDashboard"));
const TechnicianDashboard = lazy(() => import("../pages/service/TechnicianDashboard"));

// Staff pages (lazy)
const AppointmentManagementPage = lazy(() => import("../pages/service/staff/AppointmentManagementPage"));
const CustomerManagementPage = lazy(() => import("../pages/service/staff/CustomerManagementPage"));
const StaffMaintenanceProcessPage = lazy(() => import("../pages/service/staff/MaintenanceProcessPage"));
const PartsManagementPage = lazy(() => import("../pages/service/staff/PartsManagementPage"));
const ServiceManagementPage = lazy(() => import("../pages/service/staff/ServiceManagementPage"));
const StaffVehicleManagementPage = lazy(() => import("../pages/service/staff/VehicleManagementPage"));

// Technician pages (lazy)
const AssignedTasksPage = lazy(() => import("../pages/service/technician/AssignedTasksPage"));
const TechnicianMaintenanceProcessPage = lazy(() => import("../pages/service/technician/MaintenanceProcessPage"));
const VehicleStatusPage = lazy(() => import("../pages/service/technician/VehicleStatusPage"));

// Admin pages (lazy)
const FinanceManagementPage = lazy(() => import("../pages/service/admin/FinanceManagementPage"));
const PersonnelManagementPage = lazy(() => import("../pages/service/admin/PersonnelManagementPage"));
const QuotationsPage = lazy(() => import("../pages/service/admin/QuotationsPage"));
const ReportsPage = lazy(() => import("../pages/service/admin/ReportsPage"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />

        {/* Protected routes with DefaultLayout */}
        <Route path="/" element={<DefaultLayout />}>
          {/* Customer routes */}
          <Route path="customer" element={<ProtectedRoute requiredUserType="customer"><CustomerDashboard /></ProtectedRoute>} />
          <Route path="customer/booking" element={<ProtectedRoute requiredUserType="customer"><BookingPage /></ProtectedRoute>} />
          <Route path="customer/booking/confirmation" element={<ProtectedRoute requiredUserType="customer"><BookingConfirmationPage /></ProtectedRoute>} />
          <Route path="customer/bookings" element={<ProtectedRoute requiredUserType="customer"><BookingsPage /></ProtectedRoute>} />
          <Route path="customer/booking-status" element={<ProtectedRoute requiredUserType="customer"><BookingStatusPage /></ProtectedRoute>} />
          {/* Removed customer/packages route */}
          <Route path="customer/history" element={<ProtectedRoute requiredUserType="customer"><ServiceHistoryPage /></ProtectedRoute>} />
          <Route path="customer/vehicles" element={<ProtectedRoute requiredUserType="customer"><CustomerVehicleManagementPage /></ProtectedRoute>} />
          <Route path="customer/vehicle/:vehicleId" element={<ProtectedRoute requiredUserType="customer"><VehicleProfilePage /></ProtectedRoute>} />
          <Route path="customer/payment" element={<ProtectedRoute requiredUserType="customer"><PaymentPage /></ProtectedRoute>} />

          {/* Service Center routes */}
          <Route path="service/staff" element={<ProtectedRoute requiredRole="staff"><StaffDashboard /></ProtectedRoute>} />
          <Route path="service/customers" element={<ProtectedRoute requiredRole="staff"><CustomerManagementPage /></ProtectedRoute>} />
          <Route path="service/vehicles" element={<ProtectedRoute requiredRole="staff"><StaffVehicleManagementPage /></ProtectedRoute>} />
          <Route path="service/appointments" element={<ProtectedRoute requiredRole="staff"><AppointmentManagementPage /></ProtectedRoute>} />
          <Route path="service/services" element={<ProtectedRoute requiredRole="staff"><ServiceManagementPage /></ProtectedRoute>} />
          <Route path="service/maintenance" element={<ProtectedRoute requiredRole="staff"><StaffMaintenanceProcessPage /></ProtectedRoute>} />
          <Route path="service/parts" element={<ProtectedRoute requiredRole="staff"><PartsManagementPage /></ProtectedRoute>} />

          <Route path="service/technician" element={<ProtectedRoute requiredRole="technician"><TechnicianDashboard /></ProtectedRoute>} />
          <Route path="service/assigned-tasks" element={<ProtectedRoute requiredRole="technician"><AssignedTasksPage /></ProtectedRoute>} />
          <Route path="service/maintenance-process" element={<ProtectedRoute requiredRole="technician"><TechnicianMaintenanceProcessPage /></ProtectedRoute>} />
          <Route path="service/vehicle-status" element={<ProtectedRoute requiredRole="technician"><VehicleStatusPage /></ProtectedRoute>} />

          <Route path="service/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="service/personnel" element={<ProtectedRoute requiredRole="admin"><PersonnelManagementPage /></ProtectedRoute>} />
          <Route path="service/finance" element={<ProtectedRoute requiredRole="admin"><FinanceManagementPage /></ProtectedRoute>} />
          <Route path="service/reports" element={<ProtectedRoute requiredRole="admin"><ReportsPage /></ProtectedRoute>} />
          <Route path="service/quotations" element={<ProtectedRoute requiredRole="admin"><QuotationsPage /></ProtectedRoute>} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

