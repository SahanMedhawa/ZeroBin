import { Navigate } from 'react-router-dom';

const CollectorProtectedRoute = ({ children }) => {
  // Check if collector is authenticated by looking for collector token or info
  const collectorToken = localStorage.getItem('collectorToken');
  const collectorInfo = localStorage.getItem('collectorInfo');
  
  const isAuthenticated = collectorToken || collectorInfo;

  return isAuthenticated ? children : <Navigate to="/collector/login" replace />;
};

export default CollectorProtectedRoute;
