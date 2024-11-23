import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { baseURL } from "../../api/api";
import Pagination from "../DoctorListPagination/Pagination.jsx";
import Modal from "../UI/Modal/Modal.jsx"; // Import the Modal component
import styles from "./DoctorReview.module.css";
import TableSpinner from "../Spinners/TableSpinner.jsx";

function DoctorReview() {
  const { userInfo, userToken: token } = useSelector((state) => state.auth);
  const doctorId = userInfo._id;
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState("");

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5); // Customize the number of reviews per page
  const [selectedRating, setSelectedRating] = useState("All");

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${baseURL}/review/doctor/${doctorId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch reviews");
        }

        const data = await response.json();
        setReviews(data);
        setFilteredReviews(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchReviews();
    }
  }, [doctorId, token]);

  // Filter reviews by rating
  const handleFilterChange = (rating) => {
    setSelectedRating(rating);
    setCurrentPage(1);
    if (rating === "All") {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(
        reviews.filter((review) => review.rating === parseInt(rating))
      );
    }
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentReviews = filteredReviews.slice(
    indexOfFirstPost,
    indexOfLastPost
  );

  // Open modal with full comment
  const handleCommentClick = (comment) => {
    setSelectedComment(comment);
    setIsModalOpen(true);
  };

  if (loading)
    return (
      <div className={styles.spinnerContainer}>
        <TableSpinner message="loading reviews..." />
      </div>
    );

  return (
    <div className={styles.doctorReviewContainer}>
      <div className={styles.filterSection}>
        <label>Filter by Rating: </label>
        <select
          value={selectedRating}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="All">All</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {loading && <p className={styles.loading}>Loading reviews...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && (
        <div>
          {currentReviews.length > 0 ? (
            currentReviews.map((review) => (
              <div key={review._id} className={styles.review}>
                <p>
                  <strong>
                    {review.user.name.firstName +
                      " " +
                      review.user.name.lastName}
                    :
                  </strong>{" "}
                  <span
                    className={styles.comment}
                    onClick={() => handleCommentClick(review.comment)}
                    title="Click to view full comment"
                  >
                    {review.comment.length > 100
                      ? review.comment.substring(0, 100) + "..."
                      : review.comment}
                  </span>
                </p>
                <p className={styles.rating}>Rating: {review.rating}</p>
              </div>
            ))
          ) : (
            <p className={styles.noReviews}>
              No reviews available for this doctor.
            </p>
          )}
          <Pagination
            totalPosts={filteredReviews.length}
            postsPerPage={postsPerPage}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      )}

      {/* Modal to display the full comment */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <p>{selectedComment}</p>
        </Modal>
      )}
    </div>
  );
}

export default DoctorReview;
