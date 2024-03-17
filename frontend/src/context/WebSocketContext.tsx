import { useEffect, useState, createContext } from "react";
import io, { Socket } from "socket.io-client";

export const WebSocketContext = createContext<Socket | null>(null);
const apiUrl = import.meta.env.VITE_API_URL;

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const newSocket = io(apiUrl);
    newSocket.on("connect", () => {
      console.log("Connected to server");
    });
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);
  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
}
