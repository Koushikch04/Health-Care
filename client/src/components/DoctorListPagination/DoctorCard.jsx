import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Modal from "../UI/Modal/Modal";
import styles from "./DoctorCard.module.css";
import AppointmentForm from "../AppointmentForm/AppointmentForm";

const DoctorCard = ({
  doctorId,
  image,
  name,
  experience,
  rating,
  profile,
  cost,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const userLoggedIn = useSelector((state) => state.auth.userLoggedIn);

  const openModalHandler = () => {
    if (!userLoggedIn) {
      navigate("/auth/login?redirect=/appointments");
      return;
    }
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
        <p>Fees: {cost}</p>
      </div>
      <div className={styles.card_button}>
        <button onClick={openModalHandler}>
          <p>{userLoggedIn ? "Book Appointment" : "Login to Book"}</p>
          <span>{userLoggedIn ? "No Booking Fee" : "Secure booking"}</span>
        </button>
      </div>
      {isModalOpen && (
        <Modal onClose={closeModalHandler}>
          <AppointmentForm
            doctorId={doctorId}
            image={image}
            name={name}
            experience={experience}
            rating={rating}
            profile={profile}
            cost={cost}
            onSubmit={closeModalHandler}
          />
        </Modal>
      )}
    </div>
  );
};

export default DoctorCard;
