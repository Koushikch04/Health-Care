import React from "react";
import Updates from "../Updates/Updates";
import styles from "./RightSide.module.css";

const RightSide = () => {
  return (
    <div className={styles.RightSide}>
      <div>
        <h3>Updates</h3>
        <Updates />
      </div>
      {/* <div>
        <h3>Customer Review</h3>
        <CustomerReview />
      </div> */}
    </div>
  );
};

export default RightSide;
