import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store/index.js";

import App from "./App.jsx";
import "./index.css";
import AlertsContainer from "./components/UI/Notification/AlertsContainer/AlertsContainer.jsx";
import { BrowserRouter } from "react-router-dom";
import AppErrorBoundary from "./components/UI/ErrorBoundary/AppErrorBoundary.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <AppErrorBoundary>
        <AlertsContainer position="top-left" />
        <App />
      </AppErrorBoundary>
    </Provider>
  </BrowserRouter>
);
