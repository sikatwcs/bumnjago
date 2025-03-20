import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface ProtectedRouteAdminProps {
  children: ReactNode;
}

const ProtectedRouteAdmin = ({ children }: ProtectedRouteAdminProps) => {
  const { admin, loading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !admin) {
      navigate('/admin/login');
    }
  }, [admin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRouteAdmin; 