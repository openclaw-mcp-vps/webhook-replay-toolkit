import Link from "next/link";
import { ArrowRight, Bug, Cable, CloudCog, Repeat2, ShieldCheck, TimerReset, Webhook } from "lucide-react";

import { PricingCard } from "@/components/pricing-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const providerCards = [
  {
    title: "Stripe",
    detail: "Capture `checkout.session.completed`, invoice updates, and subscription events as they happen."
  },
  {
    title: "Shopify",
    detail: "Debug order/create and app/uninstalled webhooks without waiting for a customer action."
  },
  {
    title: "GitHub",
    detail: "Replay push, PR, and issue events against new commits while preserving signatures."
  },
  {
    title: "Any provider",
    detail: "Slack, Resend, Postmark, or custom services work through the same capture endpoint."
  }
];

const faqs = [
  {
    question: "How do I start capturing webhooks?",
    answer:
      "Point any provider webhook URL to your app domain at `/api/capture/<provider>`. Every request body and header is stored for replay."
  },
  {
    question: "Does replay keep original payload fidelity?",
    answer:
      "Yes. The replay request forwards the raw body and can preserve original headers (minus unsafe hop-by-hop headers) for realistic debugging."
  },
  {
    question: "Can I replay to localhost?",
    answer:
      "Yes. During local development run this app locally and replay to `http://localhost:<port>/...` endpoints directly."
  },
  {
    question: "How is access controlled?",
    answer:
      "The dashboard is paywalled. After purchase, Stripe webhook events create your access grant and you unlock with your billing email."
  }
];

export default function HomePage() {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-8 lg:px-10">
      <header className="mb-16">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-700/30 bg-sky-950/40 px-3 py-1 text-xs font-semibold text-sky-200">
          <Webhook className="h-3.5 w-3.5" />
          webhook-replay-toolkit
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
              Capture production webhooks once,
              <span className="block bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                replay them forever.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg text-slate-300">
              Stop waiting for one-off webhook events to fire again. Webhook Replay Toolkit stores full request headers + raw payload,
              then lets you replay to localhost, staging, or production with one click.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {paymentLink ? (
                <Button asChild size="lg">
                  <a href={paymentLink} target="_blank" rel="noreferrer">
                    Start for $15/month
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button size="lg" disabled>
                  Set NEXT_PUBLIC_STRIPE_PAYMENT_LINK
                </Button>
              )}
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
            </div>
            <p className="mt-3 text-sm text-slate-500">Hosted Stripe checkout. No metered pricing. Cancel anytime.</p>
          </div>

          <Card className="border-slate-800/80 bg-[#0c121a]/90">
            <CardContent className="space-y-4 pt-6 text-sm">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Capture endpoint</p>
                <code className="text-sky-200">https://your-app.com/api/capture/stripe</code>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Replay target</p>
                <code className="text-emerald-200">http://localhost:3000/api/webhooks/stripe</code>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-slate-300">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Common result</p>
                <p>
                  Reproduce signature validation and parsing bugs in under a minute instead of waiting hours for another live checkout,
                  order, or push event.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <section className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {providerCards.map((item) => (
          <Card key={item.title} className="border-slate-800/80 bg-slate-950/50">
            <CardContent className="pt-6">
              <h2 className="mb-2 text-lg font-semibold text-slate-100">{item.title}</h2>
              <p className="text-sm text-slate-400">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mb-16 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/60 text-red-200">
              <Bug className="h-5 w-5" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">The Pain</h3>
            <p className="text-sm text-slate-300">
              Webhooks are async and non-idempotent. A failed event often cannot be retriggered cleanly, and handcrafted curl scripts miss
              critical headers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-950/50 text-sky-200">
              <Cable className="h-5 w-5" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">The System</h3>
            <p className="text-sm text-slate-300">
              A capture proxy records raw body + full headers into Postgres. Replays are sent on demand, with Redis-backed queue metadata for
              operational traceability.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/60 text-emerald-200">
              <TimerReset className="h-5 w-5" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">The Outcome</h3>
            <p className="text-sm text-slate-300">
              Faster incident response, cleaner debugging workflows, and fewer “cannot reproduce” dead ends during launches and migrations.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-16 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight">How replay works</h2>
          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="mb-1 font-semibold text-slate-100">1. Capture</p>
              <p>
                Route provider webhooks to <code>/api/capture/&lt;provider&gt;</code>. Every request gets an immutable event record.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="mb-1 font-semibold text-slate-100">2. Inspect</p>
              <p>Search by provider or payload content, inspect signature headers, and review the exact JSON body in the dashboard.</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="mb-1 font-semibold text-slate-100">3. Replay</p>
              <p>Send to localhost, staging, or prod in one click. Replay attempts are logged with response code, latency, and response body.</p>
            </div>
          </div>
        </div>

        <PricingCard />
      </section>

      <section className="mb-14">
        <div className="mb-6 flex items-center gap-2">
          <CloudCog className="h-5 w-5 text-sky-300" />
          <h2 className="text-3xl font-semibold tracking-tight">FAQ</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-100">{faq.question}</summary>
              <p className="mt-3 text-sm text-slate-300">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-sm text-slate-400">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Built for full-stack developers shipping webhook-driven products.
          </p>
          <p className="inline-flex items-center gap-2">
            <Repeat2 className="h-4 w-4 text-sky-300" />
            Replay faster. Ship with confidence.
          </p>
        </div>
      </footer>
    </main>
  );
}
