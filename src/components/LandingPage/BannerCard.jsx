import React from "react";
import { RiArrowRightLine } from "react-icons/ri";
import styles from "./styles/Banner.module.css";

const BannerCard = ({ Icon, title, description, link, iconBgColor }) => (
  <div className={`${styles.banner__card}`}>
    <span
      className={`${styles.banner__icon}`}
      style={{ backgroundColor: iconBgColor }}
    >
      <Icon />
    </span>
    <h4>{title}</h4>
    <p>{description}</p>
    <a href={link}>
      Learn more
      <span style={{ marginTop: "5px" }}>
        <RiArrowRightLine />
      </span>
    </a>
  </div>
);

export default BannerCard;
