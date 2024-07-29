import Modal from "../UI/Modal/Modal";
import Pagination from "../DoctorListPagination/Pagination";
import React, { useState } from "react";
import "./UsersTable.css";

const Card = ({ user, openReviewModal }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{user.name}</h3>
        <p className="card-speciality">{user.speciality}</p>
      </div>
      <div className="card-body">
        <p>
          <strong>Review:</strong> {user.review || "No Review Provided"}
        </p>
        {!user.review && (
          <button onClick={() => openReviewModal(user.id)}>Give Review</button>
        )}
      </div>
    </div>
  );
};

const SearchBar = ({ searchTable }) => {
  const [searchValue, setSearchValue] = useState("");
  const submitForm = (e) => {
    e.preventDefault();
    searchTable(searchValue);
  };
  return (
    <div className="search-bar">
      <form onSubmit={submitForm}>
        <input
          type="text"
          placeholder="Search by Name..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </form>
    </div>
  );
};

const Filters = ({ filterOptions, setFilters }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className="filters">
      <label>
        Speciality:
        <select name="speciality" onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="Cardiologist">Cardiologist</option>
          <option value="Neurologist">Neurologist</option>
          <option value="Pediatrician">Pediatrician</option>
          <option value="Orthopedic">Orthopedic</option>
          <option value="Dermatologist">Dermatologist</option>
          <option value="Gynecologist">Gynecologist</option>
          <option value="Oncologist">Oncologist</option>
          <option value="Urologist">Urologist</option>
        </select>
      </label>
      <label>
        Review:
        <select name="review" onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="Excellent">Excellent</option>
          <option value="Very Good">Very Good</option>
          <option value="Good">Good</option>
          <option value="Satisfactory">Satisfactory</option>
          <option value="No Review Provided">No Review Provided</option>
        </select>
      </label>
    </div>
  );
};

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
  { id: 7, name: "Emily Clark", speciality: "Oncologist", review: "Excellent" },
  { id: 8, name: "Frank Wilson", speciality: "Urologist", review: "" },
];

const UsersTable = () => {
  const [users, setUsers] = useState(dummyData);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({ speciality: "", review: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4; // Number of items per page
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const searchTable = (newSearchValue) => {
    setSearchValue(newSearchValue);
    setCurrentPage(1); // Reset to the first page when searching
  };

  const filteredUsers = users
    .filter((user) =>
      user.name.toLowerCase().includes(searchValue.toLowerCase())
    )
    .filter(
      (user) => !filters.speciality || user.speciality === filters.speciality
    )
    .filter((user) => !filters.review || user.review === filters.review);

  // Pagination logic
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
    <div className="table-container">
      <SearchBar searchTable={searchTable} />
      <Filters filterOptions={filters} setFilters={setFilters} />
      <div className="card-container">
        {currentPosts.map((user) => (
          <Card key={user.id} user={user} openReviewModal={openReviewModal} />
        ))}
      </div>
      <Pagination
        totalPosts={filteredUsers.length}
        postsPerPage={postsPerPage}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
      />
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
