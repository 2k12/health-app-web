import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Users,
  Settings,
  LogOut,
  Menu, // Use Menu icon for mobile toggle
  X, // Use X icon for closing mobile menu.
  ShieldCheck,
  Apple,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useBranding } from "@/context/BrandingContext";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth(); // Use logout from context
  const { orgName } = useBranding();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { name: "Gestión de Usuarios", icon: Users, path: "/admin/users" },
    { name: "Gestión de Comidas", icon: Apple, path: "/admin/foods" },
    { name: "Gestión de Ejercicios", icon: Dumbbell, path: "/admin/exercises" },
    // { name: "Configuración", icon: Settings, path: "/admin/settings" },
    { name: "Configuración", icon: Settings, path: "#" },
    { name: "Mi Perfil", icon: ShieldCheck, path: "/admin/profile" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card text-card-foreground border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-border/50">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <ShieldCheck className="text-primary" />
            Admin Panel
          </h1>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium",
                  isActive
                    ? "bg-secondary text-secondary-foreground shadow-sm"
                    : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon
                  size={20}
                  className={cn(
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-start gap-3 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              setIsSidebarOpen(false);
              logout();
            }}
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-background border-b border-border sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="lg:hidden text-xl font-bold text-primary">
              {orgName}
            </h1>
            {/* Breadcrumb Implementation */}
            <Breadcrumb className="hidden lg:block">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {navItems.find((item) =>
                      location.pathname.startsWith(item.path)
                    )?.name || "Dashboard"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <Menu size={24} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="hidden lg:flex items-center gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto w-full max-w-[100vw] overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
