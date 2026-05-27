import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import { API } from "../../apis";
 const CHAT_API = API.CHAT;

const CHAT_SOCKET_URL =  API.CHAT;

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(CHAT_SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("[socket] Connected:", socket.id);
      socket.emit("getOnlineUsers");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("[socket] Disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("[socket] Connection error:", err.message);
      setIsConnected(false);
    });

    socket.on("onlineUsers", (userIds) => {
      setOnlineUsers(new Set(userIds.map(String)));
    });

    socket.on("userOnline", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, String(userId)]));
    });

    socket.on("userOffline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(String(userId));
        return next;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const value = {
  get socket() {
    return socketRef.current;
  },
  isConnected,
  onlineUsers,
};

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocketContext must be used inside SocketProvider");
  return ctx;
};