import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType?: 'brand' | 'creator' | 'admin';
}

export default function ProtectedRoute({ children, userType }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to appropriate login based on route
    if (userType === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  if (userType && user.type !== userType) {
    // Redirect to appropriate dashboard based on user type
    if (user.type === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to={user.type === 'brand' ? '/dashboard' : '/creator/dashboard'} replace />;
  }

  return <>{children}</>;
}
