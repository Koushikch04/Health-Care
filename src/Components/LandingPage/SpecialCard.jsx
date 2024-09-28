import React from "react";
import styles from "./styles/Special.module.css";
import { RiRewindStartFill, RiStarFill } from "react-icons/ri";

const SpecialCard = ({ image, name, experience, description }) => (
  <div className={`${styles.special__card}`}>
    <img src={image} alt="doctor" className={`${styles.doctor__image}`} />
    <h4>{name}</h4>
    <p className={`${styles.experience}`}>{experience}</p>
    <div className={`${styles.special__ratings}`}>
      {[...Array(5)].map((_, index) => (
        <span key={index}>
          <RiStarFill />
        </span>
      ))}
    </div>
    <p>{description}</p>
    <div className={`${styles.special__footer}`}>
      <button className={`${styles.booking__btn}`}>Book Appointment</button>
    </div>
  </div>
);

export default SpecialCard;
