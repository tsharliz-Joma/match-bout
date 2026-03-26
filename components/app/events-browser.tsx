"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/app/event-card";
import { EmptyState } from "@/components/app/empty-state";
import { EVENT_PLACEHOLDERS } from "@/lib/placeholders";

type EventBrowserItem = {
  id: string;
  title: string;
  description: string;
  dateTimeStart: string;
  dateTimeEnd: string;
  skillLevel: string;
  weightClassMinKg: number;
  weightClassMaxKg: number;
  stancePreference: string;
  maxParticipants: number;
  createdByCoachId: string;
  gym: { name: string; plan: string };
  createdByCoach: { fullName: string; plan: string; profileImageUrl?: string | null };
};

type EventsBrowserProps = {
  events: EventBrowserItem[];
  coachId: string;
};

const SKILL_OPTIONS = ["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO"];
const DATE_RANGE_OPTIONS = [
  { value: "ALL", label: "Any date" },
  { value: "7", label: "Next 7 days" },
  { value: "30", label: "Next 30 days" }
];

export function EventsBrowser({ events, coachId }: EventsBrowserProps) {
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("ALL");
  const [gym, setGym] = useState("ALL");
  const [dateRange, setDateRange] = useState("ALL");
  const [weight, setWeight] = useState("");

  const normalizedEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        dateTimeStart: new Date(event.dateTimeStart),
        dateTimeEnd: new Date(event.dateTimeEnd)
      })),
    [events]
  );

  const gymOptions = useMemo(() => {
    const unique = new Set(events.map((event) => event.gym.name));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const hasActiveFilters =
    search.trim().length > 0 || skill !== "ALL" || gym !== "ALL" || dateRange !== "ALL" || weight.trim().length > 0;

  const clearFilters = () => {
    setSearch("");
    setSkill("ALL");
    setGym("ALL");
    setDateRange("ALL");
    setWeight("");
  };

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    const weightValue = Number(weight);
    const useWeight = weight.trim().length > 0 && Number.isFinite(weightValue);
    const now = new Date();

    return normalizedEvents.filter((event) => {
      if (query) {
        const haystack = `${event.title} ${event.gym.name} ${event.createdByCoach.fullName}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (skill !== "ALL" && event.skillLevel !== skill) return false;
      if (gym !== "ALL" && event.gym.name !== gym) return false;

      if (dateRange !== "ALL") {
        const days = Number(dateRange);
        const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        if (event.dateTimeStart > limit) return false;
      }

      if (useWeight && (weightValue < event.weightClassMinKg || weightValue > event.weightClassMaxKg)) {
        return false;
      }

      return true;
    });
  }, [normalizedEvents, search, skill, gym, dateRange, weight]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-white/10 bg-charcoal/70 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="eventSearch">Search</Label>
            <Input
              id="eventSearch"
              placeholder="Search event, gym, or coach"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventSkill">Skill level</Label>
            <Select id="eventSkill" value={skill} onChange={(event) => setSkill(event.target.value)}>
              {SKILL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All levels" : option}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventGym">Gym</Label>
            <Select id="eventGym" value={gym} onChange={(event) => setGym(event.target.value)}>
              <option value="ALL">All gyms</option>
              {gymOptions.map((gymName) => (
                <option key={gymName} value={gymName}>
                  {gymName}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDate">Date range</Label>
            <Select id="eventDate" value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
              {DATE_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventWeight">Weight (kg)</Label>
            <Input
              id="eventWeight"
              type="number"
              min={1}
              placeholder="e.g. 75"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <span>
            {filteredEvents.length} of {events.length} events
          </span>
          <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!hasActiveFilters}>
            Clear filters
          </Button>
        </div>
      </section>

      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No events match your filters"
          description="Try adjusting your search, weight, or date range."
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredEvents.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              imageUrl={event.createdByCoach.profileImageUrl ?? EVENT_PLACEHOLDERS[index % EVENT_PLACEHOLDERS.length]}
              action={
                <Link href={`/app/events/${event.id}`}>
                  <Button variant={event.createdByCoachId === coachId ? "secondary" : "primary"} className="w-full">
                    {event.createdByCoachId === coachId ? "Manage" : "View & Join"}
                  </Button>
                </Link>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
