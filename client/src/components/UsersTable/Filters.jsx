import React, { useEffect, useState } from "react";
import styles from "./Filters.module.css";

const Filters = ({ appointments, filters, setFilters, setCurrentPage }) => {
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    // Extract unique specialties from appointments and store them in state
    const uniqueSpecialties = Array.from(
      new Set(
        appointments.map((appointment) => appointment.doctor.specialty.name)
      )
    );
    setSpecialties(uniqueSpecialties);
  }, [appointments]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  return (
    <div className={styles.filters}>
      {/* Specialty Filter */}
      <label>
        Specialty:
        <select
          name="specialty"
          value={filters.specialty}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          {specialties.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>
      </label>

      {/* Date Sorting Filter */}
      <label>
        Sort by Date:
        <select
          name="dateSort"
          value={filters.dateSort}
          onChange={handleFilterChange}
        >
          <option value="">Default</option>
          <option value="asc">Oldest to Newest</option>
          <option value="desc">Newest to Oldest</option>
        </select>
      </label>

      {/* Reviewed/Unreviewed Filter */}
      <label>
        Review Status:
        <select
          name="reviewStatus"
          value={filters.reviewStatus}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          <option value="reviewed">Reviewed</option>
          <option value="unreviewed">Unreviewed</option>
        </select>
      </label>
    </div>
  );
};

export default Filters;
