import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Package,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  UserCircle,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Calendar, label: 'Agenda', path: '/admin/agenda' },
  { icon: Users, label: 'Clientes', path: '/admin/clientes' },
  { icon: Scissors, label: 'Serviços', path: '/admin/servicos' },
  { icon: UserCircle, label: 'Profissionais', path: '/admin/profissionais' },
  { icon: Package, label: 'Produtos', path: '/admin/produtos' },
  { icon: DollarSign, label: 'Financeiro', path: '/admin/financeiro' },
  { icon: Settings, label: 'Configurações', path: '/admin/configuracoes' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userName } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Logo size="md" />
      </div>

      {/* Menu */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-11',
                  isActive && 'bg-primary/10 text-primary'
                )}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User + Logout */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-background flex">
      {/* Sidebar fixa - Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 w-64 h-screen flex-col border-r border-border bg-card">
        <SidebarContent />
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col lg:ml-64 h-screen">
        
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
          <div className="flex items-center justify-between p-4">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="p-0 w-64 h-full max-h-screen">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <Logo size="sm" />
          </div>
        </header>

        {/* Conteúdo rolável */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
