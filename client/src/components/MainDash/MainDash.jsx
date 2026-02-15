import React, { useEffect, useState } from "react";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import DynamicTable from "../Table/Table"; // Update the import
import styles from "./MainDash.module.css";
import { useSelector } from "react-redux";
import { baseURL } from "../../api/api";
import DoctorStatistics from "../../Statistics/DoctorStatistics.jsx";

const MainDash = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const { userInfo, userToken: token } = useSelector((state) => state.auth);
  const doctorId = userInfo._id;
  const name = userInfo.name.firstName + " " + userInfo.name.lastName;
  const rating = userInfo.rating;

  const today = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = today.toLocaleDateString(undefined, options);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const response = await fetch(`${baseURL}/doctor/appointment`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        setAppointments(result);
        console.log("success");
        console.log(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
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
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const recentAppointments = appointments
    .filter((appointment) => new Date(appointment.date) <= currentDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  console.log(upcomingAppointments, recentAppointments);

  return (
    <div className={styles.MainDash}>
      <div className={styles.header}>
        <div className={styles.greetings}>
          <h1>Good Morning, {name}</h1>
          <span>Have a nice day.</span>
          <div className={styles.rating}>
            <span>Your Rating: {rating}</span>
          </div>
        </div>
        <div className={styles.date}>
          <CalendarTodayIcon style={{ marginRight: "8px" }} />
          {formattedDate}
        </div>
      </div>
      {/* <h3>Have a nice day.</h3> */}
      <DoctorStatistics />
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
      </div>
      <div className={styles.tables1}>
        <DynamicTable
          title="Upcoming Appointments"
          headers={["patientName", "date", "time", "reasonForVisit", "status"]}
          rows={upcomingAppointments}
          loading={loading}
          emptyMessage="No upcoming appointments."
          rowsPerPage={5}
        />
        <DynamicTable
          title="Recent Appointments"
          headers={["patientName", "date", "time", "reasonForVisit", "status"]}
          rows={recentAppointments}
          loading={loading}
          emptyMessage="No recent appointments."
          rowsPerPage={5}
        />
      </div>
    </div>
  );
};

export default MainDash;
