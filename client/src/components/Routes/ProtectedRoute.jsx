import React from "react";
import { Navigate } from "react-router-dom";

const isRoleAllowed = (requiredRole, userRole) => {
  if (!requiredRole) return true;
  if (requiredRole === "admin") {
    return userRole === "admin" || userRole === "superadmin";
  }
  return userRole === requiredRole;
};

function ProtectedRoute({ element, userLoggedIn, userRole, requiredRole }) {
  if (!userLoggedIn) {
    return <Navigate to="/auth/login" />;
  }

  if (requiredRole && !isRoleAllowed(requiredRole, userRole)) {
    return <Navigate to="/profile/details" />;
  }

  return element;
}

export default ProtectedRoute;
