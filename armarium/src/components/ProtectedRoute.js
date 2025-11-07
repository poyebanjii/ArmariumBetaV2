import React from 'react';
import { Navigate, useLocation  } from 'react-router-dom';
import useAuth from './backend/useAuth';

function ProtectedRoute({ element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return React.cloneElement(element, { location });
}

export default ProtectedRoute;