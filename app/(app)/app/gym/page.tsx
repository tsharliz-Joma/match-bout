import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GymJoinRequests } from "@/components/app/gym-join-requests";
import { GYM_PLAN_BENEFITS } from "@/lib/plans";
import { EVENT_PLACEHOLDERS } from "@/lib/placeholders";

export default async function GymPage() {
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

  if (coach.role !== "GYM_ADMIN") {
    return (
      <div className="space-y-4">
        <PageHeader title="Gym" description="Admin-only settings." />
        <Card>
          <CardContent>
            <p className="text-sm text-muted">Only gym admins can manage this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gym = await prisma.gym.findUnique({
    where: { id: coach.gymId },
    include: {
      joinRequests: {
        include: { coach: true },
        where: { status: "PENDING" }
      },
      coaches: true
    }
  });

  if (!gym) {
    return null;
  }

  const benefits = GYM_PLAN_BENEFITS[gym.plan];

  return (
    <div className="space-y-6">
      <PageHeader title="Gym" description="Manage your gym profile and coach access." />

      <Card className="overflow-hidden">
        <div className="relative h-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gym.heroImageUrl ?? EVENT_PLACEHOLDERS[1]} alt={gym.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase text-white/70">Gym profile</p>
              <h3 className="text-2xl font-semibold text-white">{gym.name}</h3>
              <p className="text-sm text-white/80">{gym.suburb}, {gym.state}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={gym.plan === "GYM_PRO" ? "premium" : "outline"}>{gym.plan}</Badge>
              {gym.isVerified && <Badge variant="success">Verified</Badge>}
            </div>
          </div>
        </div>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-muted">Address</p>
            <p className="text-sm text-white/80">{gym.address}, {gym.suburb}, {gym.state}</p>
            <p className="text-sm text-white/80">{gym.country}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted">Coaches</p>
            <p className="text-2xl font-semibold text-white">{gym.coaches.length}</p>
            <p className="text-xs text-muted">Active staff</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted">Phone</p>
            <p className="text-sm text-white/80">{gym.phone ?? "Not provided"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Join requests</h3>
            <p className="text-sm text-muted">Approve or decline coaches requesting access.</p>
            <div className="mt-4">
              <GymJoinRequests
                requests={gym.joinRequests.map((request) => ({
                  id: request.id,
                  coachName: request.coach.fullName,
                  coachEmail: request.coach.email,
                  status: request.status
                }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Gym Pro analytics</h3>
            <p className="text-sm text-muted">Placeholder panel for multi-coach analytics and performance insights.</p>
            {benefits.analytics ? (
              <div className="mt-4 rounded-lg border border-white/10 bg-charcoal p-6 text-sm text-muted">
                Analytics dashboard placeholder. Connect performance metrics, attendance trends, and athlete outcomes here.
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-white/10 bg-charcoal p-6 text-sm text-muted">
                Upgrade to Gym Pro to unlock analytics.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
