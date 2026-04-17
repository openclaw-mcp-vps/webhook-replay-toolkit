import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ReplayButton } from "@/components/ReplayButton";
import { WebhookDetails } from "@/components/WebhookDetails";
import { getAppSession } from "@/lib/auth";
import { getWebhookById, listReplayLogs } from "@/lib/db";
import { hasPaidAccess } from "@/lib/paywall";

export default async function WebhookDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAppSession();
  if (!session?.user?.id || !session.user.email) {
    redirect("/");
  }

  const paid = await hasPaidAccess(session.user.id);
  if (!paid) {
    redirect("/#pricing");
  }

  const { id } = await params;
  const webhook = await getWebhookById(session.user.id, id);

  if (!webhook) {
    notFound();
  }

  const replayLogs = await listReplayLogs(session.user.id, webhook.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <DashboardHeader email={session.user.email} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Webhook Details</h1>
        <Link href="/dashboard/webhooks" className="text-sm text-sky-300 underline underline-offset-4">
          Back to list
        </Link>
      </div>
      <ReplayButton webhookId={webhook.id} />
      <WebhookDetails replayLogs={replayLogs} webhook={webhook} />
    </main>
  );
}
