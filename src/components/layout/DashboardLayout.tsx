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
import { Bell, Calendar, Car, History, LayoutDashboard, LogOut, Package, Settings, User } from 'lucide-react';
import { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn!",
    });
    navigate('/login');
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      customer: 'Khách hàng',
      staff: 'Nhân viên',
      technician: 'Kỹ thuật viên',
      admin: 'Quản trị viên'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  // Helper: NavLink integrated with SidebarMenuButton to set active state
  const isActivePath = (path: string) => {
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

  return (
    <SidebarProvider>
      <Sidebar className="bg-sidebar text-sidebar-foreground" collapsible="offcanvas" variant="sidebar">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2">
            <span className="font-semibold">My Service Center</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Điều hướng</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <LinkItem to="/customer" icon={LayoutDashboard} label="Dashboard" />
                <LinkItem to="/customer/booking" icon={Calendar} label="Đặt lịch" />
                <LinkItem to="/customer/bookings" icon={History} label="Quản lý lịch hẹn" />
                <LinkItem to="/customer/vehicles" icon={Car} label="Xe của tôi" />
                <LinkItem to="/customer/packages" icon={Package} label="Gói dịch vụ" />
                <LinkItem to="/customer/history" icon={History} label="Lịch sử dịch vụ" />
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
              <h1 className="text-lg font-semibold">{title}</h1>
              <span className="text-sm text-muted-foreground hidden md:inline">{getRoleDisplayName(user.role)}</span>
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
                      <AvatarImage src="/avatars/01.png" alt={user.email} />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{getRoleDisplayName(user.role)}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
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