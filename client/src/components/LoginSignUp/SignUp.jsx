import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import FormPage from "./FormPage";
import styles from "./styles/SignUp.module.css";
import { baseURL } from "../../api/api";
import useInput from "../../hooks/useInput"; // Import useInput hook for validation

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  // First Name Validation
  const {
    value: firstName,
    isValid: firstNameIsValid,
    hasError: firstNameHasError,
    valueChangeHandler: firstNameChangeHandler,
    inputBlurHandler: firstNameBlurHandler,
    isTouched: firstNameIsTouched,
  } = useInput((value) => value.trim() !== ""); // Non-empty validation

  // Last Name Validation
  const {
    value: lastName,
    isValid: lastNameIsValid,
    hasError: lastNameHasError,
    valueChangeHandler: lastNameChangeHandler,
    inputBlurHandler: lastNameBlurHandler,
    isTouched: lastNameIsTouched,
  } = useInput((value) => value.trim() !== ""); // Non-empty validation

  // Phone Validation
  const {
    value: phone,
    isValid: phoneIsValid,
    hasError: phoneHasError,
    valueChangeHandler: phoneChangeHandler,
    inputBlurHandler: phoneBlurHandler,
    isTouched: phoneIsTouched,
  } = useInput((value) => /^\d{10}$/.test(value)); // Assume phone number is 10 digits

  const {
    value: emergency,
    isValid: emergencyIsValid,
    hasError: emergencyHasError,
    valueChangeHandler: emergencyChangeHandler,
    inputBlurHandler: emergencyBlurHandler,
    isTouched: emergencyIsTouched,
  } = useInput((value) => value === "" || /^\d{10}$/.test(value));

  // Date of Birth Validation (non-empty)
  const {
    value: dob,
    isValid: dobIsValid,
    hasError: dobHasError,
    valueChangeHandler: dobChangeHandler,
    inputBlurHandler: dobBlurHandler,
    isTouched: dobIsTouched,
  } = useInput((value) => value.trim() !== ""); // Ensures a date is selected

  // Gender Validation (must select one)
  const {
    value: gender,
    isValid: genderIsValid,
    hasError: genderHasError,
    valueChangeHandler: genderChangeHandler,
    inputBlurHandler: genderBlurHandler,
    isTouched: genderIsTouched,
  } = useInput((value) => value !== ""); // Ensures a selection is made

  // Email Validation
  const {
    value: email,
    isValid: emailIsValid,
    hasError: emailHasError,
    valueChangeHandler: emailChangeHandler,
    inputBlurHandler: emailBlurHandler,
    isTouched: emailIsTouched,
  } = useInput((value) => value.includes("@"));

  // Password Validation
  const {
    value: password,
    isValid: passwordIsValid,
    hasError: passwordHasError,
    valueChangeHandler: passwordChangeHandler,
    inputBlurHandler: passwordBlurHandler,
    isTouched: passwordIsTouched,
  } = useInput((value) => value.trim().length > 6);

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !firstNameIsValid ||
      !lastNameIsValid ||
      !phoneIsValid ||
      !dobIsValid ||
      !genderIsValid ||
      !emailIsValid ||
      !passwordIsValid
    ) {
      setErrorMessage("Please fill out all fields correctly.");
      return;
    }

    try {
      const response = await fetch(`${baseURL}/auth/register/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          dob,
          gender,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        return;
      }

      const data = await response.json();
      alert(data.message);
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during registration.");
    }
  };

  const steps = ["Name", "Contact", "Birth", "Submit"];

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <header>Registration</header>
        <ProgressBar steps={steps} currentStep={currentStep} />
        <div className={styles.form_outer}>
          <form onSubmit={handleSubmit}>
            <FormPage
              title="Basic Info:"
              isVisible={currentStep === 1}
              onNext={nextStep}
              showNext={true}
              disabled={
                !firstNameIsTouched ||
                !lastNameIsTouched ||
                !firstNameIsValid ||
                !lastNameIsValid
              }
            >
              <div className={styles.field}>
                <div className={styles.label}>First Name</div>
                <input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={firstNameChangeHandler}
                  onBlur={firstNameBlurHandler}
                  required
                />
                {firstNameHasError && (
                  <div className={styles.error}>First name is required.</div>
                )}
              </div>
              <div className={styles.field}>
                <div className={styles.label}>Last Name</div>
                <input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={lastNameChangeHandler}
                  onBlur={lastNameBlurHandler}
                  required
                />
                {lastNameHasError && (
                  <div className={styles.error}>Last name is required.</div>
                )}
              </div>
            </FormPage>

            <FormPage
              title="Contact Info:"
              isVisible={currentStep === 2}
              onNext={nextStep}
              onPrev={prevStep}
              showPrev={true}
              showNext={true}
              disabled={
                !phoneIsTouched ||
                !phoneIsValid ||
                (emergencyIsTouched && !emergencyIsValid)
              }
            >
              <div className={styles.field}>
                <div className={styles.label}>Phone Number</div>
                <input
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={phoneChangeHandler}
                  onBlur={phoneBlurHandler}
                  required
                />
                {phoneHasError && (
                  <div className={styles.error}>
                    Enter a valid 10-digit phone number.
                  </div>
                )}
              </div>
              <div className={styles.field}>
                <div className={styles.label}>Emergency Contact (Optional)</div>
                <input
                  type="tel"
                  name="emergency"
                  value={emergency}
                  onChange={emergencyChangeHandler}
                  onBlur={emergencyBlurHandler}
                />
                {emergencyHasError && (
                  <div className={styles.error}>
                    Emergency contact must be 10 digits if provided.
                  </div>
                )}
              </div>
            </FormPage>
            <FormPage
              title="Date of Birth:"
              isVisible={currentStep === 3}
              onNext={nextStep}
              onPrev={prevStep}
              showPrev={true}
              showNext={true}
              disabled={
                !dobIsTouched ||
                !genderIsTouched ||
                !dobIsValid ||
                !genderIsValid
              }
            >
              <div className={styles.field}>
                <div className={styles.label}>Date</div>
                <input
                  type="date"
                  name="dob"
                  value={dob}
                  onChange={dobChangeHandler}
                  onBlur={dobBlurHandler}
                  required
                />
                {dobHasError && (
                  <div className={styles.error}>
                    Please select your date of birth.
                  </div>
                )}
              </div>
              <div className={styles.field}>
                <div className={styles.label}>Gender</div>
                <select
                  name="gender"
                  value={gender}
                  onChange={genderChangeHandler}
                  onBlur={genderBlurHandler}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {genderHasError && (
                  <div className={styles.error}>Please select your gender.</div>
                )}
              </div>
            </FormPage>
            <FormPage
              title="Login Details:"
              isVisible={currentStep === 4}
              onPrev={prevStep}
              onSubmit={handleSubmit}
              showPrev={true}
              showNext={false}
              showSubmit={true}
              disabled={
                !emailIsTouched ||
                !passwordIsTouched ||
                !emailIsValid ||
                !passwordIsValid
              }
            >
              <div className={styles.field}>
                <div className={styles.label}>Email Address</div>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={emailChangeHandler}
                  onBlur={emailBlurHandler}
                  required
                />
                {emailHasError && (
                  <div className={styles.error}>Invalid email address.</div>
                )}
              </div>
              <div className={styles.field}>
                <div className={styles.label}>Password</div>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={passwordChangeHandler}
                  onBlur={passwordBlurHandler}
                  required
                />
                {passwordHasError && (
                  <div className={styles.error}>
                    Password must be at least 7 characters long.
                  </div>
                )}
              </div>
              {errorMessage && (
                <div className={styles.error}>{errorMessage}</div>
              )}
            </FormPage>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
