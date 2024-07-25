// src/AppointmentForm/AppointmentForm.js
import React, { useEffect, useState } from "react";
import "./AppointmentForm.css";
import Notification from "../UI/Notification/Notification";

const AppointmentForm = ({
  image,
  name,
  experience,
  rating,
  profile,
  onBooking,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
  });

  const [notificationMessage, setNotificationMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotificationMessage("Appointment booked successfully!");
  };
  useEffect(() => {
    if (notificationMessage) {
      console.log(notificationMessage);
      alert(notificationMessage);
      // Clear notification after some time
      const timer = setTimeout(() => {
        setNotificationMessage("");
      }, 3000);

      // Cleanup timer on component unmount
      return () => clearTimeout(timer);
    }
  }, [notificationMessage]);

  return (
    <div className="appointment-form">
      <h2>Book an Appointment</h2>
      <div className="details-booking">
        <div className="details">
          <div className="card_image">
            <img src={image} alt={`${name}`} />
          </div>
          <div className="card_info">
            <h2>{name}</h2>
            <h3>{experience} years of experience</h3>
            <p className="rating">Rating: {rating}</p>
            <p>{profile}</p>
          </div>
        </div>
        <form className="form-group" onSubmit={handleSubmit}>
          <div className="field">
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
          <div className="field">
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
          <div className="field">
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
          <div className="field">
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

          <button type="submit" className="book-button">
            Book Now
          </button>
        </form>
      </div>
      {notificationMessage && <Notification message={notificationMessage} />}
    </div>
  );
};

export default AppointmentForm;
