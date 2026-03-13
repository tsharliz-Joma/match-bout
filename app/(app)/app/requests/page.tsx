import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EventJoinList } from "@/components/app/event-join-list";
import { SparRequestForm } from "@/components/app/spar-request-form";
import { SparRequestList } from "@/components/app/spar-request-list";

export default async function RequestsPage() {
  const session = await auth();
  const coachId = session?.user?.id;

  if (!coachId) {
    return null;
  }

  const coach = await prisma.coach.findUnique({
    where: { id: coachId },
    include: { gym: true }
  });

  if (!coach) {
    return null;
  }

  const [eventJoins, incomingRequests, outgoingRequests, otherCoaches, myFighters] = await Promise.all([
    prisma.eventJoin.findMany({
      where: { event: { createdByCoachId: coachId } },
      include: { fighter: true, coach: true }
    }),
    prisma.sparRequest.findMany({
      where: { toCoachId: coachId },
      include: { fromCoach: true, toCoach: true, fighters: { include: { fighter: true } }, proposedGym: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.sparRequest.findMany({
      where: { fromCoachId: coachId },
      include: { fromCoach: true, toCoach: true, fighters: { include: { fighter: true } }, proposedGym: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.coach.findMany({
      where: { id: { not: coachId } },
      include: { gym: true },
      orderBy: { fullName: "asc" }
    }),
    prisma.fighter.findMany({
      where: { gymId: coach.gymId ?? "" },
      orderBy: { fullName: "asc" }
    })
  ]);

  return (
    <div className="space-y-8">
      <PageHeader title="Requests" description="Manage event joins and private spar requests." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Event join requests</h3>
            <p className="text-sm text-muted">Approve or decline fighters for your hosted events.</p>
            <div className="mt-4">
              <EventJoinList
                joins={eventJoins.map((join) => ({
                  id: join.id,
                  fighterName: join.fighter.fullName,
                  coachName: join.coach.fullName,
                  status: join.status
                }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Send spar request</h3>
            <p className="text-sm text-muted">Reach out to another coach for private rounds.</p>
            <div className="mt-4">
              <SparRequestForm
                coaches={otherCoaches.map((c) => ({
                  id: c.id,
                  fullName: c.fullName,
                  gymId: c.gym?.id ?? null,
                  gymName: c.gym?.name ?? null
                }))}
                fighters={myFighters.map((fighter) => ({
                  id: fighter.id,
                  fullName: fighter.fullName,
                  weightKg: fighter.weightKg
                }))}
                myGym={coach.gymId ? { id: coach.gymId, name: coach.gym?.name ?? "My gym" } : null}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Incoming requests</h3>
            <div className="mt-4">
              <SparRequestList
                requests={incomingRequests.map((request) => ({
                  id: request.id,
                  fromCoachName: request.fromCoach.fullName,
                  toCoachName: request.toCoach.fullName,
                  proposedDateTime: request.proposedDateTime.toLocaleString(),
                  message: request.message,
                  fighters: request.fighters.map((link) => link.fighter.fullName),
                  proposedGym: request.proposedGym?.name ?? "Not set",
                  status: request.status,
                  direction: "incoming" as const
                }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Outgoing requests</h3>
            <div className="mt-4">
              <SparRequestList
                requests={outgoingRequests.map((request) => ({
                  id: request.id,
                  fromCoachName: request.fromCoach.fullName,
                  toCoachName: request.toCoach.fullName,
                  proposedDateTime: request.proposedDateTime.toLocaleString(),
                  message: request.message,
                  fighters: request.fighters.map((link) => link.fighter.fullName),
                  proposedGym: request.proposedGym?.name ?? "Not set",
                  status: request.status,
                  direction: "outgoing" as const
                }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
