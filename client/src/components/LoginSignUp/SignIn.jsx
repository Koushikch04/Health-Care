import React, { useState } from "react";
import FormPage from "./FormPage";
import styles from "./styles/SignUp.module.css";
import { baseURL } from "../../api/api";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        <div className={styles.form_outer}>
          <form onSubmit={handleSubmit}>
            <FormPage isVisible={true}>
              <div className={styles.field}>
                <div className={styles.label}>Email</div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <div className={styles.label}>Password</div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button className={styles.signInButton} type="submit">
                Submit
              </button>
              {errorMessage && (
                <div className={styles.error}>{errorMessage}</div>
              )}{" "}
              {/* Show error message */}
            </FormPage>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
