import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import FormPage from "./FormPage";
import "./styles/SignUp.css";

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
    <div className="body">
      <div className="container">
        <header>Registration</header>
        <ProgressBar steps={steps} currentStep={currentStep} />
        <div className="form-outer">
          <form>
            <FormPage
              title="Basic Info:"
              isVisible={currentStep === 1}
              onNext={nextStep}
              showNext={true}
            >
              <div className="field">
                <div className="label">First Name</div>
                <input type="text" required />
              </div>
              <div className="field">
                <div className="label">Last Name</div>
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
              <div className="field">
                <div className="label">Username</div>
                <input type="text" name="username" required />
              </div>
              <div className="field">
                <div className="label">Phone Number</div>
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
              <div className="field">
                <div className="label">Date</div>
                <input type="date" required />
              </div>
              <div className="field">
                <div className="label">Gender</div>
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
              <div className="field">
                <div className="label">Email Address</div>
                <input type="email" required />
              </div>
              <div className="field">
                <div className="label">Password</div>
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
