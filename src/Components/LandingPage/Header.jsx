import React from "react";
import "./styles/Header.css";
import "./styles/LandingPage.css";

const Header = () => (
  <header className="section__container header__container" id="home">
    <div className="header__image">
      <img src="/Images/LandingPage/single_doctor.jpg" alt="header" />
    </div>
    <div className="header__content">
      <h1>
        Your Health <span>Our Responsibility</span>.
      </h1>
      <p className="section__description">
        We are dedicated to providing the highest quality healthcare services to
        our community. Our experienced team of professionals is here to support
        your health and well-being.
      </p>
      <div className="header__btn">
        <button className="btn">Get Started</button>
      </div>
    </div>
  </header>
);

export default Header;
