import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

import styles from "./Profile.module.css";
import { authActions } from "../../store/auth/auth-slice";
import { baseURL } from "../../api/api";

function Profile() {
  const [toggleMenu, setToggleMenu] = useState(false);
  const { name, profileImage } = useSelector((state) => state.auth.userInfo);

  const profileLink = profileImage ? `${baseURL}/${profileImage}` : null;
  const [uploadedImage, setUploadedImage] = useState(
    profileLink || "https://bootdey.com/img/Content/avatar/avatar1.png"
  );

  const menuRef = useRef(null);
  const dispatch = useDispatch();

  const menuItems = [
    { label: "Edit Profile", link: "/profile" },
    { label: "Appointments", link: "/appointments" },
    { label: "Logout", link: "#" },
  ];

  const handleLogout = () => {
    dispatch(authActions.logout());
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setToggleMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("focusout", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("focusout", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.main} ref={menuRef}>
      <img
        className={styles.avatar}
        src={
          uploadedImage || "https://bootdey.com/img/Content/avatar/avatar1.png"
        }
        alt="User avatar"
        onClick={() => setToggleMenu((prev) => !prev)}
      />
      {toggleMenu && (
        <div className={`${styles.menu_wrap} ${toggleMenu ? styles.show : ""}`}>
          <div className={styles.menu}>
            <div className={styles.user_info}>
              <img src={uploadedImage} alt="User avatar" />
              <h2>
                {name ? `${name.firstName} ${name.lastName}` : "John Doe"}
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
