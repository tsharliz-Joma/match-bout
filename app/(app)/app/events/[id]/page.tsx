import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EventCard } from "@/components/app/event-card";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventJoinForm } from "@/components/app/event-join-form";
import { EventJoinList } from "@/components/app/event-join-list";
import { AddToCalendar } from "@/components/app/add-to-calendar";
import { EVENT_PLACEHOLDERS } from "@/lib/placeholders";

interface EventDetailPageProps {
  params: { id: string };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const session = await auth();
  const coachId = session?.user?.id;

  if (!coachId) {
    return null;
  }

  const event = await prisma.sparringEvent.findUnique({
    where: { id: params.id },
    include: {
      gym: true,
      createdByCoach: true,
      joins: {
        include: { fighter: true, coach: true }
      }
    }
  });

  if (!event) {
    notFound();
  }

  const coach = await prisma.coach.findUnique({
    where: { id: coachId }
  });

  if (!coach?.gymId) {
    return null;
  }

  const fighters = await prisma.fighter.findMany({
    where: { gymId: coach.gymId },
    orderBy: { fullName: "asc" }
  });

  const hasRequested = event.joins.some((join) => join.coachId === coachId);
  const isCreator = event.createdByCoachId === coachId;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Event detail"
        description="Review event requirements and manage joins."
        action={
          <Link href="/app/events">
            <Button variant="ghost">Back to events</Button>
          </Link>
        }
      />

      <EventCard
        event={event}
        imageUrl={event.createdByCoach.profileImageUrl ?? EVENT_PLACEHOLDERS[0]}
      />

      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold">Add to calendar</h3>
          <p className="text-sm text-muted">Save this sparring session to your calendar.</p>
          <div className="mt-4">
            <AddToCalendar
              event={{
                id: event.id,
                title: event.title,
                description: event.description,
                dateTimeStart: event.dateTimeStart,
                dateTimeEnd: event.dateTimeEnd,
                gym: {
                  name: event.gym.name,
                  address: event.gym.address,
                  suburb: event.gym.suburb,
                  state: event.gym.state,
                  country: event.gym.country
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {!isCreator && (
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Request to join</h3>
            <p className="text-sm text-muted">Select a fighter and send a join request to the host coach.</p>
            <div className="mt-4">
              {hasRequested ? (
                <p className="text-sm text-muted">You already sent a join request for this event.</p>
              ) : (
                <EventJoinForm eventId={event.id} fighters={fighters} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isCreator && (
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Join requests</h3>
            <p className="text-sm text-muted">Approve or decline incoming requests.</p>
            <div className="mt-4">
              <EventJoinList
                joins={event.joins.map((join) => ({
                  id: join.id,
                  fighterName: join.fighter.fullName,
                  coachName: join.coach.fullName,
                  status: join.status
                }))}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
