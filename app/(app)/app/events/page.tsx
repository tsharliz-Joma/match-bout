import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { EventsBrowser } from "@/components/app/events-browser";

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

  const serializedEvents = sorted.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    dateTimeStart: event.dateTimeStart.toISOString(),
    dateTimeEnd: event.dateTimeEnd.toISOString(),
    skillLevel: event.skillLevel,
    weightClassMinKg: event.weightClassMinKg,
    weightClassMaxKg: event.weightClassMaxKg,
    stancePreference: event.stancePreference,
    maxParticipants: event.maxParticipants,
    createdByCoachId: event.createdByCoachId,
    gym: {
      name: event.gym.name,
      plan: event.gym.plan
    },
    createdByCoach: {
      fullName: event.createdByCoach.fullName,
      plan: event.createdByCoach.plan,
      profileImageUrl: event.createdByCoach.profileImageUrl
    }
  }));

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
          actionLabel="Create event"
          actionHref="/app/events/new"
        />
      ) : (
        <EventsBrowser events={serializedEvents} coachId={coachId} />
      )}
    </div>
  );
}
