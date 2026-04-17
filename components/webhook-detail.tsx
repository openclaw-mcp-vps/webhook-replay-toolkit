import { format } from "date-fns";
import type { ReplayRecord, WebhookRecord } from "@/lib/database";

type WebhookDetailProps = {
  webhook: WebhookRecord;
  replays: ReplayRecord[];
};

export function WebhookDetail({ webhook, replays }: WebhookDetailProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-semibold">Webhook snapshot</h2>
        <div className="mt-3 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
          <p>
            Provider: <span className="text-[var(--text)]">{webhook.provider}</span>
          </p>
          <p>
            Event: <span className="text-[var(--text)]">{webhook.eventType}</span>
          </p>
          <p>
            Method: <span className="text-[var(--text)]">{webhook.method}</span>
          </p>
          <p>
            Received: <span className="text-[var(--text)]">{format(new Date(webhook.receivedAt), "PPpp")}</span>
          </p>
          <p className="sm:col-span-2">
            Source: <span className="text-[var(--text)]">{webhook.ip}</span>
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <h3 className="text-base font-semibold">Headers</h3>
        <pre className="mt-3 max-h-80 overflow-auto rounded-md border border-[var(--border)] bg-[#0b0f14] p-3 text-xs">
          {JSON.stringify(webhook.headers, null, 2)}
        </pre>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <h3 className="text-base font-semibold">Body</h3>
        <pre className="mt-3 max-h-96 overflow-auto rounded-md border border-[var(--border)] bg-[#0b0f14] p-3 text-xs">
          {webhook.body || "(empty)"}
        </pre>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <h3 className="text-base font-semibold">Replay history</h3>
        <div className="mt-3 space-y-2">
          {!replays.length ? (
            <p className="text-sm text-[var(--muted)]">No replays for this event yet.</p>
          ) : (
            replays.map((replay) => (
              <div key={replay.id} className="rounded-md border border-[var(--border)] p-3 text-sm">
                <p className="font-medium text-[var(--text)]">{replay.targetUrl}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {format(new Date(replay.createdAt), "PPpp")} · status {replay.status ?? "error"} · {replay.durationMs}ms
                </p>
                {replay.error ? <p className="mt-1 text-xs text-red-400">{replay.error}</p> : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
