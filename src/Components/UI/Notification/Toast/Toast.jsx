import React, { useEffect } from "react";
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { Close as CloseIcon } from "@mui/icons-material";

import "./Toast.css";

const iconMap = {
  success: <SuccessIcon />,
  error: <ErrorIcon />,
  warning: <WarningIcon />,
  info: <InfoIcon />,
};

const Toast = ({
  title,
  icon,
  type = "success",
  text,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (text) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [text, onClose, duration]);

  if (!text) return null;

  return (
    <div class={`toast ${type}`}>
      <i class={icon}>{iconMap[type]}</i>
      <div class="content">
        <div class="title">{title}</div>
        <span>{text}</span>
      </div>
      <i className="toast-close" onClick={onClose}>
        <CloseIcon />
      </i>
    </div>
  );
};

export default Toast;
