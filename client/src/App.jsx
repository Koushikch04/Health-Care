import "./App.css";
import { BrowserRouter } from "react-router-dom";

// import useAlert from "./hooks/useAlert";
import Layout from "./components/Layout/Layout";
import MainRoutes from "./components/Routes/MainRoutes";
function App() {
  // const alert = useAlert();

  return (
    <BrowserRouter>
      <Layout>
        <MainRoutes />
      </Layout>
    </BrowserRouter>
  );
}
export default App;
