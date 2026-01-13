import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminFoodPage from "./pages/admin/AdminFoodPage";
import AdminExercisePage from "./pages/admin/AdminExercisePage";
import UserHistoryPage from "./pages/admin/UserHistoryPage";

// User Pages
import UserMeasurementsPage from "./pages/user/UserMeasurementsPage";
import UserDietPage from "./pages/user/UserDietPage";
import UserWorkoutPage from "./pages/user/UserWorkoutPage";

// Trainer Pages
import TrainerUsersPage from "./pages/trainer/TrainerUsersPage";
import TrainerUserDetailPage from "./pages/trainer/TrainerUserDetailPage";

import ProfilePage from "./pages/ProfilePage";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";

import LandingPage from "./pages/LandingPage";
import { BrandingProvider } from "./context/BrandingContext";

function App() {
  // Determine basename for routing
  // If URL matches /org/:slug/*, extract it and set as basename
  const path = window.location.pathname;
  const pathMatch = path.match(/^\/org\/([^/]+)/);
  const orgSlug = pathMatch ? pathMatch[1] : null;

  // For SuperAdmin or Landing, we might not use a basename, or use a default
  // Current logic:
  // 1. /superadmin -> No basename (root)
  // 2. /org/:slug -> Basename /org/:slug
  // 3. / -> Redirect to /org/vitality/login or /org/vitality
  // 4. /login -> Redirect to /org/vitality/login (Defaulting)

  if (path === "/" || path === "/login") {
    if (window.location.search.includes("redirect_loop")) {
      console.error("Redirect loop detected");
    } else {
      // Force redirect to Vitality as default
      window.location.href = "/org/vitality/";
      return null;
    }
  }

  // If we are in specific non-org routes (like /superadmin), use no basename
  const isSuperAdmin = path.startsWith("/superadmin");
  const basename = isSuperAdmin ? "/" : orgSlug ? `/org/${orgSlug}` : "/";

  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <BrandingProvider>
        <Router basename={basename}>
          <Routes>
            {/* Landing Page (Public) - mapped to root of the basename */}
            <Route
              path="/"
              element={
                orgSlug ? <Navigate to="/login" replace /> : <LandingPage />
              }
            />

            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* User & Trainer Routes (DashboardLayout handles Nav based on Role) */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "USUARIO",
                    "ENTRENADOR",
                    "ADMINISTRADOR",
                    "SUPERADMIN",
                  ]}
                >
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* User Specific */}
              <Route path="/tracking" element={<UserMeasurementsPage />} />
              <Route path="/diet" element={<UserDietPage />} />
              <Route path="/workout" element={<UserWorkoutPage />} />

              {/* Trainer Specific */}
              <Route path="/trainer/users" element={<TrainerUsersPage />} />
              <Route
                path="/trainer/users/:userId"
                element={<TrainerUserDetailPage />}
              />

              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="users" replace />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route
                path="users/:userId/history"
                element={<UserHistoryPage />}
              />
              <Route path="foods" element={<AdminFoodPage />} />
              <Route path="exercises" element={<AdminExercisePage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* SuperAdmin Routes - These might be rendered somewhat weirdly if inside /org/:slug basename
                BUT SuperAdmin is global.
                If user goes to /org/vitality/superadmin, it works visually but logically maybe odd.
                However, our logic sets basename="/" if starts with /superadmin.
            */}
            {isSuperAdmin && (
              <Route
                path="/superadmin"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<SuperAdminDashboard />} />
              </Route>
            )}

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </BrandingProvider>
    </AuthProvider>
  );
}

export default App;
