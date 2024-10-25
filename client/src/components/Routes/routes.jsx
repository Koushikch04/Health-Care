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
import InstantConsultation from "../InstantConsultation/InstantConsultation";
const routes = [
  { path: "/", element: <LandingPage />, requiresAuth: false },
  { path: "/signup", element: <SignUp />, requiresAuth: false },
  { path: "/login", element: <SignIn />, requiresAuth: false },
  { path: "/appointments", element: <FindDoctorSearch />, requiresAuth: true },
  { path: "/reviews", element: <Review />, requiresAuth: true },
  {
    path: "/profile",
    element: <Profile />,
    requiresAuth: true,
    children: [
      { path: "details", element: <ProfileDetails /> },
      { path: "", element: <MainDash /> },
    ],
  },
];

export default routes;
