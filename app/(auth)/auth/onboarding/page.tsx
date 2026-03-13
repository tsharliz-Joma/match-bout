import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OnboardingClient } from "@/components/app/onboarding-client";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const coach = await prisma.coach.findUnique({
    where: { id: session.user.id },
    include: {
      gym: true
    }
  });

  if (!coach) {
    redirect("/auth/sign-in");
  }

  if (coach.status === "ACTIVE") {
    redirect("/app/dashboard");
  }

  const gyms = await prisma.gym.findMany({
    include: {
      coaches: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const gymOptions = gyms.map((gym) => ({
    id: gym.id,
    name: gym.name,
    suburb: gym.suburb,
    state: gym.state,
    country: gym.country,
    coachCount: gym.coaches.length,
    plan: gym.plan
  }));

  return <OnboardingClient coachStatus={coach.status} gyms={gymOptions} />;
}
