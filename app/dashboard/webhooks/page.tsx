import Link from "next/link";
import { cookies } from "next/headers";
import { requirePaidAccess } from "@/lib/auth";
import { USER_COOKIE } from "@/lib/constants";
import { ensureDb, pool } from "@/lib/db";
import { WebhookList } from "@/components/webhook-list";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WebhooksPage({ searchParams }: Props) {
  await requirePaidAccess();

  const params = await searchParams;
  const providerFilter = typeof params.provider === "string" ? params.provider.toLowerCase() : "";

  const store = await cookies();
  const userId = store.get(USER_COOKIE)?.value;

  if (!userId) {
    return null;
  }

  await ensureDb();

  const query = providerFilter
    ? `SELECT id, provider, method, path, body_size, received_at::text AS received_at
       FROM webhooks WHERE user_id = $1 AND provider = $2
       ORDER BY received_at DESC LIMIT 100`
    : `SELECT id, provider, method, path, body_size, received_at::text AS received_at
       FROM webhooks WHERE user_id = $1
       ORDER BY received_at DESC LIMIT 100`;

  const values = providerFilter ? [userId, providerFilter] : [userId];
  const { rows } = await pool.query(query, values);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#f0f6fc]">Captured webhooks</h1>
          <p className="text-sm text-[#8b949e]">Showing the latest 100 events for your workspace.</p>
        </div>
        <Link href="/dashboard" className="text-sm text-[#58a6ff] hover:underline">
          Back to dashboard
        </Link>
      </header>

      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { label: "All", href: "/dashboard/webhooks" },
          { label: "Stripe", href: "/dashboard/webhooks?provider=stripe" },
          { label: "Shopify", href: "/dashboard/webhooks?provider=shopify" },
          { label: "GitHub", href: "/dashboard/webhooks?provider=github" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-full border border-[#30363d] px-3 py-1 text-[#8b949e] hover:bg-[#161b22]"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <WebhookList webhooks={rows} />
    </main>
  );
}
