"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";

import { eventSchema } from "@/lib/validations";
import { createEvent } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function EventCreateForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      dateTimeStart: "",
      dateTimeEnd: "",
      skillLevel: "INTERMEDIATE",
      weightClassMinKg: 60,
      weightClassMaxKg: 80,
      stancePreference: "ANY",
      maxParticipants: 8
    }
  });

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    const result = await createEvent(values);
    if (!result.success) {
      toast.error(result.error ?? "Unable to create event");
      return;
    }
    toast.success("Event created");
    router.push(`/app/events/${result.eventId}`);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Event title</Label>
        <Input id="title" {...form.register("title")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...form.register("description")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateTimeStart">Start</Label>
          <Input id="dateTimeStart" type="datetime-local" {...form.register("dateTimeStart")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateTimeEnd">End</Label>
          <Input id="dateTimeEnd" type="datetime-local" {...form.register("dateTimeEnd")} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="skillLevel">Skill level</Label>
          <Select id="skillLevel" {...form.register("skillLevel")}>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="PRO">Pro</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stancePreference">Stance preference</Label>
          <Select id="stancePreference" {...form.register("stancePreference")}>
            <option value="ANY">Any</option>
            <option value="ORTHODOX">Orthodox</option>
            <option value="SOUTHPAW">Southpaw</option>
            <option value="SWITCH">Switch</option>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weightClassMinKg">Weight min (kg)</Label>
          <Input id="weightClassMinKg" type="number" {...form.register("weightClassMinKg")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weightClassMaxKg">Weight max (kg)</Label>
          <Input id="weightClassMaxKg" type="number" {...form.register("weightClassMaxKg")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxParticipants">Max participants</Label>
        <Input id="maxParticipants" type="number" {...form.register("maxParticipants")} />
      </div>
      <Button type="submit" className="w-full">Create event</Button>
    </form>
  );
}
