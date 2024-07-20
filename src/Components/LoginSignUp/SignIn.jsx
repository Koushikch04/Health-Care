import React, { useState } from "react";
import FormPage from "./FormPage";
import "./styles/SignIn.css";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add logic for sign-in here
    alert("Sign-In Successful");
  };

  return (
    <div className="body">
      <div className="container">
        <header>Login</header>
        <div className="form-outer">
          <form>
            <FormPage isVisible={true}>
              <div className="field">
                <div className="label">Email</div>
                <input type="email" />
              </div>
              <div className="field">
                <div className="label">Password</div>
                <input type="password" />
              </div>
              <button type="button">Submit</button>
            </FormPage>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
