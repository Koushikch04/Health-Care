import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { baseURL } from "../../api/api";
import Pagination from "../DoctorListPagination/Pagination.jsx";
import Modal from "../UI/Modal/Modal.jsx";
import styles from "./Users.module.css";

function Users() {
  const { userToken: token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5); // Customize the number of users per page
  const [searchName, setSearchName] = useState("");
  const [filterGender, setFilterGender] = useState("All");
  const [ageRange, setAgeRange] = useState("All");
  const [status, setStatus] = useState("All");
  const [registrationDate, setRegistrationDate] = useState("All");

  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: currentYear - 2024 + 1 },
    (_, i) => 2024 + i
  );

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = currentDate.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${baseURL}/admin/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.users);
        setFilteredUsers(data.users);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // Filter users by name, gender, age range, status, and registration date
  const handleFilterChange = () => {
    const filtered = users.filter((user) => {
      const matchesName = `${user.name.firstName} ${user.name.lastName}`
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const matchesGender =
        filterGender === "All" || user.gender === filterGender;
      const userAge = calculateAge(user.dob);
      let matchesAge = false;
      if (ageRange === "All") {
        matchesAge = true;
      } else {
        const [minAge, maxAge] = ageRange.split("-").map(Number);

        matchesAge = userAge >= minAge && (maxAge ? userAge <= maxAge : true);
      }
      const userStatus = user.appointmentCount > 0 ? "Active" : "Inactive";

      const matchesStatus = status === "All" || status === userStatus;

      const matchesRegistrationDate =
        registrationDate === "All" ||
        new Date(user.createdAt).getFullYear() === parseInt(registrationDate);

      return (
        matchesName &&
        matchesGender &&
        matchesAge &&
        matchesStatus &&
        matchesRegistrationDate
      );
    });
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstPost, indexOfLastPost);

  // Open modal with full user details
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.UsersContainer}>
      <div className={styles.filterSection}>
        <div className={styles.filterItem}>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <div className={styles.filterItem}>
          <label>Gender:</label>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className={styles.filterItem}>
          <label>Age Range:</label>
          <select
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
          >
            <option value="All">All</option>
            <option value="18-30">18-30</option>
            <option value="31-45">31-45</option>
            <option value="46-60">46-60</option>
            <option value="60+">60+</option>
          </select>
        </div>
        <div className={styles.filterItem}>
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className={styles.filterItem}>
          <label>Registration Year:</label>
          <select
            value={registrationDate}
            onChange={(e) => setRegistrationDate(e.target.value)}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleFilterChange}>Apply Filters</button>
      </div>

      {loading && <p className={styles.loading}>Loading users...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && (
        <div>
          <div className={styles.users}>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <div key={user._id} className={styles.userCard}>
                  <img
                    src={`${baseURL}/${user.profileImage}`}
                    alt={`${user.name.firstName}'s profile`}
                    className={styles.profileImage}
                  />
                  <div className={styles.userInfo}>
                    <p className={styles.name}>
                      {user.name.firstName} {user.name.lastName}
                    </p>
                    <p className={styles.email}>{user.email}</p>
                    <p className={styles.dob}>
                      {new Date(user.dob).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={styles.userActions}>
                    <button
                      onClick={() => handleUserClick(user)}
                      className={styles.viewDetailsButton}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noUsers}>No users found.</p>
            )}
          </div>
          <Pagination
            totalPosts={filteredUsers.length}
            postsPerPage={postsPerPage}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      )}

      {/* Modal to display the full user details */}
      {isModalOpen && selectedUser && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className={styles.modalContent}>
            <h2>
              {selectedUser.name.firstName} {selectedUser.name.lastName}
            </h2>
            <div>
              <table>
                <tbody>
                  <tr>
                    <th>Email</th>
                    <td>{selectedUser.email}</td>
                  </tr>
                  <tr>
                    <th>Gender</th>
                    <td>{selectedUser.gender}</td>
                  </tr>
                  <tr>
                    <th>Date of Birth</th>
                    <td>{new Date(selectedUser.dob).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <th>No of Appointments</th>
                    <td>{selectedUser.appointmentCount}</td>
                  </tr>
                </tbody>
              </table>
              <img
                src={`${baseURL}/${selectedUser.profileImage}`}
                alt={`${selectedUser.name.firstName}'s profile`}
                className={styles.profileImage}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Users;
