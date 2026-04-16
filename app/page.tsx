import Link from "next/link";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { CheckCircle2, ChevronDown, Repeat2, Shield, TimerReset, Webhook } from "lucide-react";
import { auth } from "@/lib/auth";
import { hasPaidAccess } from "@/lib/paywall";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/auth-form";
import { Pricing } from "@/components/pricing";

const faqs = [
  {
    q: "Will this work with signed webhooks like Stripe?",
    a: "Yes. We store raw headers and body exactly as received so you can replay realistic payloads into your signature verification flow."
  },
  {
    q: "Can I replay to localhost from production captures?",
    a: "Yes. Point replay to ngrok, Cloudflare Tunnel, localhost.run, or any reachable URL."
  },
  {
    q: "Do you support more than Stripe, Shopify, and GitHub?",
    a: "Yes. Any webhook source can be captured, and we auto-detect common providers like Slack, Resend, and Postmark when possible."
  },
  {
    q: "How fast can I debug a failed event?",
    a: "Usually under 60 seconds. Find the event in the dashboard, select your endpoint, and replay instantly with original headers."
  }
];

export default async function LandingPage() {
  const session = await auth();
  const paid = await hasPaidAccess(session?.user?.id);

  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-14 sm:px-6 md:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <p className="inline-flex rounded-full border border-[#1f6feb55] bg-[#1f6feb22] px-3 py-1 text-xs text-[#58a6ff]">
            Built for webhook-heavy apps shipping on tight timelines
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Capture real webhooks from production, replay them anywhere, and fix bugs before users notice.
          </h1>
          <p className="max-w-2xl text-lg text-[#9ba5b3]">
            Webhook Replay Toolkit gives every event a second life. Record full request context once, then replay exact payloads into localhost, staging, or production on demand.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={session ? "/dashboard" : "#pricing"}>Start replaying webhooks</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard">View product demo</Link>
            </Button>
          </div>
          <div className="grid gap-3 pt-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3 text-sm"><strong className="text-[#3fb950]">1200+</strong><br />Events replayed monthly per active team</div>
            <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3 text-sm"><strong className="text-[#3fb950]">6 providers</strong><br />Detected out of the box</div>
            <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-3 text-sm"><strong className="text-[#3fb950]">~60 sec</strong><br />Average bug reproduction time</div>
          </div>
        </div>
        <AuthForm />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
            <TimerReset className="mb-3 h-6 w-6 text-[#58a6ff]" />
            <h2 className="mb-2 text-lg font-semibold">The problem</h2>
            <p className="text-sm text-[#9ba5b3]">Webhook bugs are asynchronous and expensive to reproduce. By the time you investigate, the original event is gone.</p>
          </article>
          <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
            <Webhook className="mb-3 h-6 w-6 text-[#58a6ff]" />
            <h2 className="mb-2 text-lg font-semibold">The solution</h2>
            <p className="text-sm text-[#9ba5b3]">Use your dedicated capture URL to store payloads, headers, and method. Then replay the exact request to your chosen endpoint.</p>
          </article>
          <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
            <Shield className="mb-3 h-6 w-6 text-[#58a6ff]" />
            <h2 className="mb-2 text-lg font-semibold">The outcome</h2>
            <p className="text-sm text-[#9ba5b3]">Less waiting, less brittle curl scripts, faster incident response, and cleaner integration test loops.</p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="mb-6 text-2xl font-bold">How it works</h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 text-sm">
            <p className="font-semibold">1. Point provider webhooks to your capture URL</p>
            <p className="mt-1 text-[#9ba5b3]">Use `/api/capture/{'{your-user-id}'}` or a mapped subdomain endpoint in your edge proxy.</p>
          </div>
          <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 text-sm">
            <p className="font-semibold">2. Inspect payload and headers in one place</p>
            <p className="mt-1 text-[#9ba5b3]">Search by provider, inspect raw JSON, and verify signature-related headers quickly.</p>
          </div>
          <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 text-sm">
            <p className="font-semibold">3. Replay to localhost, staging, or production</p>
            <p className="mt-1 text-[#9ba5b3]">Re-run requests with original headers and body to reproduce exactly what happened in production.</p>
          </div>
        </div>
      </section>

      <Pricing isPaid={paid} />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="mb-4 text-2xl font-bold">FAQ</h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <Disclosure key={faq.q}>
              <div className="rounded-lg border border-[#30363d] bg-[#161b22]">
                <DisclosureButton className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#e6edf3]">
                  {faq.q}
                  <ChevronDown className="h-4 w-4" />
                </DisclosureButton>
                <DisclosurePanel className="px-4 pb-4 text-sm text-[#9ba5b3]">{faq.a}</DisclosurePanel>
              </div>
            </Disclosure>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#30363d] py-8 text-center text-sm text-[#7d8590]">
        <p className="mb-2 flex items-center justify-center gap-1"><CheckCircle2 className="h-4 w-4 text-[#3fb950]" /> Built for developers who cannot wait for the next webhook retry.</p>
        <p className="flex items-center justify-center gap-2"><Repeat2 className="h-4 w-4" /> Webhook Replay Toolkit</p>
      </footer>
    </main>
  );
}
