"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import {
  Bell,
  Check,
  CheckCheck,
  MessageCircle,
  Loader2,
  Mail,
  MailOpen,
} from "lucide-react";

export default function Notifications() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const NotificationItem = ({
    notification,
  }: {
    notification: Notification;
  }) => (
    <div
      className={`p-3 hover:bg-gray-50 transition-colors border-l-4 ${
        notification.is_read
          ? "border-transparent bg-white"
          : "border-blue-500 bg-blue-50"
      }`}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`p-2 rounded-full ${
            notification.is_read ? "bg-gray-100" : "bg-blue-100"
          }`}
        >
          <MessageCircle
            className={`w-4 h-4 ${
              notification.is_read ? "text-gray-500" : "text-blue-600"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p
              className={`text-sm ${
                notification.is_read
                  ? "text-gray-600"
                  : "text-gray-900 font-medium"
              }`}
            >
              Someone replied to your comment
            </p>
            {!notification.is_read && (
              <Button
                onClick={(e) => handleMarkAsRead(notification.id, e)}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 p-1 h-auto"
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
          </div>

          {notification.comment && (
            <p className="text-sm text-gray-500 mt-1 truncate">
              "{notification.comment.content}"
            </p>
          )}

          <div className="flex items-center mt-2 space-x-2">
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </span>
            {notification.is_read && (
              <div className="flex items-center text-xs text-gray-400">
                <MailOpen className="w-3 h-3 mr-1" />
                Read
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-hidden p-0"
        sideOffset={8}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
            </p>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">
                Loading notifications...
              </span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Mail className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                All caught up!
              </h3>
              <p className="text-gray-500 text-sm">
                No new notifications to show
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full text-blue-600 hover:text-blue-700"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
