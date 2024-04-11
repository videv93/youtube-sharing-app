import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import "./index.css";
import theme from "./theme.tsx";
import { WebSocketProvider } from "./context/WebSocketContext.tsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from "./routes.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <WebSocketProvider>
        <CssBaseline />
        <RouterProvider
          router={createBrowserRouter(routes)}
          fallbackElement={<p>Inital Load...</p>}
        />
      </WebSocketProvider>
    </ThemeProvider>
  </React.StrictMode>
);
