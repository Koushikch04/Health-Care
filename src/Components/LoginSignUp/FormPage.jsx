import React from "react";
import "./styles/SignUp.css";

const FormPage = ({
  title,
  children,
  isVisible,
  onNext,
  onPrev,
  onSubmit,
  showPrev,
  showNext,
  showSubmit,
}) => {
  return (
    <div className={`page slide-page ${isVisible ? "visible" : ""}`}>
      <div className="title">{title}</div>
      {children}
      <div className="field btns">
        {showPrev && (
          <button type="button" className="prev" onClick={onPrev}>
            Previous
          </button>
        )}
        {showNext && (
          <button type="button" className="next" onClick={onNext}>
            Next
          </button>
        )}
        {showSubmit && (
          <button type="button" className="submit" onClick={onSubmit}>
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default FormPage;
