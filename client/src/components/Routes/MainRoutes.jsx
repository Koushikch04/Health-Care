import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import routes from "./routes";
import ProtectedRoute from "./ProtectedRoute.jsx";

function MainRoutes() {
  const { userLoggedIn, userRole: role } = useSelector((state) => state.auth);

  return (
    <Routes>
      {routes.map((route, index) => {
        console.log(route.path, role, route.role);
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

        if (role === "doctor" && route.path !== "/profile") {
          return (
            <Route
              key={index}
              path={route.path}
              element={<Navigate to="/profile/doctor/dashboard" />}
            />
          );
        }

        if (role === "admin" && route.path !== "/profile") {
          return (
            <Route
              key={index}
              path={route.path}
              element={<Navigate to="/profile/admin/dashboard" />}
            />
          );
        }

        if (route.role && role && route.role !== role) {
          return (
            <Route
              key={index}
              path={route.path}
              element={<Navigate to="/" />}
            />
          );
        }

        // Determine if route needs authentication
        const element = route.requiresAuth ? (
          <ProtectedRoute
            element={route.element}
            userLoggedIn={userLoggedIn}
            userRole={role}
            requiredRole={route.role}
          />
        ) : (
          route.element
        );

        return (
          <Route key={index} path={route.path} element={element}>
            {route.children &&
              route.children.map((child, childIndex) => {
                if (child.role && child.role !== role) {
                  return (
                    <Route
                      key={childIndex}
                      path={child.path}
                      element={<Navigate to="/profile/details" />}
                    />
                  );
                }

                const childElement = child.requiresAuth ? (
                  <ProtectedRoute
                    element={child.element}
                    userLoggedIn={userLoggedIn}
                    userRole={role}
                    requiredRole={child.role}
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
