"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/app/empty-state";
import { SparRequestForm } from "@/components/app/spar-request-form";
import { EVENT_PLACEHOLDERS } from "@/lib/placeholders";

type GymBrowserItem = {
  id: string;
  name: string;
  suburb: string;
  state: string;
  country: string;
  plan: string;
  isVerified: boolean;
  heroImageUrl?: string | null;
  coaches: { id: string; fullName: string; role: string; plan: string }[];
  fighters: { id: string; fullName: string; weightKg: number; stance: string }[];
};

export function GymsBrowser({
  gyms,
  myGymId,
  myGym,
  myFighters
}: {
  gyms: GymBrowserItem[];
  myGymId?: string | null;
  myGym?: { id: string; name: string } | null;
  myFighters: { id: string; fullName: string; weightKg: number }[];
}) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [verifiedFilter, setVerifiedFilter] = useState("ALL");
  const [expandedGymId, setExpandedGymId] = useState<string | null>(null);

  const stateOptions = useMemo(() => {
    const unique = new Set(gyms.map((gym) => gym.state).filter(Boolean));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [gyms]);

  const hasActiveFilters =
    search.trim().length > 0 || planFilter !== "ALL" || stateFilter !== "ALL" || verifiedFilter !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setPlanFilter("ALL");
    setStateFilter("ALL");
    setVerifiedFilter("ALL");
  };

  const filteredGyms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return gyms.filter((gym) => {
      if (query) {
        const haystack = `${gym.name} ${gym.suburb} ${gym.state} ${gym.country}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (planFilter !== "ALL" && gym.plan !== planFilter) return false;
      if (stateFilter !== "ALL" && gym.state !== stateFilter) return false;

      if (verifiedFilter === "VERIFIED" && !gym.isVerified) return false;
      if (verifiedFilter === "UNVERIFIED" && gym.isVerified) return false;

      return true;
    });
  }, [gyms, search, planFilter, stateFilter, verifiedFilter]);

  if (gyms.length === 0) {
    return (
      <EmptyState
        title="No gyms yet"
        description="Once gyms are created, you can browse their coaches and fighters here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-white/10 bg-charcoal/70 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="gymSearch">Search</Label>
            <Input
              id="gymSearch"
              placeholder="Search by gym, suburb, or state"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gymPlan">Plan</Label>
            <Select id="gymPlan" value={planFilter} onChange={(event) => setPlanFilter(event.target.value)}>
              <option value="ALL">All plans</option>
              <option value="FREE">Free</option>
              <option value="GYM_PRO">Gym Pro</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gymState">State</Label>
            <Select id="gymState" value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}>
              <option value="ALL">All states</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gymVerified">Verified</Label>
            <Select id="gymVerified" value={verifiedFilter} onChange={(event) => setVerifiedFilter(event.target.value)}>
              <option value="ALL">All gyms</option>
              <option value="VERIFIED">Verified only</option>
              <option value="UNVERIFIED">Unverified</option>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <span>
            {filteredGyms.length} of {gyms.length} gyms
          </span>
          <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!hasActiveFilters}>
            Clear filters
          </Button>
        </div>
      </section>

      {filteredGyms.length === 0 ? (
        <EmptyState
          title="No gyms match your filters"
          description="Try adjusting your search or filters to see more gyms."
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="space-y-6">
          {filteredGyms.map((gym, index) => {
            const isMyGym = myGymId === gym.id;
            const canRequestSpar = !isMyGym && myGym && myFighters.length > 0 && gym.coaches.length > 0;
            const isExpanded = expandedGymId === gym.id;

            return (
              <Card key={gym.id} className="overflow-hidden">
                <div className="relative h-44">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gym.heroImageUrl ?? EVENT_PLACEHOLDERS[index % EVENT_PLACEHOLDERS.length]}
                    alt={gym.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase text-white/70">Gym</p>
                      <h3 className="text-2xl font-semibold text-white">{gym.name}</h3>
                      <p className="text-sm text-white/80">{gym.suburb}, {gym.state}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {isMyGym && <Badge variant="premium">Your gym</Badge>}
                      <Badge variant={gym.plan === "GYM_PRO" ? "premium" : "outline"}>{gym.plan}</Badge>
                      {gym.isVerified && <Badge variant="success">Verified</Badge>}
                    </div>
                  </div>
                </div>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-white/10 bg-charcoal p-3">
                        <p className="text-xs uppercase text-muted">Coaches</p>
                        <p className="text-lg font-semibold">{gym.coaches.length}</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-charcoal p-3">
                        <p className="text-xs uppercase text-muted">Fighters</p>
                        <p className="text-lg font-semibold">{gym.fighters.length}</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-charcoal p-3">
                        <p className="text-xs uppercase text-muted">Location</p>
                        <p className="text-sm text-white/80">{gym.suburb}, {gym.state}</p>
                        <p className="text-xs text-muted">{gym.country}</p>
                      </div>
                    </div>
                    <div className="min-w-[180px]">
                      <Button
                        className="w-full"
                        variant={isExpanded ? "secondary" : "primary"}
                        disabled={!canRequestSpar}
                        onClick={() => setExpandedGymId(isExpanded ? null : gym.id)}
                      >
                        {isExpanded ? "Hide request" : "Request sparring"}
                      </Button>
                      {!myGym && !isMyGym ? (
                        <p className="mt-2 text-xs text-muted">
                          Join or create a gym to send spar requests.
                        </p>
                      ) : null}
                      {myGym && myFighters.length === 0 && !isMyGym ? (
                        <p className="mt-2 text-xs text-muted">
                          Add fighters to your roster to send requests.
                        </p>
                      ) : null}
                      {gym.coaches.length === 0 && !isMyGym ? (
                        <p className="mt-2 text-xs text-muted">
                          This gym has no listed coaches yet.
                        </p>
                      ) : null}
                      {myGym && !isMyGym && canRequestSpar ? (
                        <p className="mt-2 text-xs text-muted">
                          Select a coach from this gym to send the request.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-semibold uppercase text-muted">Coaches</h4>
                      {gym.coaches.length === 0 ? (
                        <p className="mt-2 text-sm text-muted">No coaches listed yet.</p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {gym.coaches.map((member) => (
                            <div key={member.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-charcoal px-3 py-2">
                              <p className="text-sm font-semibold text-white">{member.fullName}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant={member.role === "GYM_ADMIN" ? "premium" : "outline"}>{member.role}</Badge>
                                <Badge variant={member.plan === "PRO" ? "premium" : "outline"}>{member.plan}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold uppercase text-muted">Fighters</h4>
                      {gym.fighters.length === 0 ? (
                        <p className="mt-2 text-sm text-muted">No fighters listed yet.</p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {gym.fighters.map((fighter) => (
                            <div key={fighter.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-charcoal px-3 py-2">
                              <p className="text-sm font-semibold text-white">{fighter.fullName}</p>
                              <div className="text-xs text-muted">
                                {fighter.weightKg} kg • {fighter.stance}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="rounded-xl border border-white/10 bg-charcoal/80 p-4">
                      <h4 className="text-sm font-semibold">Send sparring request</h4>
                      <p className="mt-1 text-xs text-muted">
                        Requests go directly to a selected coach at {gym.name}.
                      </p>
                      <div className="mt-4">
                        <SparRequestForm
                          coaches={gym.coaches.map((member) => ({
                            id: member.id,
                            fullName: member.fullName,
                            gymId: gym.id,
                            gymName: gym.name
                          }))}
                          fighters={myFighters}
                          myGym={myGym ?? null}
                        />
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
