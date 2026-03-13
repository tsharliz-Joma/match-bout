"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";

import { eventJoinSchema } from "@/lib/validations";
import { requestEventJoin } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function EventJoinForm({ eventId, fighters }: { eventId: string; fighters: { id: string; fullName: string; weightKg: number }[] }) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<z.infer<typeof eventJoinSchema>>({
    resolver: zodResolver(eventJoinSchema),
    defaultValues: {
      eventId,
      fighterId: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof eventJoinSchema>) => {
    setSubmitting(true);
    const result = await requestEventJoin(values);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error ?? "Unable to join event");
      return;
    }
    toast.success("Join request sent");
    window.location.reload();
  };

  if (fighters.length === 0) {
    return <p className="text-sm text-muted">Add a fighter to your roster before requesting a join.</p>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" value={eventId} {...form.register("eventId")} />
      <div className="space-y-2">
        <Label htmlFor="fighterId">Select fighter</Label>
        <Select id="fighterId" {...form.register("fighterId")}>
          <option value="">Select fighter</option>
          {fighters.map((fighter) => (
            <option key={fighter.id} value={fighter.id}>
              {fighter.fullName} - {fighter.weightKg} kg
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={submitting} className="w-full">
        Request join
      </Button>
    </form>
  );
}
