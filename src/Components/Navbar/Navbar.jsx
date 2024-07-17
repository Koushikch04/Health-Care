import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import "boxicons/css/boxicons.min.css";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("mode") === "dark-mode";
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  console.log(searchOpen);

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
    <nav className={menuOpen ? "active" : ""}>
      <div className="nav-bar">
        <i className="bx bx-menu sidebarOpen" onClick={toggleMenu}></i>
        <div className="logo navbar__logo">
          <a href="#">
            Health<span>Care</span>
          </a>
        </div>
        <div className={`menu ${menuOpen ? "active" : ""}`}>
          <div className="logo-toggle">
            <span className="logo">
              <Link to="/">Health Care</Link>
            </span>
            <i className="bx bx-x sideBarClose" onClick={closeMenu}></i>
          </div>
          <ul className="nav-links">
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
        <div className="darkLight-searchBox">
          <div className="dark-light" onClick={toggleDarkMode}>
            <i className={`bx ${darkMode ? "bx-sun" : "bx-moon"}`}></i>
          </div>
          <div className={`searchBox`}>
            <div
              className={`searchToggle ${searchOpen ? "active" : ""} `}
              onClick={toggleSearch}
            >
              <i
                className={`bx ${
                  searchOpen ? "bx-x cancel" : "bx-search search"
                }`}
              ></i>
            </div>
            {searchOpen && (
              <div className="search-field">
                <input type="text" placeholder="Search..." />
                <i className="bx bx-search"></i>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
