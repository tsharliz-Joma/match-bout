"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sparRequestSchema } from "@/lib/validations";
import { COACH_PLAN_LIMITS } from "@/lib/plans";
import { NotificationType, SparRequestStatus, SkillLevel, StancePreference } from "@prisma/client";

function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

export async function createSparRequest(formData: { toCoachId: string; proposedGymId: string; proposedDateTime: string; message: string; fighterIds: string[] }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = sparRequestSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid data" };
  }

  if (parsed.data.toCoachId === session.user.id) {
    return { success: false, error: "Cannot request yourself" };
  }

  const coach = await prisma.coach.findUnique({
    where: { id: session.user.id },
    include: { gym: true }
  });

  if (!coach) {
    return { success: false, error: "Coach not found" };
  }

  if (!coach.gymId) {
    return { success: false, error: "Complete onboarding first" };
  }

  const targetCoach = await prisma.coach.findUnique({
    where: { id: parsed.data.toCoachId },
    include: { gym: true }
  });

  if (!targetCoach?.gymId) {
    return { success: false, error: "Selected coach is not assigned to a gym" };
  }

  const allowedGymIds = [coach.gymId, targetCoach.gymId];
  if (!allowedGymIds.includes(parsed.data.proposedGymId)) {
    return { success: false, error: "Proposed location must be one of the two gyms" };
  }

  const fighters = await prisma.fighter.findMany({
    where: { id: { in: parsed.data.fighterIds }, gymId: coach.gymId }
  });

  if (fighters.length !== parsed.data.fighterIds.length) {
    return { success: false, error: "All selected fighters must belong to your gym" };
  }

  const limits = COACH_PLAN_LIMITS[coach.plan];
  if (limits.maxSparRequestsPerMonth !== null) {
    const { start, end } = getMonthRange(new Date());
    const count = await prisma.sparRequest.count({
      where: {
        fromCoachId: coach.id,
        createdAt: { gte: start, lt: end }
      }
    });

    if (count >= limits.maxSparRequestsPerMonth) {
      return { success: false, error: `Free plan limit reached (${limits.maxSparRequestsPerMonth} requests/month).` };
    }
  }

  const request = await prisma.sparRequest.create({
    data: {
      fromCoachId: coach.id,
      toCoachId: parsed.data.toCoachId,
      proposedGymId: parsed.data.proposedGymId,
      proposedDateTime: new Date(parsed.data.proposedDateTime),
      message: parsed.data.message,
      status: SparRequestStatus.PENDING,
      fighters: {
        createMany: {
          data: parsed.data.fighterIds.map((fighterId) => ({ fighterId }))
        }
      }
    }
  });

  await prisma.notification.create({
    data: {
      toCoachId: parsed.data.toCoachId,
      type: NotificationType.REQUEST_RECEIVED,
      title: "New spar request",
      body: "A coach sent you a private spar request.",
      linkUrl: "/app/requests"
    }
  });

  revalidatePath("/app/requests");

  return { success: true, requestId: request.id };
}

export async function respondSparRequest(requestId: string, status: SparRequestStatus, autoCreateEvent?: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const request = await prisma.sparRequest.findUnique({
    where: { id: requestId },
    include: { fromCoach: true, toCoach: true, proposedGym: true }
  });

  if (!request) {
    return { success: false, error: "Request not found" };
  }

  if (request.toCoachId !== session.user.id) {
    return { success: false, error: "Not authorized" };
  }

  await prisma.sparRequest.update({
    where: { id: requestId },
    data: { status }
  });

  if (status === SparRequestStatus.ACCEPTED && autoCreateEvent) {
    const targetGymId = request.proposedGymId ?? request.toCoach.gymId;
    if (targetGymId) {
      await prisma.sparringEvent.create({
        data: {
          gymId: targetGymId,
          createdByCoachId: request.toCoachId,
          title: `Private Spar Session`,
          description: `Auto-created from spar request with ${request.fromCoach.fullName}.`,
          dateTimeStart: request.proposedDateTime,
          dateTimeEnd: new Date(new Date(request.proposedDateTime).getTime() + 2 * 60 * 60 * 1000),
          skillLevel: SkillLevel.INTERMEDIATE,
          weightClassMinKg: 60,
          weightClassMaxKg: 85,
          stancePreference: StancePreference.ANY,
          maxParticipants: 6
        }
      });
    }
  }

  await prisma.notification.create({
    data: {
      toCoachId: request.fromCoachId,
      type: status === SparRequestStatus.ACCEPTED ? NotificationType.REQUEST_ACCEPTED : NotificationType.REQUEST_DECLINED,
      title: status === SparRequestStatus.ACCEPTED ? "Request accepted" : "Request declined",
      body: status === SparRequestStatus.ACCEPTED ? "Your spar request was accepted." : "Your spar request was declined.",
      linkUrl: "/app/requests"
    }
  });

  revalidatePath("/app/requests");
  revalidatePath("/app/events");

  return { success: true };
}
