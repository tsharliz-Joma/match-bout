"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createGymSchema, joinGymSchema } from "@/lib/validations";
import { CoachRole, CoachStatus, JoinRequestStatus, NotificationType } from "@prisma/client";

export async function createGymForCoach(formData: {
  name: string;
  address: string;
  suburb: string;
  state: string;
  country: string;
  phone?: string;
  heroImageUrl?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const existingCoach = await prisma.coach.findUnique({
    where: { id: session.user.id }
  });

  if (!existingCoach) {
    return { success: false, error: "Coach not found" };
  }

  const parsed = createGymSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid data" };
  }

  const gym = await prisma.gym.create({
    data: {
      ...parsed.data,
      heroImageUrl: parsed.data.heroImageUrl || null,
      createdByCoachId: session.user.id
    }
  });

  await prisma.coach.update({
    where: { id: session.user.id },
    data: {
      gymId: gym.id,
      role: CoachRole.GYM_ADMIN,
      status: CoachStatus.ACTIVE
    }
  });

  revalidatePath("/auth/onboarding");
  revalidatePath("/app/dashboard");

  return { success: true, gymId: gym.id };
}

export async function requestGymJoin(formData: { gymId: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const existingCoach = await prisma.coach.findUnique({
    where: { id: session.user.id }
  });

  if (!existingCoach || existingCoach.gymId) {
    return { success: false, error: "Gym already assigned" };
  }

  const parsed = joinGymSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid data" };
  }

  if (existingCoach.gymId === parsed.data.gymId) {
    return { success: false, error: "You are already in this gym" };
  }

  const existingRequest = await prisma.gymJoinRequest.findUnique({
    where: {
      gymId_coachId: {
        gymId: parsed.data.gymId,
        coachId: session.user.id
      }
    }
  });

  let joinRequest = existingRequest;
  if (existingRequest) {
    if (existingRequest.status === JoinRequestStatus.DECLINED || existingRequest.status === JoinRequestStatus.CANCELLED) {
      joinRequest = await prisma.gymJoinRequest.update({
        where: { id: existingRequest.id },
        data: { status: JoinRequestStatus.PENDING }
      });
    } else {
      return { success: false, error: "Join request already sent" };
    }
  } else {
    joinRequest = await prisma.gymJoinRequest.create({
      data: {
        gymId: parsed.data.gymId,
        coachId: session.user.id,
        status: JoinRequestStatus.PENDING
      }
    });
  }

  if (!existingCoach.gymId) {
    await prisma.coach.update({
      where: { id: session.user.id },
      data: { status: CoachStatus.PENDING_APPROVAL }
    });
  }

  const admins = await prisma.coach.findMany({
    where: {
      gymId: parsed.data.gymId,
      role: CoachRole.GYM_ADMIN
    }
  });

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        toCoachId: admin.id,
        type: NotificationType.REQUEST_RECEIVED,
        title: "New coach join request",
        body: "A coach requested to join your gym.",
        linkUrl: "/app/gym"
      }))
    });
  }

  revalidatePath("/auth/onboarding");
  revalidatePath("/app/gyms");
  return { success: true, requestId: joinRequest.id };
}

export async function approveJoinRequest(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const request = await prisma.gymJoinRequest.findUnique({
    where: { id: requestId },
    include: { gym: true, coach: true }
  });

  if (!request) {
    return { success: false, error: "Request not found" };
  }

  const admin = await prisma.coach.findUnique({
    where: { id: session.user.id }
  });

  if (!admin || admin.gymId !== request.gymId || admin.role !== CoachRole.GYM_ADMIN) {
    return { success: false, error: "Not authorized" };
  }

  await prisma.gymJoinRequest.update({
    where: { id: requestId },
    data: { status: JoinRequestStatus.APPROVED }
  });

  await prisma.coach.update({
    where: { id: request.coachId },
    data: {
      gymId: request.gymId,
      status: CoachStatus.ACTIVE,
      role: CoachRole.COACH
    }
  });

  await prisma.notification.create({
    data: {
      toCoachId: request.coachId,
      type: NotificationType.REQUEST_ACCEPTED,
      title: "Gym join approved",
      body: `You have been approved to join ${request.gym.name}.`,
      linkUrl: "/app/dashboard"
    }
  });

  revalidatePath("/app/gym");
  revalidatePath("/app/coaches");

  return { success: true };
}

export async function declineJoinRequest(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const request = await prisma.gymJoinRequest.findUnique({
    where: { id: requestId },
    include: { gym: true }
  });

  if (!request) {
    return { success: false, error: "Request not found" };
  }

  const admin = await prisma.coach.findUnique({
    where: { id: session.user.id }
  });

  if (!admin || admin.gymId !== request.gymId || admin.role !== CoachRole.GYM_ADMIN) {
    return { success: false, error: "Not authorized" };
  }

  await prisma.gymJoinRequest.update({
    where: { id: requestId },
    data: { status: JoinRequestStatus.DECLINED }
  });

  await prisma.coach.update({
    where: { id: request.coachId },
    data: { status: CoachStatus.ONBOARDING }
  });

  await prisma.notification.create({
    data: {
      toCoachId: request.coachId,
      type: NotificationType.REQUEST_DECLINED,
      title: "Join request declined",
      body: `Your request to join ${request.gym.name} was declined.`,
      linkUrl: "/auth/onboarding"
    }
  });

  revalidatePath("/app/gym");
  return { success: true };
}
