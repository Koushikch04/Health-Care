import "./App.css";
import { BrowserRouter } from "react-router-dom";

import useAlert from "./hooks/useAlert";
import Navbar from "./components/Navbar/Navbar";
function App() {
  const alert = useAlert();

  return (
    <BrowserRouter>
      {/* <Layout>
        <MainRoutes />
      </Layout> */}
      <Navbar />
    </BrowserRouter>
  );
}
export default App;
