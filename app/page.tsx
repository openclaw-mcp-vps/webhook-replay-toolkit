import Script from "next/script";
import Link from "next/link";
import { CheckCircle2, RefreshCcw, ShieldCheck, Zap } from "lucide-react";
import { AuthPanel } from "@/components/AuthPanel";
import { CheckoutButton } from "@/components/CheckoutButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppSession } from "@/lib/auth";
import { hasPaidAccess } from "@/lib/paywall";

export default async function HomePage() {
  const session = await getAppSession();
  const paid = session?.user?.id ? await hasPaidAccess(session.user.id) : false;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6 lg:px-8">
      <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="afterInteractive" />

      <header className="grid gap-6 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-8 lg:grid-cols-[1.25fr_1fr]">
        <div className="grid gap-4">
          <Badge className="w-fit border-sky-400/40 bg-sky-500/10 text-sky-200">Developer tool</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Capture real Stripe, Shopify, and GitHub webhooks and replay them against localhost.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Stop waiting for the next webhook fire. Record production payloads with full headers and raw body,
            then replay them to localhost, staging, or prod in one click.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="rounded-md border border-slate-700 px-3 py-1">Unique capture URL per user</span>
            <span className="rounded-md border border-slate-700 px-3 py-1">Replay logs with status codes</span>
            <span className="rounded-md border border-slate-700 px-3 py-1">Supports JSON and binary bodies</span>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center rounded-md bg-sky-500 px-6 font-semibold text-slate-950"
              >
                Open dashboard
              </Link>
            ) : null}
            <a
              href="#pricing"
              className="inline-flex h-11 items-center rounded-md border border-slate-700 px-6 font-semibold text-slate-200"
            >
              View pricing
            </a>
          </div>
        </div>

        <Card className="h-fit border-slate-700">
          <CardHeader>
            <CardTitle>Common webhook pain</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-slate-300">
            <p>1. Event fires once in production and fails because of a subtle parsing bug.</p>
            <p>2. You can’t replay the exact payload and signature locally.</p>
            <p>3. You lose hours writing one-off curl commands and guessing headers.</p>
            <p className="text-sky-300">Webhook Replay Toolkit captures once and replays forever.</p>
          </CardContent>
        </Card>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-sky-300" /> Full request fidelity
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Store method, path, query params, headers, and body exactly as received.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCcw className="h-4 w-4 text-sky-300" /> Instant replay
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Replay to localhost, staging, or production endpoints with one click.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-sky-300" /> Faster debugging loop
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Reproduce failures in seconds instead of waiting for new webhook events.
          </CardContent>
        </Card>
      </section>

      {!session ? <AuthPanel /> : null}

      <section id="pricing" className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-2xl font-semibold text-white">Simple pricing</h2>
        <p className="text-slate-300">One plan for developers shipping real webhook integrations.</p>
        <Card className="max-w-lg border-sky-400/30">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-slate-300">
            <p>
              <span className="text-3xl font-bold text-white">$15</span>
              <span className="text-slate-400"> / month</span>
            </p>
            <ul className="grid gap-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Unlimited captures</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Unlimited replays</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Full headers and body history</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Capture URL per account</li>
            </ul>
            {session && !paid ? (
              <CheckoutButton />
            ) : session && paid ? (
              <Link href="/dashboard" className="text-sky-300 underline underline-offset-4">
                Access your unlocked dashboard
              </Link>
            ) : (
              <p className="text-slate-400">Create an account first, then unlock Pro in one click.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <h2 className="text-2xl font-semibold text-white">FAQ</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How do I capture webhooks?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Copy your personal capture endpoint from the dashboard and paste it in Stripe, Shopify, GitHub, Slack,
            Resend, or Postmark webhook settings.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Will this replay exact headers and payload?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Yes. The replay endpoint reuses original method, content-type, and captured body. You can then inspect
            replay status and response body.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Can I replay to localhost?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Yes. Point replays at local tunnels, staging URLs, or production endpoints.
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
