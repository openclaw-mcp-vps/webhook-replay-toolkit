import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";

import { ReplayForm } from "@/components/replay-form";
import { WebhookDetailPanel } from "@/components/webhook-detail";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWebhookById } from "@/lib/db";

export const dynamic = "force-dynamic";

type WebhookDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WebhookDetailPage({ params }: WebhookDetailPageProps) {
  const { id } = await params;

  let webhook = null;
  let error: string | null = null;

  try {
    webhook = await getWebhookById(id);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Could not load webhook details.";
  }

  if (error) {
    return (
      <Card className="border-amber-700/40 bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-amber-100">Could not load event</CardTitle>
          <CardDescription className="text-amber-200/90">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!webhook) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Webhook not found</CardTitle>
          <CardDescription>The event may have been deleted or the ID is invalid.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/webhooks" className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-slate-100">
          <ArrowLeft className="h-4 w-4" />
          Back to all webhooks
        </Link>
        <Badge variant="info" className="font-mono normal-case tracking-normal">
          ID: {webhook.id}
        </Badge>
      </div>

      <WebhookDetailPanel webhook={webhook} />

      <ReplayForm webhookId={webhook.id} defaultMethod={webhook.method} />

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Bot className="h-5 w-5 text-sky-300" />
            Replay History
          </CardTitle>
          <CardDescription>Latest responses from replay attempts for this webhook.</CardDescription>
        </CardHeader>
        <CardContent>
          {webhook.replayAttempts.length === 0 ? (
            <p className="text-sm text-slate-400">No replay attempts yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Target</th>
                    <th className="px-3 py-2">Method</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {webhook.replayAttempts.map((attempt) => (
                    <tr key={attempt.id} className="border-b border-slate-900/80 text-slate-200">
                      <td className="px-3 py-2">{format(new Date(attempt.createdAt), "MMM d, HH:mm:ss")}</td>
                      <td className="max-w-[260px] truncate px-3 py-2 font-mono">{attempt.targetUrl}</td>
                      <td className="px-3 py-2">{attempt.method}</td>
                      <td className="px-3 py-2">{attempt.statusCode ?? "failed"}</td>
                      <td className="px-3 py-2">{attempt.durationMs} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
