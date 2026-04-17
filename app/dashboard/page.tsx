import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/database";
import { EventVolumeChart } from "@/components/event-volume-chart";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const metrics = getDashboardMetrics(session.user.id);
  const host = process.env.NEXT_PUBLIC_APP_DOMAIN || "hooks.localhost:3000";
  const captureUrl = `https://${session.user.id}.hooks.${host}/`;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
          Use your dedicated capture URL in Stripe, Shopify, or GitHub webhook settings. Incoming requests are stored with full
          headers and body for deterministic replay.
        </p>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm text-[var(--muted)]">Capture URL</p>
        <code className="mt-2 block overflow-auto rounded-md border border-[var(--border)] bg-[#0b0f14] p-3 text-xs">{captureUrl}</code>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Local path fallback: /api/webhooks/capture/{session.user.id} if wildcard subdomain routing is not configured.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--muted)]">Captured events</p>
          <p className="mt-2 text-2xl font-semibold">{metrics.totalWebhooks}</p>
        </article>
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--muted)]">Replay attempts</p>
          <p className="mt-2 text-2xl font-semibold">{metrics.totalReplays}</p>
        </article>
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--muted)]">Top provider</p>
          <p className="mt-2 text-lg font-semibold">{metrics.providerCounts[0]?.provider ?? "None yet"}</p>
        </article>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-base font-semibold">14-day event volume</h2>
        <EventVolumeChart data={metrics.volumeByDay} />
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-base font-semibold">Provider distribution</h2>
        <div className="mt-3 space-y-2">
          {metrics.providerCounts.length ? (
            metrics.providerCounts.map((entry) => (
              <div key={entry.provider} className="flex items-center justify-between rounded-md border border-[var(--border)] p-3 text-sm">
                <span>{entry.provider}</span>
                <span className="text-[var(--muted)]">{entry.total}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--muted)]">No provider data yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
