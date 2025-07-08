import { useState, useEffect, useCallback } from "react";
import client from "../lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "./useWebSocket";
import { toast } from "sonner";

export interface Notification {
  id: string;
  recipient_id: string;
  comment_id: string;
  is_read: boolean;
  created_at: string;
  comment?: {
    id: string;
    content: string;
    author_id: string;
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const socket = useWebSocket();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await client.get("/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user, fetchNotifications]);

  // WebSocket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      console.log("🔔 New notification received via WebSocket:", notification);

      setNotifications((prev) => [notification, ...prev]);

      toast.success("💬 New reply to your comment!", {
        action: {
          label: "View",
          onClick: () => console.log("View notification clicked"),
        },
      });
    };

    const handleNotificationUpdate = (updatedNotification: Notification) => {
      console.log(
        "🔄 Notification updated via WebSocket:",
        updatedNotification
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === updatedNotification.id
            ? updatedNotification
            : notification
        )
      );
    };

    socket.on("newNotification", handleNewNotification);
    socket.on("notificationUpdated", handleNotificationUpdate);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("notificationUpdated", handleNotificationUpdate);
    };
  }, [socket]);

  const markAsRead = async (id: string) => {
    try {
      await client.patch(`/notifications/${id}/read`, { is_read: true });
      // WebSocket will handle the update via 'notificationUpdated' event
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark as read");
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.is_read);

      await Promise.all(
        unreadNotifications.map((notification) =>
          client.patch(`/notifications/${notification.id}/read`, {
            is_read: true,
          })
        )
      );

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
