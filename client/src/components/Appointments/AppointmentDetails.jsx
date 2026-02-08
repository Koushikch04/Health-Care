import React, { useState } from "react";
import { useDispatch } from "react-redux";

import Modal from "../UI/Modal/Modal"; // Adjust the path as necessary
import { cancelAppointment } from "../../store/auth/auth-actions";
import styles from "./AppointmentDetails.module.css"; // Import the new styles
import useAlert from "../../hooks/useAlert";
import CircularSpinner from "../Spinners/CircularSpinner";

const AppointmentDetails = ({ appointment, onClose, onCancel }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { alert } = useAlert();
  const canCancel =
    appointment.status !== "canceled" && appointment.status !== "completed";

  const handleCancel = async () => {
    if (!canCancel) {
      alert.info({
        message: "This appointment can no longer be canceled.",
        title: "Cancellation Not Allowed",
      });
      onClose();
      return;
    }

    setLoading(true);
    try {
      const success = await dispatch(
        cancelAppointment(appointment._id, alert, "user", appointment.status)
      );
      if (success) {
        onCancel(appointment._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

    onClose();
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
        <strong>Doctor:</strong>{" "}
        {appointment.doctor.name.firstName +
          " " +
          appointment.doctor.name.lastName}
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

      <div className={styles.actions}>
        <button
          className={styles.cancelButton}
          onClick={handleCancel}
          disabled={loading || !canCancel}
        >
          {loading ? <CircularSpinner /> : "Cancel Appointment"}
        </button>
      </div>
    </Modal>
  );
};

export default AppointmentDetails;
