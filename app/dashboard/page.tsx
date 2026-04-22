import { formatDistanceToNowStrict } from "date-fns";
import { Activity, Clock3, Repeat2, Waves } from "lucide-react";

import { WebhookList } from "@/components/webhook-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, listWebhooks } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  try {
    const [stats, recentWebhooks] = await Promise.all([
      getDashboardStats(),
      listWebhooks({
        limit: 12
      })
    ]);

    return {
      stats,
      recentWebhooks,
      error: null
    };
  } catch (error) {
    return {
      stats: null,
      recentWebhooks: [],
      error: error instanceof Error ? error.message : "Could not load dashboard data."
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (data.error || !data.stats) {
    return (
      <Card className="border-amber-700/40 bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-amber-100">Dashboard unavailable</CardTitle>
          <CardDescription className="text-amber-200/80">
            {data.error ?? "Could not load dashboard data."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-amber-100/90">
          Add <code>DATABASE_URL</code> to connect Postgres, then reload this page.
        </CardContent>
      </Card>
    );
  }

  const { stats, recentWebhooks } = data;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Captures</CardDescription>
            <CardTitle className="text-3xl">{stats.totalEvents.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-slate-500">All webhook requests stored in Postgres.</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="inline-flex items-center gap-1">
              <Activity className="h-4 w-4 text-sky-300" />
              Last 24 Hours
            </CardDescription>
            <CardTitle className="text-3xl">{stats.eventsLast24h.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-slate-500">Recent event volume for incident windows.</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="inline-flex items-center gap-1">
              <Repeat2 className="h-4 w-4 text-emerald-300" />
              Replay Attempts
            </CardDescription>
            <CardTitle className="text-3xl">{stats.replayCount.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-slate-500">Every replay response is logged for auditing.</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="inline-flex items-center gap-1">
              <Clock3 className="h-4 w-4 text-amber-300" />
              Last Capture
            </CardDescription>
            <CardTitle className="text-base">
              {stats.lastCaptureAt
                ? formatDistanceToNowStrict(new Date(stats.lastCaptureAt), { addSuffix: true })
                : "No captures yet"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-slate-500">Incoming proxy health indicator.</CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <Waves className="h-5 w-5 text-sky-300" />
            Quick Start
          </CardTitle>
          <CardDescription>Paste these URLs into your provider webhook settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-lg border border-slate-800 bg-[#0d1117]/80 p-3 font-mono text-xs text-slate-300">
            https://your-domain.com/api/capture/stripe
          </div>
          <div className="rounded-lg border border-slate-800 bg-[#0d1117]/80 p-3 font-mono text-xs text-slate-300">
            https://your-domain.com/api/capture/shopify
          </div>
          <div className="rounded-lg border border-slate-800 bg-[#0d1117]/80 p-3 font-mono text-xs text-slate-300">
            https://your-domain.com/api/capture/github
          </div>
        </CardContent>
      </Card>

      <WebhookList
        items={recentWebhooks}
        description="Use filters in the Webhooks tab for deeper search and inspection."
      />
    </div>
  );
}
