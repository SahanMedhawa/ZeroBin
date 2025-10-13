import { Navigate } from 'react-router-dom';
import AuthService from '../api/userApi';

const PublicRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = AuthService.isAuthenticated() || localStorage.getItem('userInfo');

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    // Check userInfo for role-based redirect
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        if (userData.isAdmin) {
          return <Navigate to="/admin/dashboard" replace />;
        } else if (userData.role === 'WMA') {
          return <Navigate to="/wma/dashboard" replace />;
        } else if (userData.role === 'Collector') {
          return <Navigate to="/collector/dashboard" replace />;
        } else {
          return <Navigate to="/user/dashboard" replace />;
        }
      } catch (error) {
        console.error('Error parsing userInfo:', error);
        return <Navigate to="/user/dashboard" replace />;
      }
    }
    // Default redirect if no userInfo
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;