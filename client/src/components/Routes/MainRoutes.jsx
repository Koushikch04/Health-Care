import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import routes from "./routes";
import ProtectedRoute from "./ProtectedRoute.jsx"; // Import the ProtectedRoute component

function MainRoutes() {
  const userLoggedIn = useSelector((state) => state.auth.userLoggedIn);

  return (
    <Routes>
      {routes.map((route, index) => {
        if (
          userLoggedIn &&
          (route.path === "/login" || route.path === "/signup")
        ) {
          return (
            <Route
              key={index}
              path={route.path}
              element={<Navigate to="/" />}
            />
          );
        }

        // Handle protected routes
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
