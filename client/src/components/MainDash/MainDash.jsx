import React from "react";
import Cards from "../Cards/Cards";
import Table from "../Table/Table";
import styles from "./MainDash.module.css";
const MainDash = () => {
  return (
    <div className={styles.MainDash}>
      <h1>Good Morning, Koushik</h1>
      <Cards />
      <Table />
    </div>
  );
};

export default MainDash;
