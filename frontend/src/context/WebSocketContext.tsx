import { useEffect, useState, createContext } from "react";
import io from "socket.io-client";

export const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<any>();
  useEffect(() => {
    const newSocket = io("http://localhost:3000");
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
