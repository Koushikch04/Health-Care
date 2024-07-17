import React, { useEffect } from "react";
import ScrollReveal from "scrollreveal";
import Header from "./Header.jsx";
import Banner from "./Banner.jsx";
import Special from "./Special.jsx";
import Doctor from "./Doctor.jsx";
import Client from "./Client.jsx";
import Footer from "./Footer.jsx";

import "./styles/LandingPage.css";
import "./styles/Header.css";
import "./styles/Banner.css";
import "./styles/Special.css";
import "./styles/Doctor.css";
import "./styles/Client.css";
import "./styles/Footer.css";

const LandingPage = () => {
  useEffect(() => {
    const scrollRevealOption = {
      distance: "50px",
      origin: "bottom",
      duration: 1000,
    };

    ScrollReveal().reveal(".header__image img", {
      ...scrollRevealOption,
      origin: "right",
    });
    ScrollReveal().reveal(".header__content h1", {
      ...scrollRevealOption,
      delay: 500,
    });
    ScrollReveal().reveal(".header__content .section__description", {
      ...scrollRevealOption,
      delay: 1000,
    });
    ScrollReveal().reveal(".header__content .header__btn", {
      ...scrollRevealOption,
      delay: 1500,
    });
    ScrollReveal().reveal(".special__grid .special__card", {
      ...scrollRevealOption,
      delay: 1500,
    });
    ScrollReveal().reveal(".explore__image img", {
      ...scrollRevealOption,
      origin: "left",
    });
    ScrollReveal().reveal(".explore__content .section__header", {
      ...scrollRevealOption,
      delay: 500,
    });
    ScrollReveal().reveal(".explore__content .section__description", {
      ...scrollRevealOption,
      delay: 1000,
    });
    ScrollReveal().reveal(".explore__content .explore__btn", {
      ...scrollRevealOption,
      delay: 1500,
    });
    ScrollReveal().reveal(".banner__card", {
      ...scrollRevealOption,
      interval: 500,
    });
    ScrollReveal().reveal(".doctor__image img", {
      ...scrollRevealOption,
      origin: "right",
    });
    ScrollReveal().reveal(".doctor__content .section__header", {
      ...scrollRevealOption,
      delay: 500,
    });
    ScrollReveal().reveal(".doctor__content .section__description", {
      ...scrollRevealOption,
      delay: 1000,
    });
    ScrollReveal().reveal(".doctor__list li", {
      ...scrollRevealOption,
      delay: 1500,
      interval: 500,
    });
  }, []);

  return (
    <div className="landingPage">
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
