import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

import styles from "./Profile.module.css";
import { authActions } from "../../store/auth/auth-slice";

function Profile() {
  const [toggleMenu, setToggleMenu] = useState(false);
  const userInfo = useSelector((state) => state.auth.userInfo);

  const dispatch = useDispatch();

  const menuItems = [
    { label: "Edit Profile", link: "/profile" },
    { label: "Appointments", link: "/appointments" },
    { label: "Logout", link: "#" },
  ];

  const handleLogout = () => {
    dispatch(authActions.logout());
  };

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
                  ? `${userInfo.name.firstName} ${userInfo.name.lastName}`
                  : "John Doe"}
              </h2>
            </div>
            <hr />
            {menuItems.map((item, index) =>
              item.label === "Logout" ? (
                <div
                  key={index}
                  className={styles.menu_link}
                  onClick={handleLogout}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleLogout()}
                >
                  <img src="/Images/Navbar/avatar.png" alt="Menu icon" />
                  <p>{item.label}</p>
                  <span>{">"}</span>
                </div>
              ) : (
                <Link key={index} to={item.link} className={styles.menu_link}>
                  <img src="/Images/Navbar/avatar.png" alt="Menu icon" />
                  <p>{item.label}</p>
                  <span>{">"}</span>
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
