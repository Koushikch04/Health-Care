import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { baseURL } from "../../api/api";
import Pagination from "../DoctorListPagination/Pagination.jsx";
import Modal from "../UI/Modal/Modal.jsx";
import styles from "./Doctors.module.css";
import TableSpinner from "../Spinners/TableSpinner.jsx";

function Doctors() {
  const { userToken: token } = useSelector((state) => state.auth);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createEditModal, setCreateEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [uniqueSpecializations, setUniqueSpecializations] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(4);
  const [searchName, setSearchName] = useState("");
  const [filterGender, setFilterGender] = useState("All");
  const [specialization, setSpecialization] = useState("All");
  const [yearsOfExperience, setYearsOfExperience] = useState("All");
  const [status, setStatus] = useState("All");
  const initialDoctorValue = {
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    experience: "",
    cost: "",
    specialty: "",
    password: "",
    phone: "",
  };

  const [newDoctor, setNewDoctor] = useState(initialDoctorValue);

  const fetchSpecializations = async () => {
    try {
      const response = await fetch(`${baseURL}/specialty/`);
      const result = await response.json();

      setUniqueSpecializations(result);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseURL}/admin/doctors`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch doctors");
      }

      const data = await response.json();

      setDoctors(data.doctors);
      setFilteredDoctors(data.doctors);

      // const specializations = Array.from(
      //   new Set(data.doctors.map((doctor) => doctor.specialization))
      // );
      // setUniqueSpecializations(specializations);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, [token]);

  // Filter doctors by name, gender, specialization, experience, and status
  const handleFilterChange = () => {
    const filtered = doctors.filter((doctor) => {
      const matchesName = `${doctor.name.firstName} ${doctor.name.lastName}`
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const matchesGender =
        filterGender === "All" || doctor.gender === filterGender;
      const matchesSpecialization =
        specialization === "All" || doctor.specialization === specialization;
      const matchesExperience =
        yearsOfExperience === "All" ||
        doctor.experience >= parseInt(yearsOfExperience);
      const doctorStatus =
        doctor.registrationStatus === "approved" ? "Active" : "Inactive";
      const matchesStatus = status === "All" || status === doctorStatus;

      return (
        matchesName &&
        matchesGender &&
        matchesSpecialization &&
        matchesExperience &&
        matchesStatus
      );
    });
    setFilteredDoctors(filtered);
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstPost,
    indexOfLastPost
  );

  // Open modal with full doctor details
  const handleDoctorClick = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleEditDoctor = (doctor) => {
    if (doctor) {
      setSelectedDoctor(doctor);
      setNewDoctor({
        firstName: doctor.name.firstName,
        lastName: doctor.name.lastName,
        email: doctor.email,
        gender: doctor.gender,
      });
      setIsEditMode(true);
    } else {
      setNewDoctor(initialDoctorValue);
      setIsEditMode(false);
    }
    setCreateEditModal(true);
  };

  const handleDeleteDoctor = async (doctorId) => {
    try {
      const response = await fetch(`${baseURL}/admin/doctor/${doctorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to delete doctor");

      setDoctors(doctors.filter((doc) => doc._id !== doctorId));
      setFilteredDoctors(filteredDoctors.filter((doc) => doc._id !== doctorId));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSaveDoctor = async () => {
    const url = isEditMode
      ? `${baseURL}/admin/doctor/${selectedDoctor._id}`
      : `${baseURL}/admin/doctor`;

    const method = isEditMode ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDoctor),
      });

      if (!response.ok) throw new Error("Failed to save user");

      await fetchDoctors();
      // setIsModalOpen(false);
      setCreateEditModal(false);
      setNewDoctor(initialDoctorValue);
      setIsEditMode(false);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.DoctorsContainer}>
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
          <label>Specialization:</label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          >
            <option value="All">All</option>
            {uniqueSpecializations.map((spec) => {
              return (
                <option key={spec._id} value={spec.name}>
                  {spec.name}
                </option>
              );
            })}
          </select>
        </div>
        <div className={styles.filterItem}>
          <label>Years of Experience:</label>
          <select
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(e.target.value)}
          >
            <option value="All">All</option>
            <option value="1">1 year</option>
            <option value="2">2 years</option>
            <option value="5">5 years</option>
            <option value="10">10 years</option>
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
        <button onClick={handleFilterChange}>Apply Filters</button>
      </div>

      <button
        style={{ marginBottom: "10px" }}
        onClick={() => handleEditDoctor()}
      >
        + Add New Doctor
      </button>

      {createEditModal && (
        <Modal onClose={() => setCreateEditModal(false)}>
          <div className={styles.modalContent}>
            <h2>{isEditMode ? "Edit Doctor" : "Add New Doctor"}</h2>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={newDoctor.firstName}
                  onChange={(e) => {
                    return setNewDoctor({
                      ...newDoctor,
                      firstName: e.target.value,
                    });
                  }}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={newDoctor.lastName}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, lastName: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={newDoctor.email}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, email: e.target.value })
                  }
                />
              </div>
              {!isEditMode && (
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    value={newDoctor.password}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, password: e.target.value })
                    }
                  />
                </div>
              )}
              {!isEditMode && (
                <div className={styles.formGroup}>
                  <label htmlFor="phone">phone</label>
                  <input
                    id="contact"
                    value={newDoctor.phone}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, phone: e.target.value })
                    }
                  />
                </div>
              )}
              <div className={styles.formGroup}>
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  value={newDoctor.gender}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {!isEditMode && (
                <div className={styles.formGroup}>
                  <label htmlFor="experience">experience</label>
                  <input
                    id="experience"
                    value={newDoctor.experience}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, experience: e.target.value })
                    }
                  />
                </div>
              )}
              {!isEditMode && (
                <div className={styles.formGroup}>
                  <label htmlFor="cost">cost</label>
                  <input
                    id="cost"
                    value={newDoctor.cost}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, cost: e.target.value })
                    }
                  />
                </div>
              )}
              <div className={styles.formGroup}>
                <label htmlFor="specialty">specialty</label>
                <select
                  id="specialty"
                  value={newDoctor.specialty}
                  onChange={(e) => {
                    return setNewDoctor({
                      ...newDoctor,
                      specialty: e.target.value,
                    });
                  }}
                >
                  <option value="">Select Specialty</option>
                  {uniqueSpecializations.map((spec) => {
                    return (
                      <option key={spec._id} value={spec._id}>
                        {spec.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div></div>
              <button
                type="button"
                className={styles.button}
                onClick={handleSaveDoctor}
              >
                {isEditMode ? "Update User" : "Add User"}
              </button>
            </form>
          </div>
        </Modal>
      )}

      {loading && (
        <div className={styles.spinnerContainer}>
          <TableSpinner message="Loading doctors..." />
        </div>
      )}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && (
        <div>
          <div className={styles.doctors}>
            {currentDoctors.length > 0 ? (
              currentDoctors.map((doctor) => (
                <div key={doctor._id} className={styles.doctorCard}>
                  <img
                    // src={`${baseURL}/${doctor.profileImage}`}
                    src={`${baseURL}/uploads/1730269809274-win ltblue 1920x1200.jpg`}
                    alt={`${doctor.name.firstName}'s profile`}
                    className={styles.profileImage}
                  />
                  <div className={styles.doctorInfo}>
                    <p className={styles.name}>
                      {doctor.name.firstName} {doctor.name.lastName}
                    </p>
                    <p className={styles.email}>{doctor.email}</p>
                    <p className={styles.specialization}>
                      {doctor.specialization}
                    </p>
                    <p className={styles.experience}>
                      {doctor.experience} years experience
                    </p>
                  </div>
                  <div className={styles.doctorActions}>
                    <button
                      onClick={() => handleDoctorClick(doctor)}
                      className={styles.viewDetailsButton}
                    >
                      View Details
                    </button>
                    <button onClick={() => handleEditDoctor(doctor)}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteDoctor(doctor._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noDoctors}>No doctors found.</p>
            )}
          </div>
          <Pagination
            totalPosts={filteredDoctors.length}
            postsPerPage={postsPerPage}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      )}

      {isModalOpen && selectedDoctor && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className={styles.modalContent}>
            <h2>
              {selectedDoctor.name.firstName} {selectedDoctor.name.lastName}
            </h2>
            <div>
              <table>
                <tbody>
                  <tr>
                    <th>Email</th>
                    <td>{selectedDoctor.email}</td>
                  </tr>
                  <tr>
                    <th>Gender</th>
                    <td>{selectedDoctor.gender}</td>
                  </tr>
                  <tr>
                    <th>Specialization</th>
                    <td>{selectedDoctor.specialization}</td>
                  </tr>
                  <tr>
                    <th>Years of Experience</th>
                    <td>{selectedDoctor.experience} years</td>
                  </tr>
                </tbody>
              </table>
              <img
                // src={`${baseURL}/${selectedDoctor.profileImage}`}
                src={`${baseURL}/uploads/1730269809274-win ltblue 1920x1200.jpg`}
                alt={`${selectedDoctor.name.firstName}'s profile`}
                className={styles.profileImage}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Doctors;
