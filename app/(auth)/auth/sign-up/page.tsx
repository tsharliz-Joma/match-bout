"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { signUpSchema } from "@/lib/validations";
import { registerCoach } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/app/image-upload";

export default function SignUpPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      profileImageUrl: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    const result = await registerCoach(values);
    if (!result.success) {
      toast.error(result.error ?? "Unable to sign up");
      return;
    }

    await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password
    });

    toast.success("Account created");
    router.push("/auth/onboarding");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-2xl tracking-widest">SparConnect</p>
        <h1 className="mt-2 text-xl font-semibold">Create account</h1>
        <p className="text-sm text-muted">Start managing sparring events today.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...form.register("fullName")} />
          {form.formState.errors.fullName?.message ? (
            <p className="text-xs text-emberGlow">{form.formState.errors.fullName.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email?.message ? (
            <p className="text-xs text-emberGlow">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...form.register("password")} />
          {form.formState.errors.password?.message ? (
            <p className="text-xs text-emberGlow">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
        <input type="hidden" {...form.register("profileImageUrl")} />
        <ImageUpload
          label="Profile photo"
          value={form.watch("profileImageUrl")}
          onChange={(url) => form.setValue("profileImageUrl", url)}
        />
        <Button type="submit" className="w-full">Create account</Button>
      </form>

      <p className="text-sm text-muted">
        Already have an account? <Link href="/auth/sign-in" className="text-white">Sign in</Link>
      </p>
    </div>
  );
}
