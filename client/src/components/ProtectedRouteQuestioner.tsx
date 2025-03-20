import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionerAuth } from '@/contexts/QuestionerAuthContext';

interface ProtectedRouteQuestionerProps {
  children: ReactNode;
}

const ProtectedRouteQuestioner = ({ children }: ProtectedRouteQuestionerProps) => {
  const { questioner, loading } = useQuestionerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !questioner) {
      navigate('/questioner/login');
    }
  }, [questioner, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!questioner) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRouteQuestioner; 