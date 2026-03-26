"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, LayoutDashboard, Users, UserRound, ShieldCheck, ClipboardList, Building2 } from "lucide-react";

interface AppShellProps {
  coach: {
    fullName: string;
    role: string;
    plan: string;
    gymName?: string | null;
    gymPlan?: string | null;
  };
  unreadCount: number;
  children: React.ReactNode;
}

const primaryNav = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Events", href: "/app/events", icon: Calendar },
  { label: "Requests", href: "/app/requests", icon: ClipboardList },
  { label: "Gyms", href: "/app/gyms", icon: Building2 },
  { label: "Fighters", href: "/app/fighters", icon: UserRound },
  { label: "Notifications", href: "/app/notifications", icon: Bell }
];

const secondaryNav = [
  { label: "Coaches", href: "/app/coaches", icon: Users },
  { label: "Gym", href: "/app/gym", icon: ShieldCheck, adminOnly: true }
];

export function AppShell({ coach, unreadCount, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-canvas text-white">
      <div className="hidden lg:flex">
        <aside className="fixed left-0 top-0 h-full w-64 border-r border-white/10 bg-midnight/80 px-6 py-8">
          <div className="mb-10">
            <p className="font-display text-2xl tracking-widest">SparConnect</p>
            <p className="text-xs uppercase text-muted">sparring network</p>
          </div>
          <div className="mb-8 space-y-1">
            {primaryNav.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/5",
                    isActive && "bg-white/10 text-white"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                  {item.label === "Notifications" && unreadCount > 0 && (
                    <span className="ml-auto rounded-full bg-ember px-2 py-0.5 text-xs font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          <div className="space-y-1 border-t border-white/10 pt-6">
            {secondaryNav
              .filter((item) => !item.adminOnly || coach.role === "GYM_ADMIN")
              .map((item) => {
                const isActive = pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/5",
                      isActive && "bg-white/10 text-white"
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
          </div>
          <div className="mt-8 rounded-lg border border-white/10 bg-charcoal p-4">
            <p className="text-xs uppercase text-muted">Plan</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Coach {coach.plan}</span>
              {coach.plan === "PRO" && <Badge variant="premium">PRO</Badge>}
            </div>
            <div className="mt-2 text-xs text-muted">
              Gym: {coach.gymName ?? "Unassigned"}
            </div>
          </div>
        </aside>
        <main className="ml-64 min-h-screen flex-1 px-8 py-8">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase text-muted">Welcome back</p>
              <h1 className="font-display text-3xl tracking-wide">{coach.fullName}</h1>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-charcoal px-4 py-2">
              <div>
                <p className="text-xs uppercase text-muted">Gym</p>
                <p className="text-sm font-semibold">{coach.gymName ?? "No gym"}</p>
              </div>
              {coach.gymPlan === "GYM_PRO" && <Badge variant="premium">Featured</Badge>}
            </div>
          </header>
          {children}
        </main>
      </div>

      <div className="lg:hidden">
        <main className="px-5 pb-24 pt-6">
          <div className="mb-6">
            <p className="text-xs uppercase text-muted">Gym</p>
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl">{coach.gymName ?? "No gym"}</h1>
              {coach.gymPlan === "GYM_PRO" && <Badge variant="premium">Featured</Badge>}
            </div>
          </div>
          {children}
        </main>
        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-midnight/95">
          <div className="flex items-center justify-around px-4 py-3">
            {primaryNav.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 text-xs">
                  <div className={cn("relative rounded-md p-2", isActive && "bg-white/10")}
                  >
                    <Icon size={18} className={cn(isActive ? "text-white" : "text-white/60")} />
                    {item.label === "Notifications" && unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 h-4 min-w-[16px] rounded-full bg-ember px-1 text-[10px] font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span className={cn(isActive ? "text-white" : "text-white/60")}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
