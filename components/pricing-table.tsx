"use client";

import { useMemo } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PricingTableProps = {
  checkoutUrl: string | null;
};

export function PricingTable({ checkoutUrl }: PricingTableProps) {
  const features = useMemo(
    () => [
      "Capture Stripe, Shopify, GitHub, Slack, Resend, and Postmark webhooks",
      "Store exact headers + body payloads for deterministic replay",
      "Replay to localhost, staging, or production with one click",
      "Filter, search, and inspect webhook history by provider",
      "Unlimited replay attempts with response audit trail",
    ],
    [],
  );

  return (
    <>
      <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="afterInteractive" />
      <Card className="w-full border-[#238636]/50 bg-[#0d1117]">
        <CardHeader>
          <CardTitle className="text-2xl">Webhook Replay Toolkit Pro</CardTitle>
          <CardDescription>Pay once monthly, keep shipping without waiting for webhooks to fire again.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-4xl font-bold text-[#f0f6fc]">$15</p>
            <p className="text-sm text-[#8b949e]">per month, cancel anytime</p>
          </div>
          <ul className="space-y-2 text-sm text-[#c9d1d9]">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#58a6ff]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          {checkoutUrl ? (
            <a href={checkoutUrl} className="lemonsqueezy-button block">
              <Button className="w-full" size="lg">
                Start Paid Access
              </Button>
            </a>
          ) : (
            <p className="text-sm text-[#f85149]">
              Checkout is unavailable because Lemon Squeezy env vars are missing.
            </p>
          )}
          <a href="/api/lemonsqueezy/activate" className="block text-center text-sm text-[#58a6ff] hover:underline">
            I already completed checkout
          </a>
        </CardContent>
      </Card>
    </>
  );
}
