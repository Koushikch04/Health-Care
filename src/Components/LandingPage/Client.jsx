import React, { useEffect } from "react";
import Swiper from "swiper";
import "./styles/Client.css";
import "./styles/LandingPage.css";

import "swiper/swiper-bundle.css";

const Client = () => {
  useEffect(() => {
    new Swiper(".swiper", {
      loop: true,
      pagination: {
        el: ".swiper-pagination",
      },
    });
  }, []);

  return (
    <section className="section__container client__container" id="client">
      <h2 className="section__header">What Our Patients Are Saying</h2>
      <p className="section__description">
        Hear directly from our patients about their experiences with our
        healthcare services. Their testimonials highlight our commitment to
        compassionate care and effective treatment.
      </p>
      <div className="client__swiper">
        <div className="swiper">
          <div className="swiper-wrapper">
            <div className="swiper-slide">
              <div className="client__card">
                <p>
                  The staff at HealthCare Clinic made my visit so comfortable
                  and stress-free. The doctor was thorough and took the time to
                  answer all my questions.
                </p>
                <img src="assets/client-1.jpg" alt="client" />
                <h4>Sarah Mitchell</h4>
                <h5>Graphic Designer</h5>
              </div>
            </div>
            <div className="swiper-slide">
              <div className="client__card">
                <p>
                  I had a wonderful experience with the telemedicine service. I
                  was able to consult with a specialist from home and received
                  excellent care.
                </p>
                <img src="assets/client-2.jpg" alt="client" />
                <h4>John Doe</h4>
                <h5>Software Engineer</h5>
              </div>
            </div>
            <div className="swiper-slide">
              <div className="client__card">
                <p>
                  The general check-up was quick and efficient. The clinic is
                  well-organized, and the medical staff are very professional.
                </p>
                <img src="assets/client-3.jpg" alt="client" />
                <h4>Emily Roberts</h4>
                <h5>Teacher</h5>
              </div>
            </div>
          </div>
          <div className="swiper-pagination"></div>
        </div>
      </div>
    </section>
  );
};

export default Client;
