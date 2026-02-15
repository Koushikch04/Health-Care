import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import FormPage from "./FormPage";
import CircularSpinner from "../Spinners/CircularSpinner.jsx";
import useInput from "../../hooks/useInput";
import { loginAccount } from "../../store/auth/auth-actions";
import useAlert from "../../hooks/useAlert";

import styles from "./styles/SignUp.module.css";

const SignIn = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const dispatch = useDispatch();
  const location = useLocation();
  const { alert } = useAlert();
  const navigate = useNavigate();

  const {
    value: email,
    isValid: emailIsValid,
    hasError: emailHasError,
    valueChangeHandler: emailChangeHandler,
    inputBlurHandler: emailBlurHandler,
  } = useInput((value) => value.includes("@"));

  const {
    value: password,
    isValid: passwordIsValid,
    hasError: passwordHasError,
    valueChangeHandler: passwordChangeHandler,
    inputBlurHandler: passwordBlurHandler,
  } = useInput((value) => value.trim().length > 6);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (blockedUntil && Date.now() < blockedUntil) {
      return;
    }

    if (!emailIsValid || !passwordIsValid) {
      setErrorMessage("Please enter valid email and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(loginAccount({ email, password }, alert));
      if (!result?.ok && result?.status === 429) {
        const seconds = result.retryAfterSeconds || 300;
        setBlockedUntil(Date.now() + seconds * 1000);
        setCountdown(seconds);
        setErrorMessage(
          `Too many attempts. Try again in ${Math.ceil(seconds / 60)} minute(s).`,
        );
        return;
      }
      if (result?.ok) {
        const redirectParam = new URLSearchParams(location.search).get(
          "redirect",
        );

        if (result.role === "doctor") {
          navigate("/profile/doctor/dashboard");
          return;
        }

        if (result.role === "admin" || result.role === "superadmin") {
          navigate("/profile/admin/dashboard");
          return;
        }

        navigate(redirectParam || "/");
      }
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        <header>Login</header>
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
        <div className={styles.form_outer}>
          <form onSubmit={handleSubmit}>
            <FormPage isVisible={true}>
              <div
                className={
                  emailHasError
                    ? `${styles.invalid} ${styles.field}`
                    : styles.field
                }
              >
                <div className={styles.label}>Email</div>
                <input
                  type="email"
                  value={email}
                  onChange={emailChangeHandler}
                  onBlur={emailBlurHandler}
                  required
                />
                {/* Inline error */}
                {emailHasError && (
                  <div className={styles.error}>Invalid email.</div>
                )}
              </div>
              <div
                className={
                  passwordHasError
                    ? `${styles.invalid} ${styles.field}`
                    : styles.field
                }
              >
                <div className={styles.label}>Password</div>
                <div className={styles.passwordInputWrap}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={passwordChangeHandler}
                    onBlur={passwordBlurHandler}
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
                {passwordHasError && (
                  <div className={styles.error}>
                    Password must be at least 7 characters.
                  </div>
                )}
              </div>
              <div className={styles.authMetaRow}>
                <Link to="/auth/forgot-password" className={styles.authLink}>
                  Forgot Password?
                </Link>
              </div>
              <button
                className={styles.signInButton}
                disabled={
                  !emailIsValid ||
                  !passwordIsValid ||
                  loading ||
                  Boolean(blockedUntil && Date.now() < blockedUntil)
                }
                type="submit"
              >
                {/* {loading ? <span className={styles.spinner}></span> : "Submit"} */}
                {loading ? <CircularSpinner /> : "Submit"}
              </button>
              {blockedUntil && countdown > 0 && (
                <div className={styles.rateLimitNotice}>
                  Too many attempts. Try again in {countdown}s.
                </div>
              )}
            </FormPage>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
