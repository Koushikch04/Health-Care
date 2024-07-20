import React, { useState } from "react";
import "./AppointmentForm.css";

const AppointmentForm = ({ image, name, experience, rating, profile }) => {
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.phone) newErrors.phone = "Phone Number is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setLoading(true);
      // Simulate an API call
      setTimeout(() => {
        setLoading(false);
        alert("Appointment booked successfully!");
      }, 2000);
    }
  };

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
        <form className="form-group" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              aria-describedby="nameError"
              required
            />
            {errors.name && (
              <p id="nameError" className="error">
                {errors.name}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="phone">Phone Number:</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              aria-describedby="phoneError"
              required
            />
            {errors.phone && (
              <p id="phoneError" className="error">
                {errors.phone}
              </p>
            )}
          </div>

          <button type="submit" className="book-button" disabled={loading}>
            {loading ? "Booking..." : "Book Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
