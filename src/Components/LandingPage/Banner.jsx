import React from "react";
import "./styles/Banner.css";
import "./styles/LandingPage.css";

const Banner = () => (
  <section className="section__container banner__container">
    <div className="banner__card">
      <span className="banner__icon">
        <i className="ri-bowl-fill"></i>
      </span>
      <h4>Instant Consultation</h4>
      <p>
        Seamlessly place your food orders online with just a few clicks. Enjoy
        convenience and efficiency as you select from our diverse menu of
        delectable dishes.
      </p>
      <a href="#">
        Read more
        <span>
          <i className="ri-arrow-right-line"></i>
        </span>
      </a>
    </div>
    <div className="banner__card">
      <span className="banner__icon">
        <i className="ri-truck-fill"></i>
      </span>
      <h4>Book an Appointment</h4>
      <p>
        Customize your dining experience by choosing from a tantalizing array of
        options. For savory, sweet, or in between craving, find the perfect meal
        to satisfy your appetite.
      </p>
      <a href="#">
        Read more
        <span>
          <i className="ri-arrow-right-line"></i>
        </span>
      </a>
    </div>
    <div className="banner__card">
      <span className="banner__icon">
        <i className="ri-star-smile-fill"></i>
      </span>
      <h4>Self Checkup</h4>
      <p>
        Sit back, relax, and savor the flavors as your meticulously prepared
        meal arrives. Delight in the deliciousness of every bite, knowing that
        your satisfaction is our top priority.
      </p>
      <a href="#">
        Read more
        <span>
          <i className="ri-arrow-right-line"></i>
        </span>
      </a>
    </div>
    <div className="banner__card">
      <span className="banner__icon">
        <i className="ri-star-smile-fill"></i>
      </span>
      <h4>Healthtips and guidance</h4>
      <p>
        Sit back, relax, and savor the flavors as your meticulously prepared
        meal arrives. Delight in the deliciousness of every bite, knowing that
        your satisfaction is our top priority.
      </p>
      <a href="#">
        Read more
        <span>
          <i className="ri-arrow-right-line"></i>
        </span>
      </a>
    </div>
  </section>
);

export default Banner;
