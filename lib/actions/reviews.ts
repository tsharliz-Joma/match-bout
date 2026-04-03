"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const reviewSchema = z.object({
  eventId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(10, "Review must be at least 10 characters")
});

export async function submitEventReview(formData: {
  eventId: string;
  rating: number;
  body: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = reviewSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid data" };
  }

  const event = await prisma.sparringEvent.findUnique({
    where: { id: parsed.data.eventId }
  });

  if (!event) {
    return { success: false, error: "Event not found" };
  }

  if (new Date() <= event.dateTimeEnd) {
    return { success: false, error: "Reviews can only be submitted after the event has ended" };
  }

  const isCreator = event.createdByCoachId === session.user.id;
  const hasApprovedJoin = await prisma.eventJoin.findFirst({
    where: {
      eventId: parsed.data.eventId,
      coachId: session.user.id,
      status: "APPROVED"
    }
  });

  if (!isCreator && !hasApprovedJoin) {
    return { success: false, error: "Only attendees can review this event" };
  }

  const existing = await prisma.eventReview.findUnique({
    where: {
      eventId_authorCoachId: {
        eventId: parsed.data.eventId,
        authorCoachId: session.user.id
      }
    }
  });

  if (existing) {
    return { success: false, error: "You have already reviewed this event" };
  }

  await prisma.eventReview.create({
    data: {
      eventId: parsed.data.eventId,
      authorCoachId: session.user.id,
      rating: parsed.data.rating,
      body: parsed.data.body
    }
  });

  revalidatePath(`/app/events/${parsed.data.eventId}`);

  return { success: true };
}
