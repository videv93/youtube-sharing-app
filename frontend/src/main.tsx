import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import "./index.css";
import theme from "./theme.tsx";
import { WebSocketProvider } from "./context/WebSocketContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <WebSocketProvider>
        <CssBaseline />
        <App />
      </WebSocketProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
