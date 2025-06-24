import { NavLink, Link, useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Clock, Info, Mail, UserCheck, UserPlus, UserX, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead, logout } from "@/lib/api";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { cn, formatNotificationDate } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useUser } from "@/contexts/UserContext";


const notificationIcons = {
  EVENT_INVITATION_RECEIVED: <Mail className="h-4 w-4" />,
  EVENT_CANCELLED: <XCircle className="h-4 w-4" />,
  EVENT_DETAILS_UPDATED: <Info className="h-4 w-4" />,
  INVITATION_ACCEPTED: <UserCheck className="h-4 w-4" />,
  INVITATION_DECLINED: <UserX className="h-4 w-4" />,
  EVENT_REMINDER: <Clock className="h-4 w-4" />,
  ADDED_AS_ORGANIZER: <UserPlus className="h-4 w-4" />,
  REMOVED_AS_ORGANIZER: <UserX className="h-4 w-4" />,
  KICKED_OUT_FROM_EVENT: <UserX className="h-4 w-4" />,
  DEFAULT: <Bell className="h-4 w-4" />,
};

const getNotificationIcon = (type: string) => {
  return notificationIcons[type] || notificationIcons.DEFAULT;
}

const Header = () => {
  const navigate = useNavigate();
  const { user, clearUserState } = useUser();
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `transition-colors hover:text-foreground ${
      isActive ? "text-foreground font-semibold" : "text-muted-foreground"
    }`;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserNotifications = () => {
    setLoading(true);
    setError(null);
    fetchNotifications()
      .then(res => {
        const notificationsData = Array.isArray(res.data) ? res.data : [];
        setNotifications(notificationsData);
      })
      .catch(() => {
        setError("Failed to load notifications.");
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  };
  
  useEffect(() => {
    fetchUserNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    setNotifications(notifications => notifications.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await markNotificationAsRead(id);
      fetchUserNotifications();
    } catch {
      setError("Failed to mark as read.");
    }
  };
  
  const handleMarkAllAsRead = async () => {
    setNotifications(notifications => notifications.map(n => ({ ...n, read: true })));
    try {
      await markAllNotificationsAsRead();
      fetchUserNotifications();
    } catch {
      setError("Failed to mark all as read.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Clear all user-related state
      clearUserState();
      setNotifications([]);
      setError(null);
      setLoading(false);
      // Redirect to landing page
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear state and redirect even if logout API fails
      clearUserState();
      setNotifications([]);
      setError(null);
      setLoading(false);
      navigate("/", { replace: true });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 py-2 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:pt-4">
      
      <div className="flex items-center gap-2">
         <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <img src="/logo.jpg" alt="Logo" className="h-7 w-7" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Huddle</span>
          </Link>
      </div>

      <div className="flex-1 flex justify-center">
        <nav className="hidden md:flex items-center gap-8 text-base font-medium">
            <NavLink to="/dashboard" end className={navLinkClasses}>Events</NavLink>
            <NavLink to="/dashboard/invitations" className={navLinkClasses}>Invitations</NavLink>
        </nav>
      </div>

      <div className="relative flex items-center gap-4 md:grow-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0" variant="destructive">{unreadCount}</Badge>}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96">
            <div className="flex justify-between items-center p-2">
              <DropdownMenuLabel className="text-lg font-semibold">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={(e) => {
                      e.preventDefault();
                      handleMarkAllAsRead();
                    }}>
                      <CheckCheck className="h-5 w-5" />
                      <span className="sr-only">Mark all as read</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mark all as read</TooltipContent>
                </Tooltip>
              )}
            </div>
            <DropdownMenuSeparator />
            <ScrollArea className="h-96">
              {loading ? (
                <p className="p-4 text-sm text-muted-foreground">Loading...</p>
              ) : error ? (
                <p className="p-4 text-sm text-red-500">{error}</p>
              ) : notifications.length > 0 ? notifications.map(notif => (
                <DropdownMenuItem key={notif.id} onSelect={(e) => e.preventDefault()} className={cn("p-2 items-start gap-3", !notif.read && "bg-secondary/50")}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="grid gap-1 flex-1">
                    <p className="text-sm font-medium leading-snug">
                      {notif.recipient ? (
                        <span className="font-semibold">{notif.recipient.name}</span>
                      ) : null}
                      <span className="font-normal text-muted-foreground ml-1">{notif.message}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{formatNotificationDate(notif.createdAt)}</p>
                  </div>
                  {!notif.read && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMarkAsRead(notif.id)}>
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Mark as read</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Mark as read</TooltipContent>
                    </Tooltip>
                  )}
                </DropdownMenuItem>
              )) : (
                <p className="p-4 text-sm text-muted-foreground">No new notifications.</p>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profilePictureUrl} alt={`${user?.firstName} ${user?.lastName}`} />
                <AvatarFallback>{`${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild><Link to="/dashboard/account">Profile</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
