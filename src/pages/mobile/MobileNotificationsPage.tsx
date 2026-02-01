import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
}

// Mock notifications for now
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Appointment",
    message: "Patient Ahmed Khan booked an appointment for tomorrow at 10:00 AM",
    type: "info",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    title: "Lab Results Ready",
    message: "Blood test results for patient Sara Ali are now available",
    type: "success",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "3",
    title: "Critical Vitals Alert",
    message: "Patient in Room 204 has abnormal blood pressure readings",
    type: "warning",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "4",
    title: "Surgery Scheduled",
    message: "Appendectomy surgery confirmed for tomorrow 8:00 AM in OT-1",
    type: "info",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
];

export default function MobileNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const haptics = useHaptics();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRefresh = async () => {
    // TODO: Fetch real notifications from API
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const markAsRead = (id: string) => {
    haptics.light();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    haptics.medium();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    haptics.medium();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "border-l-success bg-success/5";
      case "warning":
        return "border-l-warning bg-warning/5";
      case "error":
        return "border-l-destructive bg-destructive/5";
      default:
        return "border-l-info bg-info/5";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 py-4 bg-background border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="px-4 py-4 space-y-2">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "border-l-4 transition-all touch-manipulation",
                  getTypeStyles(notification.type),
                  !notification.read && "shadow-sm"
                )}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={cn(
                            "text-sm font-medium truncate",
                            !notification.read && "font-semibold"
                          )}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No notifications</p>
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}
