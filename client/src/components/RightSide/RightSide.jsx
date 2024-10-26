import React from "react";
import Updates from "../Updates/Updates";
import styles from "./RightSide.module.css";
import { UpdatesData } from "../../Data/Data";

const RightSide = () => {
  return (
    <div className={styles.RightSide}>
      {UpdatesData.length == 0 && (
        <h1 style={{ textAlign: "center" }}>No updates avaiable right now</h1>
      )}
      {UpdatesData.length != 0 && (
        <div>
          <h3>Updates</h3>
          <Updates data={UpdatesData} />
        </div>
      )}
      {/* <div>
        <h3>Customer Review</h3>
        <CustomerReview />
      </div> */}
    </div>
  );
};

export default RightSide;
