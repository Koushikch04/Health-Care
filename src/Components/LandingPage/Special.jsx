import React from "react";
import styles from "./styles/Special.module.css";
import landingPageStyles from "./styles/LandingPage.module.css";
import SpecialCard from "./SpecialCard";

const doctors = [
  {
    image: "/Images/LandingPage/female_doctor.png",
    name: "Dr. Sarah Johnson",
    experience: "20 years of experience",
    description:
      "A leading cardiologist known for her groundbreaking work in heart disease prevention and treatment, offering personalized care to each patient.",
  },
  {
    image: "/Images/LandingPage/male_doctor.png",
    name: "Dr. James Lee",
    experience: "15 years of experience",
    description:
      "An expert in pediatric care, Dr. Lee is known for his gentle approach and dedication to the health and well-being of children.",
  },
  {
    image: "/Images/LandingPage/female_doctor.png",
    name: "Dr. Maria Gonzalez",
    experience: "18 years of experience",
    description:
      "Specializing in neurology, Dr. Gonzalez has a reputation for her innovative treatments and compassionate care for patients with neurological disorders.",
  },
];

const Special = () => (
  <section
    className={`${landingPageStyles.section__container} ${styles.special__container}`}
    id="special"
  >
    <h2 className={`${landingPageStyles.section__header}`}>
      Our Famous Doctors
    </h2>
    <p
      className={`${landingPageStyles.section__description} ${styles.description}`}
    >
      Meet our world-renowned doctors, each dedicated to providing exceptional
      healthcare with a blend of innovation and compassionate care.
    </p>
    <div className={`${styles.special__grid}`}>
      {doctors.map((doctor, index) => (
        <SpecialCard
          key={index}
          image={doctor.image}
          name={doctor.name}
          experience={doctor.experience}
          description={doctor.description}
        />
      ))}
    </div>
  </section>
);

export default Special;
