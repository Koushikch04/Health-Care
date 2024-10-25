import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import FormPage from "./FormPage";
import styles from "./styles/SignUp.module.css";
import useInput from "../../hooks/useInput";
import { loginUser } from "../../store/auth/auth-actions";

const SignIn = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();

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

    dispatch(loginUser(email, password));
  };

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <header>Login</header>
        {errorMessage && (
          <div className={styles.error}>{errorMessage}</div>
        )}{" "}
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
              <button className={styles.signInButton} type="submit">
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
