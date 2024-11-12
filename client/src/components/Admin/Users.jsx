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
  const [createEditModal, setCreateEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(4);
  const [searchName, setSearchName] = useState("");
  const [filterGender, setFilterGender] = useState("All");
  const [ageRange, setAgeRange] = useState("All");
  const [status, setStatus] = useState("All");
  const [registrationDate, setRegistrationDate] = useState("All");

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    dob: "",
    password: "",
    phone: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);

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
      console.log(data);

      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleSaveUser = async () => {
    const url = isEditMode
      ? `${baseURL}/admin/user/${selectedUser._id}`
      : `${baseURL}/admin/user`;

    const method = isEditMode ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) throw new Error("Failed to save user");

      await fetchUsers();
      // setIsModalOpen(false);
      setCreateEditModal(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        gender: "",
        dob: "",
        contact: "",
        password: "",
      });
      setIsEditMode(false);
    } catch (error) {
      setError(error.message);
    }
  };

  // Open modal with user form for editing or adding
  const handleOpenModal = (user = null) => {
    console.log(user);

    if (user) {
      setSelectedUser(user);
      setNewUser({
        firstName: user.name.firstName,
        lastName: user.name.lastName,
        email: user.email,
        gender: user.gender,
        dob: user.dob,
        contact: user.contact.phone,
      });
      setIsEditMode(true);
    } else {
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        gender: "",
        dob: "",
        contact: "",
      });
      setIsEditMode(false);
    }
    setCreateEditModal(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`${baseURL}/admin/user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete user");

      await fetchUsers();
      // setCurrentPage(1);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.UsersContainer}>
      <h2 className={styles.title}>Users Management</h2>
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
            <option value="All">All</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button className={styles.applyButton} onClick={handleFilterChange}>
          Apply Filters
        </button>
      </div>
      <button
        style={{ marginBottom: "10px" }}
        onClick={() => handleOpenModal()}
      >
        {" "}
        + Add New User
      </button>

      {createEditModal && (
        <Modal onClose={() => setCreateEditModal(false)}>
          <div className={styles.modalContent}>
            <h2>{isEditMode ? "Edit User" : "Add New User"}</h2>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  // placeholder="First Name"
                  value={newUser.firstName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, firstName: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  // placeholder="Last Name"
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, lastName: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  // placeholder="Email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>

              {!isEditMode && (
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    // placeholder="Email"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                </div>
              )}

              {!isEditMode && (
                <div className={styles.formGroup}>
                  <label htmlFor="phone">phone</label>
                  <input
                    id="contect"
                    // placeholder="Email"
                    value={newUser.phone}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone: e.target.value })
                    }
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  value={newUser.gender}
                  onChange={(e) =>
                    setNewUser({ ...newUser, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="dob">Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  placeholder="Date of Birth"
                  value={
                    newUser.dob
                      ? new Date(newUser.dob).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setNewUser({ ...newUser, dob: e.target.value })
                  }
                />
              </div>

              <button
                type="button"
                className={styles.button}
                onClick={handleSaveUser}
              >
                {isEditMode ? "Update User" : "Add User"}
              </button>
            </form>
          </div>
        </Modal>
      )}

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
                    <button onClick={() => handleOpenModal(user)}>Edit</button>
                    <button onClick={() => handleDeleteUser(user._id)}>
                      Delete
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
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Users;
