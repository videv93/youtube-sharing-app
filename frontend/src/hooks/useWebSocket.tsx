import { useContext } from "react";
import { WebSocketContext } from "../context/WebSocketContext";

export function useWebSocket() {
  return useContext(WebSocketContext);
}
