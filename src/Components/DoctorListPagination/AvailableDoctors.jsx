import React from "react";
import DoctorList from "./DoctorList";
import Pagination from "./Pagination";
import "./AvailableDoctors.css";

const AvailableDoctors = ({ doctorData }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [postsPerPage] = React.useState(6);

  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentPosts = doctorData.slice(firstPostIndex, lastPostIndex);

  return (
    <div className="app">
      <h1>{doctorData.length} doctors available</h1>
      <h3>
        Book Appointments with minimum wait time & verified doctor details
      </h3>
      <DoctorList doctorData={currentPosts} />
      <div className="current">
        <Pagination
          totalPosts={doctorData.length}
          postsPerPage={postsPerPage}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default AvailableDoctors;
