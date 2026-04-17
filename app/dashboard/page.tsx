import Link from "next/link";
import { cookies } from "next/headers";
import { requirePaidAccess } from "@/lib/auth";
import { USER_COOKIE } from "@/lib/constants";
import { ensureDb, ensureUser, pool } from "@/lib/db";

export default async function DashboardPage() {
  await requirePaidAccess();

  const store = await cookies();
  const userId = store.get(USER_COOKIE)?.value;

  if (!userId) {
    return null;
  }

  await ensureDb();
  await ensureUser(userId);

  const [webhookCountRes, replayCountRes] = await Promise.all([
    pool.query<{ total: string }>("SELECT COUNT(*)::text AS total FROM webhooks WHERE user_id = $1", [userId]),
    pool.query<{ total: string }>("SELECT COUNT(*)::text AS total FROM replays WHERE user_id = $1", [userId]),
  ]);

  const webhookCount = Number.parseInt(webhookCountRes.rows[0]?.total ?? "0", 10);
  const replayCount = Number.parseInt(replayCountRes.rows[0]?.total ?? "0", 10);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#f0f6fc]">Dashboard</h1>
          <p className="text-sm text-[#8b949e]">Capture URL is unique per workspace user cookie: {userId}</p>
        </div>
        <Link
          href="/dashboard/webhooks"
          className="w-fit rounded-md bg-[#238636] px-4 py-2 text-sm font-medium text-white hover:bg-[#2ea043]"
        >
          View captured webhooks
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <p className="text-sm text-[#8b949e]">Captured events</p>
          <p className="mt-2 text-3xl font-bold text-[#f0f6fc]">{webhookCount}</p>
        </article>
        <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <p className="text-sm text-[#8b949e]">Replay attempts</p>
          <p className="mt-2 text-3xl font-bold text-[#f0f6fc]">{replayCount}</p>
        </article>
        <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <p className="text-sm text-[#8b949e]">Capture endpoint</p>
          <p className="mt-2 break-all font-mono text-xs text-[#58a6ff]">/api/webhooks/capture/{userId}</p>
        </article>
      </section>

      <section className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
        <h2 className="text-lg font-semibold text-[#f0f6fc]">Setup in under 2 minutes</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[#c9d1d9]">
          <li>Copy your capture URL from above.</li>
          <li>Paste it in Stripe, Shopify, GitHub, or Slack webhook settings.</li>
          <li>Trigger one event in production.</li>
          <li>Open that event in the webhooks tab and replay it to your target endpoint.</li>
        </ol>
      </section>
    </main>
  );
}
