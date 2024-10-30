// RightSide.js
import React from "react";
import Updates from "../Updates/Updates";
import styles from "./RightSide.module.css";
import { useSelector } from "react-redux";

const RightSide = () => {
  const updates = useSelector((state) => state.auth.updates);
  return (
    <div className={styles.RightSide}>
      {updates.length === 0 ? (
        <h3 style={{ textAlign: "center" }}>No updates </h3>
      ) : (
        <div>
          <h3>Recent Updates</h3>
          <Updates updates={updates} />
        </div>
      )}
    </div>
  );
};

export default RightSide;
