import { format } from "date-fns";
import type { ReplayLogRecord, WebhookRecord } from "@/lib/db";

type WebhookDetailsProps = {
  webhook: WebhookRecord;
  replayLogs: ReplayLogRecord[];
};

function formatJsonCandidate(raw: string): string {
  if (!raw.trim()) {
    return "(empty payload)";
  }

  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw;
  }
}

export function WebhookDetails({ webhook, replayLogs }: WebhookDetailsProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-700 bg-[#111927]/80 p-5">
        <h2 className="text-lg font-semibold text-white">Request Metadata</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Provider
            </dt>
            <dd className="mt-1 text-slate-100">{webhook.provider}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Method
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-plex-mono)] text-slate-100">
              {webhook.method}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Received At
            </dt>
            <dd className="mt-1 text-slate-100">
              {format(new Date(webhook.received_at), "PPP p")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Source IP
            </dt>
            <dd className="mt-1 text-slate-100">{webhook.source_ip ?? "Unknown"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Path
            </dt>
            <dd className="mt-1 break-all font-[family-name:var(--font-plex-mono)] text-slate-100">
              {webhook.path}
              {webhook.query}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-700 bg-[#111927]/80 p-5">
        <h2 className="text-lg font-semibold text-white">Headers</h2>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-700 bg-[#0d1420] p-4 font-[family-name:var(--font-plex-mono)] text-xs text-slate-200">
          {JSON.stringify(webhook.headers, null, 2)}
        </pre>
      </section>

      <section className="rounded-xl border border-slate-700 bg-[#111927]/80 p-5">
        <h2 className="text-lg font-semibold text-white">Body</h2>
        <pre className="mt-4 max-h-[520px] overflow-auto rounded-lg border border-slate-700 bg-[#0d1420] p-4 font-[family-name:var(--font-plex-mono)] text-xs text-slate-200">
          {formatJsonCandidate(webhook.body)}
        </pre>
      </section>

      <section className="rounded-xl border border-slate-700 bg-[#111927]/80 p-5">
        <h2 className="text-lg font-semibold text-white">Replay History</h2>

        {replayLogs.length ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-700">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-[0.14em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Attempted</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Duration</th>
                </tr>
              </thead>
              <tbody>
                {replayLogs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-800 text-slate-200">
                    <td className="px-4 py-3 text-xs">
                      {format(new Date(log.attempted_at), "MMM d, HH:mm:ss")}
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-plex-mono)] text-xs">
                      <span className="line-clamp-1">{log.target_url}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`rounded-md px-2 py-1 font-semibold ${
                          log.success
                            ? "bg-emerald-400/20 text-emerald-200"
                            : "bg-rose-400/20 text-rose-200"
                        }`}
                      >
                        {log.status_code ? `HTTP ${log.status_code}` : "Failed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">
                      {log.duration_ms}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">
            No replay attempts yet for this webhook.
          </p>
        )}
      </section>
    </div>
  );
}
