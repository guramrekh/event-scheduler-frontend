import { useEffect, useState } from "react";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatNotificationDate } from "@/lib/utils";

interface Notification {
  id: number;
  recipient: any;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
}

const NotificationsWindow = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [marking, setMarking] = useState<{ [id: number]: boolean }>({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchNotifications()
      .then(res => setNotifications(res.data))
      .catch(() => setError("Failed to load notifications."))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications => notifications.map(n => ({ ...n, read: true })));
    } catch {
      setError("Failed to mark all as read.");
    }
    setMarkingAll(false);
  };

  const handleMarkAsRead = async (id: number) => {
    setMarking(m => ({ ...m, [id]: true }));
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications => notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      setError("Failed to mark notification as read.");
    }
    setMarking(m => ({ ...m, [id]: false }));
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Notifications</h1>
        <Button variant="outline" onClick={handleMarkAllAsRead} disabled={markingAll || notifications.every(n => n.read)}>
          Mark all as read
        </Button>
      </div>
      <div>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No notifications.</div>
        ) : notifications.length > 5 ? (
          <div className="h-[400px]">
            <ScrollArea className="h-full">
              <div className="grid gap-4 pr-4">
                {notifications.map(n => (
                  <Card
                    key={n.id}
                    className={`flex items-center justify-between p-4 ${!n.read ? 'bg-accent/30 border-accent' : ''}`}
                  >
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {n.message}
                        {!n.read && <Badge variant="destructive">New</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{formatNotificationDate(n.createdAt)}</div>
                    </div>
                    <Button
                      size="sm"
                      variant={n.read ? "outline" : "default"}
                      onClick={() => handleMarkAsRead(n.id)}
                      disabled={n.read || marking[n.id]}
                    >
                      {n.read ? "Read" : marking[n.id] ? "Marking..." : "Mark as read"}
                    </Button>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="grid gap-4">
            {notifications.map(n => (
              <Card
                key={n.id}
                className={`flex items-center justify-between p-4 ${!n.read ? 'bg-accent/30 border-accent' : ''}`}
              >
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {n.message}
                    {!n.read && <Badge variant="destructive">New</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{formatNotificationDate(n.createdAt)}</div>
                </div>
                <Button
                  size="sm"
                  variant={n.read ? "outline" : "default"}
                  onClick={() => handleMarkAsRead(n.id)}
                  disabled={n.read || marking[n.id]}
                >
                  {n.read ? "Read" : marking[n.id] ? "Marking..." : "Mark as read"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsWindow; 