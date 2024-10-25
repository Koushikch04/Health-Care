import { createSlice } from "@reduxjs/toolkit";

const otpSlice = createSlice({
  name: "otp",
  initialState: {
    otpSent: "no",
    otpVerified: false,
  },
  reducers: {
    sendOtp(state) {
      state.otpSent = "yes";
    },
    verifyOtp(state) {
      state.otpSent = "verified";
      state.otpVerified = true;
    },
    resetOtp(state) {
      state.otpSent = "no";
      state.otpVerified = false;
    },
    otpVerificationFailure(state) {
      state.otpSent = "failure";
    },
  },
});

export const otpActions = otpSlice.actions;
export default otpSlice.reducer;
