import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listWebhooks } from "@/lib/database";
import { WebhookList } from "@/components/webhook-list";

export default async function WebhooksPage({
  searchParams
}: {
  searchParams: Promise<{ provider?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const params = await searchParams;
  const webhooks = listWebhooks(session.user.id, { provider: params.provider, search: params.q });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Captured webhooks</h1>
      <form className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-[160px_1fr_auto]">
        <select
          name="provider"
          defaultValue={params.provider ?? "all"}
          className="h-10 rounded-md border border-[var(--border)] bg-[#0b0f14] px-3 text-sm"
        >
          <option value="all">All providers</option>
          <option value="Stripe">Stripe</option>
          <option value="Shopify">Shopify</option>
          <option value="GitHub">GitHub</option>
          <option value="Unknown">Unknown</option>
        </select>
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search event type, payload, or path"
          className="h-10 rounded-md border border-[var(--border)] bg-[#0b0f14] px-3 text-sm"
        />
        <button className="h-10 rounded-md border border-[var(--border)] px-4 text-sm hover:bg-[var(--surface-2)]">Filter</button>
      </form>
      <WebhookList webhooks={webhooks} />
    </div>
  );
}
