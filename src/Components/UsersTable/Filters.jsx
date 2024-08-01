import React from "react";
import styles from "./Filters.module.css";

const Filters = ({ filterOptions, setFilters }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className={styles.filters}>
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

export default Filters;
