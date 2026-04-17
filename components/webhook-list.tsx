import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight } from "lucide-react";

export type WebhookItem = {
  id: string;
  provider: string;
  method: string;
  path: string;
  body_size: number;
  received_at: string;
};

type WebhookListProps = {
  webhooks: WebhookItem[];
};

export function WebhookList({ webhooks }: WebhookListProps) {
  if (webhooks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#30363d] bg-[#161b22] p-8 text-center text-sm text-[#8b949e]">
        No webhooks captured yet. Point Stripe, Shopify, or GitHub at your capture URL and refresh.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#30363d]">
      <table className="min-w-full divide-y divide-[#30363d] bg-[#161b22] text-sm">
        <thead className="bg-[#0d1117] text-left text-[#8b949e]">
          <tr>
            <th className="px-4 py-3 font-medium">Provider</th>
            <th className="px-4 py-3 font-medium">Request</th>
            <th className="px-4 py-3 font-medium">Payload</th>
            <th className="px-4 py-3 font-medium">Captured</th>
            <th className="px-4 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#30363d] text-[#c9d1d9]">
          {webhooks.map((webhook) => (
            <tr key={webhook.id}>
              <td className="px-4 py-3 capitalize">{webhook.provider}</td>
              <td className="px-4 py-3">
                <span className="mr-2 rounded bg-[#1f6feb]/20 px-2 py-1 text-xs uppercase text-[#58a6ff]">
                  {webhook.method}
                </span>
                {webhook.path}
              </td>
              <td className="px-4 py-3">{(webhook.body_size / 1024).toFixed(1)} KB</td>
              <td className="px-4 py-3">{formatDistanceToNow(new Date(webhook.received_at), { addSuffix: true })}</td>
              <td className="px-4 py-3">
                <Link href={`/dashboard/webhooks/${webhook.id}`} className="inline-flex items-center gap-1 text-[#58a6ff] hover:underline">
                  Inspect <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
