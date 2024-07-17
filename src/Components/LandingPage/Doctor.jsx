import React from "react";
import "./styles/Doctor.css";
import "./styles/LandingPage.css";

const Doctor = () => (
  <section className="doctor" id="doctor">
    <div className="section__container doctor__container">
      <div className="doctor__image">
        <img src="/Images/LandingPage/three_doctors.png" alt="doctor" />
      </div>
      <div className="doctor__content">
        <h2 className="section__header">
          Cared For By The Best Doctors In The World
        </h2>
        <p className="section__description">
          Experience medical excellence crafted by top doctors from around the
          globe. Our team of medical virtuosos brings together expertise,
          innovation, and passion to create unforgettable healthcare experiences
          that redefine wellness.
        </p>
        <ul className="doctor__list">
          <li>
            <span>
              <i className="ri-checkbox-fill"></i>
            </span>
            Receive exceptional care from world-renowned doctors.
          </li>
          <li>
            <span>
              <i className="ri-checkbox-fill"></i>
            </span>
            Experience innovative treatments with meticulous attention to
            detail.
          </li>
          <li>
            <span>
              <i className="ri-checkbox-fill"></i>
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
