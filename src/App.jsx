import { useRef, useState } from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";

import useAlert from "./hooks/useAlert";
import MainRoutes from "./components/Routes/MainRoutes";
import Layout from "./components/Layout/Layout";

function App() {
  const alert = useAlert();

  return (
    <BrowserRouter>
      <Layout>
        <MainRoutes />
      </Layout>
    </BrowserRouter>
  );
}
export default App;
