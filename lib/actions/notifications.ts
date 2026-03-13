"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function markNotificationRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification || notification.toCoachId !== session.user.id) {
    return { success: false, error: "Not authorized" };
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });

  revalidatePath("/app/notifications");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  await prisma.notification.updateMany({
    where: { toCoachId: session.user.id, isRead: false },
    data: { isRead: true }
  });

  revalidatePath("/app/notifications");
  return { success: true };
}
