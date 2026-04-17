import Script from "next/script";
import Link from "next/link";
import { ArrowRight, Repeat2, ShieldCheck, Webhook } from "lucide-react";
import { CheckoutButton } from "@/components/checkout-button";
import { LoginForm } from "@/components/login-form";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="afterInteractive" />
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Webhook Replay Toolkit
        </Link>
        <LoginForm />
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 pb-16 pt-8 md:grid-cols-[1.2fr_0.8fr] md:pt-14">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--muted)]">
            Capture real Stripe, Shopify, and GitHub webhooks and replay them against localhost
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Stop waiting for webhooks to fire again. Capture once, replay anywhere.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">
            Webhook Replay Toolkit records every incoming webhook with raw headers and body, so you can replay the exact payload
            into `localhost`, staging, or production while debugging. No more brittle curl scripts or waiting for another charge,
            order, or push event.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CheckoutButton />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm hover:bg-[var(--surface-2)]"
            >
              Open dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl shadow-black/20">
          <h2 className="text-base font-medium">What gets stored per webhook</h2>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <li className="flex items-start gap-2">
              <Webhook className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
              Provider and event type (`invoice.payment_failed`, `orders/create`, `push`)
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
              Full headers, raw body, source IP, method, and received timestamp
            </li>
            <li className="flex items-start gap-2">
              <Repeat2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
              Replay history with response code, latency, and error logs
            </li>
          </ul>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)]/50 py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 md:grid-cols-3">
          <article>
            <h3 className="text-lg font-semibold">Problem</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Webhooks are asynchronous and often non-idempotent. When one fails in production, developers spend hours trying to
              recreate the exact request that already happened.
            </p>
          </article>
          <article>
            <h3 className="text-lg font-semibold">Solution</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Point Stripe, Shopify, or GitHub to your dedicated capture URL. Every payload is archived and can be replayed against
              any target endpoint instantly.
            </p>
          </article>
          <article>
            <h3 className="text-lg font-semibold">Who It&apos;s For</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Full-stack developers and solo founders shipping integrations for payments, ecommerce, and notifications.
            </p>
          </article>
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold">Simple pricing</h2>
        <div className="mt-6 max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-3xl font-semibold">$15/mo</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Unlimited captured events, unlimited replays, one workspace.</p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <li>Capture URLs for Stripe, Shopify, GitHub, Slack, Resend, and Postmark</li>
            <li>Replay to localhost, staging, and production</li>
            <li>Header/body diff-safe replay with observability</li>
          </ul>
          <div className="mt-6">
            <CheckoutButton className="w-full rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#051b0a] hover:bg-[var(--accent-2)]" />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="font-medium">Does replay preserve the original body and headers?</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Yes. You can replay with original headers, body, and method, while removing transport-specific fields like `host` and
              `content-length` that would break forwarding.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="font-medium">Can I replay to localhost?</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Yes. Use `https://` tunnel URLs from ngrok/Cloudflare Tunnel or any reachable local bridge endpoint.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="font-medium">How do I access the app after paying?</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Successful checkout redirects through a signed callback that sets a secure access cookie, unlocking dashboard routes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
