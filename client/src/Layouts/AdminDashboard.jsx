import React, { useEffect, useState } from "react";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import DynamicTable from "../components/Table/Table.jsx"; // Update the import
import styles from "./AdminDashboard.module.css";
import { useSelector } from "react-redux";
import { baseURL } from "../api/api.js";
import AdminStatistics from "../Statistics/AdminStatistics.jsx";

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingTopDoctors, setLoadingTopDoctors] = useState(false);

  const { userInfo, userToken: token } = useSelector((state) => state.auth);
  const adminId = userInfo?._id;
  const name =
    userInfo?.name?.firstName && userInfo?.name?.lastName
      ? `${userInfo.name.firstName} ${userInfo.name.lastName}`
      : userInfo?.email || "Admin";

  const today = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = today.toLocaleDateString(undefined, options);

  useEffect(() => {
    const fetchData = async () => {
      console.log("set here");

      setLoadingAppointments(true);
      try {
        const today = new Date();
        const response = await fetch(`${baseURL}/admin/appointments`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        console.log("Appointments data:", result);
        setAppointments(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        console.log("removed here");

        setLoadingAppointments(false);
      }
    };
    const fetchTopPerformingDoctors = async () => {
      setLoadingTopDoctors(true);
      try {
        const response = await fetch(`${baseURL}/admin/top-doctors`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();

        const finalResult = result.map((doctorData) => ({
          "Doctor Name": `${doctorData.name.firstName} ${doctorData.name.lastName}`,
          Specialty: doctorData.specialty.name,
          Rating: doctorData.rating,
          "Recent Appointments": doctorData.recentAppointmentsCount,
        }));
        console.log(finalResult);

        setTopDoctors(finalResult);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingTopDoctors(false);
      }
    };

    fetchData();
    fetchTopPerformingDoctors();
  }, [adminId, token]);

  const currentDate = new Date();

  const upcomingAppointments = appointments
    .filter(
      (appointment) =>
        appointment.status === "scheduled" &&
        new Date(appointment.date) > currentDate,
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const recentAppointments = appointments
    .filter((appointment) => new Date(appointment.date) <= currentDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className={styles.AdminDashboard}>
      <div className={styles.header}>
        <div className={styles.greetings}>
          <h1>Good Morning Admin, {name}</h1>
          <span>Have a nice day.</span>
        </div>
        <div className={styles.date}>
          <CalendarTodayIcon style={{ marginRight: "8px" }} />
          {formattedDate}
        </div>
      </div>
      {/* <h3>Have a nice day.</h3> */}
      <AdminStatistics />
      {/* <Cards /> */}
      <div className={styles.tables1}></div>
      <div className={styles.tables1}>
        <DynamicTable
          title="Top Performing Doctors"
          headers={[
            "Doctor Name",
            "Specialty",
            "Rating",
            "Recent Appointments",
          ]}
          rows={topDoctors}
          loading={loadingAppointments}
        />
        <DynamicTable
          title="Recent Appointments"
          headers={["patientName", "date", "time", "reasonForVisit", "status"]}
          rows={recentAppointments}
          loading={loadingTopDoctors}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
