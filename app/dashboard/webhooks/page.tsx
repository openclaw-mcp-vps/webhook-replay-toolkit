import { Search } from "lucide-react";

import { WebhookList } from "@/components/webhook-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listWebhooks, type WebhookSummary } from "@/lib/db";

export const dynamic = "force-dynamic";

type WebhooksPageProps = {
  searchParams?: Promise<{ provider?: string; q?: string }>;
};

export default async function WebhooksPage({ searchParams }: WebhooksPageProps) {
  const params = (await searchParams) ?? {};
  const provider = params.provider?.trim() || "all";
  const search = params.q?.trim() || "";

  let items: WebhookSummary[] = [];
  let error: string | null = null;

  try {
    items = await listWebhooks({
      provider,
      search,
      limit: 200
    });
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Could not load webhook list.";
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Captured Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-[200px_1fr_auto]" method="GET">
            <select
              name="provider"
              defaultValue={provider}
              className="h-10 rounded-lg border border-slate-700 bg-[#0d1117] px-3 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <option value="all">All providers</option>
              <option value="stripe">Stripe</option>
              <option value="shopify">Shopify</option>
              <option value="github">GitHub</option>
              <option value="slack">Slack</option>
              <option value="resend">Resend</option>
              <option value="postmark">Postmark</option>
            </select>
            <Input name="q" defaultValue={search} placeholder="Search path, provider, or payload text" />
            <Button type="submit" className="inline-flex items-center gap-2">
              <Search className="h-4 w-4" />
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-amber-700/40 bg-amber-950/20">
          <CardContent className="pt-6 text-sm text-amber-100">{error}</CardContent>
        </Card>
      ) : (
        <WebhookList
          title="Captured webhook events"
          description="Inspect payloads and replay from the detail page."
          items={items}
        />
      )}
    </div>
  );
}
