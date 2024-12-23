import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { baseURL } from "../../api/api";
import Modal from "../UI/Modal/Modal.jsx";
import styles from "./Card.module.css";

const Card = ({ appointment, openReviewModal, updateAppointmentReview }) => {
  const [review, setReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState("");

  const token = useSelector((state) => state.auth.userToken);

  const doctorName = `${appointment.doctor.name.firstName} ${appointment.doctor.name.lastName}`;
  const specialty = appointment.doctor.specialty.name;
  const patientName = appointment.patientName;
  const isReviewed = appointment.reviewed;

  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = new Date(
    `1970-01-01T${appointment.time}:00`
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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
  const handleCommentClick = (comment) => {
    setSelectedComment(comment);
    setIsModalOpen(true);
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
        <p>
          {formattedDate}
          {formattedTime}
        </p>
        {isReviewed ? (
          <p>
            <strong>Review:</strong>

            {review ? (
              <span
                className={styles.comment}
                onClick={() => handleCommentClick(review.comment)}
                title="Click to view full comment"
              >
                {review.comment.length > 30
                  ? review.comment.substring(0, 30) + "..."
                  : review.comment}
              </span>
            ) : (
              "Loading..."
            )}
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
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <p>{selectedComment}</p>
        </Modal>
      )}
    </div>
  );
};

export default Card;
