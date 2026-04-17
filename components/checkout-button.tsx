"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

type CheckoutButtonProps = {
  className?: string;
};

declare global {
  interface Window {
    LemonSqueezy?: {
      Url: {
        Open: (url: string) => void;
      };
    };
    createLemonSqueezy?: () => void;
  }
}

export function CheckoutButton({ className }: CheckoutButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function openCheckout() {
    if (!session?.user?.id || !session.user.email) {
      setMessage("Sign in first so we can bind the license to your account.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, email: session.user.email })
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const payload = (await response.json()) as { checkoutUrl: string };

      if (window.createLemonSqueezy) {
        window.createLemonSqueezy();
      }

      if (window.LemonSqueezy?.Url) {
        window.LemonSqueezy.Url.Open(payload.checkoutUrl);
      } else {
        window.location.href = payload.checkoutUrl;
      }
    } catch (error) {
      console.error(error);
      setMessage("Checkout is unavailable. Confirm Lemon Squeezy env vars are set.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={openCheckout}
        disabled={loading}
        className={
          className ??
          "rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#051b0a] hover:bg-[var(--accent-2)] disabled:opacity-60"
        }
      >
        {loading ? "Starting checkout..." : "Unlock Pro for $15/mo"}
      </button>
      {message ? <p className="mt-2 text-xs text-amber-300">{message}</p> : null}
    </div>
  );
}
