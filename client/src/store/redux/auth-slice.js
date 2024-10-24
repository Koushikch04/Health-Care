import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userLoggedIn: false,
    userInfo: null,
    userToken: null,
    expirationTime: null,
    // otpSent: "no",
    // userRole: null,
  },
  reducers: {
    login(state, action) {
      state.userLoggedIn = true;
      state.userInfo = action.payload.user;
      state.userToken = action.payload.token;
      state.expirationTime = action.payload.expirationTime;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("lastLoggedIn", Date.now());
    },
    logout(state) {
      state.userLoggedIn = false;
      state.userInfo = null;
      state.userToken = null;
      state.expirationTime = null;
      localStorage.removeItem("token");
      localStorage.removeItem("lastLoggedIn");
    },
    // otpSent(state, action) {
    //   state.otpSent = "yes";
    // },
    // otpVerified(state, action) {
    //   state.otpSent = "verified";
    // },
    // passwordChanged(state, action) {
    //   state.otpSent = "no";
    // },
    // otpVerificationFailure(state, action) {
    //   state.otpSent = "failure";
    // },
    checkAuth(state, action) {
      const lastLoggedIn = localStorage.getItem("lastLoggedIn");
      if (lastLoggedIn && +new Date() - lastLoggedIn > 24184287) {
        state.userLoggedIn = false;
        state.userInfo = null;
        localStorage.removeItem("token");
        localStorage.removeItem("lastLoggedIn");
      } else {
        state.userLoggedIn = true;
        state.userInfo = action.payload.user;
      }
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
