import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';

export function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Сохраняем путь, с которого пользователя перенаправили
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}