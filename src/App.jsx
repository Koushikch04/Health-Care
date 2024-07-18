import { useState } from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";

import LandingPage from "./Components/LandingPage/LandingPage";
import NavBar from "./Components/Navbar/Navbar";
import SignUp from "./Components/LoginSignUp/SignUp";
import SignIn from "./Components/LoginSignUp/SignIn";

function App() {
  return (
    <BrowserRouter>
      {/* // <NavBar /> */}
      {/* // <LandingPage /> */}
      <SignUp />
      {/* <SignIn /> */}
    </BrowserRouter>
  );
}

export default App;
