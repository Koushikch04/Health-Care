import React, { useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";
import { UilTimes } from "@iconscout/react-unicons";
import Chart from "react-apexcharts";

import styles from "./Card.module.css";

const Card = (props) => {
  return <CompactCard param={props} setExpanded={() => setExpanded(true)} />;
};

function CompactCard({ param, setExpanded, isBarRequired }) {
  const Png = param.png;

  return (
    <motion.div
      className={styles.CompactCard}
      style={{
        background: param.color.backGround,
        boxShadow: param.color.boxShadow,
      }}
      layout
      onClick={setExpanded}
    >
      <div className={styles.radialBar}>
        {isBarRequired && (
          <CircularProgressbar
            className={styles.CircularProgressbar}
            value={param.barValue}
            text={`${param.barValue}%`}
            styles={{
              text: { fill: "white", fontSize: "18px", fontWeight: "bold" },
            }}
          />
        )}
        <span>{param.title}</span>
      </div>
      <div className={styles.detail}>
        <Png />
        <span>{param.value}</span>
        {/* <span>Last 24 hours</span> */}
      </div>
    </motion.div>
  );
}

export default Card;
