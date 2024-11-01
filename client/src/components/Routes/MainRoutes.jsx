import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import routes from "./routes";
import ProtectedRoute from "./ProtectedRoute.jsx";

function MainRoutes() {
  const { userLoggedIn, role } = useSelector((state) => state.auth);

  return (
    <Routes>
      {routes.map((route, index) => {
        if (
          userLoggedIn &&
          (route.path === "/auth/login" || route.path === "/auth/signup")
        ) {
          return (
            <Route
              key={index}
              path={route.path}
              element={<Navigate to="/" />}
            />
          );
        }

        // Role-based route access
        if (route.role && route.role !== role) {
          return (
            <Route
              key={index}
              path={route.path}
              element={<Navigate to="/unauthorized" />} // Or any other restricted access page
            />
          );
        }

        // Conditionally wrap with ProtectedRoute if auth is required
        const element = route.requiresAuth ? (
          <ProtectedRoute element={route.element} userLoggedIn={userLoggedIn} />
        ) : (
          route.element
        );

        return (
          <Route key={index} path={route.path} element={element}>
            {route.children &&
              route.children.map((child, childIndex) => {
                const childElement = child.requiresAuth ? (
                  <ProtectedRoute
                    element={child.element}
                    userLoggedIn={userLoggedIn}
                  />
                ) : (
                  child.element
                );
                return (
                  <Route
                    key={childIndex}
                    path={child.path}
                    element={childElement}
                  />
                );
              })}
          </Route>
        );
      })}
    </Routes>
  );
}

export default MainRoutes;
