import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { format } from "date-fns";
import { WebhookReplayForm } from "@/components/webhook-replay-form";
import { requirePaidAccess } from "@/lib/auth";
import { USER_COOKIE } from "@/lib/constants";
import { ensureDb, pool } from "@/lib/db";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WebhookDetailPage({ params }: Props) {
  await requirePaidAccess();

  const { id } = await params;
  const store = await cookies();
  const userId = store.get(USER_COOKIE)?.value;

  if (!userId) {
    return null;
  }

  await ensureDb();

  const webhookRes = await pool.query<{
    id: string;
    provider: string;
    method: string;
    path: string;
    query_string: string | null;
    headers: Record<string, string>;
    body: string;
    received_at: string;
  }>(
    `SELECT id, provider, method, path, query_string, headers, body, received_at::text AS received_at
     FROM webhooks WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [id, userId],
  );

  const webhook = webhookRes.rows[0];
  if (!webhook) {
    notFound();
  }

  const replayRes = await pool.query<{
    id: string;
    target_url: string;
    status_code: number | null;
    duration_ms: number | null;
    created_at: string;
    error: string | null;
  }>(
    `SELECT id, target_url, status_code, duration_ms, created_at::text AS created_at, error
     FROM replays WHERE webhook_id = $1 AND user_id = $2
     ORDER BY created_at DESC LIMIT 15`,
    [webhook.id, userId],
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#f0f6fc]">Webhook detail</h1>
        <Link href="/dashboard/webhooks" className="text-sm text-[#58a6ff] hover:underline">
          Back to list
        </Link>
      </header>

      <section className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
        <p className="text-xs uppercase text-[#8b949e]">{webhook.provider}</p>
        <h2 className="mt-1 text-lg font-semibold text-[#f0f6fc]">
          {webhook.method} {webhook.path}
          {webhook.query_string ? `?${webhook.query_string}` : ""}
        </h2>
        <p className="mt-2 text-sm text-[#8b949e]">
          Captured {format(new Date(webhook.received_at), "PPpp")}
        </p>
      </section>

      <WebhookReplayForm webhookId={webhook.id} />

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
          <h3 className="mb-3 text-lg font-semibold text-[#f0f6fc]">Headers</h3>
          <pre className="max-h-96 overflow-auto rounded-md bg-[#0d1117] p-4 text-xs text-[#c9d1d9]">
            {JSON.stringify(webhook.headers, null, 2)}
          </pre>
        </article>
        <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
          <h3 className="mb-3 text-lg font-semibold text-[#f0f6fc]">Body</h3>
          <pre className="max-h-96 overflow-auto rounded-md bg-[#0d1117] p-4 text-xs text-[#c9d1d9]">{webhook.body}</pre>
        </article>
      </section>

      <section className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
        <h3 className="mb-3 text-lg font-semibold text-[#f0f6fc]">Recent replays</h3>
        {replayRes.rows.length === 0 ? (
          <p className="text-sm text-[#8b949e]">No replay attempts yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-[#c9d1d9]">
            {replayRes.rows.map((replay) => (
              <li key={replay.id} className="rounded-md border border-[#30363d] bg-[#0d1117] p-3">
                <p>{replay.target_url}</p>
                <p className="text-xs text-[#8b949e]">
                  {format(new Date(replay.created_at), "PPpp")} · status {replay.status_code ?? "error"} · {replay.duration_ms ?? 0}
                  ms{replay.error ? ` · ${replay.error}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
