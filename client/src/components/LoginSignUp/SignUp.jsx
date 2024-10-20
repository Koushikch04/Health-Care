import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import FormPage from "./FormPage";
import styles from "./styles/SignUp.module.css";
import { baseURL } from "../../api/api";

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    emergency: "",
    dob: "",
    gender: "Male",
    email: "",
    password: "",
  });

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${baseURL}/auth/register/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
          <form>
            <FormPage
              title="Basic Info:"
              isVisible={currentStep === 1}
              onNext={nextStep}
              showNext={true}
            >
              <div className={styles.field}>
                <div className={styles.label}>First Name</div>
                <input
                  type="text"
                  name="firstName"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <div className={styles.label}>Last Name</div>
                <input type="text" name="lastName" onChange={handleChange} />
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
                <div className={styles.label}>Phone Number</div>
                <input
                  type="tel"
                  name="phone"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <div className={styles.label}>Emergency Contact</div>
                <input type="tel" name="emergency" onChange={handleChange} />
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
                <input
                  type="date"
                  name="dob"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <div className={styles.label}>Gender</div>
                <select name="gender" required onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
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
                <input
                  type="email"
                  name="email"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <div className={styles.label}>Password</div>
                <input
                  type="password"
                  name="password"
                  required
                  onChange={handleChange}
                />
              </div>
            </FormPage>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
