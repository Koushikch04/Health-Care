import React from "react";
import "./Profile.css";
import Sidebar from "../SideBar/Sidebar";
import RightSide from "../RigtSide/RightSide";
import { Outlet } from "react-router-dom";

function Profile() {
  return (
    <div className="Profile">
      <div className="ProfileClass">
        <Sidebar />
        <div className="PageContent">
          <Outlet />
        </div>
        <RightSide />
      </div>
    </div>
  );
}

export default Profile;
