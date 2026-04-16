import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPaidAccess } from "@/lib/paywall";
import { WebhookDetails } from "@/components/webhook-details";
import { ReplayForm } from "@/components/replay-form";

export default async function WebhookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const paid = await hasPaidAccess(session.user.id);
  if (!paid) {
    redirect("/#pricing");
  }

  const webhook = await db.webhookEvent.findFirst({
    where: { id, userId: session.user.id }
  });

  if (!webhook) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Webhook detail</h1>
        <Link href="/dashboard/webhooks" className="text-sm text-[#58a6ff] hover:underline">Back to list</Link>
      </div>
      <ReplayForm webhookId={webhook.id} />
      <WebhookDetails webhook={webhook} />
    </main>
  );
}
