import React, { useState } from "react";
import Modal from "../UI/Modal/Modal";
import styles from "./AppointmentDetails.module.css";
import useAlert from "../../hooks/useAlert";
import { baseURL } from "../../api/api";
import { useSelector } from "react-redux";

const AppointmentDetails = ({
  appointment,
  onClose,
  onCancel,
  onReschedule,
}) => {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const { alert } = useAlert();
  const token = useSelector((state) => state.auth.userToken);
  const canCancel =
    appointment.status !== "canceled" && appointment.status !== "completed";
  const canReschedule = canCancel;

  const handleCancel = async () => {
    try {
      if (!canCancel) {
        alert.info({
          message: "This appointment can no longer be canceled.",
          title: "Cancellation Not Allowed",
        });
        return;
      }

      const response = await fetch(
        `${baseURL}/admin/appointment/${appointment._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "canceled" }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel appointment");
      }

      alert.success({
        message: "Appointment canceled successfully.",
        title: "Canceled",
      });
      onCancel(appointment._id);
      onClose();
    } catch (error) {
      alert.error({
        message: error.message,
        title: "Failed to cancel",
      });
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate) {
      alert.info({
        message: "Please select a new date to reschedule.",
        title: "Incomplete Form",
      });
      return;
    }

    try {
      const response = await fetch(
        `${baseURL}/admin/appointment/${appointment._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "rescheduled",
            newDate,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reschedule appointment");
      }

      const updatedAppointment = await response.json();
      console.log("Success");
      console.log(updatedAppointment);

      alert.success({
        message: "Appointment rescheduled successfully.",
        title: "Rescheduled",
      });
      if (onReschedule) {
        onReschedule(updatedAppointment);
      }
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
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
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
          {canReschedule && (
            <button
              className={styles.rescheduleButton}
              onClick={() => setIsRescheduling(true)}
            >
              Reschedule Appointment
            </button>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AppointmentDetails;
