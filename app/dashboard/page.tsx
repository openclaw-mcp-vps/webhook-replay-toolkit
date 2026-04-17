import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppSession } from "@/lib/auth";
import { hasPaidAccess } from "@/lib/paywall";
import { findUserById, listWebhooks } from "@/lib/db";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getAppSession();
  if (!session?.user?.id || !session.user.email) {
    redirect("/");
  }

  const params = await searchParams;
  if (params.paid === "1") {
    redirect("/api/paywall/unlock");
  }

  const paid = await hasPaidAccess(session.user.id);
  if (!paid) {
    redirect("/#pricing");
  }

  const user = await findUserById(session.user.id);
  if (!user) {
    redirect("/");
  }

  const webhooks = await listWebhooks(user.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const base = new URL(appUrl);
  const wildcardCaptureUrl =
    base.hostname === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(base.hostname)
      ? null
      : `${base.protocol}//${user.captureSubdomain}.${base.host}/api/webhooks/capture/${user.captureSubdomain}`;
  const pathCaptureUrl = `${appUrl}/api/webhooks/capture/${user.captureSubdomain}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <DashboardHeader email={session.user.email} />

      <Card>
        <CardHeader>
          <CardTitle>Your capture endpoint</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-slate-300">
          <p>
            Use this URL in Stripe, Shopify, GitHub, Slack, Resend, and Postmark webhook settings. Every request is
            recorded with full headers + body.
          </p>
          {wildcardCaptureUrl ? (
            <pre className="overflow-auto rounded-md border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-sky-300">
              {wildcardCaptureUrl}
            </pre>
          ) : null}
          <pre className="overflow-auto rounded-md border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-sky-300">
            {pathCaptureUrl}
          </pre>
          <p className="text-xs text-slate-500">
            Use wildcard DNS in production for per-user subdomains. Path capture URL works everywhere.
          </p>
          <p className="text-xs text-slate-500">Assigned subdomain key: {user.captureSubdomain}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest activity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-slate-300">
          <p>
            Captured events: <span className="font-semibold text-white">{webhooks.length}</span>
          </p>
          <a
            className="inline-flex items-center gap-2 text-sky-300 underline underline-offset-4"
            href="/dashboard/webhooks"
          >
            Open captures <ArrowRight className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>
    </main>
  );
}
