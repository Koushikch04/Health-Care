import React from "react";
import "./styles/SignUp.css";

const ProgressBar = ({ steps, currentStep }) => {
  let index = 1;
  return (
    <div className="progress-bar">
      {steps.map((step) => (
        <div
          key={index++}
          className={`step ${currentStep > index ? "active" : ""}`}
        >
          <p className={`${currentStep > index ? "active" : ""}`}>{step}</p>
          <div className={`bullet ${currentStep > index ? "active" : ""}`}>
            <span>{index}</span>
          </div>
          <div
            className={`check fas fa-check ${
              currentStep > index ? "active" : ""
            }`}
          />
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
