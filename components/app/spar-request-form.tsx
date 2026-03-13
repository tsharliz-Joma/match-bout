"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";

import { sparRequestSchema } from "@/lib/validations";
import { createSparRequest } from "@/lib/actions/requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function SparRequestForm({
  coaches,
  fighters,
  myGym
}: {
  coaches: { id: string; fullName: string; gymId: string | null; gymName: string | null }[];
  fighters: { id: string; fullName: string; weightKg: number }[];
  myGym: { id: string; name: string } | null;
}) {
  const form = useForm<z.infer<typeof sparRequestSchema>>({
    resolver: zodResolver(sparRequestSchema),
    defaultValues: {
      toCoachId: "",
      proposedGymId: "",
      proposedDateTime: "",
      message: "",
      fighterIds: []
    }
  });

  const selectedCoachId = form.watch("toCoachId");
  const selectedCoach = coaches.find((coach) => coach.id === selectedCoachId);
  const locationOptions = [
    myGym ? { id: myGym.id, name: myGym.name } : null,
    selectedCoach?.gymId ? { id: selectedCoach.gymId, name: selectedCoach.gymName ?? "Selected coach gym" } : null
  ].filter(Boolean) as { id: string; name: string }[];

  const onSubmit = async (values: z.infer<typeof sparRequestSchema>) => {
    const result = await createSparRequest(values);
    if (!result.success) {
      toast.error(result.error ?? "Unable to send request");
      return;
    }
    toast.success("Spar request sent");
    form.reset();
    window.location.reload();
  };

  if (coaches.length === 0) {
    return <p className="text-sm text-muted">No coaches available yet. Check back after more gyms join.</p>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {fighters.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-charcoal p-4 text-xs text-muted">
          Add fighters to your gym roster before sending spar requests.
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="toCoachId">Select coach</Label>
        <Select id="toCoachId" {...form.register("toCoachId")}>
          <option value="">Choose a coach</option>
          {coaches.map((coach) => (
            <option key={coach.id} value={coach.id}>
              {coach.fullName} - {coach.gymName ?? "Independent"}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="proposedGymId">Proposed location</Label>
        <Select id="proposedGymId" {...form.register("proposedGymId")}>
          <option value="">Select a gym</option>
          {locationOptions.map((gym) => (
            <option key={gym.id} value={gym.id}>
              {gym.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Proposed fighters</Label>
        <div className="grid gap-2 rounded-lg border border-white/10 bg-charcoal p-3 text-xs text-white/80">
          {fighters.map((fighter) => (
            <label key={fighter.id} className="flex items-center gap-2">
              <input type="checkbox" value={fighter.id} {...form.register("fighterIds")} />
              <span>{fighter.fullName} - {fighter.weightKg} kg</span>
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="proposedDateTime">Proposed date/time</Label>
        <Input id="proposedDateTime" type="datetime-local" {...form.register("proposedDateTime")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" {...form.register("message")} />
      </div>
      <Button type="submit" className="w-full">Send request</Button>
    </form>
  );
}
