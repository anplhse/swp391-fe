import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/auth';
import { Bell, Calendar, Car, ClipboardList, History, LayoutDashboard, LogOut, Package, Settings, User, Users, Wrench } from 'lucide-react';
import { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  user: {
    email: string;
    role: string;
    userType: string;
  };
}

export function DashboardLayout({ children, title, user }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { logout, user: authUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Lỗi đăng xuất",
        description: "Có lỗi xảy ra khi đăng xuất",
        variant: "destructive"
      });
    }
  };

  // Use auth user if available, fallback to prop user
  // Map role from roleDisplayName if needed
  const roleKey = authUser?.roleDisplayName
    ? (authService.getRoleKey() || user?.role || 'customer')
    : (user?.role || 'customer');
  const currentUser = authUser ? { ...authUser, role: roleKey } : { ...user, role: roleKey };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      customer: 'Khách hàng',
      staff: 'Nhân viên',
      technician: 'Kỹ thuật viên',
      admin: 'Quản trị viên'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  // Get user type based on role
  const getUserType = (role: string) => {
    return role === 'customer' ? 'customer' : 'service';
  };

  // Type guards/helpers for display name without using any
  type MinimalUser = { email: string; role: string };
  type PropUser = MinimalUser & { userType: string };
  type AuthUser = MinimalUser & { fullName?: string };

  function hasFullName(u: MinimalUser | PropUser | AuthUser): u is AuthUser & { fullName: string } {
    return 'fullName' in u && typeof (u as { fullName: unknown }).fullName === 'string' && (u as { fullName: string }).fullName.length > 0;
  }

  // Helper: NavLink integrated with SidebarMenuButton to set active state
  const isActivePath = (path: string) => {
    // Only exact match for dashboard paths to prevent multiple active states
    if (path === '/customer' || path === '/service/staff' || path === '/service/technician' || path === '/service/admin') {
      return location.pathname === path;
    }
    // For other paths, allow startsWith for sub-pages
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const LinkItem = ({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<unknown>; label: string }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActivePath(to)}>
        <NavLink to={to}>
          <Icon /> <span>{label}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  const menuItems = (() => {
    switch (currentUser.role) {
      case 'staff':
        return [
          { to: '/service/staff', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/service/customers', icon: Users, label: 'Quản lý tài khoản' },
          { to: '/service/vehicles', icon: Car, label: 'Quản lý xe' },
          { to: '/service/appointments', icon: Calendar, label: 'Quản lý lịch hẹn' },
          { to: '/service/services', icon: Wrench, label: 'Quản lý dịch vụ' },
          { to: '/service/maintenance', icon: Settings, label: 'Quy trình bảo dưỡng' },
          { to: '/service/parts', icon: Package, label: 'Quản lý phụ tùng' },
          { to: '/service/vehicle-models', icon: Car, label: 'Quản lý mẫu xe' },
        ];
      case 'technician':
        return [
          { to: '/service/technician', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/service/assigned-tasks', icon: ClipboardList, label: 'Công việc được giao' },
          { to: '/service/maintenance-process', icon: Settings, label: 'Quy trình bảo dưỡng' },
          { to: '/service/vehicle-status', icon: Car, label: 'Trạng thái xe' },
        ];
      case 'admin':
        return [
          { to: '/service/admin', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/service/personnel', icon: Users, label: 'Quản lý nhân sự' },
        ];
      default:
        return [
          { to: '/customer', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/customer/booking', icon: Calendar, label: 'Đặt lịch' },
          { to: '/customer/bookings', icon: History, label: 'Quản lý lịch hẹn' },
          { to: '/customer/vehicles', icon: Car, label: 'Xe của tôi' },
        ];
    }
  })();

  return (
    <SidebarProvider>
      <Sidebar className="bg-sidebar text-sidebar-foreground" collapsible="offcanvas" variant="sidebar">
        <SidebarHeader>
          <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-2 rounded-2xl shadow-lg border border-orange-200 mx-2 my-2">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <span className="font-sans font-semibold text-gray-800">VinFast Service Workshop</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Quản lý chính</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item, idx) => (
                  <LinkItem key={idx} to={item.to} icon={item.icon as unknown as React.ComponentType<unknown>} label={item.label} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <Button variant="ghost" className="justify-start" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0 md:m-0 md:rounded-none md:shadow-none">
        {/* Top bar */}
        <header className="border-b border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-40 min-w-0">
          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              {title && <h1 className="text-lg font-sans font-semibold">{title}</h1>}
              <span className="text-sm text-muted-foreground hidden md:inline">{getRoleDisplayName(currentUser.role)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs"></span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatars/01.png" alt={currentUser.email} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {currentUser.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-sans font-medium leading-none">{hasFullName(currentUser) ? currentUser.fullName : getRoleDisplayName(currentUser.role)}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Hồ sơ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Cài đặt</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:py-6 min-w-0">
              {children}
            </div>
          </div>
        </div>

      </SidebarInset>
    </SidebarProvider>
  );
}