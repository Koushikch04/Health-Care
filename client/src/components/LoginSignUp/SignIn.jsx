import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import FormPage from "./FormPage";
import CircularSpinner from "../Spinners/CircularSpinner.jsx";
import useInput from "../../hooks/useInput";
import { loginAccount } from "../../store/auth/auth-actions";
import useAlert from "../../hooks/useAlert";

import styles from "./styles/SignUp.module.css";

const SignIn = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
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

  const getPostLoginPath = (role) => {
    if (role === "doctor") return "/profile/doctor/dashboard";
    if (role === "admin" || role === "superadmin")
      return "/profile/admin/dashboard";
    return "/";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!emailIsValid || !passwordIsValid) {
      setErrorMessage("Please enter valid email and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(loginAccount({ email, password }, alert));
      if (result?.ok) {
        navigate(getPostLoginPath(result.role), { replace: true });
      }
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setLoading(false);
    }
  };

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
                <input
                  type="password"
                  value={password}
                  onChange={passwordChangeHandler}
                  onBlur={passwordBlurHandler}
                  required
                />
                {passwordHasError && (
                  <div className={styles.error}>
                    Password must be at least 7 characters.
                  </div>
                )}
              </div>
              <button
                className={styles.signInButton}
                disabled={!emailIsValid || !passwordIsValid || loading}
                type="submit"
              >
                {/* {loading ? <span className={styles.spinner}></span> : "Submit"} */}
                {loading ? <CircularSpinner /> : "Submit"}
              </button>
            </FormPage>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
