import React, { useEffect, useState } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

import styles from "./Statistics.module.css";

import Card from "./Card.jsx";
import { useSelector } from "react-redux";
import { baseURL } from "../api/api.js";
import DoctorChart from "../Charts/DoctorChart.jsx";
import StatisticsSpinner from "../components/Spinners/StatisticsSpinner.jsx";

const transformDataToCards = (responseData) => {
  const {
    totalAppointments,
    pendingAppointments,
    completedAppointments,
    revenue,
  } = responseData.data;

  const expectedMaxRevenue = 12400;

  const cardsData = [
    {
      title: "Total",
      color: {
        backGround: "linear-gradient(180deg, #34eb5c 0%, #76f78d 100%)",
        boxShadow: "0px 10px 20px 0px #d9f7e6",
      },
      barValue: 100,
      value: totalAppointments.toString(),
      png: DashboardIcon, // Icon for total appointments
      series: [
        {
          name: "Appointments",
          data: [pendingAppointments, completedAppointments],
        },
      ],
    },
    {
      title: "Scheduled",
      color: {
        backGround: "linear-gradient(180deg, #FFC75F 0%, #FFDD99 100%)",
        boxShadow: "0px 10px 20px 0px #f5d67a",
      },
      barValue:
        Math.floor((pendingAppointments / totalAppointments) * 100) || 0,
      value: pendingAppointments.toString(),
      png: AccessTimeIcon, // Icon for pending appointments
      series: [{ name: "Pending Appointments", data: [pendingAppointments] }],
    },
    {
      title: "Completed",
      color: {
        backGround: "linear-gradient(180deg, #42a5f5 0%, #1e88e5 100%)",
        boxShadow: "0px 10px 20px 0px #9ecfff",
      },
      barValue:
        Math.floor((completedAppointments / totalAppointments) * 100) || 0,
      value: completedAppointments.toString(),
      png: CheckCircleIcon, // Icon for completed appointments
      series: [
        { name: "Completed Appointments", data: [completedAppointments] },
      ],
    },
    {
      title: "Revenue",
      color: {
        backGround: "linear-gradient(180deg, #FF919D 0%, #FC929D 100%)",
        boxShadow: "0px 10px 20px 0px #FDC0C7",
      },
      barValue: Math.floor((revenue / expectedMaxRevenue) * 100) || 0,
      value: `$${revenue.toLocaleString()}`,
      png: AttachMoneyIcon,
      series: [{ name: "Revenue", data: [revenue] }],
    },
  ];

  return cardsData;
};

const DoctorStatistics = () => {
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${baseURL}/doctor/statistics?doctorId=${userInfo._id}`
        );

        const statistics = await response.json();
        console.log("Hello");
        console.log(statistics);

        // setData(statistics.data);
        setCardsData(transformDataToCards(statistics));
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userInfo._id]);

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <StatisticsSpinner />
      </div>
    );
  }
  return (
    <div className={styles.statistics}>
      {cardsData.map((card, id) => {
        return (
          <div className={styles.parentContainer} key={id}>
            <Card
              title={card.title}
              color={card.color}
              barValue={card.barValue}
              value={card.value}
              png={card.png}
              series={card.series}
              isBarRequired={true}
            />
          </div>
        );
      })}
      <DoctorChart />
    </div>
  );
};

export default DoctorStatistics;
