import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Utensils,
  Dumbbell,
  User,
  Menu,
  X,
  Users,
  LogOut,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useBranding } from "@/context/BrandingContext";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { orgName } = useBranding();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const getNavItems = () => {
    if (user?.role === "SUPERADMIN") {
      return [
        { name: "Organizaciones", icon: Building2, path: "/superadmin" },
        { name: "Perfil", icon: User, path: "/profile" },
      ];
    }

    if (user?.role === "ENTRENADOR") {
      return [
        { name: "Resumen", icon: LayoutDashboard, path: "/dashboard" },
        { name: "Mis Usuarios", icon: Users, path: "/trainer/users" },
        // ADDED: Allow trainers to track their own progress
        { name: "Seguimiento", icon: Activity, path: "/tracking" },
        { name: "Dieta", icon: Utensils, path: "/diet" },
        { name: "Entrenamiento", icon: Dumbbell, path: "/workout" },
        { name: "Perfil", icon: User, path: "/profile" },
      ];
    }

    // Default to USER view (Admin should probably separate or see all, but for now User view + Admin Link in App.tsx handles Admin Layout)
    // Actually Admin Layout is separate. So this is for User/Trainer.
    return [
      { name: "Resumen", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Seguimiento", icon: Activity, path: "/tracking" },
      { name: "Dieta", icon: Utensils, path: "/diet" },
      { name: "Entrenamiento", icon: Dumbbell, path: "/workout" },
      { name: "Perfil", icon: User, path: "/profile" },
    ];
  };

  const navItems = getNavItems();

  console.log("📐 DashboardLayout Render:", {
    userRole: user?.role,
    navItemsCount: navItems.length,
  });

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
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xl flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            {orgName}
            <span className="text-secondary">.</span>
          </h1>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-primary-foreground"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-secondary text-secondary-foreground font-medium shadow-md"
                    : "hover:bg-primary-foreground/10 text-primary-foreground/80 hover:text-primary-foreground"
                )}
              >
                <item.icon
                  size={20}
                  className={cn(
                    "",
                    isActive
                      ? "text-secondary-foreground"
                      : "text-primary-foreground/70 group-hover:text-primary-foreground"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary-foreground/10">
          <div className="bg-primary-foreground/10 rounded-xl p-4 mb-2">
            <p className="font-medium text-sm truncate text-primary-foreground">
              {user?.name || "Usuario"}
            </p>
            <p className="text-xs text-primary-foreground/60 truncate uppercase">
              {user?.role || "GUEST"}
            </p>
          </div>

          <Button
            variant="ghost"
            className="w-full flex items-center justify-start gap-3 px-4 text-primary-foreground/80 hover:text-white hover:bg-white/10"
            onClick={() => logout()}
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        {/* Topbar (Mobile only mostly) */}
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-background border-b border-border sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <Menu size={24} />
            </Button>
            <h1 className="text-xl font-bold text-primary lg:hidden">
              {orgName}
            </h1>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* <NotificationCenter /> */}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
