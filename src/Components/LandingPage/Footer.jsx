import React from "react";
import "./styles/Footer.css";
const Footer = () => (
  <footer className="footer" id="contact">
    <div className="section__container footer__container">
      <div className="footer__col">
        <div className="logo footer__logo">
          <a href="#">
            Health<span>Care</span>
          </a>
        </div>
        <p className="section__description">
          Join HealthCare for a journey towards better health, where every
          appointment is a step towards wellness and every blog post brings
          valuable insights.
        </p>
      </div>
      <div className="footer__col">
        <h4>Services</h4>
        <ul className="footer__links">
          <li>
            <a href="#">Appointments</a>
          </li>
          <li>
            <a href="#">Consultations</a>
          </li>
          <li>
            <a href="#">Medical Services</a>
          </li>
          <li>
            <a href="#">Health Check-ups</a>
          </li>
          <li>
            <a href="#">Emergency Services</a>
          </li>
        </ul>
      </div>
      <div className="footer__col">
        <h4>Information</h4>
        <ul className="footer__links">
          <li>
            <a href="#">About Us</a>
          </li>
          <li>
            <a href="#">Contact Us</a>
          </li>
          <li>
            <a href="#">Health Blog</a>
          </li>
          <li>
            <a href="#">FAQs</a>
          </li>
        </ul>
      </div>
      <div className="footer__col">
        <h4>Company</h4>
        <ul className="footer__links">
          <li>
            <a href="#">Our Story</a>
          </li>
          <li>
            <a href="#">Careers</a>
          </li>
          <li>
            <a href="#">Terms of Service</a>
          </li>
          <li>
            <a href="#">Privacy Policy</a>
          </li>
          <li>
            <a href="#">Reviews</a>
          </li>
        </ul>
      </div>
    </div>
    <div className="footer__bar">
      Copyright © 2024 HealthCare. All rights reserved.
    </div>
  </footer>
);

export default Footer;
