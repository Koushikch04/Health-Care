import React from "react";
import styles from "./StateBlocks.module.css";

function EmptyState({
  title = "No data available",
  message = "There is nothing to show right now.",
  actionLabel,
  onAction,
}) {
  return (
    <div className={styles.stateBox} role="status" aria-live="polite">
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export default EmptyState;
