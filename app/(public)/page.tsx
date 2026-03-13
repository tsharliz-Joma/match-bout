import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-canvas text-white">
      <div className="bg-grid">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <header className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="font-display text-2xl tracking-widest">match-bout</p>
              <p className="text-xs uppercase text-muted">sparring network</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/pricing" className="text-sm text-muted hover:text-white">
                Pricing
              </Link>
              <Link href="/auth/sign-in" className="text-sm text-muted hover:text-white">
                Sign In
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm">Create Account</Button>
              </Link>
            </div>
          </header>

          <section className="mt-20 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="animate-fade-up">
              <Badge variant="outline">Built for coaches and gyms</Badge>
              <h1 className="mt-4 font-display text-5xl tracking-wide lg:text-6xl">
                Organise structured sparring between gyms.
              </h1>
              <p className="mt-6 text-lg text-muted">
                match-bout streamlines event hosting, fighter matching, and private requests so your gym can focus on performance.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/auth/sign-up">
                  <Button size="lg">Create Account</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg">See Pricing</Button>
                </Link>
              </div>
            </div>
            <div className="animate-fade-up rounded-2xl border border-white/10 bg-steel/70 p-6 shadow-soft" style={{ animationDelay: "120ms" }}>
              <p className="text-xs uppercase text-muted">Live snapshot</p>
              <h3 className="mt-2 text-xl font-semibold">Tonight's sparring board</h3>
              <div className="mt-6 space-y-4">
                {[
                  { title: "Technical Sparring Night", gym: "Iron Harbor Boxing", weight: "65-78 kg", level: "Intermediate" },
                  { title: "Redline Pro Camp", gym: "Redline Combat Club", weight: "68-90 kg", level: "Pro" },
                  { title: "Beginner Rhythm Rounds", gym: "Northside Fight Lab", weight: "55-70 kg", level: "Beginner" }
                ].map((event) => (
                  <div key={event.title} className="rounded-xl border border-white/10 bg-charcoal p-4">
                    <p className="text-sm font-semibold">{event.title}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted">
                      <span>{event.gym}</span>
                      <span>{event.weight}</span>
                      <span>{event.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-20 grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Gym-ready onboarding",
                body: "Coaches create or request gym access in minutes, with admin approval built in."
              },
              {
                title: "Event matching",
                body: "Structured sparring events with weight ranges, stance preferences, and skill levels."
              },
              {
                title: "Private spar requests",
                body: "Coach-to-coach requests, approvals, and notifications built for busy schedules."
              }
            ].map((card, index) => (
              <div
                key={card.title}
                className="animate-fade-up rounded-2xl border border-white/10 bg-steel/70 p-6"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm text-muted">{card.body}</p>
              </div>
            ))}
          </section>

          <section className="mt-20 rounded-2xl border border-white/10 bg-gradient-to-r from-ember/20 via-transparent to-transparent p-10 animate-fade-up" style={{ animationDelay: "180ms" }}>
            <h2 className="text-3xl font-semibold">Ready to set the sparring calendar?</h2>
            <p className="mt-2 text-muted">Create your account and get your gym matched tonight.</p>
            <div className="mt-6">
              <Link href="/auth/sign-up">
                <Button size="lg" className="animate-glow">Get Started</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
