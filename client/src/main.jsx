import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store/index.js";

import App from "./App.jsx";
import "./index.css";
import AlertsContainer from "./components/UI/Notification/AlertsContainer/AlertsContainer.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AlertsContainer position="top-right" />
    <App />
  </Provider>
);
