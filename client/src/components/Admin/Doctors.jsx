import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { baseURL, fetchJson, fetchWithTimeout } from "../../api/api";
import Pagination from "../DoctorListPagination/Pagination.jsx";
import Modal from "../UI/Modal/Modal.jsx";
import styles from "./Doctors.module.css";
import ErrorState from "../UI/States/ErrorState";
import EmptyState from "../UI/States/EmptyState";
import CardListSkeleton from "../UI/States/CardListSkeleton";

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

  const fetchSpecializations = useCallback(async () => {
    const result = await fetchJson(
      `${baseURL}/specialty/`,
      {},
      { timeoutMs: 12000, errorMessage: "Failed to load specializations." },
    );

    setUniqueSpecializations(Array.isArray(result) ? result : []);
  }, []);

  const fetchDoctors = useCallback(async () => {
    if (!token) {
      setDoctors([]);
      setFilteredDoctors([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchJson(
        `${baseURL}/admin/doctors`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
        { timeoutMs: 15000, errorMessage: "Failed to fetch doctors." },
      );

      setDoctors(data?.doctors || []);
      setFilteredDoctors(data?.doctors || []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadDoctorsScreen = useCallback(async () => {
    setError(null);
    try {
      await Promise.all([fetchDoctors(), fetchSpecializations()]);
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [fetchDoctors, fetchSpecializations]);

  useEffect(() => {
    loadDoctorsScreen();
  }, [loadDoctorsScreen]);

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
        doctor.experience >= parseInt(yearsOfExperience, 10);
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

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstPost, indexOfLastPost);

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
    const previousDoctors = doctors;
    const previousFilteredDoctors = filteredDoctors;

    setDoctors((prev) => prev.filter((doc) => doc._id !== doctorId));
    setFilteredDoctors((prev) => prev.filter((doc) => doc._id !== doctorId));

    try {
      const response = await fetchWithTimeout(
        `${baseURL}/admin/doctor/${doctorId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
        15000,
      );
      if (!response.ok) throw new Error("Failed to delete doctor");
    } catch (deleteError) {
      setDoctors(previousDoctors);
      setFilteredDoctors(previousFilteredDoctors);
      setError(deleteError.message);
    }
  };

  const handleSaveDoctor = async () => {
    const url = isEditMode
      ? `${baseURL}/admin/doctor/${selectedDoctor._id}`
      : `${baseURL}/admin/doctor`;

    const method = isEditMode ? "PUT" : "POST";
    const previousDoctors = doctors;
    const previousFilteredDoctors = filteredDoctors;

    const specializationName =
      uniqueSpecializations.find((spec) => spec._id === newDoctor.specialty)
        ?.name ||
      selectedDoctor?.specialization ||
      "";

    if (isEditMode) {
      const optimisticUpdatedDoctor = {
        ...selectedDoctor,
        name: {
          firstName: newDoctor.firstName,
          lastName: newDoctor.lastName,
        },
        email: newDoctor.email,
        gender: newDoctor.gender,
        specialization: specializationName || selectedDoctor?.specialization,
      };

      setDoctors((prev) =>
        prev.map((doctor) =>
          doctor._id === selectedDoctor._id ? optimisticUpdatedDoctor : doctor,
        ),
      );
      setFilteredDoctors((prev) =>
        prev.map((doctor) =>
          doctor._id === selectedDoctor._id ? optimisticUpdatedDoctor : doctor,
        ),
      );
    } else {
      const optimisticDoctor = {
        _id: `temp-${Date.now()}`,
        name: {
          firstName: newDoctor.firstName,
          lastName: newDoctor.lastName,
        },
        email: newDoctor.email,
        gender: newDoctor.gender,
        specialization: specializationName,
        experience: Number(newDoctor.experience || 0),
        appointmentCount: 0,
        registrationStatus: "approved",
      };

      setDoctors((prev) => [optimisticDoctor, ...prev]);
      setFilteredDoctors((prev) => [optimisticDoctor, ...prev]);
    }

    setCreateEditModal(false);
    setNewDoctor(initialDoctorValue);
    setIsEditMode(false);

    try {
      const response = await fetchWithTimeout(
        url,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newDoctor),
        },
        15000,
      );

      if (!response.ok) throw new Error("Failed to save user");
      await fetchDoctors();
    } catch (saveError) {
      setDoctors(previousDoctors);
      setFilteredDoctors(previousFilteredDoctors);
      setError(saveError.message);
    }
  };

  return (
    <div className={styles.DoctorsContainer}>
      <h2 className={styles.title}>Doctors Management</h2>
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
            {uniqueSpecializations.map((spec) => (
              <option key={spec._id} value={spec.name}>
                {spec.name}
              </option>
            ))}
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
        <div className={styles.filterActions}>
          <button onClick={handleFilterChange}>Apply Filters</button>
          <button
            className={styles.addDoctorButton}
            onClick={() => handleEditDoctor()}
          >
            + Add New Doctor
          </button>
        </div>
      </div>

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
                  onChange={(e) =>
                    setNewDoctor({
                      ...newDoctor,
                      firstName: e.target.value,
                    })
                  }
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
                  <label htmlFor="phone">Phone</label>
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
                  <label htmlFor="experience">Experience</label>
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
                  <label htmlFor="cost">Cost</label>
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
                <label htmlFor="specialty">Specialty</label>
                <select
                  id="specialty"
                  value={newDoctor.specialty}
                  onChange={(e) =>
                    setNewDoctor({
                      ...newDoctor,
                      specialty: e.target.value,
                    })
                  }
                >
                  <option value="">Select Specialty</option>
                  {uniqueSpecializations.map((spec) => (
                    <option key={spec._id} value={spec._id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>
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

      {error && !createEditModal && !isModalOpen && (
        <ErrorState
          title="Could not load doctors"
          message={error}
          onRetry={loadDoctorsScreen}
        />
      )}

      {!error && loading && (
        <div className={styles.spinnerContainer}>
          <CardListSkeleton rows={4} />
        </div>
      )}

      {!loading && !error && (
        <div className={styles.resultsSection}>
          <div className={styles.doctors}>
            {currentDoctors.length > 0 ? (
              currentDoctors.map((doctor) => (
                <div key={doctor._id} className={styles.doctorCard}>
                  <img
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
              <EmptyState
                title="No doctors found"
                message="Try changing filters or add a new doctor."
              />
            )}
          </div>
          <div className={styles.paginationWrap}>
            <Pagination
              totalPosts={filteredDoctors.length}
              postsPerPage={postsPerPage}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
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
