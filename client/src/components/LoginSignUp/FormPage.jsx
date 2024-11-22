import React from "react";
import styles from "./styles/SignUp.module.css";

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
  disabled = false,
  loading = false,
}) => {
  return (
    <div
      className={`${styles.page} ${styles.slide_page} ${
        isVisible ? `${styles.visible}` : ""
      }`}
    >
      <div className={styles.title}>{title}</div>
      {children}
      {(showNext || showPrev || showSubmit) && (
        <div
          className={`${styles.field} ${styles.btns}`}
          style={{ display: "flex" }}
        >
          {showPrev && (
            <button
              type="button"
              className={`${styles.prev} ${styles.signupbtn}`}
              onClick={onPrev}
            >
              Previous
            </button>
          )}
          {showNext && (
            <button
              type="button"
              className={`${styles.next} ${styles.signupbtn}`}
              onClick={onNext}
              disabled={disabled}
            >
              Next
            </button>
          )}
          {showSubmit && (
            <button
              type="button"
              className={`${styles.submit} ${styles.signupbtn}`}
              onClick={onSubmit}
              disabled={disabled || loading}
            >
              {loading ? <span className={styles.spinner}></span> : "Submit"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FormPage;
