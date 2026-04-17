"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { initLemonSqueezy } from "@/lib/lemonsqueezy";

declare global {
  interface Window {
    LemonSqueezy?: {
      Url?: {
        Open: (url: string) => void;
      };
    };
  }
}

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    initLemonSqueezy();
  }, []);

  async function startCheckout() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/checkout", {
      method: "POST"
    });

    const data = (await res.json()) as { checkoutUrl?: string; error?: string };
    if (!res.ok || !data.checkoutUrl) {
      setError(data.error ?? "Unable to start checkout.");
      setLoading(false);
      return;
    }

    if (window.LemonSqueezy?.Url?.Open) {
      window.LemonSqueezy.Url.Open(data.checkoutUrl);
    } else {
      window.open(data.checkoutUrl, "_blank", "noopener,noreferrer");
    }

    setLoading(false);
  }

  return (
    <div className="grid gap-2">
      <Button onClick={startCheckout} size="lg">
        {loading ? "Opening checkout..." : "Unlock Pro for $15/mo"}
      </Button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
