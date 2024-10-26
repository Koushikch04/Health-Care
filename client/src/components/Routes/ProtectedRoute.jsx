import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ element, userLoggedIn }) => {
  console.log(userLoggedIn);

  return userLoggedIn ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
