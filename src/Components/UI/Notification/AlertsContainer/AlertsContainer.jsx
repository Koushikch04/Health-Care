import React from "react";
import "./AlertsContainer.css"; // For container styling
import Alert from "../Alert/Alert";

const AlertsContainer = ({ alerts, position = "top-right" }) => {
  return (
    <div className={`alerts-container ${position}`}>
      {alerts.map((alert) => (
        <Alert key={alert.id} {...alert} />
      ))}
    </div>
  );
};

export default AlertsContainer;
