import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EventCard } from "@/components/app/event-card";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { EVENT_PLACEHOLDERS } from "@/lib/placeholders";

export default async function EventsPage() {
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

  const events = await prisma.sparringEvent.findMany({
    where: {
      dateTimeStart: { gt: new Date() }
    },
    include: {
      gym: true,
      createdByCoach: true
    },
    orderBy: { dateTimeStart: "asc" }
  });

  const sorted = [...events].sort((a, b) => {
    const planRank = (plan: string) => (plan === "PRO" ? 1 : 0);
    const planDiff = planRank(b.createdByCoach.plan) - planRank(a.createdByCoach.plan);
    if (planDiff !== 0) return planDiff;
    return new Date(a.dateTimeStart).getTime() - new Date(b.dateTimeStart).getTime();
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Events"
        description="Discover upcoming sparring events across gyms."
        action={
          <Link href="/app/events/new">
            <Button>Create event</Button>
          </Link>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          title="No upcoming events"
          description="Create the first sparring event to start matching coaches."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sorted.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              imageUrl={event.createdByCoach.profileImageUrl ?? EVENT_PLACEHOLDERS[index % EVENT_PLACEHOLDERS.length]}
              action={
                <Link href={`/app/events/${event.id}`}>
                  <Button variant={event.createdByCoachId === coachId ? "secondary" : "primary"} className="w-full">
                    {event.createdByCoachId === coachId ? "Manage" : "View & Join"}
                  </Button>
                </Link>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
