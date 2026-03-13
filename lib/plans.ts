import { CoachPlan, GymPlan } from "@prisma/client";

export const COACH_PLAN_LIMITS: Record<CoachPlan, { maxActiveEvents: number | null; maxSparRequestsPerMonth: number | null; priorityListing: boolean }> = {
  FREE: { maxActiveEvents: 2, maxSparRequestsPerMonth: 5, priorityListing: false },
  PRO: { maxActiveEvents: null, maxSparRequestsPerMonth: null, priorityListing: true }
};

export const GYM_PLAN_BENEFITS: Record<GymPlan, { analytics: boolean; featuredBadge: boolean }> = {
  FREE: { analytics: false, featuredBadge: false },
  GYM_PRO: { analytics: true, featuredBadge: true }
};

export function isPlanLimited(value: number | null) {
  return value !== null;
}
