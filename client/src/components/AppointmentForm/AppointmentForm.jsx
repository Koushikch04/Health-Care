import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
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
  const CACHE_TTL_MS = 60 * 1000;
  const token = useSelector((state) => state.auth.userToken);
  const dispatch = useDispatch();
  const slotsCacheRef = useRef(new Map());
  const inFlightControllerRef = useRef(null);

  const [formData, setFormData] = useState({
    doctorId,
    date: "",
    time: "",
    patientName: "",
    additionalNotes: "",
    reasonForVisit: "",
  });

  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [availabilityHint, setAvailabilityHint] = useState("");
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const { alert } = useAlert();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "time" && !isDateSelected) {
      return;
    }
  };

  const handleDateChange = (value) => {
    const nextDate = value?.isValid?.() ? value.format("YYYY-MM-DD") : "";

    setFormData((prev) => ({
      ...prev,
      date: nextDate,
      time: "",
    }));

    setIsDateSelected(Boolean(nextDate));
    if (!nextDate) {
      setAvailableTimeSlots([]);
      setAvailabilityHint("");
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
    if (!selectedDate || !token) {
      return;
    }

    const cacheKey = `${doctorId}:${selectedDate}`;
    const cachedEntry = slotsCacheRef.current.get(cacheKey);

    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      setAvailableTimeSlots(cachedEntry.slots);
      setAvailabilityHint(cachedEntry.hint || "");
      return;
    }

    if (inFlightControllerRef.current) {
      inFlightControllerRef.current.abort();
    }

    const controller = new AbortController();
    inFlightControllerRef.current = controller;
    setIsLoadingSlots(true);
    setAvailabilityHint("");

    try {
      const response = await fetch(
        `${baseURL}/appointment/available-slots/doctor/${doctorId}/date/${selectedDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        },
      );

      console.log(
        `${baseURL}/appointment/available-slots/doctor/${doctorId}/date/${selectedDate}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available time slots");
      }

      const reason = response.headers.get("X-Availability-Reason");
      const slots = await response.json();
      let hint = "";
      if (slots.length === 0) {
        if (reason === "NON_WORKING_DAY" || reason === "OUT_OF_SCHEDULE") {
          hint = "Doctor is not available on the selected date. Please choose another day.";
        } else if (reason === "FULLY_BOOKED") {
          hint = "All slots are booked for this date. Please choose another day.";
        } else {
          hint = "No slots are available for this date.";
        }
      }
      slotsCacheRef.current.set(cacheKey, {
        slots,
        hint,
        timestamp: Date.now(),
      });
      setAvailableTimeSlots(slots);
      setAvailabilityHint(hint);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      alert.error({
        message: `Error fetching time slots: ${error.message}`,
        title: "Error",
      });
    } finally {
      setIsLoadingSlots(false);
      if (inFlightControllerRef.current === controller) {
        inFlightControllerRef.current = null;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBooking) return;
    if (!formData.date) {
      alert.info({
        message: "Please select a valid appointment date.",
        title: "Info",
      });
      return;
    }
    if (!formData.time) {
      alert.info({
        message: "Please select an available time slot.",
        title: "Info",
      });
      return;
    }

    const selectedSlot = formData.time;
    const previousSlots = availableTimeSlots;
    setIsBooking(true);
    setAvailableTimeSlots((prev) =>
      prev.filter((slot) => slot !== selectedSlot),
    );
    setFormData((prev) => ({ ...prev, time: "" }));

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

      dispatch(authActions.addUpdate(newUpdate));
      slotsCacheRef.current.delete(`${doctorId}:${formData.date}`);

      alert.success({
        message: "Appointment booked successfully!",
        title: "Successful Booking",
      });
      onSubmit();
    } catch (error) {
      setAvailableTimeSlots(previousSlots);
      setFormData((prev) => ({ ...prev, time: selectedSlot }));
      alert.error({
        message: `Failed to book appointment: ${error.message}`,
        title: "Failed Booking",
      });
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    if (isDateSelected && formData.date) {
      fetchAvailableTimeSlots(formData.date);
    }
  }, [isDateSelected, formData.date, doctorId, token]);

  useEffect(() => {
    return () => {
      if (inFlightControllerRef.current) {
        inFlightControllerRef.current.abort();
      }
    };
  }, []);

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
            <div className={styles.datePicker}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={formData.date ? dayjs(formData.date) : null}
                  onChange={handleDateChange}
                  disablePast
                  disabled={isBooking}
                  slotProps={{
                    textField: {
                      id: "date",
                      required: true,
                      fullWidth: true,
                      size: "small",
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
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
              disabled={isBooking}
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
            {isDateSelected && isLoadingSlots && (
              <p className={styles.slotHint}>Checking slot availability...</p>
            )}
            {isDateSelected && !isLoadingSlots && availabilityHint && (
              <p className={styles.slotHint}>{availabilityHint}</p>
            )}
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

          <button
            type="submit"
            className={styles.book_button}
            disabled={isBooking}
          >
            {isBooking ? "Booking..." : "Book Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
