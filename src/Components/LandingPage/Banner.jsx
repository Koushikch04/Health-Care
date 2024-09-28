import React from "react";
import styles from "./styles/Banner.module.css";
import landingPageStyles from "./styles/LandingPage.module.css";

import BannerCard from "./BannerCard";
import {
  RiHeartFill,
  RiCalendarFill,
  RiStethoscopeFill,
  RiLightbulbFill,
} from "react-icons/ri";

const Banner = () => {
  const cards = [
    {
      Icon: RiHeartFill,
      title: "Instant Consultation",
      description:
        "Connect with our experienced doctors through instant online consultations. Get the medical advice you need from the comfort of your home.",
      link: "/appointments",
      iconBgColor: "#62b15c",
    },
    {
      Icon: RiCalendarFill,
      title: "Book an Appointment",
      description:
        "Schedule appointments with our healthcare professionals easily. Choose a time that works best for you and receive quality care.",
      link: "/appointments",
      iconBgColor: "#ff3e67",
    },
    {
      Icon: RiStethoscopeFill,
      title: "Self Checkup",
      description:
        "Utilize our online self-checkup tools to assess your health conditions. Understand your symptoms and get recommendations.",
      link: "#",
      iconBgColor: "#185adb",
    },
    {
      Icon: RiLightbulbFill,
      title: "Health Tips and Guidance",
      description:
        "Access expert health tips and guidance tailored to your needs. Stay informed with articles and resources to improve your well-being.",
      link: "#",
      iconBgColor: "#ff9900",
    },
  ];

  return (
    <section
      className={`${landingPageStyles.section__container} ${styles.banner__container}`}
    >
      {cards.map((card, index) => (
        <BannerCard
          key={index}
          Icon={card.Icon}
          title={card.title}
          description={card.description}
          link={card.link}
          iconBgColor={card.iconBgColor}
        />
      ))}
    </section>
  );
};

export default Banner;
