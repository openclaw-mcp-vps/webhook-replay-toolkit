import Link from "next/link";
import { cookies } from "next/headers";
import { Bug, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import { PricingTable } from "@/components/pricing-table";
import { PAID_COOKIE } from "@/lib/constants";

export default async function Home() {
  const store = await cookies();
  const isPaid = store.get(PAID_COOKIE)?.value === "1";
  const checkoutUrl = "/api/lemonsqueezy/checkout";

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-12 md:px-10">
      <header className="rounded-2xl border border-[#30363d] bg-[#161b22]/80 p-6 backdrop-blur">
        <nav className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-lg font-semibold text-[#f0f6fc]">Webhook Replay Toolkit</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a href="#problem" className="text-[#8b949e] hover:text-[#58a6ff]">
              Problem
            </a>
            <a href="#solution" className="text-[#8b949e] hover:text-[#58a6ff]">
              Solution
            </a>
            <a href="#pricing" className="text-[#8b949e] hover:text-[#58a6ff]">
              Pricing
            </a>
            <a href="#faq" className="text-[#8b949e] hover:text-[#58a6ff]">
              FAQ
            </a>
            <Link href={isPaid ? "/dashboard" : "#pricing"} className="rounded-md bg-[#238636] px-4 py-2 text-white hover:bg-[#2ea043]">
              {isPaid ? "Open Dashboard" : "Unlock Access"}
            </Link>
          </div>
        </nav>
      </header>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="space-y-5">
          <p className="inline-flex rounded-full border border-[#30363d] px-3 py-1 text-xs uppercase tracking-wide text-[#8b949e]">
            Developer Tooling · $15/mo
          </p>
          <h1 className="text-4xl font-bold leading-tight text-[#f0f6fc] md:text-5xl">
            Capture real Stripe, Shopify, and GitHub webhooks. Replay them anywhere.
          </h1>
          <p className="text-lg text-[#8b949e]">
            Production webhook failed at 2AM? Keep the exact payload, headers, and signature context. Replay to localhost, staging, or prod in one click.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="#pricing" className="rounded-md bg-[#238636] px-5 py-3 font-medium text-white hover:bg-[#2ea043]">
              Start paid access
            </Link>
            <Link href="/dashboard" className="rounded-md border border-[#30363d] px-5 py-3 font-medium text-[#c9d1d9] hover:bg-[#161b22]">
              View dashboard
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6">
          <p className="mb-4 text-sm text-[#8b949e]">Why teams use it</p>
          <div className="space-y-4">
            {[
              "No more waiting for another Stripe checkout event.",
              "No more hand-written curl scripts for every provider.",
              "No more guessing whether your local payload matches production.",
            ].map((item) => (
              <div key={item} className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4 text-sm text-[#c9d1d9]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="problem" className="space-y-6">
        <h2 className="text-3xl font-bold text-[#f0f6fc]">The painful webhook loop</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
            <Bug className="mb-3 h-5 w-5 text-[#f85149]" />
            <h3 className="mb-2 font-semibold text-[#f0f6fc]">Async bugs vanish fast</h3>
            <p className="text-sm text-[#8b949e]">
              A failed webhook event is gone unless you explicitly persisted it with headers and body.
            </p>
          </article>
          <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
            <RotateCcw className="mb-3 h-5 w-5 text-[#58a6ff]" />
            <h3 className="mb-2 font-semibold text-[#f0f6fc]">Replay scripts rot instantly</h3>
            <p className="text-sm text-[#8b949e]">
              Throwaway curl commands miss provider-specific headers, odd body formats, and edge-case timing.
            </p>
          </article>
          <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
            <Zap className="mb-3 h-5 w-5 text-[#d29922]" />
            <h3 className="mb-2 font-semibold text-[#f0f6fc]">Fixes take too long</h3>
            <p className="text-sm text-[#8b949e]">
              Teams burn hours waiting on customers to trigger the same event again.
            </p>
          </article>
        </div>
      </section>

      <section id="solution" className="space-y-6">
        <h2 className="text-3xl font-bold text-[#f0f6fc]">Built to debug webhooks in minutes</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
            <ShieldCheck className="mb-3 h-5 w-5 text-[#3fb950]" />
            <h3 className="mb-2 text-xl font-semibold text-[#f0f6fc]">Capture exactly what hit production</h3>
            <p className="text-sm text-[#8b949e]">
              We store method, path, full headers, and raw request body so your replay is faithful to what happened.
            </p>
          </div>
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
            <RotateCcw className="mb-3 h-5 w-5 text-[#58a6ff]" />
            <h3 className="mb-2 text-xl font-semibold text-[#f0f6fc]">Replay against any endpoint</h3>
            <p className="text-sm text-[#8b949e]">
              Fire the same payload at localhost tunnels, staging URLs, or production workers with one click.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-2xl">
        <PricingTable checkoutUrl={checkoutUrl} />
      </section>

      <section id="faq" className="space-y-4">
        <h2 className="text-3xl font-bold text-[#f0f6fc]">FAQ</h2>
        {[
          {
            q: "Which providers does this support?",
            a: "Any provider that can send HTTP webhooks. Stripe, Shopify, GitHub, Slack, Resend, and Postmark work out of the box.",
          },
          {
            q: "Can I replay to localhost?",
            a: "Yes. Point replay at an ngrok/Cloudflare tunnel URL for your local dev server.",
          },
          {
            q: "How is access controlled?",
            a: "After successful checkout, your browser receives a secure paid-access cookie that unlocks the dashboard.",
          },
        ].map((item) => (
          <article key={item.q} className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
            <h3 className="mb-2 font-semibold text-[#f0f6fc]">{item.q}</h3>
            <p className="text-sm text-[#8b949e]">{item.a}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
