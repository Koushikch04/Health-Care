import React from "react";
import styles from "./TableSpinner.module.css";

const TableSpinner = ({ size = 40, color = "#3498db", message = "" }) => {
  return (
    <div className={styles.spinnerContainer}>
      <div
        className={styles.spinner}
        style={{
          width: size,
          height: size,
          borderWidth: size / 8,
          borderTopColor: color,
        }}
      ></div>
      {message && <div className={styles.message}>{message}</div>}
    </div>
  );
};

export default TableSpinner;
