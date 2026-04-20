import { getServerAuthSession } from "@/lib/auth";
import { listWebhooksByUser } from "@/lib/db";
import { WebhookList } from "@/components/WebhookList";

export const metadata = {
  title: "Webhook Events"
};

type SearchParamValue = string | string[] | undefined;

function toSingle(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function WebhooksPage({
  searchParams
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const [session, params] = await Promise.all([
    getServerAuthSession(),
    searchParams
  ]);

  if (!session?.user?.id) {
    return null;
  }

  const provider = toSingle(params.provider) || "all";
  const search = toSingle(params.q) || "";

  const webhooks = await listWebhooksByUser(session.user.id, {
    provider,
    search,
    limit: 150
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Webhook Timeline</h1>
        <p className="mt-2 text-sm text-slate-400">
          Filter by provider or keyword, then open any event to inspect payload
          details and run replay tests.
        </p>
      </div>

      <form className="grid gap-3 rounded-xl border border-slate-700 bg-[#111927]/80 p-4 md:grid-cols-[1fr,180px,auto]">
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search path, body, or provider"
          className="w-full rounded-lg border border-slate-700 bg-[#0b111c] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
        />
        <select
          name="provider"
          defaultValue={provider}
          className="rounded-lg border border-slate-700 bg-[#0b111c] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
        >
          <option value="all">All providers</option>
          <option value="stripe">Stripe</option>
          <option value="shopify">Shopify</option>
          <option value="github">GitHub</option>
          <option value="slack">Slack</option>
          <option value="resend">Resend</option>
          <option value="postmark">Postmark</option>
          <option value="custom">Custom</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Apply Filters
        </button>
      </form>

      <WebhookList items={webhooks} />
    </div>
  );
}
