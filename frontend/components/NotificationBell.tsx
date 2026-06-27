"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { toast } from "sonner";

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const timeAgo = (dateString: string) => {
  const parsed = new Date(dateString).getTime();
  if (isNaN(parsed)) return "recently";
  const seconds = Math.floor((Date.now() - parsed) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getMyNotifications();
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const res = await notificationsApi.markAsRead(id);
    if (res.success) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const res = await notificationsApi.markAllAsRead();
    if (res.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await notificationsApi.deleteNotification(id);
    if (res.success) {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => {
        const target = notifications.find((n) => n._id === id);
        return target && !target.read ? Math.max(0, prev - 1) : prev;
      });
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 rounded-lg relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-linear-to-r from-cyan-500 to-blue-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 bg-slate-900 border-slate-800 text-slate-200 mt-2 max-h-[28rem] overflow-y-auto"
        align="end"
      >
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0 text-white font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-slate-800" />

        {loading && notifications.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-slate-400">
            Loading notifications...
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-slate-400">
            You're all caught up — no notifications yet.
          </div>
        )}

        {notifications.map((notification) => (
          <DropdownMenuItem
            key={notification._id}
            onClick={() =>
              !notification.read && handleMarkAsRead(notification._id)
            }
            className={`cursor-pointer flex flex-col items-start gap-1 px-3 py-2.5 rounded-lg focus:bg-slate-800 ${
              notification.read ? "text-slate-400" : "text-slate-100 bg-slate-800/50"
            }`}
          >
            <div className="flex w-full items-start justify-between gap-2">
              <span
                className={`text-sm font-medium ${
                  notification.read ? "text-slate-300" : "text-white"
                }`}
              >
                {notification.title}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {!notification.read && (
                  <span className="h-2 w-2 rounded-full bg-cyan-500" />
                )}
                <button
                  onClick={(e) => handleDelete(notification._id, e)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="text-xs leading-snug">{notification.message}</p>
            <span className="text-[10px] text-slate-500">
              {timeAgo(notification.createdAt)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
