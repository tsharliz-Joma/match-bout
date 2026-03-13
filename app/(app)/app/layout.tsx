import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
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

  if (coach.status !== "ACTIVE") {
    redirect("/auth/onboarding");
  }

  const unreadCount = await prisma.notification.count({
    where: { toCoachId: coach.id, isRead: false }
  });

  return (
    <AppShell
      coach={{
        fullName: coach.fullName,
        role: coach.role,
        plan: coach.plan,
        gymName: coach.gym?.name,
        gymPlan: coach.gym?.plan
      }}
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  );
}
