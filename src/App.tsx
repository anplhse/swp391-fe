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
import VehicleManagementPage from "./pages/customer/VehicleManagementPage";
import VehicleProfilePage from "./pages/customer/VehicleProfilePage";
import AdminDashboard from "./pages/service/AdminDashboard";
import StaffDashboard from "./pages/service/StaffDashboard";
import TechnicianDashboard from "./pages/service/TechnicianDashboard";

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
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/customer/booking" element={<BookingPage />} />
            <Route path="/customer/bookings" element={<BookingsPage />} />
            <Route path="/customer/booking-status" element={<BookingStatusPage />} />
            <Route path="/customer/packages" element={<ServicePackagesPage />} />
            <Route path="/customer/history" element={<ServiceHistoryPage />} />
            <Route path="/customer/vehicles" element={<VehicleManagementPage />} />
            <Route path="/customer/vehicle/:vehicleId" element={<VehicleProfilePage />} />
            <Route path="/customer/payment" element={<PaymentPage />} />
            <Route path="/service/staff" element={<StaffDashboard />} />
            <Route path="/service/technician" element={<TechnicianDashboard />} />
            <Route path="/service/admin" element={<AdminDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ScrollToTop>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
