"use client";

import { useState } from "react";
import { Check, Zap, Sparkles, Star } from "lucide-react";

const CREDIT_PACKS = [
  { credits: 50, price: 199, perCredit: 3.98 },
  { credits: 150, price: 499, perCredit: 3.33, popular: true },
  { credits: 500, price: 1499, perCredit: 3.0 },
];

const SUBSCRIPTIONS = [
  {
    name: "Basic",
    price: 299,
    credits: 100,
    features: ["100 credits/month", "All 6 AI tools", "Standard resolution", "Email support"],
  },
  {
    name: "Pro",
    price: 799,
    credits: 500,
    popular: true,
    features: ["500 credits/month", "All 6 AI tools", "4K resolution", "Priority support", "Private gallery"],
  },
  {
    name: "Studio",
    price: 2999,
    credits: 2000,
    features: ["2,000 credits/month", "All 6 AI tools", "4K resolution", "Dedicated support", "Team accounts", "API access"],
  },
];

export default function PricingPage() {
  const [tab, setTab] = useState<"packs" | "subscription">("packs");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple Pricing</h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          Pay as you go or subscribe monthly. Start with 10 free credits.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 mb-12">
        <button
          onClick={() => setTab("packs")}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === "packs" ? "bg-accent text-white" : "glass text-muted hover:text-foreground"
          }`}
        >
          Credit Packs
        </button>
        <button
          onClick={() => setTab("subscription")}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === "subscription" ? "bg-accent text-white" : "glass text-muted hover:text-foreground"
          }`}
        >
          Monthly Plans
        </button>
      </div>

      {/* Credit Packs */}
      {tab === "packs" && (
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.credits}
              className={`glass rounded-2xl p-8 text-center relative ${
                pack.popular ? "border-accent/50 ring-1 ring-accent/20" : ""
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-white text-xs font-medium">
                  Best Value
                </div>
              )}
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="text-4xl font-bold mb-1">{pack.credits}</div>
              <div className="text-sm text-muted mb-6">credits</div>
              <div className="text-3xl font-bold mb-1">
                NT${pack.price.toLocaleString()}
              </div>
              <div className="text-xs text-muted mb-6">
                NT${pack.perCredit.toFixed(2)} per credit
              </div>
              <button className={pack.popular ? "btn-primary w-full" : "btn-secondary w-full"}>
                Buy Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Subscriptions */}
      {tab === "subscription" && (
        <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {SUBSCRIPTIONS.map((plan) => (
            <div
              key={plan.name}
              className={`glass rounded-2xl p-8 relative ${
                plan.popular ? "border-accent/50 ring-1 ring-accent/20" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-white text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">NT${plan.price.toLocaleString()}</span>
                  <span className="text-sm text-muted">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={plan.popular ? "btn-primary w-full" : "btn-secondary w-full"}>
                Subscribe
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Credit costs table */}
      <div className="mt-20 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Credit Costs</h2>
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted">Function</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { name: "Sketch to Render", credits: 2 },
                { name: "Realistic Render", credits: 2 },
                { name: "Photo Remodel", credits: 3 },
                { name: "Style Transfer", credits: 2 },
                { name: "4K Upscale", credits: 1 },
                { name: "Text to Design", credits: 1 },
              ].map((item) => (
                <tr key={item.name} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3 text-sm">{item.name}</td>
                  <td className="px-6 py-3 text-sm text-right">
                    <span className="inline-flex items-center gap-1 text-yellow-500">
                      <Zap className="w-3 h-3" />
                      {item.credits}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
