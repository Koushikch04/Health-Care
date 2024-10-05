import React from "react";
import styles from "./styles/Doctor.module.css";
import landingPageStyles from "./styles/LandingPage.module.css";
import {
  RiCheckboxBlankCircleFill,
  RiCheckboxCircleFill,
  RiCheckDoubleFill,
  RiCheckFill,
} from "react-icons/ri";

const Doctor = () => (
  <section className="doctor" id="doctor">
    <div
      className={`${landingPageStyles.section__container} ${styles.doctor__container}`}
    >
      <div className={`${styles.doctor__image}`}>
        <img src="/Images/LandingPage/three_doctors.png" alt="doctor" />
      </div>
      <div className={`${styles.doctor__content}`}>
        <h2 className={`${landingPageStyles.section__header}`}>
          Cared For By The Best Doctors In The World
        </h2>
        <p className={`${landingPageStyles.section__description}`}>
          Experience medical excellence crafted by top doctors from around the
          globe. Our team of medical virtuosos brings together expertise,
          innovation, and passion to create unforgettable healthcare experiences
          that redefine wellness.
        </p>
        <ul className={`${styles.doctor__list}`}>
          <li>
            <span>
              <RiCheckboxCircleFill />
            </span>
            Receive exceptional care from world-renowned doctors.
          </li>
          <li>
            <span>
              <RiCheckboxCircleFill />
            </span>
            Experience innovative treatments with meticulous attention to
            detail.
          </li>
          <li>
            <span>
              <RiCheckboxCircleFill />
            </span>
            Enjoy health services crafted with an unwavering passion for
            perfection.
          </li>
        </ul>
      </div>
    </div>
  </section>
);

export default Doctor;
