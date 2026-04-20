"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
  }
}

type PricingCardProps = {
  signedIn: boolean;
};

export function PricingCard({ signedIn }: PricingCardProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setError(null);

    if (!signedIn) {
      router.push("/login?next=/");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST"
      });

      const data = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || "Unable to start checkout");
      }

      if (window.createLemonSqueezy) {
        window.createLemonSqueezy();
      }

      const checkoutLink = document.createElement("a");
      checkoutLink.href = data.checkoutUrl;
      checkoutLink.className = "lemonsqueezy-button";
      checkoutLink.target = "_blank";
      checkoutLink.rel = "noreferrer";
      checkoutLink.style.display = "none";
      document.body.appendChild(checkoutLink);
      checkoutLink.click();
      document.body.removeChild(checkoutLink);
    } catch (checkoutError) {
      const message =
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-400/40 bg-[linear-gradient(170deg,#10202f_0%,#0f1621_70%)] p-8 shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_20px_50px_-20px_rgba(34,211,238,0.5)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.24),transparent_50%)]" />
      <div className="relative z-10">
        <p className="inline-flex items-center rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          Single Pro Plan
        </p>
        <h3 className="mt-5 text-3xl font-bold text-white">$15/month</h3>
        <p className="mt-3 text-sm text-slate-300">
          Unlimited webhook captures and replays, with secure storage of raw
          headers and body payloads.
        </p>

        <ul className="mt-6 space-y-3 text-sm text-slate-200">
          {[
            "Capture URLs for Stripe, Shopify, GitHub, Slack, Resend, and Postmark",
            "Replay any event to localhost, staging, or production",
            "Preserve full headers, method, body, and replay history",
            "Filter by provider, event content, and delivery timestamp"
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={startCheckout}
          disabled={loading}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening Checkout...
            </>
          ) : (
            "Start Pro Access"
          )}
        </button>

        <p className="mt-3 text-xs text-slate-400">
          Payment runs through Lemon Squeezy secure checkout.
        </p>

        {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}

        {!signedIn ? (
          <p className="mt-3 text-xs text-slate-400">
            Need an account first?{" "}
            <Link className="text-cyan-300 underline" href="/login?next=/">
              Create one in under 30 seconds
            </Link>
            .
          </p>
        ) : null}
      </div>
    </div>
  );
}
