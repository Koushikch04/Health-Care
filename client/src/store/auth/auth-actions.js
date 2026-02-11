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

export const loginAccount = (userData, alert) => async (dispatch) => {
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
      return { ok: false };
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    console.log(data);

    const displayName =
      data.person?.name?.firstName || data.account?.email || "there";
    alert.success({
      message: `Hello, ${displayName} `,
      title: "Login Success",
    });
    console.log("logged in as", data);

    const personWithEmail = data.person
      ? { ...data.person, email: data.account?.email || data.person.email }
      : data.person;

    dispatch(
      authActions.login({
        person: personWithEmail,
        token: data.token,
        expiresAt: data.expiresAt,
        role: data.role,
      }),
    );
    return { ok: true, role: data.role };
    // dispatch(loginSuccess(data.token));
    // alert("Sign-In Successful");
  } catch (error) {
    console.log(error);

    alert.error({
      message: error.msg || "An unexpected error occurred",
      title: "Login failed",
    });
    return { ok: false };
  }
};

export const logoutUser = (alert) => async (dispatch) => {
  try {
    dispatch(authActions.logout());
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

export const cancelAppointment = (
  appointmentId,
  alert,
  role = "user",
  appointmentStatus,
) => {
  return async (dispatch) => {
    try {
      if (
        appointmentStatus === "canceled" ||
        appointmentStatus === "completed"
      ) {
        alert.info({
          message: "This appointment can no longer be canceled.",
          title: "Cancellation Not Allowed",
        });
        return false;
      }

      const response = await fetch(
        `${baseURL}/appointment/${appointmentId}?role=${role}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
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
        },
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
