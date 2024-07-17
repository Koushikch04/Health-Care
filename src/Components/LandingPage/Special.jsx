import React from "react";
import "./styles/Special.css";
import "./styles/LandingPage.css";

const Special = () => (
  <section className="section__container special__container" id="special">
    <h2 className="section__header">Our Famous Doctors</h2>
    <p className="section__description">
      Meet our world-renowned doctors, each dedicated to providing exceptional
      healthcare with a blend of innovation and compassionate care.
    </p>
    <div className="special__grid">
      <div className="special__card">
        <img src="assets/doctor-1.png" alt="doctor" />
        <h4>Dr. Sarah Johnson</h4>
        <p>
          A leading cardiologist known for her groundbreaking work in heart
          disease prevention and treatment, offering personalized care to each
          patient.
        </p>
        <div className="special__ratings">
          <span>
            <i className="ri-star-fill"></i>
          </span>
          <span>
            <i className="ri-star-fill"></i>
          </span>
          <span>
            <i className="ri-star-fill"></i>
          </span>
          <span>
            <i className="ri-star-fill"></i>
          </span>
          <span>
            <i className="ri-star-fill"></i>
          </span>
        </div>
        <div className="special__footer">
          <p className="experience">20 years of experience</p>
          <button className="btn">Book Appointment</button>
        </div>
      </div>
      <div className="special__card">
        <img src="assets/doctor-2.png" alt="doctor" />
        <h4>Dr. James Lee</h4>
        <p>
          An expert in pediatric care, Dr. Lee is known for his gentle approach
          and dedication to the health and well-being of children.
        </p>
        <div className="special__ratings">
          <span>
            <i className="ri-star-fill"></i>
          </span>
          <span>
            <i className="ri-star-fill"></i>
          </span>
          <span>
            <i className="ri-star-fill"></i>
          </span>
          <span>
            <i className="ri-star-fill"></i>
          </span>
          <span>
            <i className="ri-star-fill"></i>
          </span>
        </div>
        <div className="special__footer">
          <p className="experience">15 years of experience</p>
          <button className="btn">Book Appointment</button>
        </div>
      </div>
      <div className="special__card">
        <img src="assets/doctor-3.png" alt="doctor" />
        <h4>Dr. Maria Gonzalez</h4>
        <p>
          Specializing in neurology, Dr. Gonzalez has a reputation for her
          innovative treatments and compassionate care for patients with
          neurological disorders.
        </p>
        <div className="special__ratings">
          <span>
            <i className="ri-star-fill"></i>
          </span>
          <span>
            <i className="ri-star-fill"></i>
          </span>
          <span>
            <i className="ri-star-fill"></i>
          </span>
          <span>
            <i className="ri-star-fill"></i>
          </span>
          <span>
            <i className="ri-star-fill"></i>
          </span>
        </div>
        <div className="special__footer">
          <p className="experience">18 years of experience</p>
          <button className="btn">Book Appointment</button>
        </div>
      </div>
    </div>
  </section>
);

export default Special;
