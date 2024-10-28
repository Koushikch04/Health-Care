import React from "react";
import { useDispatch } from "react-redux";

import Modal from "../UI/Modal/Modal"; // Adjust the path as necessary
import { cancelAppointment } from "../../store/auth/auth-actions";
import styles from "./AppointmentDetails.module.css"; // Import the new styles
import useAlert from "../../hooks/useAlert";

const AppointmentDetails = ({ appointment, onClose, onCancel }) => {
  const dispatch = useDispatch();
  const { alert } = useAlert();

  const handleCancel = async () => {
    try {
      const success = await dispatch(cancelAppointment(appointment._id, alert));
      if (success) {
        onCancel(appointment._id);
      }
    } catch (err) {
      console.error(err);
    }

    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2>Appointment Details</h2>
      <p>
        <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}
      </p>
      <p>
        <strong>Time:</strong> {appointment.time}
      </p>
      <p>
        <strong>Doctor:</strong> {appointment.doctor.name}
      </p>
      <p>
        <strong>Patient:</strong> {appointment.patientName}
      </p>
      <p>
        <strong>Description:</strong>{" "}
        {appointment.reasonForVisit || "No description available."}
      </p>
      <p>
        <strong>Status:</strong> {appointment.status || "Not specified"}
      </p>

      <div className={styles.actions}>
        <button className={styles.cancelButton} onClick={handleCancel}>
          Cancel Appointment
        </button>
      </div>
    </Modal>
  );
};

export default AppointmentDetails;
