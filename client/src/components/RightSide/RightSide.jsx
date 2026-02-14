// RightSide.js
import React from "react";
import Updates from "../Updates/Updates";
import styles from "./RightSide.module.css";
import { useSelector } from "react-redux";

const RightSide = () => {
  const updates = useSelector((state) => state.auth.updates);
  const hasUpdates = updates.length > 0;

  return (
    <div className={styles.RightSide}>
      {!hasUpdates ? (
        <div className={styles.Panel}>
          <h3>No updates</h3>
        </div>
      ) : (
        <div className={styles.Panel}>
          <h3>Recent Updates</h3>
          <div className={styles.UpdatesWrap}>
            <Updates updates={updates} />
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSide;
