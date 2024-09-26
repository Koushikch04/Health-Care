import React from "react";
import Navbar from "../Navbar/Navbar";

function Layout({ navbarPresent = false, children }) {
  return (
    <>
      {navbarPresent && <Navbar />}
      <main style={{ paddingTop: navbarPresent ? "70px" : "0px" }}>
        {children}
      </main>
    </>
  );
}

export default Layout;
