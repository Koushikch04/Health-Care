import {
  UilEstate,
  UilClipboardAlt,
  UilUsersAlt,
  UilPackage,
  UilChart,
  UilSignOutAlt,
} from "@iconscout/react-unicons";

import { UilUsdSquare, UilMoneyWithdrawal } from "@iconscout/react-unicons";

import img1 from "/Images/LandingPage/Client/img1.png";
import img2 from "/Images/LandingPage/Client/img2.png";
import img3 from "/Images/LandingPage/Client/img3.png";
import {
  CalendarMonth,
  Dashboard,
  MessageSharp,
  Settings,
} from "@mui/icons-material";

// Sidebar Data
export const SidebarData = [
  {
    icon: Dashboard,
    heading: "Overview",
    url: "/profile/",
  },
  {
    icon: UilUsersAlt,
    heading: "Account",
    url: "details",
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

export const cardsData = [
  {
    title: "Appointments",
    color: {
      backGround: "linear-gradient(180deg, #bb67ff 0%, #c484f3 100%)",
      boxShadow: "0px 10px 20px 0px #e0c6f5",
    },
    barValue: 70,
    value: "25,970",
    png: UilUsdSquare,
    series: [
      {
        name: "Sales",
        data: [31, 40, 28, 51, 42, 109, 100],
      },
    ],
  },
  {
    title: "Revenue",
    color: {
      backGround: "linear-gradient(180deg, #FF919D 0%, #FC929D 100%)",
      boxShadow: "0px 10px 20px 0px #FDC0C7",
    },
    barValue: 80,
    value: "14,270",
    png: UilMoneyWithdrawal,
    series: [
      {
        name: "Revenue",
        data: [10, 100, 50, 70, 80, 30, 40],
      },
    ],
  },
  {
    title: "Expenses",
    color: {
      backGround:
        "linear-gradient(rgb(248, 212, 154) -146.42%, rgb(255 202 113) -46.42%)",
      boxShadow: "0px 10px 20px 0px #F9D59B",
    },
    barValue: 60,
    value: "4,270",
    png: UilClipboardAlt,
    series: [
      {
        name: "Expenses",
        data: [10, 25, 15, 30, 12, 15, 20],
      },
    ],
  },
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
export const AppointmentsData = [
  {
    _id: "1",
    img: "https://bootdey.com/img/Content/avatar/avatar1.png",
    doctor: { name: "Dr. Andrew Thomas" },
    time: "10:00 AM",
    timeAgo: "10 minutes ago",
  },
  {
    _id: "2",
    img: "https://bootdey.com/img/Content/avatar/avatar2.png",
    doctor: { name: "Dr. James Bond" },
    time: "11:30 AM",
    timeAgo: "30 minutes ago",
  },
  {
    _id: "3",
    img: "https://bootdey.com/img/Content/avatar/avatar3.png",
    doctor: { name: "Dr. Iron Man" },
    time: "2:00 PM",
    timeAgo: "2 hours ago",
  },
];
