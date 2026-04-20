import Link from "next/link";
import { notFound } from "next/navigation";
import { ReplayModal } from "@/components/ReplayModal";
import { WebhookDetails } from "@/components/WebhookDetails";
import { getServerAuthSession } from "@/lib/auth";
import { getWebhookById, listReplayLogsForWebhook } from "@/lib/db";

export const metadata = {
  title: "Webhook Details"
};

export default async function WebhookDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return null;
  }

  const { id } = await params;

  const webhook = await getWebhookById(session.user.id, id);

  if (!webhook) {
    notFound();
  }

  const replayLogs = await listReplayLogsForWebhook(session.user.id, webhook.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/webhooks"
            className="text-sm text-cyan-300 transition hover:text-cyan-200"
          >
            ← Back to timeline
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-white">
            {webhook.provider.toUpperCase()} webhook
          </h1>
        </div>

        <ReplayModal webhookId={webhook.id} />
      </div>

      <WebhookDetails webhook={webhook} replayLogs={replayLogs} />
    </div>
  );
}
