import React, { useContext, useState } from "react";
import useAlert from "../../hooks/useAlert";
import styles from "./AppointmentForm.module.css";
import cardStyles from "../DoctorListPagination/DoctorCard.module.css";

const AppointmentForm = ({
  image,
  name,
  experience,
  rating,
  profile,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
  });

  const alert = useAlert();

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
    alert.success("Appointment booked successfully!");
  };

  return (
    <div className={styles.appointment_form}>
      <h2>Book an Appointment</h2>
      <div className={styles.details_booking}>
        <div className={styles.details}>
          <div className={cardStyles.card_image}>
            <img src={image} alt={`${name}`} />
          </div>
          <div className={cardStyles.card_info}>
            <h2>{name}</h2>
            <h3>{experience} years of experience</h3>
            <p className={cardStyles.rating}>Rating: {rating}</p>
            <p>{profile}</p>
          </div>
        </div>
        <form className={styles.form_group} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="phone">Phone Number:</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="date">Date of Appointment:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="time">Book Time Slot:</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className={styles.book_button}>
            Book Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;