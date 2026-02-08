import dayjs from "dayjs";
import Badge from "@mui/material/Badge";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { useSelector } from "react-redux";
import { baseURL } from "../../api/api";
import styles from "./AppointmentCalendar.module.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import TableSpinner from "../Spinners/TableSpinner";

const initialValue = dayjs();

const ServerDay = React.memo((props) => {
  const {
    highlightedDays = [],
    day,
    outsideCurrentMonth,
    selectedDate,
    ...other
  } = props;
  const isHighlighted =
    highlightedDays.includes(day.date()) &&
    !outsideCurrentMonth &&
    day.month() === selectedDate.month() &&
    day.year() === selectedDate.year();

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={isHighlighted ? "🌟" : undefined}
    >
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
      />
    </Badge>
  );
});

const AppointmentCalendar = () => {
  const token = useSelector((state) => state.auth.userToken);
  const [viewMode, setViewMode] = useState("day");
  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const fetchAllAppointments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/appointment`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch appointments.");
      }

      const data = await response.json();
      console.log(data);

      setAllAppointments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  const highlightedDays = useMemo(() => {
    const currentMonth = selectedDate.month();
    const currentYear = selectedDate.year();

    return [
      ...new Set(
        allAppointments
          .map((appointment) => dayjs(appointment.date))
          .filter(
            (date) =>
              date.month() === currentMonth && date.year() === currentYear
          )
          .map((date) => date.date())
      ),
    ];
  }, [allAppointments, selectedDate]);

  const filteredAppointments = useMemo(() => {
    return allAppointments.filter((appointment) => {
      const appointmentDate = dayjs(appointment.date);
      if (viewMode === "day") {
        return appointmentDate.isSame(selectedDate, "day");
      } else if (viewMode === "week") {
        return appointmentDate.isBetween(
          selectedDate.startOf("week"),
          selectedDate.endOf("week"),
          null,
          "[]"
        );
      } else if (viewMode === "month") {
        return appointmentDate.isSame(selectedDate, "month");
      }
      return false;
    });
  }, [allAppointments, selectedDate, viewMode]);

  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const handleMonthChange = useCallback((newMonth) => {
    setSelectedDate(newMonth);
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <TableSpinner message="Loading Appointments..." />
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={styles.calendarContainer}>
        <div className={styles.calendarSection}>
          <h2>Your Calendar</h2>
          <div className={styles.viewModeButtons}>
            <button
              onClick={() => handleViewModeChange("day")}
              className={viewMode === "day" ? styles.activeViewMode : ""}
            >
              Daily
            </button>
            <button
              onClick={() => handleViewModeChange("week")}
              className={viewMode === "week" ? styles.activeViewMode : ""}
            >
              Weekly
            </button>
            <button
              onClick={() => handleViewModeChange("month")}
              className={viewMode === "month" ? styles.activeViewMode : ""}
            >
              Monthly
            </button>
          </div>

          <DateCalendar
            value={selectedDate}
            onChange={handleDateChange}
            onMonthChange={handleMonthChange}
            slots={{ day: ServerDay }}
            slotProps={{ day: { highlightedDays, selectedDate } }}
          />
        </div>

        <div className={styles.appointmentsSection}>
          <h2>Appointments</h2>
          <div className={styles.appointmentsList}>
            <h3>
              {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}{" "}
              Appointments
            </h3>

            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className={`${styles.appointmentItem} ${
                    styles[appointment.status]
                  }`}
                >
                  <strong>Time:</strong> {appointment.time} <br />
                  <strong>Doctor:</strong>{" "}
                  {appointment.doctor.name.firstName +
                    " " +
                    appointment.doctor.name.lastName}{" "}
                  <br />
                  <strong>Status:</strong> <span>{appointment.status}</span>
                </div>
              ))
            ) : (
              <p className={styles.noAppointments}>
                No appointments for this period.
              </p>
            )}
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default AppointmentCalendar;
