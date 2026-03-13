"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { signInSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password
    });

    if (result?.error) {
      toast.error("Invalid credentials");
      return;
    }

    toast.success("Welcome back");
    router.push("/app/dashboard");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-2xl tracking-widest">match-bout</p>
        <h1 className="mt-2 text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted">Continue to your sparring dashboard.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...form.register("password")} />
        </div>
        <Button type="submit" className="w-full">Sign in</Button>
      </form>

      <p className="text-sm text-muted">
        New coach? <Link href="/auth/sign-up" className="text-white">Create an account</Link>
      </p>
    </div>
  );
}
