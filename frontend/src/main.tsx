import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RouterApp from "./RouterApp";
import { QueryProvider } from "./providers/QueryProvider";
import { NotificationProvider } from "./providers/NotificationProvider";
import "./index.css";

/**
 * Application Entry Point
 *
 * Provider hierarchy:
 * 1. BrowserRouter - React Router for URL-based navigation
 * 2. QueryProvider - TanStack Query for data fetching & caching
 * 3. NotificationProvider - Toast notifications
 * 4. RouterApp - Main application with routes
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <NotificationProvider>
          <RouterApp />
        </NotificationProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
