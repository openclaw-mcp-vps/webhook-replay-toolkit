import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, RefreshCcw } from "lucide-react";
import type { WebhookRecord } from "@/lib/db";

type WebhookListProps = {
  items: WebhookRecord[];
};

function badgeClasses(provider: string): string {
  const colorMap: Record<string, string> = {
    stripe: "bg-violet-500/20 text-violet-200 border-violet-400/30",
    shopify: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
    github: "bg-slate-500/30 text-slate-100 border-slate-300/30",
    slack: "bg-pink-500/20 text-pink-200 border-pink-400/30",
    resend: "bg-cyan-500/20 text-cyan-200 border-cyan-400/30",
    postmark: "bg-amber-500/20 text-amber-200 border-amber-400/30",
    custom: "bg-blue-500/20 text-blue-200 border-blue-400/30"
  };

  return colorMap[provider] ?? colorMap.custom;
}

export function WebhookList({ items }: WebhookListProps) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-[#0f1623]/70 p-10 text-center">
        <p className="text-base font-semibold text-slate-100">No webhooks yet</p>
        <p className="mt-2 text-sm text-slate-400">
          Send a test event from Stripe, Shopify, or GitHub to your capture URL
          and it will show up here instantly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/dashboard/webhooks/${item.id}`}
          className="group block rounded-xl border border-slate-700/90 bg-[#111927]/80 p-4 transition hover:border-cyan-400/70 hover:bg-[#132134]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${badgeClasses(
                  item.provider
                )}`}
              >
                {item.provider}
              </span>
              <span className="rounded-md border border-slate-600 bg-slate-800/70 px-2 py-1 font-[family-name:var(--font-plex-mono)] text-[11px] text-slate-300">
                {item.method}
              </span>
              <span className="font-[family-name:var(--font-plex-mono)] text-xs text-slate-400">
                {formatDistanceToNow(new Date(item.received_at), {
                  addSuffix: true
                })}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <RefreshCcw className="h-3.5 w-3.5" />
                {item.replay_count} replays
              </span>
              <span className="inline-flex items-center gap-1 text-cyan-300">
                Open
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>

          <p className="mt-3 truncate font-[family-name:var(--font-plex-mono)] text-sm text-slate-200">
            {item.path}
            {item.query}
          </p>

          <p className="mt-1 truncate text-xs text-slate-400">
            {item.body.slice(0, 160) || "(empty payload)"}
          </p>
        </Link>
      ))}
    </div>
  );
}
