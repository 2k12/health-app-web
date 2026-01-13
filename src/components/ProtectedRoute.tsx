import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("USUARIO" | "ADMINISTRADOR" | "ENTRENADOR" | "SUPERADMIN")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  console.log("🛡️ ProtectedRoute Check:", {
    path: location.pathname,
    isAuthenticated,
    userRole: user?.role,
    allowedRoles,
  });

  if (isLoading) {
    // You could replace this with a loading spinner component
    return (
      <div className="h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If authenticated but not authorized, redirect to home/dashboard
    // Or show an unauthorized page
    // If authenticated but not authorized, redirect based on role
    if (user.role === "SUPERADMIN") {
      return <Navigate to="/superadmin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
