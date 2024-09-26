import React from "react";
import { Route, Routes } from "react-router-dom";
import Profile from "./Profile";
import ProfileDetails from "../../Pages/ProfileDetails";

function ProfileRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Profile />}>
        <Route path="details" element={<ProfileDetails />} />
      </Route>
    </Routes>
  );
}

export default ProfileRoutes;
