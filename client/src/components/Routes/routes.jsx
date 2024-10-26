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
import Appointments from "../Appointments/Appointments";
import InstantConsultation from "../InstantConsultation/InstantConsultation";
const routes = [
  { path: "/", element: <LandingPage />, requiresAuth: false },
  { path: "/auth/signup", element: <SignUp />, requiresAuth: false },
  { path: "/auth/login", element: <SignIn />, requiresAuth: false },
  { path: "/appointments", element: <FindDoctorSearch />, requiresAuth: false },
  { path: "/reviews", element: <Review />, requiresAuth: true },
  {
    path: "/profile",
    element: <Profile />,
    requiresAuth: true,
    children: [
      { path: "details", element: <ProfileDetails /> },
      { path: "appointments", element: <Appointments /> },
      { path: "", element: <MainDash /> },
    ],
  },
];

export default routes;
