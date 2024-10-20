import React, { useState, useEffect } from "react";
import useAlert from "../../hooks/useAlert";
import styles from "./AppointmentForm.module.css";
import cardStyles from "../DoctorListPagination/DoctorCard.module.css";
import { baseURL, token } from "../../api/api";

const AppointmentForm = ({
  doctorId,
  image,
  name,
  experience,
  rating,
  profile,
  onSubmit,
  cost,
}) => {
  const [formData, setFormData] = useState({
    doctorId,
    date: "",
    time: "",
    patientName: "",
    additionalNotes: "",
    reasonForVisit: "",
  });

  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const alert = useAlert();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const fetchAvailableTimeSlots = async (selectedDate) => {
    if (!selectedDate) return;

    try {
      const response = await fetch(
        `${baseURL}/appointment/available-slots/doctor/${doctorId}/date/${selectedDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include your actual token
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available time slots");
      }

      const slots = await response.json();
      setAvailableTimeSlots(slots);
    } catch (error) {
      alert.error(`Error fetching time slots: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${baseURL}/appointment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include your actual token
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error booking appointment");
      }

      const data = await response.json();
      alert.success("Appointment booked successfully!");
      onSubmit();
    } catch (error) {
      alert.error(`Failed to book appointment: ${error.message}`);
    }
  };

  useEffect(() => {
    // Fetch available time slots whenever the date changes
    fetchAvailableTimeSlots(formData.date);
  }, [formData.date]); // Trigger when the date changes

  return (
    <div className={styles.appointment_form}>
      <h2 className={styles.title}>Book an Appointment</h2>
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
          <p className={styles.fees}>Fees: {cost}</p>

          <div className={styles.field}>
            <label htmlFor="name">Patient Name:</label>
            <input
              type="text"
              id="name"
              name="patientName"
              value={formData.patientName}
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
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="time">Book Time Slot:</label>
            <select
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className={styles.input}
              required
            >
              <option value="" disabled>
                Select a time
              </option>
              {availableTimeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="reasonForVisit">Reason for Visit (optional)</label>
            <input
              type="text"
              id="reasonForVisit"
              name="reasonForVisit"
              value={formData.reasonForVisit}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="additionalNotes">Additional Info (optional)</label>
            <input
              type="text"
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
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
