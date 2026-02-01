import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck,
  Calendar,
  FlaskConical,
  Pill,
  Stethoscope,
  AlertTriangle,
  Info,
  ArrowLeft
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHaptics } from "@/hooks/useHaptics";
import { Capacitor } from "@capacitor/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: 'appointment' | 'lab' | 'pharmacy' | 'consultation' | 'alert' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Mock notifications - replace with real data from Supabase
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: 'You have an appointment with Dr. Ahmed in 30 minutes',
    timestamp: new Date(),
    read: false
  },
  {
    id: '2',
    type: 'lab',
    title: 'Lab Results Ready',
    message: 'Blood test results for patient John Doe are ready for review',
    timestamp: new Date(Date.now() - 3600000),
    read: false
  },
  {
    id: '3',
    type: 'pharmacy',
    title: 'Prescription Dispensed',
    message: 'Prescription #RX-12345 has been dispensed successfully',
    timestamp: new Date(Date.now() - 7200000),
    read: true
  },
  {
    id: '4',
    type: 'alert',
    title: 'Critical Alert',
    message: 'Patient vitals require immediate attention in Room 302',
    timestamp: new Date(Date.now() - 10800000),
    read: true
  }
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'appointment': return Calendar;
    case 'lab': return FlaskConical;
    case 'pharmacy': return Pill;
    case 'consultation': return Stethoscope;
    case 'alert': return AlertTriangle;
    default: return Info;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'appointment': return 'text-blue-500 bg-blue-500/10';
    case 'lab': return 'text-purple-500 bg-purple-500/10';
    case 'pharmacy': return 'text-green-500 bg-green-500/10';
    case 'consultation': return 'text-teal-500 bg-teal-500/10';
    case 'alert': return 'text-red-500 bg-red-500/10';
    default: return 'text-gray-500 bg-gray-500/10';
  }
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const haptics = useHaptics();
  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;
  
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    haptics.light();
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    haptics.medium();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const Icon = getNotificationIcon(notification.type);
    const colorClass = getNotificationColor(notification.type);
    
    return (
      <div 
        onClick={() => markAsRead(notification.id)}
        className={cn(
          "flex items-start gap-3 p-4 border-b last:border-b-0 transition-colors cursor-pointer",
          "touch-manipulation active:bg-muted/50",
          !notification.read && "bg-primary/5"
        )}
      >
        <div className={cn("p-2 rounded-full", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={cn(
              "font-medium truncate",
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </h3>
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {format(notification.timestamp, 'h:mm a')} • {format(notification.timestamp, 'MMM d')}
          </p>
        </div>
      </div>
    );
  };

  // Mobile Layout
  if (showMobileUI) {
    return (
      <div className="pb-24">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="text-primary"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="bg-card">
            {notifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BellOff className="h-16 w-16 opacity-30 mb-4" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="container max-w-3xl py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <BellOff className="h-16 w-16 opacity-30 mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
