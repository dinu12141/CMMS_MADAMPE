import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  // With authentication removed, all routes are now publicly accessible
  return children;
};

export default PrivateRoute;