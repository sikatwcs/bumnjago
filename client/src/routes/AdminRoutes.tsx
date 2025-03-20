import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLogin from "@/pages/AdminLogin";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  if (!role || !token) {
    return <Navigate to="login" state={{ from: location }} replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        path=""
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="*"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  );
};

export default AdminRoutes; 