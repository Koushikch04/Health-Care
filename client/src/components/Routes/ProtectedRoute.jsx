import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ element, userLoggedIn, userRole, requiredRole }) {
  if (!userLoggedIn) {
    return <Navigate to="/auth/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/profile/details" />;
  }

  return element;
}

export default ProtectedRoute;
