import { useRef } from "react";
import ToastContainer from "../Notification/ToastContainer/ToastContainer";

const toastRef = useRef(null);

export const ToastService = {
  init: (containerRef) => {
    toastRef.current = containerRef;
  },
  showToast: (message) => {
    if (toastRef.current) {
      toastRef.current.addToast(message);
    }
  },
};
