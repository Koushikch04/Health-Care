// RightSide.js
import React from "react";
import Updates from "../Updates/Updates";
import styles from "./RightSide.module.css";
import { AppointmentsData } from "../../Data/Data";

const RightSide = () => {
  return (
    <div className={styles.RightSide}>
      {AppointmentsData.length === 0 ? (
        <h1 style={{ textAlign: "center" }}>No updates available right now</h1>
      ) : (
        <div>
          <h3>Recent Updates</h3>
          <Updates data={AppointmentsData} />
        </div>
      )}
    </div>
  );
};

export default RightSide;
