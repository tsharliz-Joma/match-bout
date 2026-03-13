import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/app/empty-state";
import { COACH_PLACEHOLDERS } from "@/lib/placeholders";

export default async function CoachesPage() {
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

  const coaches = await prisma.coach.findMany({
    where: { gymId: coach.gymId },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Coaches" description="Everyone on your gym roster." />

      {coaches.length === 0 ? (
        <EmptyState title="No coaches yet" description="Invite coaches to your gym to coordinate sparring." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {coaches.map((member, index) => (
            <Card key={member.id} className="overflow-hidden">
              <div className="relative h-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.profileImageUrl ?? COACH_PLACEHOLDERS[index % COACH_PLACEHOLDERS.length]}
                  alt={member.fullName}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase text-white/70">Coach</p>
                    <h3 className="text-lg font-semibold text-white">{member.fullName}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={member.role === "GYM_ADMIN" ? "premium" : "outline"}>{member.role}</Badge>
                    <Badge variant={member.plan === "PRO" ? "premium" : "outline"}>{member.plan}</Badge>
                  </div>
                </div>
              </div>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted">{member.email}</p>
                <div className="grid gap-3 text-xs text-white/80 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-charcoal p-3">
                    <p className="text-[11px] uppercase text-muted">Cancellation</p>
                    <p className="text-sm font-semibold">{(member.cancellationRate ?? 0).toFixed(1)}%</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-charcoal p-3">
                    <p className="text-[11px] uppercase text-muted">No-show</p>
                    <p className="text-sm font-semibold">{(member.noShowRate ?? 0).toFixed(1)}%</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-charcoal p-3">
                    <p className="text-[11px] uppercase text-muted">Responsiveness</p>
                    <p className="text-sm font-semibold">{(member.responsivenessScore ?? 0).toFixed(0)}/100</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-charcoal p-3">
                    <p className="text-[11px] uppercase text-muted">Approval rate</p>
                    <p className="text-sm font-semibold">{(member.approvalRate ?? 0).toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
