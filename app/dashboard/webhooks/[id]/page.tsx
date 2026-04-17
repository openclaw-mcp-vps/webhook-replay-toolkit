import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWebhookById, listReplaysForWebhook } from "@/lib/database";
import { ReplayForm } from "@/components/replay-form";
import { WebhookDetail } from "@/components/webhook-detail";

export default async function WebhookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const { id } = await params;
  const webhook = getWebhookById(session.user.id, id);

  if (!webhook) {
    notFound();
  }

  const replays = listReplaysForWebhook(webhook.id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Webhook detail</h1>
        <Link href="/dashboard/webhooks" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          Back to webhooks
        </Link>
      </div>
      <ReplayForm webhookId={webhook.id} />
      <WebhookDetail webhook={webhook} replays={replays} />
    </div>
  );
}
