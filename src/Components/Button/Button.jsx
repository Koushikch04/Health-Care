import React from "react";
import "./Button.css";

const Button = ({ children, style, onClick, classType }) => {
  return (
    <button style={style} className={classType} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
