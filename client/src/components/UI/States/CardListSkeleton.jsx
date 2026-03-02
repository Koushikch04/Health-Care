import React from "react";
import styles from "./StateBlocks.module.css";

function CardListSkeleton({ rows = 4, withAvatar = true }) {
  const cards = Array.from({ length: rows });

  return (
    <div className={styles.cardSkeletonList} aria-hidden="true">
      {cards.map((_, index) => (
        <div key={index} className={styles.cardSkeleton}>
          {withAvatar ? (
            <div
              className={styles.skeletonBlock}
              style={{ width: "56px", height: "56px", borderRadius: "50%" }}
            />
          ) : (
            <div
              className={styles.skeletonBlock}
              style={{ width: "10px", height: "56px" }}
            />
          )}
          <div className={styles.cardBody}>
            <div
              className={styles.skeletonBlock}
              style={{ height: "16px", width: "60%" }}
            />
            <div
              className={styles.skeletonBlock}
              style={{ height: "14px", width: "75%" }}
            />
            <div
              className={styles.skeletonBlock}
              style={{ height: "14px", width: "45%" }}
            />
          </div>
          <div className={styles.cardActions}>
            <div className={styles.skeletonBlock} style={{ height: "34px" }} />
            <div className={styles.skeletonBlock} style={{ height: "34px" }} />
            <div className={styles.skeletonBlock} style={{ height: "34px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardListSkeleton;
