import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';

function PrivateRoute({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [navigate, token]);

  return token ? children : null;
}

export default PrivateRoute;
