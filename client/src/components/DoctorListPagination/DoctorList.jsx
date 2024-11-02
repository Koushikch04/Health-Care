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
            doctorId={doctor.id}
            image={doctor.image}
            name={doctor.name.firstName + " " + doctor.name.lastName}
            experience={doctor.experience}
            rating={doctor.rating}
            profile={doctor.profile}
            cost={doctor.cost}
          />
        );
      })}
    </div>
  );
};

export default DoctorList;
