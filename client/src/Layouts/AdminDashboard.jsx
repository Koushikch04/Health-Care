import React, { useEffect, useState } from "react";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import DynamicTable from "../components/Table/Table.jsx"; // Update the import
import styles from "./AdminDashboard.module.css";
import { useSelector } from "react-redux";
import { baseURL } from "../api/api.js";
import AdminStatistics from "../Statistics/AdminStatistics.jsx";
import { ContinuousColorLegend } from "@mui/x-charts";

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingTopDoctors, setLoadingTopDoctors] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(null);
  const [doctorsError, setDoctorsError] = useState(null);

  const { userInfo, userToken: token } = useSelector((state) => state.auth);
  const adminId = userInfo?._id;
  const name =
    userInfo?.name?.firstName && userInfo?.name?.lastName
      ? `${userInfo.name.firstName} ${userInfo.name.lastName}`
      : userInfo?.email || "Admin";

  const today = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = today.toLocaleDateString(undefined, options);

  const getPermissionValue = (permissions, key) => {
    if (!permissions) return false;
    if (permissions instanceof Map) return Boolean(permissions.get(key));
    if (Array.isArray(permissions)) {
      const entry = permissions.find(
        (perm) => perm?.[0] === key || perm?.key === key,
      );
      return Boolean(entry?.[1] ?? entry?.value);
    }
    return Boolean(permissions[key]);
  };

  const canManageAppointments = getPermissionValue(
    userInfo?.permissions,
    "appointmentManagement",
  );
  const canManageDoctors = getPermissionValue(
    userInfo?.permissions,
    "doctorManagement",
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !canManageAppointments) {
        setAppointments([]);
        setAppointmentsError(
          canManageAppointments
            ? null
            : "You do not have permission to view appointments.",
        );
        setLoadingAppointments(false);
        return;
      }

      setAppointmentsError(null);
      setLoadingAppointments(true);
      try {
        const response = await fetch(`${baseURL}/admin/appointments`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (!response.ok) {
          setAppointmentsError(
            result?.message || "Failed to load appointments.",
          );
          setAppointments([]);
          return;
        }

        setAppointments(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        setAppointmentsError("Failed to load appointments.");
      } finally {
        setLoadingAppointments(false);
      }
    };
    const fetchTopPerformingDoctors = async () => {
      if (!token || !canManageDoctors) {
        setTopDoctors([]);
        setDoctorsError(
          canManageDoctors
            ? null
            : "You do not have permission to view doctors.",
        );
        setLoadingTopDoctors(false);
        return;
      }

      setDoctorsError(null);
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
        if (!response.ok) {
          setDoctorsError(result?.message || "Failed to load doctors.");
          setTopDoctors([]);
          return;
        }

        const finalResult = result.map((doctorData) => ({
          "Doctor Name": `${doctorData.name.firstName} ${doctorData.name.lastName}`,
          Specialty: doctorData.specialty.name,
          Rating: doctorData.rating,
          "Recent Appointments": doctorData.recentAppointmentsCount,
        }));

        setTopDoctors(finalResult);
      } catch (error) {
        console.error("Error fetching data:", error);
        setDoctorsError("Failed to load doctors.");
      } finally {
        setLoadingTopDoctors(false);
      }
    };

    fetchData();
    fetchTopPerformingDoctors();
  }, [adminId, token, canManageAppointments, canManageDoctors]);

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
        {canManageDoctors ? (
          <DynamicTable
            title="Top Performing Doctors"
            headers={[
              "Doctor Name",
              "Specialty",
              "Rating",
              "Recent Appointments",
            ]}
            rows={topDoctors}
            loading={loadingTopDoctors}
          />
        ) : (
          <div className={styles.notice}>
            {doctorsError || "You do not have permission to view doctors."}
          </div>
        )}
        {canManageAppointments ? (
          <DynamicTable
            title="Recent Appointments"
            headers={["patientName", "date", "time", "reasonForVisit", "status"]}
            rows={recentAppointments}
            loading={loadingAppointments}
          />
        ) : (
          <div className={styles.notice}>
            {appointmentsError ||
              "You do not have permission to view appointments."}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
