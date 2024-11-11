import LandingPage from "../LandingPage/LandingPage";
import SignUp from "../LoginSignUp/SignUp";
import SignIn from "../LoginSignUp/SignIn";
import FindDoctorSearch from "../SearchBar/FindDoctorSearch";
import Review from "../Reviews/UserReview";
import Profile from "../Profile/Profile";
import MainDash from "../MainDash/MainDash";
import ProfileDetails from "../../Pages/ProfileDetails";
import Appointments from "../Appointments/Appointments";
import AppointmentCalendar from "../AppointmentCalender/AppointmentCalendar";
import ChatConsultation from "../chatConsultation/chatConsultation";
import DoctorAppointments from "../Appointments/DoctorAppointments";
import DoctorAppointmentCalendar from "../AppointmentCalender/DoctorAppointmentCalendar";
import DoctorReview from "../Reviews/DoctorReview";
import AdminDashboard from "../../Layouts/AdminDashboard.jsx";
import Users from "../Admin/Users.jsx";
import Doctors from "../Admin/Doctors.jsx";

const routes = [
  { path: "/", element: <LandingPage />, requiresAuth: false },
  { path: "/auth/signup", element: <SignUp />, requiresAuth: false },
  { path: "/auth/login", element: <SignIn />, requiresAuth: false },
  {
    path: "/appointments",
    element: <FindDoctorSearch />,
    requiresAuth: false,
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
      { path: "details", element: <ProfileDetails />, role: "user" },
      { path: "appointments", element: <Appointments />, role: "user" },
      { path: "calendar", element: <AppointmentCalendar />, role: "user" },
      {
        path: "/profile/doctor/calendar",
        element: <DoctorAppointmentCalendar />,
        role: "doctor",
      },
      {
        path: "/profile/doctor/dashboard",
        element: <MainDash />,
        requiresAuth: true,
        role: "doctor",
      },
      {
        path: "/profile/doctor/appointments",
        element: <DoctorAppointments />,
        requiresAuth: true,
        role: "doctor",
      },
      {
        path: "/profile/doctor/reviews",
        element: <DoctorReview />,
        role: "doctor",
      },

      {
        path: "/profile/admin/dashboard",
        element: <AdminDashboard />,
        role: "admin",
      },
      { path: "/profile/admin/users", element: <Users />, role: "admin" },
      { path: "/profile/admin/doctors", element: <Doctors />, role: "admin" },

      // { path: "", element: <MainDash /> },
    ],
  },
];

export default routes;
