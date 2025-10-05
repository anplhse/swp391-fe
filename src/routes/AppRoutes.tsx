import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import DefaultLayout from "../layouts/DefaultLayout";
import Index from "../pages/Index";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import Unauthorized from "../pages/Unauthorized";
import BookingPage from "../pages/customer/BookingPage";
import BookingStatusPage from "../pages/customer/BookingStatusPage";
import BookingsPage from "../pages/customer/BookingsPage";
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import PaymentPage from "../pages/customer/PaymentPage";
import ServiceHistoryPage from "../pages/customer/ServiceHistoryPage";
import ServicePackagesPage from "../pages/customer/ServicePackagesPage";
import CustomerVehicleManagementPage from "../pages/customer/VehicleManagementPage";
import VehicleProfilePage from "../pages/customer/VehicleProfilePage";
import About from "../pages/marketing/About";
import Blog from "../pages/marketing/Blog";
import Contact from "../pages/marketing/Contact";
import Pricing from "../pages/marketing/Pricing";
import Services from "../pages/marketing/Services";
import Solutions from "../pages/marketing/Solutions";
import AdminDashboard from "../pages/service/AdminDashboard";
import StaffDashboard from "../pages/service/StaffDashboard";
import TechnicianDashboard from "../pages/service/TechnicianDashboard";
// Staff pages
import AppointmentManagementPage from "../pages/service/staff/AppointmentManagementPage";
import CustomerManagementPage from "../pages/service/staff/CustomerManagementPage";
import StaffMaintenanceProcessPage from "../pages/service/staff/MaintenanceProcessPage";
import PartsManagementPage from "../pages/service/staff/PartsManagementPage";
import ServiceManagementPage from "../pages/service/staff/ServiceManagementPage";
import StaffVehicleManagementPage from "../pages/service/staff/VehicleManagementPage";
// Technician pages
import AssignedTasksPage from "../pages/service/technician/AssignedTasksPage";
import TechnicianMaintenanceProcessPage from "../pages/service/technician/MaintenanceProcessPage";
import VehicleStatusPage from "../pages/service/technician/VehicleStatusPage";
// Admin pages
import FinanceManagementPage from "../pages/service/admin/FinanceManagementPage";
import PersonnelManagementPage from "../pages/service/admin/PersonnelManagementPage";
import QuotationsPage from "../pages/service/admin/QuotationsPage";
import ReportsPage from "../pages/service/admin/ReportsPage";

export default function AppRoutes() {
  return (
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
        <Route path="customer/bookings" element={<ProtectedRoute requiredUserType="customer"><BookingsPage /></ProtectedRoute>} />
        <Route path="customer/booking-status" element={<ProtectedRoute requiredUserType="customer"><BookingStatusPage /></ProtectedRoute>} />
        <Route path="customer/packages" element={<ProtectedRoute requiredUserType="customer"><ServicePackagesPage /></ProtectedRoute>} />
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
  );
}

