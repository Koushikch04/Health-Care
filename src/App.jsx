import { useRef, useState } from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";

import LandingPage from "./components/LandingPage/LandingPage";
import NavBar from "./components/Navbar/Navbar";
import SignUp from "./components/LoginSignUp/SignUp";
import SignIn from "./components/LoginSignUp/SignIn";
import FindDoctorSearch from "./components/SearchBar/FindDoctorSearch";
import useAlert from "./hooks/useAlert";
import Review from "./components/Reviews/Review";
import Profile from "./components/Profile/Profile";

function App() {
  const alert = useAlert();

  return (
    <BrowserRouter>
      {/* <NavBar /> */}
      {/* <LandingPage /> */}
      {/* <SignUp /> */}
      {/* <SignIn /> */}
      {/* <FindDoctorSearch /> */}
      {/* <ProfileForm /> */}
      {/* <Review /> */}
      <Profile />
    </BrowserRouter>
  );
}

export default App;
