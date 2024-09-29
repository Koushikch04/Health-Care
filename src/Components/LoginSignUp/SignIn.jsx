import React, { useState } from "react";
import FormPage from "./FormPage";
import styles from "./styles/SignUp.module.css";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add logic for sign-in here
    alert("Sign-In Successful");
  };

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <header>Login</header>
        <div className={styles.form_outer}>
          <form>
            <FormPage isVisible={true}>
              <div className={styles.field}>
                <div className={styles.label}>Email</div>
                <input type="email" />
              </div>
              <div className={styles.field}>
                <div className={styles.label}>Password</div>
                <input type="password" />
              </div>
              <button className={styles.signInButton} type="button">
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
