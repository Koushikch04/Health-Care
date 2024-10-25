import React from "react";
import { useSelector } from "react-redux";
import "./AlertsContainer.css";
import Alert from "../Alert/Alert";

const AlertsContainer = ({ position = "top-right" }) => {
  const alerts = useSelector((state) => state.alerts.alerts);
  console.log(alerts);

  return (
    <div className={`alerts-container ${position}`}>
      {alerts.map((alert) => (
        <Alert key={alert.id} {...alert} />
      ))}
    </div>
  );
};

export default AlertsContainer;
