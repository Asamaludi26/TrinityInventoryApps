import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { QueryProvider } from "./providers/QueryProvider";
import { NotificationProvider } from "./providers/NotificationProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
