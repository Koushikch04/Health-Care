import React from "react";
import styles from "./CircularSpinner.module.css";

const CircularSpinner = () => {
  return (
    <div className={styles.circularSpinner}>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className={styles[`bar${i + 1}`]}></div>
      ))}
    </div>
  );
};

export default CircularSpinner;
