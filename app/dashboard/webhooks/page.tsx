import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { WebhookList } from "@/components/WebhookList";
import { getAppSession } from "@/lib/auth";
import { hasPaidAccess } from "@/lib/paywall";
import { listWebhooks } from "@/lib/db";

export default async function WebhooksPage() {
  const session = await getAppSession();
  if (!session?.user?.id || !session.user.email) {
    redirect("/");
  }

  const paid = await hasPaidAccess(session.user.id);
  if (!paid) {
    redirect("/#pricing");
  }

  const webhooks = await listWebhooks(session.user.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <DashboardHeader email={session.user.email} />
      <WebhookList webhooks={webhooks} />
    </main>
  );
}
