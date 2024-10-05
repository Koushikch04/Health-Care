import React from "react";
import styles from "./Updates.module.css";
import { UpdatesData } from "../../Data/Data";

const Updates = () => {
  return (
    <div className={styles.Updates}>
      {UpdatesData.map((update) => {
        return (
          <div className={styles.update}>
            <img src={update.img} alt="profile" />
            <div className={styles.noti}>
              <div style={{ marginBottom: "0.5rem" }}>
                <span>{update.name}</span>
                <span> {update.noti}</span>
              </div>
              <span>{update.time}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Updates;
