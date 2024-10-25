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
      state.userInfo = action.payload.person;
      state.userToken = action.payload.token;
      state.expirationTime = action.payload.expiresAt;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("lastLoggedIn", Date.now());
      localStorage.setItem("expirationTime", action.payload.expiresAt);
      localStorage.setItem("userInfo", JSON.stringify(action.payload.person));
    },
    logout(state) {
      state.userLoggedIn = false;
      state.userInfo = null;
      state.userToken = null;
      state.expirationTime = null;
      localStorage.removeItem("token");
      localStorage.removeItem("lastLoggedIn");
      localStorage.removeItem("expirationTime");
      localStorage.removeItem("userInfo");
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
      const token = localStorage.getItem("token");
      const expirationTime = localStorage.getItem("expirationTime");
      const lastLoggedIn = localStorage.getItem("lastLoggedIn");
      const userInfo = localStorage.getItem("userInfo");

      if (token && expirationTime) {
        const currentTime = Date.now();
        const expirationTimeInMillis = new Date(expirationTime).getTime();
        console.log(currentTime, expirationTimeInMillis);

        if (currentTime < expirationTimeInMillis) {
          state.userLoggedIn = true;
          state.userToken = token;
          state.userInfo = JSON.parse(userInfo);
        } else {
          // Token expired, clean up
          // state.userLoggedIn = false;
          // state.userToken = null;
          // localStorage.removeItem("token");
          // localStorage.removeItem("lastLoggedIn");
          // localStorage.removeItem("expirationTime");
          // localStorage.removeItem("userInfo");
        }
      } else {
        // state.userLoggedIn = false;
      }
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
