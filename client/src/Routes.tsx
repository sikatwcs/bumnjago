import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from './contexts/AdminAuthContext';
import { useQuestionerAuth } from './contexts/QuestionerAuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import QuestionerLogin from './pages/QuestionerLogin';
import QuestionerDashboard from './pages/QuestionerDashboard';
import NotFound from './pages/NotFound';

// Protected Route Components
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { admin, loading } = useAdminAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!admin) {
    return <Navigate to="/admin/login" />;
  }
  
  return <>{children}</>;
};

const QuestionerRoute = ({ children }: { children: React.ReactNode }) => {
  const { questioner, isLoading } = useQuestionerAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!questioner) {
    return <Navigate to="/questioner/login" />;
  }
  
  return <>{children}</>;
};

const Routes = () => {
  return (
    <RouterRoutes>
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Questioner Routes */}
      <Route path="/questioner/login" element={<QuestionerLogin />} />
      <Route
        path="/questioner/dashboard"
        element={
          <QuestionerRoute>
            <QuestionerDashboard />
          </QuestionerRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};

export default Routes; 