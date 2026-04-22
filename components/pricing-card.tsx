"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const claimSchema = z.object({
  email: z.string().email("Use the same billing email you used in Stripe checkout")
});

type ClaimFormValues = z.infer<typeof claimSchema>;

export function PricingCard() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (values: ClaimFormValues) => {
    setSubmitting(true);

    try {
      const response = await fetch("/api/access/claim", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not unlock your dashboard access.");
      }

      toast.success("Access unlocked. Opening your dashboard.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not unlock your dashboard access.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-sky-800/40 bg-gradient-to-b from-slate-900/90 to-slate-950/70">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300" />
      <CardHeader className="gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-700/40 bg-sky-950/40 px-3 py-1 text-xs font-semibold text-sky-200">
          <Sparkles className="h-3.5 w-3.5" />
          Launch Plan
        </div>
        <CardTitle className="text-3xl">$15/month</CardTitle>
        <CardDescription className="text-base text-slate-300">
          Capture every webhook once, replay it forever. One price for all providers and all environments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ul className="space-y-2 text-sm text-slate-300">
          <li>Unlimited webhook captures across Stripe, Shopify, GitHub, Slack, and custom services</li>
          <li>Full request headers + raw body preserved for accurate replay debugging</li>
          <li>Replay to localhost, staging, or production with one click</li>
          <li>Redis-backed replay queue so high-volume bursts stay reliable</li>
        </ul>

        {paymentLink ? (
          <Button className="w-full" asChild>
            <a href={paymentLink} target="_blank" rel="noreferrer">
              Buy Access in Stripe Checkout
            </a>
          </Button>
        ) : (
          <Button className="w-full" disabled>
            Configure NEXT_PUBLIC_STRIPE_PAYMENT_LINK to enable checkout
          </Button>
        )}

        <form className="space-y-3 rounded-xl border border-slate-800 bg-[#0d1117]/80 p-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="claim-email">
              Already purchased? Unlock dashboard
            </label>
            <Input
              id="claim-email"
              type="email"
              placeholder="billing@yourcompany.com"
              autoComplete="email"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-sm text-red-300">{form.formState.errors.email.message}</p>
            ) : (
              <p className="text-xs text-slate-500">
                We verify this against completed checkout events received on your webhook endpoint.
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" variant="secondary" disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            Unlock Dashboard
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
