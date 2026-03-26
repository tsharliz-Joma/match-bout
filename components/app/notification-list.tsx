"use client";

import { useRouter } from "next/navigation";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  linkUrl?: string | null;
}

export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  const router = useRouter();

  if (notifications.length === 0) {
    return <p className="text-sm text-muted">No notifications yet.</p>;
  }

  const handleRead = async (id: string) => {
    const result = await markNotificationRead(id);
    if (!result.success) {
      toast.error(result.error ?? "Unable to mark read");
      return;
    }
    toast.success("Marked as read");
    router.refresh();
  };

  const handleReadAll = async () => {
    const result = await markAllNotificationsRead();
    if (!result.success) {
      toast.error(result.error ?? "Unable to mark all read");
      return;
    }
    toast.success("All notifications marked as read");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your notifications</h3>
        <Button variant="ghost" size="sm" onClick={handleReadAll}>Mark all read</Button>
      </div>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="rounded-lg border border-white/10 bg-charcoal p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{notification.title}</p>
                <p className="text-xs text-muted">{notification.createdAt}</p>
              </div>
              {notification.isRead ? (
                <Badge variant="outline">Read</Badge>
              ) : (
                <Badge variant="warning">New</Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-white/80">{notification.body}</p>
            {!notification.isRead && (
              <div className="mt-3">
                <Button size="sm" variant="secondary" onClick={() => handleRead(notification.id)}>
                  Mark read
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
