import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import styles from "./styles/SignUp.module.css";
import { baseURL } from "../../api/api";
import CircularSpinner from "../Spinners/CircularSpinner";

const InviteSetup = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const submitHandler = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!inviteToken) {
      setErrorMessage("Invite token is missing or invalid.");
      return;
    }

    if (newPassword.trim().length < 7) {
      setErrorMessage("Password must be at least 7 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/auth/invite/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: inviteToken,
          newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrorMessage(data?.msg || "Failed to complete invite setup.");
        return;
      }

      setSuccessMessage(data?.msg || "Password set successfully. Redirecting to login...");
      setTimeout(() => navigate("/auth/login"), 1400);
    } catch (error) {
      setErrorMessage("Failed to complete invite setup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <header>Set Your Password</header>
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
        {successMessage && <div className={styles.rateLimitNotice}>{successMessage}</div>}

        <div className={styles.form_outer}>
          <form onSubmit={submitHandler}>
            <div className={styles.page + " " + styles.visible}>
              <div className={styles.field}>
                <div className={styles.label}>New Password</div>
                <div className={styles.passwordInputWrap}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Confirm Password</div>
                <div className={styles.passwordInputWrap}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </button>
                </div>
              </div>

              <button className={styles.signInButton} disabled={loading} type="submit">
                {loading ? <CircularSpinner /> : "Set Password"}
              </button>
            </div>
          </form>
        </div>
        <div className={styles.authMetaRow}>
          <Link to="/auth/login" className={styles.authLink}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InviteSetup;
