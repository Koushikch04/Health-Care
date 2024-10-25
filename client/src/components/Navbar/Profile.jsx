import React, { useState } from "react";
import { useSelector } from "react-redux";

import styles from "./Profile.module.css";

function Profile() {
  const [toggleMenu, setToggleMenu] = useState(false);

  const userInfo = useSelector((state) => state.auth.userInfo);

  const menuItems = [
    { label: "Edit Profile", link: "/profile" },
    { label: "Appointments", link: "#" },
    { label: "Logout", link: "#" },
  ];

  return (
    <div className={styles.main}>
      <img
        className={styles.avatar}
        src="/Images/Navbar/avatar.png"
        alt="User avatar"
        onClick={() => setToggleMenu((prev) => !prev)}
      />
      {toggleMenu && (
        <div className={`${styles.menu_wrap} ${toggleMenu ? styles.show : ""}`}>
          <div className={styles.menu}>
            <div className={styles.user_info}>
              <img src="/Images/Navbar/avatar.png" alt="User avatar" />
              <h2>
                {userInfo
                  ? userInfo.name.firstName + " " + userInfo.name.lastName
                  : "John Doe"}
              </h2>
            </div>
            <hr />
            {menuItems.map((item, index) => (
              <a key={index} href={item.link} className={styles.menu_link}>
                <img src="/Images/Navbar/avatar.png" alt="Menu icon" />
                <p>{item.label}</p>
                <span>{">"}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
