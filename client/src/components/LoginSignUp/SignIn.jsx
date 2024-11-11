import React, { useState } from "react";
import { useDispatch } from "react-redux";

import FormPage from "./FormPage";
import useInput from "../../hooks/useInput";
import {
  loginAsAdmin,
  loginUser,
  loginUserAsDoctor,
} from "../../store/auth/auth-actions";
import useAlert from "../../hooks/useAlert";

import styles from "./styles/SignUp.module.css";

const SignIn = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const { alert } = useAlert();

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

    if (!emailIsValid || !passwordIsValid) {
      setErrorMessage("Please enter valid email and password.");
      return;
    }

    if (email === "superadmin@healthcare.com") {
      dispatch(loginAsAdmin({ email, password }, alert));
    } else if (email.endsWith("@healthcare.com")) {
      console.log("doctor");
      dispatch(loginUserAsDoctor({ email, password }, alert));
    } else {
      console.log("user");
      dispatch(loginUser({ email, password }, alert));
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
                )}{" "}
                {/* Inline error */}
              </div>
              <button
                className={styles.signInButton}
                disabled={!emailIsValid || !passwordIsValid}
                type="submit"
              >
                Submit
              </button>
            </FormPage>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
