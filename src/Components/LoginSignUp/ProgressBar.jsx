import React from "react";
import styles from "./styles/SignUp.module.css";

const ProgressBar = ({ steps, currentStep }) => {
  let index = 1;
  return (
    <div className={styles.progress_bar}>
      {steps.map((step) => (
        <div
          key={index++}
          className={`${styles.step} ${
            currentStep > index ? `${styles.active}` : ""
          }`}
        >
          <p className={`${currentStep > index ? `${styles.active}` : ""}`}>
            {step}
          </p>
          <div
            className={`${styles.bullet} ${
              currentStep > index ? `${styles.active}` : ""
            }`}
          >
            <span>{index}</span>
          </div>
          <div
            className={`${styles.check} fas fa-check ${
              currentStep > index ? `${styles.active}` : ""
            }`}
          />
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
