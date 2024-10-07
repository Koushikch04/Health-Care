import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

import "boxicons/css/boxicons.min.css";
import Button from "../Button/Button";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("mode") === "dark-mode";
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("mode", newMode ? "dark-mode" : "light-mode");
      return newMode;
    });
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className={menuOpen ? styles.active : ""}>
      <div className={styles.nav_bar}>
        <i
          className={`bx bx-menu ${styles.sidebarOpen}`}
          onClick={toggleMenu}
        ></i>
        <div className={`${styles.logo} ${styles.navbar__logo}`}>
          <a href="#">
            Health<span>Care</span>
          </a>
        </div>
        <div className={`${styles.menu} ${menuOpen ? `${styles.active}` : ""}`}>
          <div className={styles.logo_toggle}>
            <span className={styles.logo}>
              <Link to="/">Health Care</Link>
            </span>
            <i className="bx bx-x sideBarClose" onClick={closeMenu}></i>
          </div>
          <ul className={styles.nav_links}>
            <li>
              <Link to="/" onClick={closeMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/appointments" onClick={closeMenu}>
                Appointments
              </Link>
            </li>
            {/* <li>
              <Link to="/instant-consultation" onClick={closeMenu}>
                Instant-Consultation
              </Link>
            </li> */}
            <li>
              <Link to="/health-blog" onClick={closeMenu}>
                Health Blog
              </Link>
            </li>
            <li>
              <Link to="/reviews" onClick={closeMenu}>
                Reviews
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.darkLight_searchBox}>
          <div className={styles.dark_light} onClick={toggleDarkMode}>
            <i className={`bx ${styles.darkMode ? "bx-sun" : "bx-moon"}`}></i>
          </div>
          <div className={styles.searchBox}>
            <div
              className={`${styles.searchToggle} ${
                searchOpen ? `${styles.active}` : ""
              } `}
              onClick={toggleSearch}
            >
              <i
                className={`bx ${
                  searchOpen ? "bx-x cancel" : "bx-search search"
                }`}
              ></i>
            </div>
            {searchOpen && (
              <div className={styles.search_field}>
                <input type="text" placeholder="Search..." />
                <i className="bx bx-search"></i>
              </div>
            )}
          </div>
        </div>
        <div className="loginSignUp">
          <Link to="/login">
            <Button classType={"login"}>Login</Button>
          </Link>
          <Link to="/signup" className={styles.signUpLink}>
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
