import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { io } from "socket.io-client";

const apiUri = import.meta.env.VITE_REACT_API_URI;
const socketUri = apiUri.replace(/\/api.*/, ""); // Remove /api if present

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(AuthContext);
  const socketRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user?.user?._id) return; // Don't fetch if user is not authenticated
    
    try {
      const response = await axios.get(`${apiUri}/api/notifications`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response?.status === 401) {
        // Handle unauthorized error - user might need to log in again
        toast.error('Please log in to view notifications');
      }
    }
  };

  useEffect(() => {
    if (user?.user?._id) {
      fetchNotifications();
      
      // Connect to Socket.IO
      socketRef.current = io(socketUri, {
        withCredentials: true,
        transports: ["websocket"],
        auth: {
          userId: user.user._id
        }
      });

      // Authenticate/join room
      socketRef.current.emit("authenticate", user.user._id);

      // Listen for notification events
      socketRef.current.on("notification", (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.success("New notification received!");
      });

      // Handle connection errors
      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        if (error.message === "Unauthorized") {
          toast.error("Please log in to receive notifications");
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user?.user?._id]);

  const handleMarkAsRead = async (notificationId) => {
    if (!user?.user?._id) return;
    
    try {
      await axios.patch(
        `${apiUri}/api/notifications/${notificationId}/read`,
        {},
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.user?._id) return;
    
    try {
      await axios.patch(
        `${apiUri}/api/notifications/read-all`,
        {},
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Don't render the notification bell if user is not authenticated
  if (!user?.user?._id) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 px-2"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className="flex flex-col items-start p-4 cursor-pointer"
                onClick={() => handleMarkAsRead(notification._id)}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notification.createdAt), 'PPp')}
                    </p>
                  </div>
                  {!notification.read && (
                    <Badge variant="secondary" className="h-2 w-2 rounded-full" />
                  )}
                </div>
                {notification.ride && (
                  <Link
                    to={`/ride/${notification.ride._id}`}
                    className="text-xs text-primary mt-1 hover:underline"
                  >
                    View Ride Details
                  </Link>
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell; 