"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";

import { createGymSchema, joinGymSchema } from "@/lib/validations";
import { createGymForCoach, requestGymJoin } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { GymHeroPicker } from "@/components/app/gym-hero-picker";

interface GymOption {
  id: string;
  name: string;
  suburb: string;
  state: string;
  country: string;
  coachCount: number;
  plan: string;
}

export function OnboardingClient({ coachStatus, gyms }: { coachStatus: string; gyms: GymOption[] }) {
  const [tab, setTab] = useState("create");
  const [search, setSearch] = useState("");

  const createForm = useForm<z.infer<typeof createGymSchema>>({
    resolver: zodResolver(createGymSchema),
    defaultValues: {
      name: "",
      address: "",
      suburb: "",
      state: "",
      country: "",
      phone: "",
      heroImageUrl: ""
    }
  });

  const joinForm = useForm<z.infer<typeof joinGymSchema>>({
    resolver: zodResolver(joinGymSchema),
    defaultValues: {
      gymId: ""
    }
  });

  const filteredGyms = useMemo(() => {
    if (!search) return gyms;
    return gyms.filter((gym) => gym.name.toLowerCase().includes(search.toLowerCase()));
  }, [gyms, search]);

  const handleCreate = async (values: z.infer<typeof createGymSchema>) => {
    const result = await createGymForCoach(values);
    if (!result.success) {
      toast.error(result.error ?? "Unable to create gym");
      return;
    }
    toast.success("Gym created. You are now a gym admin.");
    window.location.href = "/app/dashboard";
  };

  const handleJoin = async (values: z.infer<typeof joinGymSchema>) => {
    const result = await requestGymJoin(values);
    if (!result.success) {
      toast.error(result.error ?? "Unable to request join");
      return;
    }
    toast.success("Join request sent. Waiting for approval.");
    window.location.reload();
  };

  if (coachStatus === "PENDING_APPROVAL") {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Join request pending</h1>
        <p className="text-sm text-muted">
          Your gym admin needs to approve your request. You will receive a notification once approved.
        </p>
        <Button onClick={() => window.location.href = "/auth/sign-in"} variant="outline">
          Return to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-2xl tracking-widest">match-bout</p>
        <h1 className="mt-2 text-xl font-semibold">Finish onboarding</h1>
        <p className="text-sm text-muted">Choose how you want to connect your gym.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-between">
          <TabsTrigger value="create" className="flex-1">Create a new gym</TabsTrigger>
          <TabsTrigger value="join" className="flex-1">Join existing gym</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Gym name</Label>
              <Input id="name" {...createForm.register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...createForm.register("address")} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="suburb">Suburb</Label>
                <Input id="suburb" {...createForm.register("suburb")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...createForm.register("state")} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...createForm.register("country")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" {...createForm.register("phone")} />
              </div>
            </div>
            <input type="hidden" {...createForm.register("heroImageUrl")} />
            <GymHeroPicker
              value={createForm.watch("heroImageUrl")}
              onChange={(value) => createForm.setValue("heroImageUrl", value)}
            />
            <Button type="submit" className="w-full">Create gym</Button>
          </form>
        </TabsContent>

        <TabsContent value="join">
          <form onSubmit={joinForm.handleSubmit(handleJoin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search gyms</Label>
              <Input id="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by gym name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gymId">Select gym</Label>
              <Select id="gymId" {...joinForm.register("gymId")}>
                <option value="">Select a gym</option>
                {filteredGyms.map((gym) => (
                  <option key={gym.id} value={gym.id}>
                    {gym.name} - {gym.suburb}, {gym.state}
                  </option>
                ))}
              </Select>
            </div>
            <div className="rounded-lg border border-white/10 bg-charcoal p-4 text-xs text-muted">
              <p>Gyms available: {filteredGyms.length}</p>
              <p>Admins will be notified to approve your request.</p>
            </div>
            <Button type="submit" className="w-full" variant="secondary">Request to join</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
