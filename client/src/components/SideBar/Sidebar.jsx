import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import classes from "./Sidebar.module.css";
import { UilSignOutAlt } from "@iconscout/react-unicons";
import { SidebarData } from "../../Data/Data";
import { UilBars } from "@iconscout/react-unicons";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import useAlert from "../../hooks/useAlert";
import { logoutUser } from "../../store/auth/auth-actions";

const Sidebar = () => {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(true);

  const { alert } = useAlert();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userRole: role } = useSelector((state) => state.auth);
  const isAdminRole = role === "admin" || role === "superadmin";
  console.log(role);

  const logoutHandler = () => {
    navigate("/");
    dispatch(logoutUser(alert));
  };

  const sidebarVariants = {
    true: {
      left: "0",
    },
    false: {
      left: "-60%",
    },
  };

  return (
    <>
      {/* <div
        className={classes.bars}
        style={expanded ? { left: "60%" } : { left: "5%" }}
        onClick={() => setExpaned(!expanded)}
      >
        <UilBars />
      </div> */}
      <motion.div
        className={classes.sidebar}
        variants={sidebarVariants}
        animate={window.innerWidth <= 768 ? `${expanded}` : ""}
      >
        <div className={classes.logo}>
          <Link to={"/"}>
            <span>
              <span>Health</span>Care
            </span>
          </Link>
        </div>

        <div className={classes.menu}>
          {SidebarData.filter(
            (item) =>
              !item.role ||
              item.role === role ||
              (item.role === "admin" && isAdminRole)
          ).map((item, index) => (
            <div
              className={
                selected === index
                  ? `${classes.menuItem} ${classes.active}`
                  : classes.menuItem
              }
              key={index}
              onClick={() => {
                setSelected(index);
                if (item.url) {
                  navigate(item.url);
                }
              }}
            >
              <item.icon />
              <span>{item.heading}</span>
            </div>
          ))}
          <div className={classes.menuItem} onClick={logoutHandler}>
            <UilSignOutAlt /> <span>Log out</span>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
