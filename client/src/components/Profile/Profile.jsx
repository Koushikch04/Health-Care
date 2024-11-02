import React from "react";
import styles from "./Profile.module.css";
import Sidebar from "../SideBar/Sidebar";
import RightSide from "../RightSide/RightSide";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function Profile() {
  const userRole = useSelector((state) => state.auth.userRole);
  return (
    <div className={styles.Profile}>
      <div className={styles.ProfileClass}>
        <Sidebar />
        <div className={styles.PageContent}>
          <Outlet />
        </div>
        {userRole == "user" && <RightSide />}
      </div>
    </div>
  );
}

export default Profile;
