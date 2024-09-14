import React from "react";
import Navbar from "../Navbar/Navbar";

function Layout(props) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px" }}>{props.children}</main>
    </>
  );
}

export default Layout;
