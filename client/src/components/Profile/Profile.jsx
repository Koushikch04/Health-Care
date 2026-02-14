import React from "react";
import styles from "./Profile.module.css";
import Sidebar from "../SideBar/Sidebar";
import RightSide from "../RightSide/RightSide";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function Profile() {
  const userRole = useSelector((state) => state.auth.userRole);
  const profileClassName =
    userRole === "user"
      ? `${styles.ProfileClass} ${styles.withRightSide}`
      : styles.ProfileClass;

  return (
    <div className={styles.Profile}>
      <div className={profileClassName}>
        <Sidebar />
        <div className={styles.PageContent}>
          <div className={styles.ContentTransition}>
            <Outlet />
          </div>
        </div>
        {userRole == "user" && <RightSide />}
      </div>
    </div>
  );
}

export default Profile;
