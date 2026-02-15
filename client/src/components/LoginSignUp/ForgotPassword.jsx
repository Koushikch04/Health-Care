import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import styles from "./styles/SignUp.module.css";
import { baseURL } from "../../api/api";
import CircularSpinner from "../Spinners/CircularSpinner";
import useAlert from "../../hooks/useAlert";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otpNumber, setOtpNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [blockedUntil, setBlockedUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const { alert } = useAlert();
  const isBlocked = Boolean(blockedUntil && Date.now() < blockedUntil);

  const getRetryAfterSeconds = (response) => {
    const retryAfter = response.headers.get("retry-after");
    if (!retryAfter) return 300;

    const asNumber = Number(retryAfter);
    if (!Number.isNaN(asNumber) && asNumber > 0) {
      return asNumber;
    }

    const retryDate = new Date(retryAfter);
    if (!Number.isNaN(retryDate.getTime())) {
      const seconds = Math.ceil((retryDate.getTime() - Date.now()) / 1000);
      return seconds > 0 ? seconds : 300;
    }

    return 300;
  };

  const applyRateLimit = (response) => {
    const seconds = getRetryAfterSeconds(response);
    setBlockedUntil(Date.now() + seconds * 1000);
    setCountdown(seconds);
    setErrorMessage(`Too many attempts. Try again in ${seconds}s.`);
  };

  const sendOtpHandler = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (isBlocked) return;

    if (!email.includes("@")) {
      setErrorMessage("Please enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/auth/forgotPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.status === 429) {
        applyRateLimit(response);
        return;
      }
      if (!response.ok) {
        setErrorMessage(data?.message || "Failed to send OTP.");
        return;
      }

      alert.success({ title: "Success", message: data.message || "OTP sent." });
      setStep(2);
    } catch (error) {
      setErrorMessage("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpHandler = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (isBlocked) return;

    if (!otpNumber.trim()) {
      setErrorMessage("Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/auth/validateOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpNumber }),
      });

      const data = await response.json();
      if (response.status === 429) {
        applyRateLimit(response);
        return;
      }
      if (!response.ok) {
        setErrorMessage(data?.message || "Invalid OTP.");
        return;
      }

      setResetToken(data.token);
      alert.success({
        title: "Success",
        message: data.message || "OTP verified successfully.",
      });
      setStep(3);
    } catch (error) {
      setErrorMessage("Failed to validate OTP.");
    } finally {
      setLoading(false);
    }
  };

  const changePasswordHandler = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (isBlocked) return;

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
      const response = await fetch(`${baseURL}/auth/changePassword`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resetToken}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();
      if (response.status === 429) {
        applyRateLimit(response);
        return;
      }
      if (!response.ok) {
        setErrorMessage(data?.message || "Failed to change password.");
        return;
      }

      alert.success({
        title: "Success",
        message: data.message || "Password changed successfully.",
      });
      navigate("/auth/login");
    } catch (error) {
      setErrorMessage("Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepTitle = () => {
    if (step === 1) return "Forgot Password";
    if (step === 2) return "Verify OTP";
    return "Set New Password";
  };

  React.useEffect(() => {
    if (!blockedUntil) return;

    const interval = setInterval(() => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((blockedUntil - Date.now()) / 1000),
      );
      setCountdown(secondsLeft);
      if (secondsLeft <= 0) {
        setBlockedUntil(null);
        setErrorMessage("");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [blockedUntil]);

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <header>{renderStepTitle()}</header>
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
        <div className={styles.form_outer}>
          <form
            onSubmit={
              step === 1
                ? sendOtpHandler
                : step === 2
                  ? verifyOtpHandler
                  : changePasswordHandler
            }
          >
            {step === 1 && (
              <div className={styles.page + " " + styles.visible}>
                <div className={styles.field}>
                  <div className={styles.label}>Email</div>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <button className={styles.signInButton} disabled={loading || isBlocked} type="submit">
                  {loading ? <CircularSpinner /> : "Send OTP"}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className={styles.page + " " + styles.visible}>
                <div className={styles.field}>
                  <div className={styles.label}>OTP</div>
                  <input
                    type="text"
                    value={otpNumber}
                    onChange={(event) => setOtpNumber(event.target.value)}
                    required
                  />
                </div>
                <button className={styles.signInButton} disabled={loading || isBlocked} type="submit">
                  {loading ? <CircularSpinner /> : "Verify OTP"}
                </button>
              </div>
            )}

            {step === 3 && (
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
                <button className={styles.signInButton} disabled={loading || isBlocked} type="submit">
                  {loading ? <CircularSpinner /> : "Change Password"}
                </button>
              </div>
            )}
          </form>
        </div>
        {isBlocked && countdown > 0 && (
          <div className={styles.rateLimitNotice}>
            Too many attempts. Try again in {countdown}s.
          </div>
        )}
        <div className={styles.authMetaRow}>
          <Link to="/auth/login" className={styles.authLink}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
