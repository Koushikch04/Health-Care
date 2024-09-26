import React from "react";
import { Route, Routes } from "react-router-dom";

import LandingPage from "../LandingPage/LandingPage";
import SignUp from "../LoginSignUp/SignUp";
import SignIn from "../LoginSignUp/SignIn";
import FindDoctorSearch from "../SearchBar/FindDoctorSearch";
import Review from "../Reviews/Review";
import Profile from "../Profile/Profile";

function MainRoutes() {
  return (
    <>
      <Routes>
        <Route exact path="/" element={<LandingPage />} />
        <Route exact path="/signup" element={<SignUp />} />
        <Route exact path="/login" element={<SignIn />} />
        <Route exact path="/appointments" element={<FindDoctorSearch />} />
        <Route exact path="/reviews" element={<Review />} />
        <Route exact path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default MainRoutes;
