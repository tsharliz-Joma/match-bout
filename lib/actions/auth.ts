"use server";

import { prisma } from "@/lib/db";
import { signUpSchema } from "@/lib/validations";
import { hash } from "bcryptjs";

export async function registerCoach(formData: { fullName: string; email: string; password: string; profileImageUrl?: string }) {
  const parsed = signUpSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid data" };
  }

  const existing = await prisma.coach.findUnique({
    where: { email: parsed.data.email }
  });

  if (existing) {
    return { success: false, error: "Email already registered" };
  }

  const passwordHash = await hash(parsed.data.password, 10);

  const coach = await prisma.coach.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      passwordHash,
      profileImageUrl: parsed.data.profileImageUrl || null
    }
  });

  return { success: true, coachId: coach.id };
}
