import React, { useState } from "react";
import "./Card.css";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";
import { UilTimes } from "@iconscout/react-unicons";
import Chart from "react-apexcharts";

// Parent Card
const Card = (props) => {
  const [expanded, setExpanded] = useState(false);

  return expanded ? (
    <ExpandedCardTest param={props} setExpanded={() => setExpanded(false)} />
  ) : (
    <CompactCard param={props} setExpanded={() => setExpanded(true)} />
  );
};

// Compact Card
function CompactCard({ param, setExpanded }) {
  const Png = param.png;
  return (
    <motion.div
      className="CompactCard"
      style={{
        background: param.color.backGround,
        boxShadow: param.color.boxShadow,
      }}
      layout
      onClick={setExpanded}
    >
      <div className="radialBar">
        <CircularProgressbar
          value={param.barValue}
          text={`${param.barValue}%`}
        />
        <span>{param.title}</span>
      </div>
      <div className="detail">
        <Png />
        <span>${param.value}</span>
        <span>Last 24 hours</span>
      </div>
    </motion.div>
  );
}

// Expanded Card
function ExpandedCard({ param, setExpanded }) {
  const data = {
    options: {
      chart: {
        type: "area",
        height: "auto",
      },

      dropShadow: {
        enabled: false,
        enabledOnSeries: undefined,
        top: 0,
        left: 0,
        blur: 3,
        color: "#000",
        opacity: 0.35,
      },

      fill: {
        colors: ["#fff"],
        type: "gradient",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        colors: ["white"],
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
      },
      grid: {
        show: true,
      },
      xaxis: {
        type: "datetime",
        categories: [
          "2018-09-19T00:00:00.000Z",
          "2018-09-19T01:30:00.000Z",
          "2018-09-19T02:30:00.000Z",
          "2018-09-19T03:30:00.000Z",
          "2018-09-19T04:30:00.000Z",
          "2018-09-19T05:30:00.000Z",
          "2018-09-19T06:30:00.000Z",
        ],
      },
    },
  };

  return (
    <motion.div
      className="ExpandedCard"
      style={{
        background: param.color.backGround,
        boxShadow: param.color.boxShadow,
      }}
      layout
    >
      <div style={{ alignSelf: "flex-end", cursor: "pointer", color: "white" }}>
        <UilTimes onClick={setExpanded} />
      </div>
      <span>{param.title}</span>
      <div className="chartContainer">
        <Chart options={data.options} series={param.series} type="area" />
      </div>
      <span>Last 24 hours</span>
    </motion.div>
  );
}

function ExpandedCardTest({ param, setExpanded }) {
  // Add state to track selected range
  const [range, setRange] = useState("Monthly");

  // Define monthly and yearly mock data
  const monthlyDates = [
    "2024-10-01",
    "2024-10-08",
    "2024-10-15",
    "2024-10-22",
    "2024-10-29",
  ];
  const yearlyDates = [
    "2023-11-01",
    "2024-02-01",
    "2024-05-01",
    "2024-08-01",
    "2024-11-01",
  ];

  const monthlyData = [{ name: "Appointments", data: [30, 40, 35, 50, 49] }];
  const yearlyData = [
    { name: "Appointments", data: [300, 400, 350, 500, 490] },
  ];

  // Dynamic data based on selected range
  const data = {
    options: {
      chart: {
        type: "area",
        height: "auto",
      },
      dropShadow: {
        enabled: false,
        top: 0,
        left: 0,
        blur: 3,
        color: "#000",
        opacity: 0.35,
      },
      fill: {
        colors: ["#fff"],
        type: "gradient",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        colors: ["white"],
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
      },
      grid: {
        show: true,
      },
      xaxis: {
        type: "datetime",
        categories: range === "Yearly" ? yearlyDates : monthlyDates,
      },
    },
    series: range === "Yearly" ? yearlyData : monthlyData,
  };

  return (
    <motion.div
      className="ExpandedCard"
      style={{
        background: param.color.backGround,
        boxShadow: param.color.boxShadow,
      }}
      layout
    >
      <div style={{ alignSelf: "flex-end", cursor: "pointer", color: "white" }}>
        <UilTimes onClick={() => setExpanded(false)} />
      </div>
      <span>{param.title}</span>

      {/* Dropdown to select Monthly or Yearly data */}
      <select onChange={(e) => setRange(e.target.value)} value={range}>
        <option value="Monthly">Past Month</option>
        <option value="Yearly">Past Year</option>
      </select>

      <div className="chartContainer">
        <Chart options={data.options} series={data.series} type="area" />
      </div>
      <span>{range === "Monthly" ? "Last Month" : "Last Year"}</span>
    </motion.div>
  );
}

export default Card;
