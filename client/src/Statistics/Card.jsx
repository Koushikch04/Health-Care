import React, { useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";
import { UilTimes } from "@iconscout/react-unicons";
import Chart from "react-apexcharts";

import styles from "./Card.module.css";

// Parent Card
const Card = (props) => {
  //   const [expanded, setExpanded] = useState(false);

  //   return expanded ? (
  //     <ExpandedCardTest param={props} setExpanded={() => setExpanded(false)} />
  //   ) : (
  return <CompactCard param={props} setExpanded={() => setExpanded(true)} />;
  //   );
};

// Compact Card
function CompactCard({ param, setExpanded }) {
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
        <CircularProgressbar
          value={param.barValue}
          text={`${param.barValue}%`}
        />
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
