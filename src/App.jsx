import { useState } from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";

import LandingPage from "./Components/LandingPage/LandingPage";
import NavBar from "./Components/Navbar/Navbar";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <LandingPage />
    </BrowserRouter>
  );
}

export default App;
