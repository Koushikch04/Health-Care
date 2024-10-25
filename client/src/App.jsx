import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { useDispatch } from "react-redux";

// import useAlert from "./hooks/useAlert";
import Layout from "./components/Layout/Layout";
import MainRoutes from "./components/Routes/MainRoutes";
import { useEffect } from "react";
import { authActions } from "./store/auth/auth-slice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authActions.checkAuth());
  }, [dispatch]);
  const isProfileRoute = location.pathname.startsWith("/profile");
  return (
    <BrowserRouter>
      <Layout navbarPresent={!isProfileRoute}>
        <MainRoutes />
      </Layout>
    </BrowserRouter>
  );
}
export default App;
