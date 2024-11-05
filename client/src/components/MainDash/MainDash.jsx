import React, { useEffect, useState } from "react";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import Cards from "../Cards/Cards";
import Statistics from "../../Statistics/Statistics.jsx";
import DynamicTable from "../Table/Table"; // Update the import
import styles from "./MainDash.module.css";
import { useSelector } from "react-redux";
import BarChart from "../../Charts/BarChartComponent";
import BarChartComponent from "../../Charts/BarChartComponent";
import DoctorDashboard from "../../Charts/DoctorDashboard";
import { baseURL } from "../../api/api";

const MainDash = () => {
  const [appointments, setAppointments] = useState([]);

  const { userInfo, userToken: token } = useSelector((state) => state.auth);
  const doctorId = userInfo._id;
  const name = userInfo.name.firstName + " " + userInfo.name.lastName;

  const today = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = today.toLocaleDateString(undefined, options);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // setLoading(true);
        const today = new Date();
        const todayDate = today.toISOString().split("T")[0];
        const response = await fetch(`${baseURL}/doctor/appointment`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        // setData(result);
        setAppointments(result);
        console.log("success");
        console.log(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        // setLoading(false);
      }
    };

    fetchData();
  }, [doctorId]);

  const currentDate = new Date();

  const upcomingAppointments = appointments
    .filter(
      (appointment) =>
        appointment.status === "scheduled" &&
        new Date(appointment.date) > currentDate
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const recentAppointments = appointments
    .filter((appointment) => new Date(appointment.date) <= currentDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className={styles.MainDash}>
      <div className={styles.header}>
        <div className={styles.greetings}>
          <h1>Good Morning, {name}</h1>
          <span>Have a nice day.</span>
        </div>
        <div className={styles.date}>
          <CalendarTodayIcon style={{ marginRight: "8px" }} />
          {formattedDate}
        </div>
      </div>
      {/* <h3>Have a nice day.</h3> */}
      <Statistics />
      {/* <Cards /> */}

      <div className={styles.tables1}>
        {/* <BarChartComponent
          title="Patient Incoming History"
          data={patientIncomingData}
          labels={patientIncomingLabels}
        />
        <BarChartComponent
          title="Rebooking Rate"
          data={rebookingRatesData}
          labels={rebookingLabels}
        /> */}
        <DoctorDashboard />
      </div>
      <div className={styles.tables1}>
        <DynamicTable
          title="Upcoming Appointments"
          headers={[
            "Patient Name",
            "Date",
            "Time",
            "Reason For Visit",
            "Status",
          ]}
          rows={upcomingAppointments}
        />
        <DynamicTable
          title="Recent Appointments"
          headers={[
            "Patient Name",
            "Date",
            "Time",
            "Reason For Visit",
            "Status",
          ]}
          rows={recentAppointments}
        />
      </div>
    </div>
  );
};

export default MainDash;
