import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { baseURL } from "../../api/api";
import Pagination from "../DoctorListPagination/Pagination.jsx";
import Modal from "../UI/Modal/Modal.jsx";
import styles from "./Doctors.module.css";

function Doctors() {
  const { userToken: token } = useSelector((state) => state.auth);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [uniqueSpecializations, setUniqueSpecializations] = useState([]);

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(4); // Customize the number of doctors per page
  const [searchName, setSearchName] = useState("");
  const [filterGender, setFilterGender] = useState("All");
  const [specialization, setSpecialization] = useState("All");
  const [yearsOfExperience, setYearsOfExperience] = useState("All");
  const [status, setStatus] = useState("All");

  const currentYear = new Date().getFullYear();

  useEffect(() => {
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
        console.log(data);

        setDoctors(data.doctors);
        setFilteredDoctors(data.doctors);

        const specializations = Array.from(
          new Set(data.doctors.map((doctor) => doctor.specialization))
        );
        setUniqueSpecializations(specializations);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
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
            {uniqueSpecializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
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
        <button onClick={handleFilterChange}>Apply Filters</button>
      </div>

      {loading && <p className={styles.loading}>Loading doctors...</p>}
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

      {/* Modal to display the full doctor details */}
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
