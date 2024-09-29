import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import FormPage from "./FormPage";
import styles from "./styles/SignUp.module.css";

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  console.log(currentStep);
  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setCurrentStep((prev) => prev + 1);
    setTimeout(function () {
      alert("Your Form Successfully Signed up");
      location.reload();
    }, 800);
  };

  const steps = ["Name", "Contact", "Birth", "Submit"];

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <header>Registration</header>
        <ProgressBar steps={steps} currentStep={currentStep} />
        <div className={styles.form_outer}>
          <form>
            <FormPage
              title="Basic Info:"
              isVisible={currentStep === 1}
              onNext={nextStep}
              showNext={true}
            >
              <div className={styles.field}>
                <div className={styles.label}>First Name</div>
                <input type="text" required />
              </div>
              <div className={styles.field}>
                <div className={styles.label}>Last Name</div>
                <input type="text" required />
              </div>
            </FormPage>
            <FormPage
              title="Contact Info:"
              isVisible={currentStep === 2}
              onNext={nextStep}
              onPrev={prevStep}
              showPrev={true}
              showNext={true}
            >
              <div className={styles.field}>
                <div className={styles.label}>Username</div>
                <input type="text" name="username" required />
              </div>
              <div className={styles.field}>
                <div className={styles.label}>Phone Number</div>
                <input type="number" required />
              </div>
            </FormPage>
            <FormPage
              title="Date of Birth:"
              isVisible={currentStep === 3}
              onNext={nextStep}
              onPrev={prevStep}
              showPrev={true}
              showNext={true}
            >
              <div className={styles.field}>
                <div className={styles.label}>Date</div>
                <input type="date" required />
              </div>
              <div className={styles.field}>
                <div className={styles.label}>Gender</div>
                <select required>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
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
            >
              <div className={styles.field}>
                <div className={styles.label}>Email Address</div>
                <input type="email" required />
              </div>
              <div className={styles.field}>
                <div className={styles.label}>Password</div>
                <input type="password" required />
              </div>
            </FormPage>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
