import { baseURL } from "../../api/api";
// Action Types

// Async Action Creators
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

export const loginUser = (email, password) => async (dispatch) => {
  try {
    const response = await fetch(`${baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      dispatch(loginFailure(errorData.msg || "Login failed"));
      return;
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    dispatch(loginSuccess(data.token));
    alert("Sign-In Successful");
  } catch (error) {
    dispatch(loginFailure("An unexpected error occurred"));
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    // You could also call your API for logout if needed
    localStorage.removeItem("token");
    dispatch(logout());
    alert("Logged out successfully");
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
