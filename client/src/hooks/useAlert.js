import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";

import { alertActions } from "../store/alert/alert-slice";

const useAlert = () => {
  const dispatch = useDispatch();
  const alerts = useSelector((state) => state.alerts.alerts);

  const addAlert = (data, type) => {
    dispatch(alertActions.addAlert({ data, type }));
  };

  const alert = {
    success: (data) => addAlert(data, "success"),
    error: (data) => addAlert(data, "error"),
    warning: (data) => addAlert(data, "warning"),
    info: (data) => addAlert(data, "info"),
  };

  const removeAlert = (id) => dispatch(alertActions.removeAlert(id));
  const clearAlerts = () => dispatch(alertActions.clearAlerts());

  const memoizedAlerts = useMemo(() => alerts, [alerts]);

  return {
    alerts: memoizedAlerts,
    alert,
    removeAlert,
    clearAlerts,
  };
};

export default useAlert;
