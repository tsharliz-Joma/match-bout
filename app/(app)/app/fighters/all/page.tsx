import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { FIGHTER_PLACEHOLDERS } from "@/lib/placeholders";

export default async function AllFightersPage() {
  const session = await auth();
  const coachId = session?.user?.id;

  if (!coachId) {
    return null;
  }

  const fighters = await prisma.fighter.findMany({
    include: { gym: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="All fighters"
        description="Browse fighters across all gyms."
        action={
          <Link href="/app/fighters">
            <Button variant="ghost">My gym fighters</Button>
          </Link>
        }
      />

      {fighters.length === 0 ? (
        <EmptyState title="No fighters yet" description="Add fighters to start matching across gyms." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {fighters.map((fighter, index) => (
            <Card key={fighter.id} className="overflow-hidden">
              <div className="relative h-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fighter.profileImageUrl ?? FIGHTER_PLACEHOLDERS[index % FIGHTER_PLACEHOLDERS.length]}
                  alt={fighter.fullName}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase text-white/70">{fighter.gym.name}</p>
                    <h3 className="text-lg font-semibold text-white">{fighter.fullName}</h3>
                  </div>
                  <Badge variant="outline">{fighter.stance}</Badge>
                </div>
              </div>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{fighter.weightKg} kg</Badge>
                  <Badge variant="outline">Age {fighter.age}</Badge>
                  <Badge variant="outline">{fighter.heightCm} cm</Badge>
                </div>
                <p className="text-xs text-muted">Record {fighter.wins}-{fighter.losses} ({fighter.totalFights} fights)</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
