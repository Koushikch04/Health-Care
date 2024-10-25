import { baseURL } from "../../api/api";
import { authActions } from "./auth-slice";

export const registerUser = (userData) => async (dispatch) => {
  try {
    const response = await fetch(`${baseURL}/auth/register/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }

    const data = await response.json();
    // Dispatch any success actions if needed
  } catch (error) {
    // Dispatch failure action if needed
  }
};

export const loginUser = (userData, alert) => async (dispatch) => {
  try {
    const response = await fetch(`${baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // dispatch(errorData.msg || "Login failed");
      alert.error({
        message: errorData.msg || "Login failed",
        title: "Login failed",
      });
      return;
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    console.log(data);

    alert.success({
      message: `Hello, ${data.person.name.firstName} `,
      title: "Login Success",
    });
    dispatch(authActions.login(data.person, data.token, data.expiresAt));
    // dispatch(loginSuccess(data.token));
    // alert("Sign-In Successful");
  } catch (error) {
    alert.error({
      message: error.msg || "An unexpected error occurred",
      title: "Login failed",
    });
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    // You could also call your API for logout if needed
    localStorage.removeItem("token");
    dispatch(logout());
    // alert("Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export const checkAuthStatus = () => (dispatch) => {
  const token = localStorage.getItem("token");
  if (token) {
    // You might want to decode the token to get user info
    const user = jwt.decode(token);
    dispatch(checkAuth(user));
  } else {
    dispatch(logout());
  }
};
