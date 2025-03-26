import { Navigate } from 'react-router-dom';
import { useQuestionerAuth } from '../contexts/QuestionerAuthContext';

interface ProtectedRouteQuestionerProps {
  children: React.ReactNode;
}

const ProtectedRouteQuestioner: React.FC<ProtectedRouteQuestionerProps> = ({ children }) => {
  const { isAuthenticated } = useQuestionerAuth();

  if (!isAuthenticated) {
    return <Navigate to="/questioner/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRouteQuestioner; 