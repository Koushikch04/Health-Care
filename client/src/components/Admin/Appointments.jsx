import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./Appointments.module.css";
import { baseURL } from "../../api/api";
import AppointmentDetails from "./AppointmentDetails.jsx";

function Appointments() {
  const token = useSelector((state) => state.auth.userToken);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "ascending",
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const getAppointments = async () => {
      if (!token) return;
      try {
        const data = await fetch(`${baseURL}/admin/appointments`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const appointmentsData = await data.json();
        console.log(appointmentsData);

        setAppointments(appointmentsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    getAppointments();
    console.log("Hello");
  }, [token]);

  const sortedAppointments = [...appointments].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? " ▲" : " ▼";
    }
    return "";
  };

  const handleCancelAppointment = (id) => {
    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment._id === id
          ? { ...appointment, status: "canceled" }
          : appointment
      )
    );
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeDetailsModal = () => {
    setSelectedAppointment(null);
  };

  if (loading) return <p>Loading Appointments ... </p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.appointmentsContainer}>
      <h1>Appointments</h1>
      {appointments.length > 0 ? (
        <div className={styles.appointmentsTableContainer}>
          <table className={styles.appointmentsTable}>
            <thead>
              <tr>
                <th onClick={() => requestSort("date")}>
                  Date{getSortIndicator("date")}
                </th>
                <th onClick={() => requestSort("time")}>
                  Time{getSortIndicator("time")}
                </th>
                <th onClick={() => requestSort("doctor.name")}>
                  Doctor{getSortIndicator("doctor.name")}
                </th>
                <th onClick={() => requestSort("patientName")}>
                  Patient{getSortIndicator("patientName")}
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
          </table>
          <div className={styles.scrollableTbody}>
            <table className={styles.appointmentsTable}>
              <tbody>
                {sortedAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{new Date(appointment.date).toLocaleDateString()}</td>
                    <td>{appointment.time}</td>
                    <td>
                      {appointment.doctor.name.firstName +
                        " " +
                        appointment.doctor.name.lastName}
                    </td>
                    <td>{appointment.patientName}</td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          styles[appointment.status]
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleViewDetails(appointment)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p>No appointments found.</p>
      )}

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          onClose={closeDetailsModal}
          onCancel={handleCancelAppointment}
        />
      )}
    </div>
  );
}

export default Appointments;
