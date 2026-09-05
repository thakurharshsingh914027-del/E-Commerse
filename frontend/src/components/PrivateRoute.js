// src/components/PrivateRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ FIX: Use toLowerCase() to avoid "Admin" vs "admin" mismatches
  if (role && user?.role?.toLowerCase() !== role.toLowerCase()) {
    console.warn(`Access denied. Required: ${role}, User has: ${user?.role}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const PrivateRoute = ({ children, role }) => {
//   const { isAuthenticated, user, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="loading-spinner">
//         <div className="spinner"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (role && user?.role !== role) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default PrivateRoute;
