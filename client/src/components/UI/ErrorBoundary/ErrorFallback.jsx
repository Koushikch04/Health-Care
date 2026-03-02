import React from "react";
import styles from "./ErrorBoundary.module.css";

function ErrorFallback({ onReset }) {
  return (
    <section className={styles.fallback} role="alert">
      <h2>We hit an unexpected UI error</h2>
      <p>
        The page crashed while rendering. You can try reloading now, and if this
        keeps happening please report the flow that caused it.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onReset}>
          Reload Page
        </button>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
      </div>
    </section>
  );
}

export default ErrorFallback;
