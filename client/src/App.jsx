import "./App.css";
import { BrowserRouter, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";

import Layout from "./components/Layout/Layout";
import MainRoutes from "./components/Routes/MainRoutes";
import { useEffect } from "react";
import { authActions } from "./store/auth/auth-slice";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(authActions.checkAuth());
    dispatch(authActions.loadUpdates());
  }, [dispatch]);

  const isProfileRoute = location.pathname.startsWith("/profile");

  return (
    // <BrowserRouter>
    <Layout navbarPresent={!isProfileRoute}>
      <div className="route-fade">
        <MainRoutes />
      </div>
    </Layout>
    // </BrowserRouter>
  );
}
export default App;
