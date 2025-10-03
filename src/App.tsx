import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import BookingPage from "./pages/customer/BookingPage";
import BookingStatusPage from "./pages/customer/BookingStatusPage";
import BookingsPage from "./pages/customer/BookingsPage";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import PaymentPage from "./pages/customer/PaymentPage";
import ServiceHistoryPage from "./pages/customer/ServiceHistoryPage";
import ServicePackagesPage from "./pages/customer/ServicePackagesPage";
import CustomerVehicleManagementPage from "./pages/customer/VehicleManagementPage";
import VehicleProfilePage from "./pages/customer/VehicleProfilePage";
import About from "./pages/marketing/About";
import Blog from "./pages/marketing/Blog";
import Contact from "./pages/marketing/Contact";
import Pricing from "./pages/marketing/Pricing";
import Services from "./pages/marketing/Services";
import Solutions from "./pages/marketing/Solutions";
import AdminDashboard from "./pages/service/AdminDashboard";
import StaffDashboard from "./pages/service/StaffDashboard";
import TechnicianDashboard from "./pages/service/TechnicianDashboard";
// Staff pages
import AppointmentManagementPage from "./pages/service/staff/AppointmentManagementPage";
import CustomerManagementPage from "./pages/service/staff/CustomerManagementPage";
import StaffMaintenanceProcessPage from "./pages/service/staff/MaintenanceProcessPage";
import PartsManagementPage from "./pages/service/staff/PartsManagementPage";
import ServiceManagementPage from "./pages/service/staff/ServiceManagementPage";
import StaffVehicleManagementPage from "./pages/service/staff/VehicleManagementPage";
// Technician pages
import AssignedTasksPage from "./pages/service/technician/AssignedTasksPage";
import TechnicianMaintenanceProcessPage from "./pages/service/technician/MaintenanceProcessPage";
import VehicleStatusPage from "./pages/service/technician/VehicleStatusPage";
// Admin pages
import FinanceManagementPage from "./pages/service/admin/FinanceManagementPage";
import PersonnelManagementPage from "./pages/service/admin/PersonnelManagementPage";
import QuotationsPage from "./pages/service/admin/QuotationsPage";
import ReportsPage from "./pages/service/admin/ReportsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/customer/booking" element={<BookingPage />} />
            <Route path="/customer/bookings" element={<BookingsPage />} />
            <Route path="/customer/booking-status" element={<BookingStatusPage />} />
            <Route path="/customer/packages" element={<ServicePackagesPage />} />
            <Route path="/customer/history" element={<ServiceHistoryPage />} />
            <Route path="/customer/vehicles" element={<CustomerVehicleManagementPage />} />
            <Route path="/customer/vehicle/:vehicleId" element={<VehicleProfilePage />} />
            <Route path="/customer/payment" element={<PaymentPage />} />
            <Route path="/service/staff" element={<StaffDashboard />} />
            <Route path="/service/customers" element={<CustomerManagementPage />} />
            <Route path="/service/vehicles" element={<StaffVehicleManagementPage />} />
            <Route path="/service/appointments" element={<AppointmentManagementPage />} />
            <Route path="/service/services" element={<ServiceManagementPage />} />
            <Route path="/service/maintenance" element={<StaffMaintenanceProcessPage />} />
            <Route path="/service/parts" element={<PartsManagementPage />} />
            <Route path="/service/technician" element={<TechnicianDashboard />} />
            <Route path="/service/assigned-tasks" element={<AssignedTasksPage />} />
            <Route path="/service/maintenance-process" element={<TechnicianMaintenanceProcessPage />} />
            <Route path="/service/vehicle-status" element={<VehicleStatusPage />} />
            <Route path="/service/admin" element={<AdminDashboard />} />
            <Route path="/service/personnel" element={<PersonnelManagementPage />} />
            <Route path="/service/finance" element={<FinanceManagementPage />} />
            <Route path="/service/reports" element={<ReportsPage />} />
            <Route path="/service/quotations" element={<QuotationsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ScrollToTop>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
