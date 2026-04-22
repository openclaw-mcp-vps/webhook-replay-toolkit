import { format } from "date-fns";
import { Clock3, FileJson2, Fingerprint, Network, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { WebhookDetail } from "@/lib/db";

function prettyBody(webhook: WebhookDetail) {
  if (webhook.parsedBody) {
    return JSON.stringify(webhook.parsedBody, null, 2);
  }

  return webhook.body;
}

export function WebhookDetailPanel({ webhook }: { webhook: WebhookDetail }) {
  const headers = Object.entries(webhook.headers).sort(([a], [b]) => a.localeCompare(b));
  const query = Object.entries(webhook.query).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Network className="h-5 w-5 text-sky-300" />
            Capture Details
          </CardTitle>
          <CardDescription>Everything needed to reproduce this event exactly.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-[#0d1117]/80 p-4">
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <Clock3 className="h-4 w-4" />
              Received at
            </div>
            <p className="text-sm text-slate-200">{format(new Date(webhook.receivedAt), "PPP p")}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0d1117]/80 p-4">
            <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">Provider</div>
            <div className="flex items-center gap-2">
              <Badge>{webhook.provider}</Badge>
              <span className="text-xs uppercase text-slate-400">{webhook.method}</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0d1117]/80 p-4 md:col-span-2">
            <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">Route</div>
            <p className="font-mono text-xs text-slate-300">{webhook.path}</p>
          </div>
          {webhook.signature ? (
            <div className="rounded-xl border border-slate-800 bg-[#0d1117]/80 p-4 md:col-span-2">
              <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <Fingerprint className="h-4 w-4" />
                Signature Header
              </div>
              <p className="break-all font-mono text-xs text-slate-300">{webhook.signature}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            Headers
          </CardTitle>
          <CardDescription>{headers.length} captured request headers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="min-w-full text-left text-xs">
              <tbody>
                {headers.map(([name, value]) => (
                  <tr key={name} className="border-b border-slate-900/80">
                    <th className="w-52 px-3 py-2 font-mono text-slate-400">{name}</th>
                    <td className="px-3 py-2 font-mono text-slate-200">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {query.length > 0 ? (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Query params</h4>
              <div className="flex flex-wrap gap-2">
                {query.map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="normal-case tracking-normal">
                    {key}={value}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson2 className="h-5 w-5 text-amber-300" />
            Raw Body
          </CardTitle>
          <CardDescription>Stored exactly as received for deterministic replay.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[520px] overflow-auto rounded-xl border border-slate-800 bg-[#0b0f14] p-4 text-xs leading-relaxed text-slate-200">
            {prettyBody(webhook)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
