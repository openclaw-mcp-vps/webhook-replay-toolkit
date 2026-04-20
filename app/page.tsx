import Link from "next/link";
import Script from "next/script";
import { ArrowRight, Bug, Clock3, ShieldCheck, Zap } from "lucide-react";
import { getServerAuthSession } from "@/lib/auth";
import { PricingCard } from "@/components/PricingCard";

const faqs = [
  {
    question: "How do capture URLs work?",
    answer:
      "Each account gets a private capture key and subdomain. Point Stripe, Shopify, or GitHub webhooks to that URL and every request is stored with method, headers, body, and timestamp."
  },
  {
    question: "Can I replay to localhost?",
    answer:
      "Yes. Paste any URL, including local tunnel URLs like ngrok or Cloudflare Tunnel. The replay sends the original method, headers, and body exactly as captured."
  },
  {
    question: "Will this help with signature verification bugs?",
    answer:
      "Yes. Because the original signature headers are preserved, you can test how your app handles real signature payloads instead of handcrafted curl approximations."
  },
  {
    question: "Do you support non-Stripe providers?",
    answer:
      "Out of the box we detect Stripe, Shopify, GitHub, Slack, Resend, and Postmark. Custom webhook sources still capture and replay without special setup."
  }
];

export default async function HomePage() {
  const session = await getServerAuthSession();

  return (
    <main>
      <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="afterInteractive" />

      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(34,211,238,0.22),transparent_45%)]" />
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-12 md:pb-24 md:pt-16">
          <header className="flex items-center justify-between">
            <p className="font-[family-name:var(--font-plex-mono)] text-xs uppercase tracking-[0.24em] text-cyan-300">
              Webhook Replay Toolkit
            </p>
            <div className="flex items-center gap-3">
              {session?.user?.id ? (
                <Link
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-white"
                  href="/dashboard"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-white"
                  href="/login"
                >
                  Sign In
                </Link>
              )}
            </div>
          </header>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Capture live webhooks once. Replay them forever.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-slate-300">
                Stop waiting on production events to fire again. Record real
                Stripe, Shopify, and GitHub webhooks with full fidelity, then
                replay them on demand against localhost, staging, or production.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={session?.user?.id ? "/dashboard" : "/login?next=/dashboard"}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  {session?.user?.id ? "Open Dashboard" : "Start in 30 Seconds"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-white"
                >
                  See Pricing
                </a>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <Clock3 className="h-5 w-5 text-cyan-300" />
                  <p className="mt-2 text-sm font-semibold text-white">
                    Recover Hours
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Replay failed events immediately instead of waiting for
                    another production trigger.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <Bug className="h-5 w-5 text-cyan-300" />
                  <p className="mt-2 text-sm font-semibold text-white">
                    Reproduce Edge Cases
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Debug payload-specific bugs using real event bodies and
                    headers.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <ShieldCheck className="h-5 w-5 text-cyan-300" />
                  <p className="mt-2 text-sm font-semibold text-white">
                    Keep Traceability
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Every replay is logged with status code, duration, and
                    response body.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#111927]/85 p-6 shadow-2xl shadow-cyan-950/20">
              <p className="font-[family-name:var(--font-plex-mono)] text-xs uppercase tracking-[0.16em] text-slate-400">
                Why developers switch
              </p>
              <ul className="mt-4 space-y-4 text-sm text-slate-200">
                <li>
                  <strong className="text-white">Before:</strong> broken webhook,
                  no payload copy, no way to replay, and no confidence fix works.
                </li>
                <li>
                  <strong className="text-white">After:</strong> captured payload,
                  one-click replay, and proof your endpoint handles the exact
                  request that failed in production.
                </li>
              </ul>

              <div className="mt-6 rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
                  <Zap className="h-4 w-4" />
                  Built for async webhook debugging loops
                </p>
                <p className="mt-2 text-xs text-cyan-100/90">
                  Capture endpoint + searchable event history + replay executor in
                  one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr,0.85fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-bold text-white">Simple pricing</h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              One plan that covers your entire webhook workflow, from capture to
              replay. No usage caps on events or endpoints.
            </p>
          </div>

          <PricingCard signedIn={Boolean(session?.user?.id)} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="text-3xl font-bold text-white">FAQ</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <article
              key={item.question}
              className="rounded-xl border border-slate-800 bg-[#101826]/80 p-5"
            >
              <h3 className="text-base font-semibold text-white">{item.question}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
