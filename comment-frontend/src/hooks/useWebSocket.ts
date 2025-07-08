import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

export function useWebSocket(onCommentUpdate?: () => void) {
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !user) {
      // Disconnect if no auth
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to WebSocket server
    const API_BASE =
      process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3600";
    const socket = io(`${API_BASE}/notifications`, {
      auth: {
        token: token,
      },
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ WebSocket connected");
    });

    socket.on("connected", (data) => {
      console.log("✅ WebSocket authenticated for user:", data.userId);
    });

    // Listen for comment events
    socket.on("newComment", (comment) => {
      console.log("📝 New comment received:", comment);
      onCommentUpdate?.();
    });

    socket.on("commentUpdated", (comment) => {
      console.log("✏️ Comment updated:", comment);
      onCommentUpdate?.();
    });

    socket.on("commentDeleted", ({ commentId }) => {
      console.log("🗑️ Comment deleted:", commentId);
      onCommentUpdate?.();
    });

    socket.on("commentRestored", (comment) => {
      console.log("♻️ Comment restored:", comment);
      onCommentUpdate?.();
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user, onCommentUpdate]);

  return socketRef.current;
}
