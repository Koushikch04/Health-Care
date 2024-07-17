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
      <h2 className="section__header">What Our Customers Are Saying</h2>
      <p className="section__description">
        Discover firsthand experiences and testimonials from our valued patrons.
        Explore the feedback and reviews that showcase our commitment to
        quality, service, and customer satisfaction.
      </p>
      <div className="client__swiper">
        <div className="swiper">
          <div className="swiper-wrapper">
            <div className="swiper-slide">
              <div className="client__card">
                <p>
                  FoodMan's culinary expertise never fails to impress! Every
                  dish is a masterpiece, bursting with flavor and freshness.
                </p>
                <img src="assets/client-1.jpg" alt="client" />
                <h4>David Lee</h4>
                <h5>Business Executive</h5>
              </div>
            </div>
            <div className="swiper-slide">
              <div className="client__card">
                <p>
                  I always turn to FoodMan for a quick and delicious meal. Their
                  efficient service and mouthwatering options never disappoint!
                </p>
                <img src="assets/client-2.jpg" alt="client" />
                <h4>Emily Johnson</h4>
                <h5>Food Blogger</h5>
              </div>
            </div>
            <div className="swiper-slide">
              <div className="client__card">
                <p>
                  FoodMan has become my go-to for all my catering needs. Their
                  attention to detail and exceptional customer service make
                  every event a success.
                </p>
                <img src="assets/client-3.jpg" alt="client" />
                <h4>Michael Thompson</h4>
                <h5>Event Planner</h5>
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
