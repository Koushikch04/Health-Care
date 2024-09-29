import React, { useState } from "react";
import Card from "./Card";
import SearchBar from "./SearchBar";
import Filters from "./Filters";
import Pagination from "../DoctorListPagination/Pagination";
import Modal from "../UI/Modal/Modal";
import styles from "./UsersTable.module.css";

const dummyData = [
  { id: 1, name: "John Doe", speciality: "Cardiologist", review: "Excellent" },
  { id: 2, name: "Jane Smith", speciality: "Neurologist", review: "" },
  {
    id: 3,
    name: "Alice Johnson",
    speciality: "Pediatrician",
    review: "Very Good",
  },
  { id: 4, name: "Bob Brown", speciality: "Orthopedic", review: "Good" },
  { id: 5, name: "Charlie Davis", speciality: "Dermatologist", review: "" },
  {
    id: 6,
    name: "Diana Moore",
    speciality: "Gynecologist",
    review: "Satisfactory",
  },
  // { id: 7, name: "Emily Clark", speciality: "Oncologist", review: "Excellent" },
  // { id: 8, name: "Frank Wilson", speciality: "Urologist", review: "" },
];

const UsersTable = () => {
  const [users, setUsers] = useState(dummyData);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({ speciality: "", review: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const searchTable = (newSearchValue) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1);
  };

  const filteredUsers = users
    .filter((user) =>
      user.name.toLowerCase().includes(searchValue.toLowerCase())
    )
    .filter(
      (user) => !filters.speciality || user.speciality === filters.speciality
    )
    .filter((user) => !filters.review || user.review === filters.review);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredUsers.slice(indexOfFirstPost, indexOfLastPost);

  const openReviewModal = (userId) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const closeReviewModal = () => {
    setShowModal(false);
    setSelectedUserId(null);
  };

  const handleReviewSubmit = () => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === selectedUserId
          ? { ...user, review: "Temporary Review" }
          : user
      )
    );
    closeReviewModal();
  };

  return (
    <div className={styles.tableContainer}>
      <SearchBar searchTable={searchTable} />
      <Filters filterOptions={filters} setFilters={setFilters} />
      <div className={styles.cardContainer}>
        {currentPosts.map((user) => (
          <Card key={user.id} user={user} openReviewModal={openReviewModal} />
        ))}
      </div>
      <div className={styles.paginationContainer}>
        <Pagination
          totalPosts={filteredUsers.length}
          postsPerPage={postsPerPage}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
      {showModal && (
        <Modal onClose={closeReviewModal}>
          <h2>Give Review</h2>
          <form>
            <textarea placeholder="Enter your review" />
            <button type="button" onClick={handleReviewSubmit}>
              Submit Review
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UsersTable;
