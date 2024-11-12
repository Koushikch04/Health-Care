import {
  // UilEstate,
  UilClipboardAlt,
  UilUsersAlt,
  // UilPackage,
  // UilChart,
  // UilSignOutAlt,
} from "@iconscout/react-unicons";

import img1 from "/Images/LandingPage/Client/img1.png";
import img2 from "/Images/LandingPage/Client/img2.png";
import img3 from "/Images/LandingPage/Client/img3.png";
import {
  CalendarMonth,
  Dashboard,
  MessageSharp,
  Repeat,
  Reviews,
  Settings,
} from "@mui/icons-material";

// Sidebar Data
export const SidebarData = [
  {
    icon: Dashboard,
    heading: "Overview",
    url: "/profile/doctor/dashboard",
    role: "doctor",
  },
  {
    icon: UilUsersAlt,
    heading: "Account",
    url: "details",
    role: "user",
  },
  {
    icon: UilClipboardAlt,
    heading: "Appointments",
    url: "appointments",
    role: "user",
  },
  {
    icon: UilClipboardAlt,
    heading: "Appointments",
    url: "/profile/doctor/appointments",
    role: "doctor",
  },
  {
    icon: CalendarMonth,
    heading: "Calender",
    url: "calendar",
    role: "user",
  },
  {
    icon: CalendarMonth,
    heading: "Calender",
    url: "/profile/doctor/calendar",
    role: "doctor",
  },
  // {
  //   icon: MessageSharp,
  //   heading: "Messages",
  //   url: "/",
  // },
  {
    icon: Reviews,
    heading: "Reviews",
    url: "/profile/doctor/reviews",
    role: "doctor",
  },

  {
    icon: Dashboard,
    heading: "Overview",
    url: "/profile/admin/dashboard",
    role: "admin",
  },
  { icon: UilUsersAlt, heading: "Users", url: "/profile/admin/users" },
  { icon: UilUsersAlt, heading: "Doctors", url: "/profile/admin/doctors" },
  { icon: UilUsersAlt, heading: "Admins", url: "/profile/admin/admins" },
  // {
  //   icon: Settings,
  //   heading: "Settings",
  //   url: "/",
  // },
];

// export const cardsData = [
//   {
//     title: "Appointments",
//     color: {
//       backGround: "linear-gradient(180deg, #bb67ff 0%, #c484f3 100%)",
//       boxShadow: "0px 10px 20px 0px #e0c6f5",
//     },
//     barValue: 70,
//     value: "25,970",
//     png: UilUsdSquare,
//     series: [
//       {
//         name: "Sales",
//         data: [31, 40, 28, 51, 42, 109, 100],
//       },
//     ],
//   },
//   {
//     title: "Revenue",
//     color: {
//       backGround: "linear-gradient(180deg, #FF919D 0%, #FC929D 100%)",
//       boxShadow: "0px 10px 20px 0px #FDC0C7",
//     },
//     barValue: 80,
//     value: "14,270",
//     png: UilMoneyWithdrawal,
//     series: [
//       {
//         name: "Revenue",
//         data: [10, 100, 50, 70, 80, 30, 40],
//       },
//     ],
//   },
//   {
//     title: "Expenses",
//     color: {
//       backGround:
//         "linear-gradient(rgb(248, 212, 154) -146.42%, rgb(255 202 113) -46.42%)",
//       boxShadow: "0px 10px 20px 0px #F9D59B",
//     },
//     barValue: 60,
//     value: "4,270",
//     png: UilClipboardAlt,
//     series: [
//       {
//         name: "Expenses",
//         data: [10, 25, 15, 30, 12, 15, 20],
//       },
//     ],
//   },
// ];
