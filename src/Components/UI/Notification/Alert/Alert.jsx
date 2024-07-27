import React, { useEffect, useRef } from "react";
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { Close as CloseIcon } from "@mui/icons-material";

import "./Alert.css";
import useAlert from "../../../../hooks/useAlert";

const iconMap = {
  success: <SuccessIcon />,
  error: <ErrorIcon />,
  warning: <WarningIcon />,
  info: <InfoIcon />,
};

const Alert = ({ id, title = "Success", type = "success", message }) => {
  const alert = useAlert();
  const timerID = useRef(null);
  const progressRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timerID.current);
    progressRef.current.style.animationPlayState = "paused";
  };
  const handleMouseLeave = () => {
    const remainingTime =
      (progressRef.current.offsetWidth /
        progressRef.current.parentElement.offsetWidth) *
      4000;

    progressRef.current.style.animationPlayState = "running";

    timerID.current = setTimeout(() => {
      handleDismiss();
    }, remainingTime);
  };

  const handleDismiss = () => {
    alert.remove(id);
  };

  useEffect(() => {
    timerID.current = setTimeout(() => {
      handleDismiss();
    }, 4000);

    return () => {
      clearTimeout(timerID.current);
    };
  }, []);
  return (
    <div
      className={`alert ${type}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <i className="icon">{iconMap[type]}</i>
      <div className="content">
        <div className="title">{title}</div>
        <span>{message}</span>
      </div>
      <i
        className="alert-close"
        onClick={() => {
          alert.remove(id);
        }}
      >
        <CloseIcon />
      </i>
      <div className="alert-progress">
        <div className={`alert-progress-bar ${type}`} ref={progressRef}></div>
      </div>
    </div>
  );
};

export default Alert;
