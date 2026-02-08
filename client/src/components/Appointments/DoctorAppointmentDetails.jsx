import React from "react";
import { useDispatch, useSelector } from "react-redux";

import Modal from "../UI/Modal/Modal"; // Adjust the path as necessary
import { cancelAppointment } from "../../store/auth/auth-actions";
import styles from "./AppointmentDetails.module.css"; // Import the new styles
import useAlert from "../../hooks/useAlert";

const DoctorAppointmentDetails = ({ appointment, onClose, onCancel }) => {
  const role = useSelector((state) => state.auth.userRole);
  const dispatch = useDispatch();
  const { alert } = useAlert();
  const canCancel =
    appointment.status !== "canceled" && appointment.status !== "completed";

  const handleCancel = async () => {
    try {
      const success = await dispatch(
        cancelAppointment(appointment._id, alert, role, appointment.status)
      );
      if (success) {
        onCancel(appointment._id);
      }
    } catch (err) {
      console.error(err);
    }

    onClose();
  };
  console.log(appointment);

  return (
    <Modal onClose={onClose}>
      <h2 className={styles.h2}>Appointment Details</h2>
      <p className={styles.p}>
        <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}
      </p>
      <p className={styles.p}>
        <strong>Time:</strong> {appointment.time}
      </p>
      {role == "user" && (
        <p className={styles.p}>
          <strong>Doctor:</strong>
          {appointment.doctor.name.firstName +
            " " +
            appointment.doctor.name.lastName}
        </p>
      )}
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
        {canCancel && (
          <button className={styles.cancelButton} onClick={handleCancel}>
            Cancel Appointment
          </button>
        )}
      </div>
    </Modal>
  );
};

export default DoctorAppointmentDetails;
