"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { eventSchema, eventJoinSchema } from "@/lib/validations";
import { COACH_PLAN_LIMITS } from "@/lib/plans";
import { EventJoinStatus, NotificationType } from "@prisma/client";

export async function createEvent(formData: {
  title: string;
  description: string;
  dateTimeStart: string;
  dateTimeEnd: string;
  skillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO";
  weightClassMinKg: number;
  weightClassMaxKg: number;
  stancePreference: "ANY" | "ORTHODOX" | "SOUTHPAW" | "SWITCH";
  maxParticipants: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = eventSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid data" };
  }

  const coach = await prisma.coach.findUnique({
    where: { id: session.user.id }
  });

  if (!coach?.gymId) {
    return { success: false, error: "Complete onboarding first" };
  }

  const limits = COACH_PLAN_LIMITS[coach.plan];
  if (limits.maxActiveEvents !== null) {
    const activeEvents = await prisma.sparringEvent.count({
      where: {
        createdByCoachId: coach.id,
        dateTimeEnd: { gt: new Date() }
      }
    });

    if (activeEvents >= limits.maxActiveEvents) {
      return { success: false, error: `Free plan limit reached (${limits.maxActiveEvents} active events).` };
    }
  }

  const event = await prisma.sparringEvent.create({
    data: {
      gymId: coach.gymId,
      createdByCoachId: coach.id,
      title: parsed.data.title,
      description: parsed.data.description,
      dateTimeStart: new Date(parsed.data.dateTimeStart),
      dateTimeEnd: new Date(parsed.data.dateTimeEnd),
      skillLevel: parsed.data.skillLevel,
      weightClassMinKg: parsed.data.weightClassMinKg,
      weightClassMaxKg: parsed.data.weightClassMaxKg,
      stancePreference: parsed.data.stancePreference,
      maxParticipants: parsed.data.maxParticipants
    }
  });

  revalidatePath("/app/events");
  revalidatePath("/app/dashboard");

  return { success: true, eventId: event.id };
}

export async function requestEventJoin(formData: { eventId: string; fighterId: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = eventJoinSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid data" };
  }

  const coach = await prisma.coach.findUnique({
    where: { id: session.user.id }
  });

  if (!coach?.gymId) {
    return { success: false, error: "Complete onboarding first" };
  }

  const event = await prisma.sparringEvent.findUnique({
    where: { id: parsed.data.eventId }
  });

  if (!event) {
    return { success: false, error: "Event not found" };
  }

  const activeJoins = await prisma.eventJoin.count({
    where: {
      eventId: parsed.data.eventId,
      status: { in: [EventJoinStatus.PENDING, EventJoinStatus.APPROVED] }
    }
  });

  if (activeJoins >= event.maxParticipants) {
    return { success: false, error: "Event is at capacity" };
  }

  const fighter = await prisma.fighter.findUnique({
    where: { id: parsed.data.fighterId }
  });

  if (!fighter || fighter.gymId !== coach.gymId) {
    return { success: false, error: "Invalid fighter selection" };
  }

  const existing = await prisma.eventJoin.findUnique({
    where: {
      eventId_fighterId: {
        eventId: parsed.data.eventId,
        fighterId: parsed.data.fighterId
      }
    }
  });

  if (existing) {
    return { success: false, error: "Fighter already requested for this event" };
  }

  const join = await prisma.eventJoin.create({
    data: {
      eventId: parsed.data.eventId,
      fighterId: parsed.data.fighterId,
      coachId: coach.id,
      status: EventJoinStatus.PENDING
    },
    include: { event: true }
  });

  await prisma.notification.create({
    data: {
      toCoachId: join.event.createdByCoachId,
      type: NotificationType.EVENT_JOINED,
      title: "New event join request",
      body: `${fighter.fullName} has requested to join ${join.event.title}.`,
      linkUrl: "/app/requests"
    }
  });

  revalidatePath(`/app/events/${join.eventId}`);
  revalidatePath("/app/requests");

  return { success: true, joinId: join.id };
}

export async function updateEventJoinStatus(joinId: string, status: EventJoinStatus) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const join = await prisma.eventJoin.findUnique({
    where: { id: joinId },
    include: { event: true, fighter: true, coach: true }
  });

  if (!join) {
    return { success: false, error: "Join request not found" };
  }

  if (join.event.createdByCoachId !== session.user.id) {
    return { success: false, error: "Not authorized" };
  }

  await prisma.eventJoin.update({
    where: { id: joinId },
    data: { status }
  });

  await prisma.notification.create({
    data: {
      toCoachId: join.coachId,
      type: status === EventJoinStatus.APPROVED ? NotificationType.REQUEST_ACCEPTED : NotificationType.REQUEST_DECLINED,
      title: status === EventJoinStatus.APPROVED ? "Event join approved" : "Event join declined",
      body: `${join.fighter.fullName} was ${status === EventJoinStatus.APPROVED ? "approved" : "declined"} for ${join.event.title}.`,
      linkUrl: "/app/events"
    }
  });

  revalidatePath("/app/requests");
  revalidatePath(`/app/events/${join.eventId}`);

  return { success: true };
}
