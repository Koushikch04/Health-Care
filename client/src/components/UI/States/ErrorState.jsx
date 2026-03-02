import React from "react";
import styles from "./StateBlocks.module.css";

function ErrorState({
  title = "Something went wrong",
  message = "Please try again in a moment.",
  onRetry,
  retryLabel = "Try Again",
}) {
  return (
    <div
      className={`${styles.stateBox} ${styles.stateBoxError}`}
      role="alert"
      aria-live="assertive"
    >
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

export default ErrorState;
