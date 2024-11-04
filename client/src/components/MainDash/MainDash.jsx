import React from "react";
import Cards from "../Cards/Cards";
import DynamicTable from "../Table/Table"; // Update the import
import styles from "./MainDash.module.css";
import { useSelector } from "react-redux";
import BarChart from "../../Charts/BarChartComponent";
import BarChartComponent from "../../Charts/BarChartComponent";
import DoctorDashboard from "../../Charts/DoctorDashboard";

const MainDash = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const name = userInfo.name.firstName + " " + userInfo.name.lastName;

  // Example data for different tables
  const patientIncomingHistoryRows = [
    {
      name: "John Doe",
      tracking_id: "A1001",
      date: "3 Nov 2024",
      status: "Scheduled",
    },
    {
      name: "Sarah Connor",
      tracking_id: "A1002",
      date: "3 Nov 2024",
      status: "Scheduled",
    },
    // Add more rows as needed
  ];

  const rebookingRateRows = [
    {
      name: "Tony Stark",
      tracking_id: "A1003",
      date: "3 Nov 2024",
      status: "Completed",
    },
    {
      name: "Tony Stark",
      tracking_id: "A1003",
      date: "3 Nov 2024",
      status: "Completed",
    },
    // Add more rows as needed
  ];

  const upcomingAppointmentsRows = [
    {
      name: "Bruce Wayne",
      tracking_id: "A1004",
      date: "4 Nov 2024",
      status: "Scheduled",
    },
    {
      name: "Bruce Wayne",
      tracking_id: "A1004",
      date: "4 Nov 2024",
      status: "Scheduled",
    },
    // Add more rows as needed
  ];

  const recentAppointmentsRows = [
    {
      name: "Peter Parker",
      tracking_id: "A1005",
      date: "1 Nov 2024",
      status: "Completed",
    },
    {
      name: "Peter Parker",
      tracking_id: "A1005",
      date: "1 Nov 2024",
      status: "Completed",
    },
    // Add more rows as needed
  ];

  const patientIncomingData = [10, 20, 30, 25, 15, 30, 40]; // Example data for incoming patients
  const rebookingRatesData = [5, 15, 10, 20, 10, 15, 25]; // Example data for rebooking rates

  const patientIncomingLabels = [
    "Week 1",
    "Week 2",
    "Week 3",
    "Week 4",
    "Week 5",
    "Week 6",
    "Week 7",
  ];

  const rebookingLabels = [
    "Week 1",
    "Week 2",
    "Week 3",
    "Week 4",
    "Week 5",
    "Week 6",
    "Week 7",
  ];

  return (
    <div className={styles.MainDash}>
      <h1>Good Morning, {name}</h1>
      <Cards />
      <div className={styles.tables1}>
        {/* <BarChartComponent
          title="Patient Incoming History"
          data={patientIncomingData}
          labels={patientIncomingLabels}
        />
        <BarChartComponent
          title="Rebooking Rate"
          data={rebookingRatesData}
          labels={rebookingLabels}
        /> */}
        <DoctorDashboard />
      </div>
      <div className={styles.tables1}>
        <DynamicTable
          title="Upcoming Appointments"
          headers={["Patient Name", "Tracking ID", "Date", "Status"]}
          rows={upcomingAppointmentsRows}
        />
        <DynamicTable
          title="Recent Appointments"
          headers={["Patient Name", "Tracking ID", "Date", "Status"]}
          rows={recentAppointmentsRows}
        />
      </div>
    </div>
  );
};

export default MainDash;
