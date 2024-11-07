import React, { useState, useEffect } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { baseURL } from "../api/api";
import { useSelector } from "react-redux";
import styles from "./DoctorDashboard.module.css"; // Assuming you are using CSS modules
import { UilTimes } from "@iconscout/react-unicons"; // Import close icon

const DoctorDashboard = ({ doctorId }) => {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("week");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${baseURL}/appointment/doctor/${userInfo._id}?filter=${filter}`
        );
        const result = await response.json();

        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, doctorId]);

  const formatChartData = () => {
    if (!data?.data) return { dataset: [], labels: [] };

    return {
      dataset: [
        {
          data: data.data.map((item) => {
            let label = "";
            if (filter === "week") {
              label = item.dayName?.substring(0, 3) || "N/A";
            } else if (filter === "month") {
              label = `Week ${item.weekOfMonth}`;
            } else if (filter === "year") {
              label = item.monthName ? item.monthName.substring(0, 3) : "N/A";
            }

            return {
              label,
              scheduled: item.scheduled,
              canceled: item.canceled,
              completed: item.completed,
            };
          }),
        },
      ],
    };
  };

  const chartData = formatChartData();

  const chartSettings = {
    width: 800,
    height: 400,
    mx: 60,
    my: 30,
  };

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <div
        className={expanded ? styles.expandedCard : styles.compactCard}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={styles.filterContainer}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
            onClick={(e) => e.stopPropagation()} // Prevent event from propagating to the card
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>

        <div className={styles.compactContent}>
          <h4>View All</h4>
          <p>Total: {data.summary.total}</p>
        </div>
      </div>

      {expanded && (
        <div className={styles.overlay} onClick={() => setExpanded(false)}>
          <div
            className={styles.overlayContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* The chart will be displayed in this section */}
            <BarChart
              dataset={chartData.dataset[0]?.data || []}
              xAxis={[
                {
                  scaleType: "band",
                  dataKey: "label",
                  tickLabelStyle: {
                    angle: 0,
                    textAnchor: "middle",
                  },
                },
              ]}
              series={[
                { dataKey: "scheduled", label: "Scheduled", color: "#2563eb" },
                { dataKey: "canceled", label: "Canceled", color: "#dc2626" },
                { dataKey: "completed", label: "Completed", color: "#16a34a" },
              ]}
              {...chartSettings}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
