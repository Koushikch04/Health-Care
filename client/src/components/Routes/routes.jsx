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
import AppointmentCalendar from "../AppointmentCalender/AppointmentCalendar";
import ChatConsultation from "../chatConsultation/chatConsultation";

const routes = [
  { path: "/", element: <LandingPage />, requiresAuth: false, role: "user" },
  { path: "/auth/signup", element: <SignUp />, requiresAuth: false },
  { path: "/auth/login", element: <SignIn />, requiresAuth: false },
  {
    path: "/appointments",
    element: <FindDoctorSearch />,
    requiresAuth: false,
    role: "user",
  },
  { path: "/reviews", element: <Review />, requiresAuth: true, role: "user" },
  {
    path: "/chat",
    element: <ChatConsultation />,
    requiresAuth: true,
    role: "user",
  },
  {
    path: "/profile",
    element: <Profile />,
    requiresAuth: true,
    children: [
      { path: "details", element: <ProfileDetails /> },
      { path: "appointments", element: <Appointments /> },
      { path: "calendar", element: <AppointmentCalendar /> },
      {
        path: "/profile/dashboard",
        element: <MainDash />,
        requiresAuth: true,
        role: "doctor",
      },

      // { path: "", element: <MainDash /> },
    ],
  },
];

export default routes;
