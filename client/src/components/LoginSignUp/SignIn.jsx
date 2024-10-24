import React, { useState } from "react";
import FormPage from "./FormPage";
import styles from "./styles/SignUp.module.css";
import { baseURL } from "../../api/api";
import useInput from "../../hooks/useInput";

const SignIn = () => {
  const [errorMessage, setErrorMessage] = useState("");

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

    try {
      const response = await fetch(`${baseURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.msg || "Login failed");
        return;
      }

      const data = await response.json();
      alert("Sign-In Successful");
      localStorage.setItem("token", data.token);
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
    }
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
