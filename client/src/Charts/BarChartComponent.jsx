import * as React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import styles from "./BarChartComponent.module.css"; // Import your CSS module

const BarChartComponent = ({ data, labels, title }) => {
  const dataset = data.map((count, index) => ({
    label: labels[index],
    count: count,
  }));

  const chartSetting = {
    yAxis: [
      {
        label: "Count",
      },
    ],
    width: 500,
    height: 200,
  };

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <BarChart
        dataset={dataset}
        xAxis={[{ scaleType: "band", dataKey: "label" }]} // Use 'label' for the x-axis keys
        series={[{ dataKey: "count", label: title }]} // Use 'count' for the data key
        layout="vertical" // Set the layout to vertical
        {...chartSetting}
      />
    </div>
  );
};

export default BarChartComponent;
