// AppointmentForm.js
import React from "react";
import "./AppointmentForm.css";

const AppointmentForm = ({ image, name, experience, rating, profile }) => {
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
        <form className="form-group">
          <div className="field">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone Number:</label>
            <input type="text" id="phone" name="phone" required />
          </div>
          <div className="field">
            <label htmlFor="date">Date of Appointment:</label>
            <input type="date" id="date" name="date" required />
          </div>
          <div className="field">
            <label htmlFor="time">Book Time Slot:</label>
            <input type="time" id="time" name="time" required />
          </div>

          <button type="submit" className="book-button">
            Book Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
