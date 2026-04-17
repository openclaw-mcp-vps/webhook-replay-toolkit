import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import type { WebhookRecord } from "@/lib/database";

type WebhookListProps = {
  webhooks: WebhookRecord[];
};

export function WebhookList({ webhooks }: WebhookListProps) {
  if (!webhooks.length) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
        No webhooks captured yet. Send your provider to the capture URL shown in Dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {webhooks.map((webhook) => (
        <Link
          key={webhook.id}
          href={`/dashboard/webhooks/${webhook.id}`}
          className="block rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[#3fb950]/60 hover:bg-[var(--surface-2)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                {webhook.provider} · {webhook.eventType}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {webhook.method} {webhook.path}
                {webhook.query ? `?${webhook.query}` : ""}
              </p>
            </div>
            <p className="text-xs text-[var(--muted)]">
              {formatDistanceToNowStrict(new Date(webhook.receivedAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
