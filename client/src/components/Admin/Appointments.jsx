import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./Appointments.module.css";
import { baseURL, fetchJson } from "../../api/api";
import AppointmentDetails from "./AppointmentDetails.jsx";
import Pagination from "../DoctorListPagination/Pagination.jsx";
import ErrorState from "../UI/States/ErrorState";
import EmptyState from "../UI/States/EmptyState";
import TableSkeleton from "../UI/States/TableSkeleton";

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
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;

  const getAppointments = useCallback(async () => {
    if (!token) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const appointmentsData = await fetchJson(
        `${baseURL}/admin/appointments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        { timeoutMs: 15000, errorMessage: "Failed to load appointments." },
      );
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    getAppointments();
  }, [getAppointments]);

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
    setCurrentPage(1);
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? " ^" : " v";
    }
    return "";
  };

  const handleCancelAppointment = (id) => {
    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment._id === id
          ? { ...appointment, status: "canceled" }
          : appointment,
      ),
    );
  };

  const handleRescheduleAppointment = (updatedAppointment) => {
    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment._id === updatedAppointment._id
          ? { ...appointment, ...updatedAppointment }
          : appointment,
      ),
    );
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeDetailsModal = () => {
    setSelectedAppointment(null);
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentAppointments = sortedAppointments.slice(
    indexOfFirstPost,
    indexOfLastPost,
  );

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load appointments"
        message={error}
        onRetry={getAppointments}
      />
    );
  }

  return (
    <div className={styles.appointmentsContainer}>
      <h1>Appointments</h1>
      {appointments.length > 0 ? (
        <>
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
                  {currentAppointments.map((appointment) => (
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
                          className={`${styles.status} ${styles[appointment.status]}`}
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
          <div className={styles.paginationWrap}>
            <Pagination
              totalPosts={sortedAppointments.length}
              postsPerPage={postsPerPage}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
        </>
      ) : (
        <EmptyState
          title="No appointments found"
          message="There are no appointment records to display."
        />
      )}

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          onClose={closeDetailsModal}
          onCancel={handleCancelAppointment}
          onReschedule={handleRescheduleAppointment}
        />
      )}
    </div>
  );
}

export default Appointments;
