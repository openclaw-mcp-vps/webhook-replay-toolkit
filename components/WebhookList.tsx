import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CapturedWebhook } from "@/lib/types";

export function WebhookList({ webhooks }: { webhooks: CapturedWebhook[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent captures</CardTitle>
      </CardHeader>
      <CardContent>
        {webhooks.length === 0 ? (
          <p className="text-sm text-slate-400">
            No webhook events captured yet. Point Stripe, Shopify, or GitHub at your capture URL.
          </p>
        ) : (
          <ul className="grid gap-3">
            {webhooks.map((webhook) => (
              <li key={webhook.id}>
                <Link
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/70 p-4 transition hover:border-sky-500/60"
                  href={`/dashboard/webhooks/${webhook.id}`}
                >
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Badge>{webhook.method}</Badge>
                      <span className="font-mono text-sm text-slate-300">{webhook.path}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(webhook.receivedAt), { addSuffix: true })}
                      <span>source: {webhook.sourceHint}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-500" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
