import React from "react";
import "./DoctorCard.css";

const DoctorCard = ({ image, name, experience, rating, profile }) => {
  return (
    <div className="card">
      <div className="card_image">
        <img src={image} alt={name} />
      </div>
      <div className="card_info">
        <h2>{name}</h2>
        <h3>{experience} years experience</h3>
        <h3>Rating: {rating}</h3>
        <p>{profile}</p>
      </div>
    </div>
  );
};

export default DoctorCard;
