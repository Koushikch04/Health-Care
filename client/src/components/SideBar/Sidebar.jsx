import React, { useRef, useState } from "react";
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
  const logoutInProgressRef = useRef(false);

  const { userRole: role, userInfo } = useSelector((state) => state.auth);
  const isAdminRole = role === "admin" || role === "superadmin";
  console.log(role);

  const getPermissionValue = (permissions, key) => {
    if (!permissions) return false;
    if (permissions instanceof Map) return Boolean(permissions.get(key));
    if (Array.isArray(permissions)) {
      const entry = permissions.find(
        (perm) => perm?.[0] === key || perm?.key === key,
      );
      return Boolean(entry?.[1] ?? entry?.value);
    }
    return Boolean(permissions[key]);
  };

  const logoutHandler = async () => {
    if (logoutInProgressRef.current) return;
    logoutInProgressRef.current = true;

    try {
      await dispatch(logoutUser(alert));
      navigate("/", { replace: true });
    } finally {
      logoutInProgressRef.current = false;
    }
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
          {SidebarData.filter((item) => {
            const roleAllowed =
              !item.role ||
              item.role === role ||
              (item.role === "admin" && isAdminRole);

            if (!roleAllowed) return false;
            if (item.role === "admin" && item.permission) {
              return getPermissionValue(userInfo?.permissions, item.permission);
            }
            return true;
          }).map((item, index) => (
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
