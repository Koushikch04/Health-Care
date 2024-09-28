import React, { useEffect } from "react";
import ScrollReveal from "scrollreveal";
import Header from "./Header.jsx";
import Banner from "./Banner.jsx";
import Special from "./Special.jsx";
import Doctor from "./Doctor.jsx";
import Client from "./Client.jsx";
import Footer from "./Footer.jsx";

import landingPageStyles from "./styles/LandingPage.module.css";
import headerStyles from "./styles/Header.module.css";
import bannerStyles from "./styles/Banner.module.css";
import specialStyles from "./styles/Special.module.css";
import doctorStyles from "./styles/Doctor.module.css";
import clientStyles from "./styles/Client.module.css";
import footerStyles from "./styles/Footer.module.css";

const LandingPage = () => {
  useEffect(() => {
    const scrollRevealOption = {
      distance: "50px",
      origin: "bottom",
      duration: 1000,
    };

    ScrollReveal().reveal(`.${headerStyles.header__image} img`, {
      ...scrollRevealOption,
      origin: "right",
    });
    ScrollReveal().reveal(`.${headerStyles.header__content} h1`, {
      ...scrollRevealOption,
      delay: 500,
    });
    ScrollReveal().reveal(
      `.${headerStyles.header__content} .${headerStyles.section__description}`,
      {
        ...scrollRevealOption,
        delay: 1000,
      }
    );
    ScrollReveal().reveal(`.${headerStyles.header__btn}`, {
      ...scrollRevealOption,
      delay: 1500,
    });
    ScrollReveal().reveal(
      `.${specialStyles.special__grid} .${specialStyles.special__card}`,
      {
        ...scrollRevealOption,
        delay: 1500,
      }
    );
    ScrollReveal().reveal(`.${bannerStyles.banner__card}`, {
      ...scrollRevealOption,
      interval: 500,
    });
    ScrollReveal().reveal(`.${doctorStyles.doctor__image} img`, {
      ...scrollRevealOption,
      origin: "right",
    });
    ScrollReveal().reveal(
      `.${doctorStyles.doctor__content} .${doctorStyles.section__header}`,
      {
        ...scrollRevealOption,
        delay: 500,
      }
    );
    ScrollReveal().reveal(
      `.${doctorStyles.doctor__content} .${doctorStyles.section__description}`,
      {
        ...scrollRevealOption,
        delay: 1000,
      }
    );
    ScrollReveal().reveal(`.${doctorStyles.doctor__list} li`, {
      ...scrollRevealOption,
      delay: 1500,
      interval: 500,
    });
  }, []);

  return (
    <div className={landingPageStyles.landingPage}>
      <Header />
      <Banner />
      <Special />
      <Doctor />
      <Client />
      <Footer />
    </div>
  );
};

export default LandingPage;
