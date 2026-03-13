"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fighterSchema } from "@/lib/validations";

export async function createFighter(formData: {
  fullName: string;
  age: number;
  heightCm: number;
  weightKg: number;
  stance: "ORTHODOX" | "SOUTHPAW" | "SWITCH";
  totalFights: number;
  wins: number;
  losses: number;
  profileImageUrl?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = fighterSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid data" };
  }

  const coach = await prisma.coach.findUnique({
    where: { id: session.user.id }
  });

  if (!coach?.gymId) {
    return { success: false, error: "Complete onboarding first" };
  }

  const fighter = await prisma.fighter.create({
    data: {
      ...parsed.data,
      profileImageUrl: parsed.data.profileImageUrl || null,
      gymId: coach.gymId
    }
  });

  await prisma.coachFighter.create({
    data: {
      coachId: coach.id,
      fighterId: fighter.id
    }
  });

  revalidatePath("/app/fighters");

  return { success: true, fighterId: fighter.id };
}
