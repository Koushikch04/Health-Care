import {
  // UilEstate,
  UilClipboardAlt,
  UilUsersAlt,
  // UilPackage,
  // UilChart,
  // UilSignOutAlt,
} from "@iconscout/react-unicons";

import { UilUsdSquare, UilMoneyWithdrawal } from "@iconscout/react-unicons";

import img1 from "/Images/LandingPage/Client/img1.png";
import img2 from "/Images/LandingPage/Client/img2.png";
import img3 from "/Images/LandingPage/Client/img3.png";
import {
  CalendarMonth,
  Dashboard,
  MessageSharp,
  Repeat,
  Settings,
} from "@mui/icons-material";

// Sidebar Data
export const SidebarData = [
  {
    icon: Dashboard,
    heading: "Overview",
    url: "/profile/dashboard",
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
  },
  {
    icon: CalendarMonth,
    heading: "Calender",
    url: "calendar",
  },
  {
    icon: MessageSharp,
    heading: "Messages",
    url: "/",
  },
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

export const cardsData = [
  {
    title: "Today's Appointments",
    color: {
      backGround: "linear-gradient(180deg, #34eb5c 0%, #76f78d 100%)",
      boxShadow: "0px 10px 20px 0px #d9f7e6",
    },
    barValue: 75,
    value: "20",
    png: UilClipboardAlt, // or any suitable icon
    series: [{ name: "Appointments", data: [15, 17, 14, 18, 20] }],
  },
  {
    title: "Revenue",
    color: {
      backGround: "linear-gradient(180deg, #FF919D 0%, #FC929D 100%)",
      boxShadow: "0px 10px 20px 0px #FDC0C7",
    },
    barValue: 85,
    value: "$12,400",
    png: UilMoneyWithdrawal,
    series: [{ name: "Revenue", data: [5000, 7000, 8500, 11000, 12400] }],
  },
  {
    title: "Expenses",
    color: {
      backGround: "linear-gradient(180deg, #FFC75F 0%, #FFDD99 100%)",
      boxShadow: "0px 10px 20px 0px #f5d67a",
    },
    barValue: 50,
    value: "$3,000",
    png: UilUsdSquare,
    series: [{ name: "Expenses", data: [2000, 2500, 2800, 3000, 3000] }],
  },
  {
    title: "New Patients",
    color: {
      backGround: "linear-gradient(180deg, #42a5f5 0%, #1e88e5 100%)",
      boxShadow: "0px 10px 20px 0px #9ecfff",
    },
    barValue: 75, // Example progress, could represent patient growth
    value: "320", // Mock data for new patients count
    png: UilUsersAlt, // Add relevant icon
    series: [
      {
        name: "New Patients",
        data: [25, 30, 45, 50, 70, 80, 100], // Monthly or weekly data for trends
      },
    ],
  },

  // {
  //   title: "Rebooking Rate",
  //   color: {
  //     backGround: "linear-gradient(180deg, #ffb74d 0%, #ff9800 100%)",
  //     boxShadow: "0px 10px 20px 0px #ffd280",
  //   },
  //   barValue: 50, // Example rebooking rate percentage
  //   value: "50%",
  //   png: Repeat,
  //   series: [
  //     {
  //       name: "Rebooking Rate",
  //       data: [10, 20, 30, 40, 50, 60, 70], // Mock data for rebooking trends
  //     },
  //   ],
  // },
];

// Recent Update Card Data
export const UpdatesData = [
  {
    img: img1,
    name: "Andrew Thomas",
    noti: "has ordered Apple smart watch 2500mh battery.",
    time: "25 seconds ago",
  },
  {
    img: img2,
    name: "James Bond",
    noti: "has received Samsung gadget for charging battery.",
    time: "30 minutes ago",
  },
  // {
  //   img: img3,
  //   name: "Iron Man",
  //   noti: "has ordered Apple smart watch, samsung Gear 2500mh battery.",
  //   time: "2 hours ago",
  // },
];

// Data.js
// export const AppointmentsData = [
//   {
//     _id: "1",
//     img: "https://bootdey.com/img/Content/avatar/avatar1.png",
//     doctor: { name: "Dr. Andrew Thomas" },
//     time: "10:00 AM",
//     timeAgo: "10 minutes ago",
//   },
//   {
//     _id: "2",
//     img: "https://bootdey.com/img/Content/avatar/avatar2.png",
//     doctor: { name: "Dr. James Bond" },
//     time: "11:30 AM",
//     timeAgo: "30 minutes ago",
//   },
//   {
//     _id: "3",
//     img: "https://bootdey.com/img/Content/avatar/avatar3.png",
//     doctor: { name: "Dr. Iron Man" },
//     time: "2:00 PM",
//     timeAgo: "2 hours ago",
//   },
// ];

export const AppointmentsData = [
  {
    _id: "1",
    img: "https://example.com/avatar1.png",
    patient: { name: "John Doe" },
    time: "10:00 AM",
    timeAgo: "10 minutes ago",
  },
  {
    _id: "2",
    img: "https://example.com/avatar2.png",
    patient: { name: "Sarah Connor" },
    time: "11:30 AM",
    timeAgo: "30 minutes ago",
  },
  {
    _id: "3",
    img: "https://example.com/avatar3.png",
    patient: { name: "Tony Stark" },
    time: "2:00 PM",
    timeAgo: "2 hours ago",
  },
];
