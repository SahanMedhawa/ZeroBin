import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CollectorLoginRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to main login page
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
};

export default CollectorLoginRedirect;
