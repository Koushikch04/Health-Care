import React, { useState } from "react";
import Modal from "../UI/Modal/Modal";
import styles from "./DoctorCard.module.css";
import AppointmentForm from "../AppointmentForm/AppointmentForm";

const DoctorCard = ({ image, name, experience, rating, profile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModalHandler = () => {
    setIsModalOpen(true);
  };

  const closeModalHandler = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.card_image}>
        <img src={image} alt={`${name}`} />
      </div>
      <div className={styles.card_info}>
        <h2>{name}</h2>
        <h3>{experience} years of experience</h3>
        <p className={styles.rating}>Rating: {rating}</p>
      </div>
      <div className={styles.card_button}>
        <button onClick={openModalHandler}>
          <p>Book Appointment</p>
          <span>No Booking Fee</span>
        </button>
      </div>
      {isModalOpen && (
        <Modal onClose={closeModalHandler}>
          <AppointmentForm
            image={image}
            name={name}
            experience={experience}
            rating={rating}
            profile={profile}
            onSubmit={closeModalHandler}
          />
        </Modal>
      )}
    </div>
  );
};

export default DoctorCard;
