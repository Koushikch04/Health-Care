import React, { useEffect, useState } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

import styles from "./Statistics.module.css";

import Card from "./Card.jsx";
import { useSelector } from "react-redux";
import { baseURL } from "../api/api.js";
import AdminChart from "../Charts/AdminChart.jsx";
import StatisticsSpinner from "../components/Spinners/StatisticsSpinner.jsx";

const transformDataToCards = (responseData) => {
  const { userCount, doctorCount, appointmentCount, revenue } =
    responseData.data;

  const expectedMaxRevenue = 12400;

  const cardsData = [
    {
      title: "Users",
      color: {
        backGround: "linear-gradient(180deg, #34eb5c 0%, #76f78d 100%)",
        boxShadow: "0px 10px 20px 0px #d9f7e6",
      },
      barValue: 100,
      value: userCount.toString(),
      png: DashboardIcon,
      series: [],
    },
    {
      title: "Doctors",
      color: {
        backGround: "linear-gradient(180deg, #FFC75F 0%, #FFDD99 100%)",
        boxShadow: "0px 10px 20px 0px #f5d67a",
      },
      barValue: 100,
      value: doctorCount.toString(),
      png: AccessTimeIcon,
    },
    {
      title: "Appointments",
      color: {
        backGround: "linear-gradient(180deg, #42a5f5 0%, #1e88e5 100%)",
        boxShadow: "0px 10px 20px 0px #9ecfff",
      },
      barValue: 100,
      value: appointmentCount.toString(),
      png: CheckCircleIcon,
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
    },
  ];

  return cardsData;
};

const AdminStatistics = () => {
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const { userInfo } = useSelector((state) => state.auth);
  const { userToken: token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/admin/analytics`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const statistics = await response.json();
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
      {cardsData.map((card, id) => (
        <div className={styles.parentContainer} key={id}>
          <Card
            title={card.title}
            color={card.color}
            isBarRequired={true}
            barValue={card.barValue}
            value={card.value}
            png={card.png}
            series={card.series}
          />
        </div>
      ))}
      <AdminChart />
    </div>
  );
};

export default AdminStatistics;
