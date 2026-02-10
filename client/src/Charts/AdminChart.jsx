import React, { useState, useEffect } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { baseURL } from "../api/api";
import { useSelector } from "react-redux";
import styles from "./DoctorChart.module.css"; // Assuming you are using CSS modules

const getPermissionValue = (permissions, key) => {
  if (!permissions) return false;
  if (permissions instanceof Map) return Boolean(permissions.get(key));
  if (Array.isArray(permissions)) {
    const entry = permissions.find(
      (perm) => perm?.[0] === key || perm?.key === key
    );
    return Boolean(entry?.[1] ?? entry?.value);
  }
  return Boolean(permissions[key]);
};

const AdminChart = () => {
  const { userToken: token, userInfo } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("week");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);
  const canViewAppointments = getPermissionValue(
    userInfo?.permissions,
    "appointmentManagement"
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      if (!canViewAppointments) {
        setData(null);
        setError("You do not have permission to view appointment analytics.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${baseURL}/admin/appointments/?filter=${filter}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();

        if (!response.ok) {
          setError(result?.message || "Failed to load chart data.");
          setData(null);
          return;
        }

        setError(null);
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load chart data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, token, canViewAppointments]);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className={styles.notice}>{error}</div>;
  }

  if (!data) {
    return null;
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

export default AdminChart;
