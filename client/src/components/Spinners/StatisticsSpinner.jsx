import React from "react";
import styles from "./StatisticsSpinner.module.css";

const StatisticsSpinner = () => {
  return (
    <div className={styles.spinner}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default StatisticsSpinner;
