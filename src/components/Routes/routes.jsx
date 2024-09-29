// routes.js
import React from "react";
import LandingPage from "../LandingPage/LandingPage";
import SignUp from "../LoginSignUp/SignUp";
import SignIn from "../LoginSignUp/SignIn";
import FindDoctorSearch from "../SearchBar/FindDoctorSearch";
import Review from "../Reviews/Review";
import Profile from "../Profile/Profile";
import MainDash from "../MainDash/MainDash";
import ProfileDetails from "../../Pages/ProfileDetails";

const routes = [
  { path: "/", element: <LandingPage /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/login", element: <SignIn /> },
  { path: "/appointments", element: <FindDoctorSearch /> },
  { path: "/reviews", element: <Review /> },
  {
    path: "/profile",
    element: <Profile />,
    children: [
      { path: "details", element: <ProfileDetails /> },
      { path: "", element: <MainDash /> },
    ],
  },
];

export default routes;
