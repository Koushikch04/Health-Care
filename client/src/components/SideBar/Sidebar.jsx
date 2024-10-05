import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./Sidebar.module.css";
import { UilSignOutAlt } from "@iconscout/react-unicons";
import { SidebarData } from "../../Data/Data";
import { UilBars } from "@iconscout/react-unicons";
import { motion } from "framer-motion";

const Sidebar = () => {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpaned] = useState(true);
  const navigate = useNavigate();
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
      <div
        className={classes.bars}
        style={expanded ? { left: "60%" } : { left: "5%" }}
        onClick={() => setExpaned(!expanded)}
      >
        <UilBars />
      </div>
      <motion.div
        className={classes.sidebar}
        variants={sidebarVariants}
        animate={window.innerWidth <= 768 ? `${expanded}` : ""}
      >
        <div className={classes.logo}>
          <span>
            <span>Health</span>Care
          </span>
        </div>

        <div className={classes.menu}>
          {SidebarData.map((item, index) => {
            return (
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
            );
          })}
          <div className={classes.menuItem}>
            <UilSignOutAlt />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
