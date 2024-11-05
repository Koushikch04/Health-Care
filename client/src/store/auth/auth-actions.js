import { baseURL } from "../../api/api";
import { authActions } from "./auth-slice";

export const registerUser = (userData, alert) => async (dispatch) => {
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
      throw new Error(errorData.msg);
    }

    const data = await response.json();
    alert.success({
      message: "Registration Success, login to continue",
      title: `Hello, ${data.person.name.firstName} `,
    });
  } catch (error) {
    alert.error({
      message: error.msg || "An unexpected error occurred",
      title: "Registration failed",
    });
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
    console.log("logged in as", data.role);

    dispatch(
      authActions.login({
        person: data.person,
        token: data.token,
        expiresAt: data.expiresAt,
        role: data.role,
      })
    );
    // dispatch(loginSuccess(data.token));
    // alert("Sign-In Successful");
  } catch (error) {
    alert.error({
      message: error.msg || "An unexpected error occurred",
      title: "Login failed",
    });
  }
};

export const loginUserAsDoctor = (userData, alert) => async (dispatch) => {
  try {
    const response = await fetch(`${baseURL}/doctor/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert.error({
        message: errorData.msg || "Login failed",
        title: "Login failed",
      });
      return;
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);

    alert.success({
      message: `Hello, ${data.person.name.firstName} `,
      title: "Login Success",
    });

    console.log("logged in as", data.role);

    dispatch(
      authActions.login({
        person: data.person,
        token: data.token,
        expiresAt: data.expiresAt,
        role: data.role,
      })
    );
  } catch (error) {
    alert.error({
      message: error.msg || "An unexpected error occurred",
      title: "Login failed",
    });
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    dispatch(logout());
    alert.success({
      message: "Logged out successfully",
      title: "Authentication status",
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export const checkAuthStatus = () => (dispatch) => {
  const token = localStorage.getItem("token");
  if (token) {
    const user = jwt.decode(token);
    dispatch(checkAuth(user));
  } else {
    dispatch(logout());
  }
};

export const cancelAppointment = (appointmentId, alert, role = "user") => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        `${baseURL}/appointment/${appointmentId}?role=${role}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg);
      }

      const canceledAppointment = await fetch(
        `${baseURL}/appointment/${appointmentId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const appointmentData = await canceledAppointment.json();
      if (role == "user") {
        const newUpdate = {
          id: appointmentData._id,
          img: appointmentData.patientImage || "defaultImage.jpg",
          patient: appointmentData.patientName,
          doctor:
            appointmentData.doctor.name.firstName +
            appointmentData.doctor.name.lastName,
          type: "canceled",
          time: new Date().toISOString(),
        };

        dispatch(authActions.addUpdate(newUpdate));
      }

      alert.success({
        message: "Appointment cancelled successfully.",
        title: "Cancellation Success",
      });

      return true;
    } catch (error) {
      console.log(error);

      alert.error({
        message: error.msg || "Failed to cancel the appointment.",
        title: "Cancellation Failed",
      });
      return false;
    }
  };
};
