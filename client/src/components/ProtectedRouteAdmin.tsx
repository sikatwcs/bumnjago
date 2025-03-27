import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteAdminProps {
  children: ReactNode;
}

const ProtectedRouteAdmin = ({ children }: ProtectedRouteAdminProps) => {
  const { admin, loading, getProfile } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('admin-token');
      
      if (!token) {
        // Jika tidak ada token, redirect ke login
        navigate('/admin/login', { 
          state: { from: location },
          replace: true 
        });
        return;
      }
      
      if (!admin) {
        try {
          // Mencoba mendapatkan profil admin dengan token yang ada
          await getProfile();
        } catch (error) {
          console.error('Admin auth verification error:', error);
          toast.error('Sesi Anda telah berakhir, silakan login kembali');
          
          // Token tidak valid, hapus dari localStorage
          localStorage.removeItem('admin-token');
          
          // Redirect ke login
          navigate('/admin/login', { 
            state: { from: location },
            replace: true 
          });
        }
      }
      
      setIsVerifying(false);
    };
    
    verifyAuth();
  }, [admin, getProfile, navigate, location]);

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
          <p className="mt-4 text-gray-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Jika sudah tidak loading dan admin ada, render children
  if (!loading && !isVerifying && admin) {
    return <>{children}</>;
  }

  // Fallback jika semua kondisi tidak terpenuhi
  return null;
};

export default ProtectedRouteAdmin; 