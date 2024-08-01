import React from "react";
import styles from "./Card.module.css";

const Card = ({ user, openReviewModal }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{user.name}</h3>
        <p className={styles.cardSpeciality}>{user.speciality}</p>
      </div>
      <div className={styles.cardBody}>
        {user.review && (
          <p>
            <strong>Review:</strong> {user.review}
          </p>
        )}
        {!user.review && (
          <button onClick={() => openReviewModal(user.id)}>Give Review</button>
        )}
      </div>
    </div>
  );
};

export default Card;
