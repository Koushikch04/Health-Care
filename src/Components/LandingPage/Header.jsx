import React from "react";
import styles from "./styles/Header.module.css";
import landingPageStyles from "./styles/LandingPage.module.css";

const Header = () => (
  <header
    className={`${styles.header__container} ${landingPageStyles.section__container}`}
    id="home"
  >
    <div className={`${styles.header__image}`}>
      <img src="/Images/LandingPage/single_doctor.jpg" alt="header" />
    </div>
    <div className={`${styles.header__content}`}>
      <h1>
        Your Health <span>Our Responsibility</span>.
      </h1>
      <p className={`${landingPageStyles.section__description}`}>
        We are dedicated to providing the highest quality healthcare services to
        our community. Our experienced team of professionals is here to support
        your health and well-being.
      </p>
      <div className={`${styles.header__btn}`}>
        <button className={`${styles.btn}`}>Get Started</button>
      </div>
    </div>
  </header>
);

export default Header;
