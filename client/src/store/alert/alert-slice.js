import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const ALERT_LIMIT = 5;

const alertSlice = createSlice({
  name: "alerts",
  initialState: {
    alerts: [],
  },
  reducers: {
    addAlert(state, action) {
      const { message, title } = action.payload.data;
      const alert = {
        id: uuidv4(),
        message,
        title,
        type: action.payload.type,
      };
      state.alerts.push(alert);

      if (state.alerts.length > ALERT_LIMIT) {
        state.alerts.shift();
      }
    },
    removeAlert(state, action) {
      const alertId = action.payload;
      state.alerts = state.alerts.filter((alert) => alert.id !== alertId);
    },
    clearAlerts(state) {
      state.alerts = [];
    },
  },
});

export const alertActions = alertSlice.actions;
export default alertSlice.reducer;
