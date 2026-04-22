import { formatDistanceToNowStrict } from "date-fns";
import { ArrowUpRight, Database } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { WebhookSummary } from "@/lib/db";

type WebhookListProps = {
  title?: string;
  description?: string;
  items: WebhookSummary[];
};

function providerBadgeVariant(provider: string): "info" | "success" | "warning" | "default" {
  if (provider === "stripe") {
    return "info";
  }

  if (provider === "shopify") {
    return "success";
  }

  if (provider === "github") {
    return "warning";
  }

  return "default";
}

export function WebhookList({ title = "Recent webhooks", description, items }: WebhookListProps) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description ?? "Newest captures from your ingress endpoint"}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center text-sm text-slate-400">
            <Database className="mx-auto mb-2 h-5 w-5 text-slate-500" />
            No webhook captures yet. Point a provider webhook URL at <code>/api/capture/&lt;provider&gt;</code>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Provider</th>
                  <th className="px-3 py-2">Route</th>
                  <th className="px-3 py-2">Method</th>
                  <th className="px-3 py-2">Body</th>
                  <th className="px-3 py-2">Received</th>
                  <th className="px-3 py-2" aria-label="Open" />
                </tr>
              </thead>
              <tbody>
                {items.map((event) => (
                  <tr key={event.id} className="border-b border-slate-900/80 text-slate-200">
                    <td className="px-3 py-3 align-top">
                      <Badge variant={providerBadgeVariant(event.provider)}>{event.provider}</Badge>
                    </td>
                    <td className="px-3 py-3 align-top font-mono text-xs text-slate-300">{event.path}</td>
                    <td className="px-3 py-3 align-top text-xs font-semibold uppercase text-slate-400">{event.method}</td>
                    <td className="px-3 py-3 align-top text-xs text-slate-400">{event.bodySize.toLocaleString()} bytes</td>
                    <td className="px-3 py-3 align-top text-xs text-slate-400">
                      {formatDistanceToNowStrict(new Date(event.receivedAt), { addSuffix: true })}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <Link
                        href={`/dashboard/webhooks/${event.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-sky-300 hover:text-sky-200"
                      >
                        Inspect
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
