import { useReducer } from "react";
import alertContext from "./alert-context.js";
import ToastContainer from "../../components/UI/Notification/AlertsContainer/AlertsContainer.jsx";
const defaultAlertState = {
  alerts: [],
};
const alertReducer = (state, action) => {
  if (action.type === "ADD") {
    return { ...state, alerts: [...state.alerts, action.payload] };
  }
  if (action.type === "REMOVE") {
    const updatedAlerts = state.alerts.filter(
      (alert) => alert.id != action.payload
    );
    return { ...state, alerts: updatedAlerts };
  }
  return defaultAlertState;
};

const AlertProvider = (props) => {
  const [alertState, dispatchAlerts] = useReducer(
    alertReducer,
    defaultAlertState
  );
  const addAlertHandler = (type, message) => {
    const id = Math.floor(Math.random() * 10000000);
    dispatchAlerts({ type: "ADD", payload: { id, message, type } });
  };

  const removeAlertHandler = (id) => {
    dispatchAlerts({ type: "REMOVE", payload: id });
  };

  const success = (message) => addAlertHandler("success", message);
  const warning = (message) => addAlertHandler("warning", message);
  const info = (message) => addAlertHandler("info", message);
  const error = (message) => addAlertHandler("error", message);

  const alertValue = {
    success,
    warning,
    info,
    error,
    remove: removeAlertHandler,
  };
  return (
    <alertContext.Provider value={alertValue}>
      <ToastContainer alerts={alertState.alerts} />
      {props.children}
    </alertContext.Provider>
  );
};
export default AlertProvider;
