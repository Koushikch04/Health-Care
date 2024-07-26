// import React, { useState } from "react";
// import Toast from "../Toast/Toast";

// const ToastContainer = () => {
//   const [toasts, setToasts] = useState([]);

//   const addToast = (message, duration = 5000) => {
//     setToasts([...toasts, { message, duration }]);
//   };

//   const removeToast = (index) => {
//     setToasts(toasts.filter((_, i) => i !== index));
//   };

//   return (
//     <div className="toast-container">
//       {toasts.map((toast, index) => (
//         <Toast
//           key={index}
//           message={toast.message}
//           onClose={() => removeToast(index)}
//           duration={toast.duration}
//         />
//       ))}
//       <button onClick={() => addToast("Sample Toast Message")}>
//         Show Toast
//       </button>
//     </div>
//   );
// };

// export default ToastContainer;

import React from "react";
import "./ToastContainer.css"; // For container styling

const ToastContainer = ({ children }) => {
  return <div className="toast-container">{children}</div>;
};

export default ToastContainer;
