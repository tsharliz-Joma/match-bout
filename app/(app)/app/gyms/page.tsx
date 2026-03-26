import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { GymsBrowser } from "@/components/app/gyms-browser";

export default async function GymsPage() {
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

  const gyms = await prisma.gym.findMany({
    include: {
      coaches: { orderBy: { fullName: "asc" } },
      fighters: { orderBy: { fullName: "asc" } }
    },
    orderBy: { createdAt: "desc" }
  });

  const myFighters = coach.gymId
    ? await prisma.fighter.findMany({
        where: { gymId: coach.gymId },
        orderBy: { fullName: "asc" }
      })
    : [];

  const serializedGyms = gyms.map((gym) => ({
    id: gym.id,
    name: gym.name,
    suburb: gym.suburb,
    state: gym.state,
    country: gym.country,
    plan: gym.plan,
    isVerified: gym.isVerified,
    heroImageUrl: gym.heroImageUrl,
    coaches: gym.coaches.map((member) => ({
      id: member.id,
      fullName: member.fullName,
      role: member.role,
      plan: member.plan
    })),
    fighters: gym.fighters.map((fighter) => ({
      id: fighter.id,
      fullName: fighter.fullName,
      weightKg: fighter.weightKg,
      stance: fighter.stance
    }))
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gyms"
        description="Explore gyms, coaches, and fighters across the network."
      />

      <GymsBrowser
        gyms={serializedGyms}
        myGymId={coach.gymId}
        myGym={coach.gymId ? { id: coach.gymId, name: coach.gym?.name ?? "My gym" } : null}
        myFighters={myFighters.map((fighter) => ({
          id: fighter.id,
          fullName: fighter.fullName,
          weightKg: fighter.weightKg
        }))}
      />
    </div>
  );
}
