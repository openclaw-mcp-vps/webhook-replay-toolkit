import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CapturedWebhook, ReplayLog } from "@/lib/types";

export function WebhookDetails({
  webhook,
  replayLogs
}: {
  webhook: CapturedWebhook;
  replayLogs: ReplayLog[];
}) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Webhook metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-slate-300">
          <p>
            <span className="text-slate-400">Method:</span> {webhook.method}
          </p>
          <p>
            <span className="text-slate-400">Path:</span> {webhook.path}
          </p>
          <p>
            <span className="text-slate-400">Received:</span>{" "}
            {format(new Date(webhook.receivedAt), "PPpp")}
          </p>
          <p>
            <span className="text-slate-400">IP:</span> {webhook.ipAddress}
          </p>
          <p>
            <span className="text-slate-400">Source:</span> {webhook.sourceHint}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Headers</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
            {JSON.stringify(webhook.headers, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payload body</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
            {webhook.bodyText || "[binary payload stored as base64]"}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Replay history</CardTitle>
        </CardHeader>
        <CardContent>
          {replayLogs.length === 0 ? (
            <p className="text-sm text-slate-400">No replay attempts yet.</p>
          ) : (
            <ul className="grid gap-2 text-sm text-slate-300">
              {replayLogs.map((log) => (
                <li key={log.id} className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
                  <p className="font-mono text-xs text-slate-400">{log.targetUrl}</p>
                  <p>
                    Status {log.statusCode} in {log.durationMs}ms
                  </p>
                  <p className="text-xs text-slate-500">{format(new Date(log.createdAt), "PPpp")}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
