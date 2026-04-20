import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { BarChart3, RefreshCcw, Webhook } from "lucide-react";
import { getServerAuthSession } from "@/lib/auth";
import { getDashboardMetrics, listWebhooksByUser } from "@/lib/db";

export const metadata = {
  title: "Dashboard"
};

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return null;
  }

  const [metrics, recentWebhooks] = await Promise.all([
    getDashboardMetrics(session.user.id),
    listWebhooksByUser(session.user.id, { limit: 8 })
  ]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-700 bg-[#111927]/80 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Total Captured
          </p>
          <p className="mt-2 text-2xl font-bold text-white">
            {metrics.totalWebhooks}
          </p>
        </article>

        <article className="rounded-xl border border-slate-700 bg-[#111927]/80 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Captured (24h)
          </p>
          <p className="mt-2 text-2xl font-bold text-white">
            {metrics.webhooksLast24h}
          </p>
        </article>

        <article className="rounded-xl border border-slate-700 bg-[#111927]/80 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Replay Attempts (24h)
          </p>
          <p className="mt-2 text-2xl font-bold text-white">
            {metrics.replayAttemptsLast24h}
          </p>
        </article>

        <article className="rounded-xl border border-slate-700 bg-[#111927]/80 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Failed Replays (24h)
          </p>
          <p className="mt-2 text-2xl font-bold text-rose-300">
            {metrics.failedReplaysLast24h}
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-700 bg-[#111927]/80 p-5">
          <Webhook className="h-5 w-5 text-cyan-300" />
          <h2 className="mt-3 text-lg font-semibold text-white">Capture</h2>
          <p className="mt-2 text-sm text-slate-300">
            Point your provider to your private capture URL and every webhook is
            persisted with full request metadata.
          </p>
        </article>

        <article className="rounded-xl border border-slate-700 bg-[#111927]/80 p-5">
          <RefreshCcw className="h-5 w-5 text-cyan-300" />
          <h2 className="mt-3 text-lg font-semibold text-white">Replay</h2>
          <p className="mt-2 text-sm text-slate-300">
            Open any captured event and replay it to localhost, staging, or
            production with one click.
          </p>
        </article>

        <article className="rounded-xl border border-slate-700 bg-[#111927]/80 p-5">
          <BarChart3 className="h-5 w-5 text-cyan-300" />
          <h2 className="mt-3 text-lg font-semibold text-white">Diagnose</h2>
          <p className="mt-2 text-sm text-slate-300">
            Inspect replay responses, latency, and headers to verify fixes before
            shipping.
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-700 bg-[#111927]/80 p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Recent Webhooks</h2>
          <Link
            href="/dashboard/webhooks"
            className="text-sm text-cyan-300 transition hover:text-cyan-200"
          >
            View all
          </Link>
        </div>

        {recentWebhooks.length ? (
          <ul className="mt-4 space-y-2">
            {recentWebhooks.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/dashboard/webhooks/${event.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700/80 bg-slate-900/40 px-4 py-3 transition hover:border-cyan-400/60"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {event.provider.toUpperCase()} {event.method}
                    </p>
                    <p className="font-[family-name:var(--font-plex-mono)] text-xs text-slate-400">
                      {event.path}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(event.received_at), {
                      addSuffix: true
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-400">
            No events captured yet. Fire a webhook to your capture URL to start.
          </p>
        )}
      </section>
    </div>
  );
}
