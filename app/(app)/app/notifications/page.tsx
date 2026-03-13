import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationList } from "@/components/app/notification-list";

export default async function NotificationsPage() {
  const session = await auth();
  const coachId = session?.user?.id;

  if (!coachId) {
    return null;
  }

  const notifications = await prisma.notification.findMany({
    where: { toCoachId: coachId },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Stay on top of event activity." />
      <Card>
        <CardContent>
          <NotificationList
            notifications={notifications.map((notification) => ({
              id: notification.id,
              title: notification.title,
              body: notification.body,
              createdAt: notification.createdAt.toLocaleString(),
              isRead: notification.isRead,
              linkUrl: notification.linkUrl
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
