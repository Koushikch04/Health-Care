import React, { useState, useEffect } from "react";
import Modal from "../UI/Modal/Modal";
import styles from "./AppointmentDetails.module.css";
import useAlert from "../../hooks/useAlert";
import { baseURL } from "../../api/api";
import { useDispatch, useSelector } from "react-redux";
import { cancelAppointment } from "../../store/auth/auth-actions";

const AppointmentDetails = ({ appointment, onClose, onCancel }) => {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const { alert } = useAlert();
  const token = useSelector((state) => state.auth.userToken);
  const dispatch = useDispatch();
  const canCancel =
    appointment.status !== "canceled" && appointment.status !== "completed";

  const handleCancel = async () => {
    try {
      if (!canCancel) {
        alert.info({
          message: "This appointment can no longer be canceled.",
          title: "Cancellation Not Allowed",
        });
        return;
      }

      await dispatch(
        cancelAppointment(appointment.id, alert, "admin", appointment.status)
      );
      alert.success({
        message: "Appointment canceled successfully.",
        title: "Canceled",
      });
      onClose();
    } catch (error) {
      alert.error({
        message: error.message,
        title: "Failed to cancel",
      });
    }
  };

  const fetchAvailableTimeSlots = async (selectedDate) => {
    if (!selectedDate) return;

    try {
      const response = await fetch(
        `${baseURL}/appointment/available-slots/doctor/${appointment.doctor._id}/date/${selectedDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available time slots");
      }

      const slots = await response.json();
      setAvailableTimeSlots(slots);
    } catch (error) {
      alert.error({
        message: `Error fetching time slots: ${error.message}`,
        title: "Error",
      });
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      alert.info({
        message: "Please select both a date and time to reschedule.",
        title: "Incomplete Form",
      });
      return;
    }

    try {
      await dispatch(rescheduleAppointment(appointment.id, newDate, newTime)); // Assuming rescheduleAppointment is defined in your actions
      alert.success({
        message: "Appointment rescheduled successfully.",
        title: "Rescheduled",
      });
      setIsRescheduling(false);
      onClose();
    } catch (error) {
      alert.error({
        message: `Error rescheduling appointment: ${error.message}`,
        title: "Reschedule Failed",
      });
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className={styles.h2}>Appointment Details</h2>
      <p className={styles.p}>
        <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}
      </p>
      <p className={styles.p}>
        <strong>Time:</strong> {appointment.time}
      </p>
      <p className={styles.p}>
        <strong>Doctor:</strong> {appointment.doctor.name.firstName}{" "}
        {appointment.doctor.name.lastName}
      </p>
      <p className={styles.p}>
        <strong>Patient:</strong> {appointment.patientName}
      </p>
      <p className={styles.p}>
        <strong>Description:</strong>{" "}
        {appointment.reasonForVisit || "No description available."}
      </p>
      <p className={styles.p}>
        <strong>Status:</strong> {appointment.status || "Not specified"}
      </p>

      {isRescheduling ? (
        <form onSubmit={handleRescheduleSubmit}>
          <div className={styles.field}>
            <label htmlFor="date">Select New Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={newDate}
              onChange={(e) => {
                setNewDate(e.target.value);
                fetchAvailableTimeSlots(e.target.value); // Fetch time slots based on the selected date
              }}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="time">Select New Time:</label>
            <select
              id="time"
              name="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a time
              </option>
              {availableTimeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className={styles.rescheduleButton}>
            Reschedule
          </button>
          <button
            type="button"
            onClick={() => setIsRescheduling(false)}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className={styles.actions}>
          {canCancel && (
            <button className={styles.cancelButton} onClick={handleCancel}>
              Cancel Appointment
            </button>
          )}
          <button
            className={styles.rescheduleButton}
            onClick={() => setIsRescheduling(true)}
          >
            Reschedule Appointment
          </button>
        </div>
      )}
    </Modal>
  );
};

export default AppointmentDetails;
