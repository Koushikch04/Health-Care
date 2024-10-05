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
}) => {
  return (
    <div
      className={`${styles.page} ${styles.slide_page} ${
        isVisible ? `${styles.visible}` : ""
      }`}
    >
      <div className={styles.title}>{title}</div>
      {children}
      <div className={`${styles.field} ${styles.btns}`}>
        {showPrev && (
          <button type="button" className={styles.prev} onClick={onPrev}>
            Previous
          </button>
        )}
        {showNext && (
          <button type="button" className={styles.next} onClick={onNext}>
            Next
          </button>
        )}
        {showSubmit && (
          <button type="button" className={styles.submit} onClick={onSubmit}>
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default FormPage;
