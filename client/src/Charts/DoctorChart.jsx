import React, { useState, useEffect } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { baseURL } from "../api/api";
import { useSelector } from "react-redux";
import styles from "./DoctorChart.module.css"; // Assuming you are using CSS modules

const DoctorDashboard = ({ doctorId }) => {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("week");
  const [loading, setLoading] = useState(false);
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
  const chartWidth = Math.min(800, Math.max(320, window.innerWidth - 140));

  const chartSettings = {
    width: chartWidth,
    height: 400,
    mx: 60,
    my: 30,
  };

  return (
    <div className={styles.dashboardContainer}>
      <div
        className={expanded ? styles.expandedCard : styles.compactCard}
        onClick={() => data && setExpanded(!expanded)}
      >
        <div className={styles.compactContent}>
          <h4>View Analytics</h4>
          <p>{data ? `Total: ${data.summary.total}` : "Loading analytics..."}</p>
        </div>

        <div className={styles.compactActions}>
          {loading && data && <span className={styles.updating}>Updating...</span>}
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
        </div>
      </div>

      {expanded && data && (
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
