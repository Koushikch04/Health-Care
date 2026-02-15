import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { baseURL } from "../../api/api";
import Pagination from "../DoctorListPagination/Pagination.jsx";
import Modal from "../UI/Modal/Modal.jsx";
import styles from "./Users.module.css";
import TableSpinner from "../Spinners/TableSpinner.jsx";

const createUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Enter a valid email."),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select a gender." }),
  }),
  dob: z.string().min(1, "Date of birth is required."),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || (/^[0-9]+$/.test(value) && value.length >= 7 && value.length <= 15),
      "Phone number must be 7-15 digits.",
    ),
});

const editUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Enter a valid email."),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select a gender." }),
  }),
  dob: z.string().min(1, "Date of birth is required."),
});

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

  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(isEditMode ? editUserSchema : createUserSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      gender: "",
      dob: "",
      password: "",
      phone: "",
    },
  });

  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: currentYear - 2024 + 1 },
    (_, i) => 2024 + i,
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

  const handleSaveUser = async (formData) => {
    const url = isEditMode
      ? `${baseURL}/admin/user/${selectedUser._id}`
      : `${baseURL}/admin/user`;

    const method = isEditMode ? "PUT" : "POST";
    const payload = isEditMode
      ? {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          gender: formData.gender,
          dob: formData.dob,
        }
      : {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          gender: formData.gender,
          dob: formData.dob,
          phone: formData.phone,
        };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error || "Failed to save user";
        setFormError("root.serverError", { type: "server", message });
        return;
      }

      await fetchUsers();
      // setIsModalOpen(false);
      setCreateEditModal(false);
      reset({
        firstName: "",
        lastName: "",
        email: "",
        gender: "",
        dob: "",
        phone: "",
        password: "",
      });
      setIsEditMode(false);
    } catch (error) {
      setFormError("root.serverError", {
        type: "server",
        message: error.message || "Failed to save user",
      });
    }
  };

  // Open modal with user form for editing or adding
  const handleOpenModal = (user = null) => {
    console.log(user);

    if (user) {
      setSelectedUser(user);
      reset({
        firstName: user.name.firstName,
        lastName: user.name.lastName,
        email: user.email,
        gender: user.gender,
        dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
        phone: "",
        password: "",
      });
      setIsEditMode(true);
    } else {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        gender: "",
        dob: "",
        phone: "",
        password: "",
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
            <form className={styles.form} onSubmit={handleSubmit(handleSaveUser)}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <span className={styles.formError}>{errors.firstName.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <span className={styles.formError}>{errors.lastName.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                />
                {errors.email && (
                  <span className={styles.formError}>{errors.email.message}</span>
                )}
              </div>

              {!isEditMode && (
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <span className={styles.formError}>{errors.phone.message}</span>
                  )}
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="gender">Gender</label>
                <select id="gender" {...register("gender")}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <span className={styles.formError}>{errors.gender.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="dob">Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  {...register("dob")}
                />
                {errors.dob && (
                  <span className={styles.formError}>{errors.dob.message}</span>
                )}
              </div>
              {errors.root?.serverError && (
                <p className={styles.formError}>{errors.root.serverError.message}</p>
              )}

              <button
                type="submit"
                className={styles.button}
                disabled={!isValid || isSubmitting}
              >
                {isEditMode ? "Update User" : "Create & Send Invite"}
              </button>
            </form>
          </div>
        </Modal>
      )}

      {loading && (
        <div className={styles.spinnerContainer}>
          <TableSpinner message="Loading Users..." />
        </div>
      )}
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
