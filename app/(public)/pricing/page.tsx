import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tiers = [
  {
    name: "Free Coach",
    price: "$0",
    description: "For individual coaches managing a small roster.",
    features: ["Max 2 active events", "Max 5 spar requests/month", "Standard listing"],
    highlight: false
  },
  {
    name: "Coach Pro",
    price: "$39",
    description: "Unlimited events with priority placement.",
    features: ["Unlimited events", "Unlimited spar requests", "Priority event listing"],
    highlight: true
  },
  {
    name: "Gym Pro",
    price: "$129",
    description: "Gym-wide upgrades for multi-coach teams.",
    features: ["Featured gym badge", "Multi-coach analytics (placeholder)", "Priority support"],
    highlight: false
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-canvas text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="font-display text-2xl tracking-widest">match-bout</p>
            <p className="text-xs uppercase text-muted">Pricing</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Create Account</Button>
            </Link>
          </div>
        </header>

        <section className="mt-16">
          <h1 className="text-4xl font-semibold">Simple plans for every gym</h1>
          <p className="mt-3 text-muted">No payments in MVP. Stripe integration structure included for later.</p>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {tiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`animate-fade-up rounded-2xl border border-white/10 bg-steel/70 p-6 ${tier.highlight ? "ring-1 ring-emberGlow" : ""}`}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{tier.name}</h3>
                  {tier.highlight && <Badge variant="premium">Most popular</Badge>}
                </div>
                <p className="mt-2 text-3xl font-semibold">{tier.price}<span className="text-base text-muted">/mo</span></p>
                <p className="mt-2 text-sm text-muted">{tier.description}</p>
                <ul className="mt-6 space-y-2 text-sm text-white/80">
                  {tier.features.map((feature) => (
                    <li key={feature}>- {feature}</li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link href="/auth/sign-up">
                    <Button variant={tier.highlight ? "primary" : "outline"} className="w-full">
                      Get started
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
