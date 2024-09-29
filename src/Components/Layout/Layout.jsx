import React from "react";
import Navbar from "../Navbar/Navbar";

function Layout({ navbarPresent = false, children }) {
  return (
    <>
      {navbarPresent && <Navbar />}
      <main style={{ paddingTop: navbarPresent ? "20px" : "0px" }}>
        {children}
      </main>
    </>
  );
}

export default Layout;
