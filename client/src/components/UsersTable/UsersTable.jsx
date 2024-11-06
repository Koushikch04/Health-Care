import { useState, useEffect } from "react";
import Card from "./Card";
import SearchBar from "./SearchBar";
import Filters from "./Filters";
import Pagination from "../DoctorListPagination/Pagination";
import Modal from "../UI/Modal/Modal";
import styles from "./UsersTable.module.css";
import { useSelector } from "react-redux";
import { baseURL } from "../../api/api";

const UsersTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({ specialty: "", review: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { userInfo, userToken: token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `${baseURL}/appointment?status=completed`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const appointmentData = await response.json();
        console.log(appointmentData);

        setAppointments(appointmentData);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    };
    fetchAppointments();
  }, [userInfo, token]);

  const searchTable = (newSearchValue) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  };

  const filteredAppointments = appointments
    .filter((appointment) =>
      appointment.doctor.name.firstName
        .toLowerCase()
        .includes(searchValue.toLowerCase())
    )
    .filter(
      (appointment) =>
        !filters.specialty ||
        appointment.doctor.specialty.name === filters.specialty
    )
    .filter(
      (appointment) =>
        !filters.review ||
        appointment.reviewed === (filters.review === "Reviewed")
    );

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredAppointments.slice(
    indexOfFirstPost,
    indexOfLastPost
  );

  const openReviewModal = (reviewId, handleReviewSubmission) => {
    setSelectedAppointmentId(reviewId);
    setShowModal(true);
  };

  const closeReviewModal = () => {
    setShowModal(false);
    setSelectedAppointmentId(null);
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    const reviewText = event.target.elements.reviewText.value;
    const appointment = appointments.find(
      (appt) => appt._id === selectedAppointmentId
    );

    if (!appointment) return;

    try {
      const response = await fetch(`${baseURL}/review/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: appointment.doctor._id,
          appointmentId: selectedAppointmentId,
          userId: appointment.user,
          rating: 3,
          comment: reviewText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      const newReview = await response.json();

      // Pass the new review to the parent component
      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt._id === selectedAppointmentId
            ? { ...appt, reviewed: true, review: newReview }
            : appt
        )
      );

      closeReviewModal();
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Something went wrong while submitting your review.");
    }
  };

  return (
    <div className={styles.tableContainer}>
      <SearchBar searchTable={searchTable} />
      <Filters filterOptions={filters} setFilters={setFilters} />
      <div className={styles.cardContainer}>
        {currentPosts.map((appointment) => (
          <Card
            key={appointment._id}
            appointment={appointment}
            openReviewModal={openReviewModal}
            updateAppointmentReview={(id, newReview) =>
              setAppointments((prevAppointments) =>
                prevAppointments.map((appt) =>
                  appt._id === id ? { ...appt, review: newReview } : appt
                )
              )
            }
          />
        ))}
      </div>
      <div className={styles.paginationContainer}>
        <Pagination
          totalPosts={filteredAppointments.length}
          postsPerPage={postsPerPage}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
      {showModal && (
        <Modal onClose={closeReviewModal}>
          <h2>Give Review</h2>
          <form onSubmit={handleReviewSubmit}>
            <textarea name="reviewText" placeholder="Enter your review" />
            <button type="submit">Submit Review</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UsersTable;
