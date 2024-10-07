import React from "react";
import styles from "./Profile.module.css";
import Sidebar from "../SideBar/Sidebar";
import RightSide from "../RightSide/RightSide";
import { Outlet } from "react-router-dom";

function Profile() {
  return (
    <div className={styles.Profile}>
      <div className={styles.ProfileClass}>
        <Sidebar />
        <div className={styles.PageContent}>
          <Outlet />
        </div>
        <RightSide />
      </div>
    </div>
  );
}

export default Profile;
