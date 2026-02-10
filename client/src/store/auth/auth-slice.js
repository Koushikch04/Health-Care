import { createSlice } from "@reduxjs/toolkit";

// const TOKEN_EXPIRATION_DURATION = 24184287;

const normalizePermissions = (permissions) => {
  if (!permissions) return permissions;
  if (permissions instanceof Map) return Object.fromEntries(permissions);
  if (Array.isArray(permissions)) {
    if (permissions.length === 0) return {};
    if (Array.isArray(permissions[0])) return Object.fromEntries(permissions);
    return permissions.reduce((acc, item) => {
      if (item?.key) acc[item.key] = item.value;
      else if (item?.[0]) acc[item[0]] = item[1];
      return acc;
    }, {});
  }
  if (typeof permissions === "object") return { ...permissions };
  return permissions;
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userLoggedIn: false,
    userInfo: null,
    userToken: null,
    expirationTime: null,
    updates: [],
    // otpSent: "no",
    userRole: null,
  },
  reducers: {
    login(state, action) {
      const normalizedPermissions = normalizePermissions(
        action.payload.person?.permissions,
      );
      const normalizedPerson = action.payload.person
        ? { ...action.payload.person, permissions: normalizedPermissions }
        : action.payload.person;

      state.userLoggedIn = true;
      state.userInfo = normalizedPerson;
      state.userToken = action.payload.token;
      console.log(action.payload.person);
      state.expirationTime = action.payload.expiresAt;
      state.userRole = action.payload.role;

      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("lastLoggedIn", Date.now());
      localStorage.setItem("expirationTime", action.payload.expiresAt);
      localStorage.setItem("userInfo", JSON.stringify(normalizedPerson));
      localStorage.setItem("userRole", action.payload.role);
    },
    logout(state) {
      state.userLoggedIn = false;
      state.userInfo = null;
      state.userToken = null;
      state.expirationTime = null;
      state.updates = [];
      sessionStorage.removeItem("updates");
      localStorage.removeItem("token");
      localStorage.removeItem("lastLoggedIn");
      localStorage.removeItem("expirationTime");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userRole");
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
    updateUserInfo(state, action) {
      // console.log("Hello");
      // console.log(action.payload);

      state.userInfo = { ...state.userInfo, ...action.payload };
      localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
    },
    addUpdate(state, action) {
      state.updates.push(action.payload);
      sessionStorage.setItem("updates", JSON.stringify(state.updates));
    },
    loadUpdates(state) {
      const storedUpdates = sessionStorage.getItem("updates");
      if (storedUpdates) {
        state.updates = JSON.parse(storedUpdates);
      }
    },
    clearUpdates(state) {
      state.updates = [];
      sessionStorage.removeItem("updates");
    },
    checkAuth(state, action) {
      const token = localStorage.getItem("token");
      const expirationTime = localStorage.getItem("expirationTime");
      const lastLoggedIn = localStorage.getItem("lastLoggedIn");
      const userInfo = localStorage.getItem("userInfo");
      const userRole = localStorage.getItem("userRole");

      if (token && expirationTime) {
        const currentTime = Date.now();
        const expirationTimeInMillis = new Date(expirationTime).getTime();
        // console.log(currentTime, expirationTimeInMillis);

        if (currentTime < expirationTimeInMillis) {
          state.userLoggedIn = true;
          state.userToken = token;
          const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
          state.userInfo = parsedUserInfo
            ? {
                ...parsedUserInfo,
                permissions: normalizePermissions(parsedUserInfo.permissions),
              }
            : null;
          state.userRole = userRole;
        } else {
          // Token expired, clean up
          state.userLoggedIn = false;
          state.userToken = null;
          localStorage.removeItem("token");
          localStorage.removeItem("lastLoggedIn");
          localStorage.removeItem("expirationTime");
          localStorage.removeItem("userInfo");
          localStorage.removeItem("userRole");
        }
      } else {
        // state.userLoggedIn = false;
      }
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
