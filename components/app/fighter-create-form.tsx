"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";

import { fighterSchema } from "@/lib/validations";
import { createFighter } from "@/lib/actions/fighters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/app/image-upload";

export function FighterCreateForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof fighterSchema>>({
    resolver: zodResolver(fighterSchema),
    defaultValues: {
      fullName: "",
      age: 18,
      heightCm: 175,
      weightKg: 70,
      stance: "ORTHODOX",
      totalFights: 0,
      wins: 0,
      losses: 0,
      profileImageUrl: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof fighterSchema>) => {
    const result = await createFighter(values);
    if (!result.success) {
      toast.error(result.error ?? "Unable to add fighter");
      return;
    }
    toast.success("Fighter added");
    form.reset();
    router.refresh();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" {...form.register("fullName")} />
        {form.formState.errors.fullName?.message ? (
          <p className="text-xs text-emberGlow">{form.formState.errors.fullName.message}</p>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input id="age" type="number" {...form.register("age")} />
          {form.formState.errors.age?.message ? (
            <p className="text-xs text-emberGlow">{form.formState.errors.age.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="stance">Stance</Label>
          <Select id="stance" {...form.register("stance")}>
            <option value="ORTHODOX">Orthodox</option>
            <option value="SOUTHPAW">Southpaw</option>
            <option value="SWITCH">Switch</option>
          </Select>
          {form.formState.errors.stance?.message ? (
            <p className="text-xs text-emberGlow">{form.formState.errors.stance.message}</p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="heightCm">Height (cm)</Label>
          <Input id="heightCm" type="number" {...form.register("heightCm")} />
          {form.formState.errors.heightCm?.message ? (
            <p className="text-xs text-emberGlow">{form.formState.errors.heightCm.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="weightKg">Weight (kg)</Label>
          <Input id="weightKg" type="number" {...form.register("weightKg")} />
          {form.formState.errors.weightKg?.message ? (
            <p className="text-xs text-emberGlow">{form.formState.errors.weightKg.message}</p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="totalFights">Total fights</Label>
          <Input id="totalFights" type="number" {...form.register("totalFights")} />
          {form.formState.errors.totalFights?.message ? (
            <p className="text-xs text-emberGlow">{form.formState.errors.totalFights.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="wins">Wins</Label>
          <Input id="wins" type="number" {...form.register("wins")} />
          {form.formState.errors.wins?.message ? (
            <p className="text-xs text-emberGlow">{form.formState.errors.wins.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="losses">Losses</Label>
          <Input id="losses" type="number" {...form.register("losses")} />
          {form.formState.errors.losses?.message ? (
            <p className="text-xs text-emberGlow">{form.formState.errors.losses.message}</p>
          ) : null}
        </div>
      </div>
      <input type="hidden" {...form.register("profileImageUrl")} />
      <ImageUpload
        label="Fighter photo"
        value={form.watch("profileImageUrl")}
        onChange={(url) => form.setValue("profileImageUrl", url)}
      />
      <Button type="submit" className="w-full">Add fighter</Button>
    </form>
  );
}
