import { createSlice } from "@reduxjs/toolkit";

const TOKEN_EXPIRATION_DURATION = 24184287;

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
      localStorage.setItem("expirationTime", action.payload.expiresAt);
    },
    logout(state) {
      state.userLoggedIn = false;
      state.userInfo = null;
      state.userToken = null;
      state.expirationTime = null;
      localStorage.removeItem("token");
      localStorage.removeItem("lastLoggedIn");
      localStorage.removeItem("expirationTime");
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
      if (
        lastLoggedIn &&
        +new Date() - lastLoggedIn > TOKEN_EXPIRATION_DURATION
      ) {
        state.userLoggedIn = false;
        state.userInfo = null;
        localStorage.removeItem("token");
        localStorage.removeItem("lastLoggedIn");
        localStorage.removeItem("expirationTime");
      } else {
        state.userLoggedIn = true;
        //state.userInfo = action.payload.user;
      }
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
