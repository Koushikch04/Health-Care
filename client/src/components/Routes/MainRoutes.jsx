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
        // Redirect logged-in users from auth routes to the home page
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

        // Check top-level route's role requirement
        if (route.role && route.role !== role) {
          return (
            <Route
              key={index}
              path={route.path}
              element={<Navigate to="/profile/details" />}
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
                // Check child route's role requirement
                if (child.role && child.role !== role) {
                  return (
                    <Route
                      key={childIndex}
                      path={child.path}
                      element={<Navigate to="/profile/details" />}
                    />
                  );
                }

                // Child element with auth and role check
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
