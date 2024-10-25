import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth/auth-slice.js";
import alertReducer from "./alert/alert-slice.js";
import otpReducer from "./auth/otp-slice.js";

const store = configureStore({
  reducer: { auth: authReducer, alerts: alertReducer, otp: otpReducer },
});

export default store;
