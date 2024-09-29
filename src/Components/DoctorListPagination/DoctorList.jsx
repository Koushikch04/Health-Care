import React from "react";
import DoctorCard from "./DoctorCard";
import styles from "./DoctorList.module.css";

const DoctorList = ({ doctorData }) => {
  return (
    <div className={styles.doctor_list}>
      {doctorData.map((doctor, index) => {
        return (
          <DoctorCard
            key={index}
            image={doctor.image}
            name={doctor.name}
            experience={doctor.experience}
            rating={doctor.rating}
            profile={doctor.profile}
          />
        );
      })}
    </div>
  );
};

export default DoctorList;