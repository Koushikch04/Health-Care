// AvailableDoctors.js
import React, { useEffect, useState } from "react";
import DoctorList from "./DoctorList";
import Pagination from "./Pagination";
import styles from "./AvailableDoctors.module.css";

const AvailableDoctors = ({ doctorData, selectedSpecialty }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);

  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentPosts = doctorData.slice(firstPostIndex, lastPostIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSpecialty]);

  return (
    <div className={styles.app}>
      <h1>
        {doctorData.length} doctors available in {selectedSpecialty}
      </h1>
      <h3 style={{ color: "#777" }}>
        Book Appointments with minimum wait time & verified doctor details
      </h3>
      <DoctorList doctorData={currentPosts} />
      <Pagination
        totalPosts={doctorData.length}
        postsPerPage={postsPerPage}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
      />
    </div>
  );
};

export default AvailableDoctors;
