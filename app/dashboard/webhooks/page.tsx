import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPaidAccess } from "@/lib/paywall";
import { WebhookList } from "@/components/webhook-list";

export default async function WebhooksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const paid = await hasPaidAccess(session.user.id);
  if (!paid) {
    redirect("/#pricing");
  }

  const webhooks = await db.webhookEvent.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold">Captured webhooks</h1>
      <WebhookList webhooks={webhooks} />
    </main>
  );
}
