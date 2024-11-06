import React, { useEffect, useState } from "react";
import styles from "./Card.module.css";
import { baseURL } from "../../api/api";
import { useSelector } from "react-redux";

const Card = ({ appointment, openReviewModal, updateAppointmentReview }) => {
  const [review, setReview] = useState(null);
  const token = useSelector((state) => state.auth.userToken);

  const doctorName = `${appointment.doctor.name.firstName} ${appointment.doctor.name.lastName}`;
  const specialty = appointment.doctor.specialty.name;
  const patientName = appointment.patientName;
  const isReviewed = appointment.reviewed;

  useEffect(() => {
    const fetchReview = async () => {
      if (isReviewed) {
        try {
          const response = await fetch(`${baseURL}/review/${appointment._id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const reviewData = await response.json();
          if (reviewData) setReview(reviewData);
        } catch (error) {
          console.error("Failed to fetch review:", error);
        }
      }
    };

    fetchReview();
  }, [appointment._id, isReviewed, token]);

  const handleReviewSubmission = (newReview) => {
    updateAppointmentReview(appointment._id, newReview);
    setReview(newReview);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{doctorName}</h3>
        <p className={styles.cardSpeciality}>{specialty}</p>
      </div>
      <div className={styles.cardBody}>
        <p>
          <strong>Patient:</strong> {patientName}
        </p>
        {isReviewed ? (
          <p>
            <strong>Review:</strong>
            {review ? review.comment : "Loading..."}
          </p>
        ) : (
          <button
            className={styles.reviewButton}
            onClick={() =>
              openReviewModal(appointment._id, handleReviewSubmission)
            }
          >
            Give Review
          </button>
        )}
      </div>
    </div>
  );
};

export default Card;
