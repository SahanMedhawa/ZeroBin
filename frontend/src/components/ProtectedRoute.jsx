import { Navigate } from 'react-router-dom';
import AuthService from '../api/userApi';

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated by looking for token or userInfo
  const isAuthenticated = AuthService.isAuthenticated() || localStorage.getItem('userInfo');

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;