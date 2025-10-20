// import { DashboardLayout } from '@/components/layout/DashboardLayout';
// import { useAuth } from '@/hooks/useAuth';
// import { Navigate, Outlet, useLocation } from 'react-router-dom';

// export default function DefaultLayout() {
//   const { user, isAuthenticated } = useAuth();
//   const location = useLocation();

//   if (!isAuthenticated || !user) {
//     return <Navigate to="/" replace />; // Chưa đăng nhập: về trang gốc
//   }

//   // Khách hàng: chỉ riêng trang dashboard "/customer" dùng layout công khai (giống trang gốc)
//   if (user.role === 'customer' && location.pathname === '/customer') {
//     return <Outlet />;
//   }

//   // Service center roles: bọc bằng DashboardLayout
//   return (
//     <DashboardLayout user={{
//       email: user.email,
//       role: user.role,
//       userType: 'service'
//     }}>
//       <Outlet />
//     </DashboardLayout>
//   );
// }
