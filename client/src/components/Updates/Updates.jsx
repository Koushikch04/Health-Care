import React from "react";
import styles from "./Updates.module.css";
import { useSelector } from "react-redux";

const getTimeAgo = (timeString) => {
  const now = new Date();
  const appointmentTime = new Date(timeString);
  const diffInSeconds = Math.floor((now - appointmentTime) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

const Updates = (props) => {
  const updates = useSelector((state) => state.auth.updates);
  console.log(updates);

  return (
    <div className={styles.Updates}>
      {updates.map((appointment) => (
        <div className={styles.update} key={appointment.id}>
          {/* <img src={appointment.img} alt="profile" /> */}
          <div className={styles.noti}>
            <div style={{ marginBottom: "0.5rem" }}>
              {/* <span>{appointment.doctor}</span> */}
              {/* <span> has an appointment at {appointment.time}.</span> */}
              <span>{`${appointment.patient}`}</span> has{" "}
              <span>{`${appointment.type}`}</span> appoinment with
              <span>{` ${appointment.doctor} .`}</span>
            </div>
            <span>{getTimeAgo(appointment.time)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Updates;
