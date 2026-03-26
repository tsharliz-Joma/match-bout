import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/app/stat-card";
import { EventCard } from "@/components/app/event-card";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { LogoutButton } from "@/components/app/logout-button";
import { EVENT_PLACEHOLDERS } from "@/lib/placeholders";

export default async function DashboardPage() {
  const session = await auth();
  const coachId = session?.user?.id;

  if (!coachId) {
    return null;
  }

  const coach = await prisma.coach.findUnique({
    where: { id: coachId },
    include: { gym: true }
  });

  if (!coach?.gymId) {
    return null;
  }

  const [fightersCount, upcomingEvents, pendingJoins, sparRequests, notifications] = await Promise.all([
    prisma.fighter.count({ where: { gymId: coach.gymId } }),
    prisma.sparringEvent.findMany({
      where: { gymId: coach.gymId, dateTimeStart: { gt: new Date() } },
      include: { gym: true, createdByCoach: true },
      orderBy: { dateTimeStart: "asc" },
      take: 3
    }),
    prisma.eventJoin.count({
      where: { event: { createdByCoachId: coach.id }, status: "PENDING" }
    }),
    prisma.sparRequest.count({
      where: { toCoachId: coach.id, status: "PENDING" }
    }),
    prisma.notification.count({
      where: { toCoachId: coach.id, isRead: false }
    })
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your gym activity at a glance."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/app/events/new">
              <Button>Create event</Button>
            </Link>
            <LogoutButton />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Fighters" value={fightersCount} hint="Active roster" />
        <StatCard label="Pending joins" value={pendingJoins} hint="Event join requests" />
        <StatCard label="Spar requests" value={sparRequests} hint="Incoming this week" />
        <StatCard label="Unread alerts" value={notifications} hint="Notifications" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Upcoming gym events</h3>
          <Link href="/app/events" className="text-sm text-muted hover:text-white">View all</Link>
        </div>
        {upcomingEvents.length === 0 ? (
          <EmptyState
            title="No upcoming events"
            description="Create your first sparring event to start matching fighters."
            actionLabel="Create event"
            actionHref="/app/events/new"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {upcomingEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                imageUrl={event.createdByCoach.profileImageUrl ?? EVENT_PLACEHOLDERS[index % EVENT_PLACEHOLDERS.length]}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Reliability & Reputation</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Cancellation rate" value={`${(coach.cancellationRate ?? 0).toFixed(1)}%`} hint="Last 90 days" />
          <StatCard label="No-show rate" value={`${(coach.noShowRate ?? 0).toFixed(1)}%`} hint="Last 90 days" />
          <StatCard label="Responsiveness" value={`${(coach.responsivenessScore ?? 0).toFixed(0)}/100`} hint="Replies within 24h" />
          <StatCard label="Approval rate" value={`${(coach.approvalRate ?? 0).toFixed(1)}%`} hint="Event join approvals" />
        </div>
      </section>
    </div>
  );
}
