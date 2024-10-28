import React, { useState, useEffect } from "react";
import useAlert from "../../hooks/useAlert";
import styles from "./AppointmentForm.module.css";
import cardStyles from "../DoctorListPagination/DoctorCard.module.css";
import { baseURL } from "../../api/api";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../../store/auth/auth-slice";

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
  const token = useSelector((state) => state.auth.userToken);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    doctorId,
    date: "",
    time: "",
    patientName: "",
    additionalNotes: "",
    reasonForVisit: "",
  });

  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isDateSelected, setIsDateSelected] = useState(false);

  const { alert } = useAlert();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "time" && !isDateSelected) {
      return;
    }
    if (name === "date") {
      setIsDateSelected(!!value);
    }
  };

  const handleTimeFocus = () => {
    if (!isDateSelected) {
      alert.info({
        message: "Please select a date before choosing a time.",
        title: "Info",
      });
    }
  };

  const fetchAvailableTimeSlots = async (selectedDate) => {
    if (!selectedDate) {
      return;
    }
    console.log(token);

    try {
      const response = await fetch(
        `${baseURL}/appointment/available-slots/doctor/${doctorId}/date/${selectedDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available time slots");
      }

      const slots = await response.json();
      setAvailableTimeSlots(slots);
    } catch (error) {
      console.log("error" + error.message);
      alert.error({
        message: `Error fetching time slots: ${error.message}`,
        title: "Error",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${baseURL}/appointment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error booking appointment");
      }

      const data = await response.json();

      const newUpdate = {
        id: data._id,
        img: image,
        patient: formData.patientName,
        doctor: name,
        type: "booked",
        time: data.createdAt,
      };

      console.log(newUpdate);

      dispatch(authActions.addUpdate(newUpdate));

      alert.success({
        message: "Appointment booked successfully!",
        title: "Successful Booking",
      });
      onSubmit();
    } catch (error) {
      alert.error({
        message: `Failed to book appointment: ${error.message}`,
        title: "Failed Booking",
      });
    }
  };

  useEffect(() => {
    if (isDateSelected && formData.date) {
      fetchAvailableTimeSlots(formData.date);
    }
  }, [isDateSelected, formData.date]);

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
              onFocus={handleTimeFocus}
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
