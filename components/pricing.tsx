"use client";

import { useState } from "react";
import { ShoppingCart, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PricingProps = {
  isPaid: boolean;
};

export function Pricing({ isPaid }: PricingProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ action: "create" })
      });

      const data = (await response.json()) as { checkoutUrl?: string; error?: string };

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || "Unable to start checkout.");
      }

      if (window.LemonSqueezy) {
        window.LemonSqueezy.Setup({
          eventHandler: async (event) => {
            if (event.event === "Checkout.Success") {
              await fetch("/api/checkout", {
                method: "POST",
                headers: {
                  "content-type": "application/json"
                },
                body: JSON.stringify({ action: "unlock" })
              });
              window.location.href = "/dashboard";
            }
          }
        });
        window.LemonSqueezy.Url.Open(data.checkoutUrl);
      } else {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Card className="border-[#2ea04355] bg-gradient-to-b from-[#1f6feb22] to-[#161b22]">
        <CardHeader>
          <CardTitle className="text-3xl">Simple pricing for teams shipping fast</CardTitle>
          <CardDescription>
            One plan. Unlimited captures, unlimited replays, full payload history with headers and response logs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-[1fr_220px] md:items-start">
            <div className="space-y-4">
              <div className="text-5xl font-bold text-[#3fb950]">$15<span className="text-lg text-[#9ba5b3]">/month</span></div>
              <ul className="space-y-3 text-sm text-[#c9d1d9]">
                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-[#58a6ff]" /> Capture webhooks from Stripe, Shopify, GitHub, Slack, Resend, and Postmark</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#58a6ff]" /> Secure replay with header controls and replay audit count</li>
                <li className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-[#58a6ff]" /> Lemon Squeezy checkout + instant paywall unlock</li>
              </ul>
            </div>
            {isPaid ? (
              <Button className="w-full" onClick={() => (window.location.href = "/dashboard")}>Open dashboard</Button>
            ) : (
              <div className="space-y-3">
                <Button className="w-full" onClick={startCheckout} disabled={loading}>
                  {loading ? "Opening checkout..." : "Start Pro"}
                </Button>
                {error ? <p className="text-xs text-[#f85149]">{error}</p> : null}
                <p className="text-xs text-[#9ba5b3]">Secure checkout via Lemon Squeezy overlay.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
