import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles.length > 0 && user?.role) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect unauthorized users to appropriate page based on their role
      const roleRedirects = {
        'COMMUNITY_ADMIN': '/community-admin/dashboard',
        'SHOP_OWNER': '/shop/dashboard',
        'PLATFORM_ADMIN': '/admin/dashboard',
        'TOURIST': '/'
      };
      
      const redirectPath = roleRedirects[user.role] || '/';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
