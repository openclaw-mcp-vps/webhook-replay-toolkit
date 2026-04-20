import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { getServerAuthSession } from "@/lib/auth";
import { getPaymentStatus } from "@/lib/db";
import { PAYWALL_COOKIE_NAME, verifyPaidCookieValue } from "@/lib/paywall";
import { buildCaptureUrls } from "@/lib/webhook-proxy";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/login?next=/dashboard");
  }

  const cookieStore = await cookies();
  const paidCookie = cookieStore.get(PAYWALL_COOKIE_NAME)?.value;
  const cookieValid = verifyPaidCookieValue(paidCookie, session.user.id);

  if (!cookieValid) {
    const status = await getPaymentStatus(session.user.id);

    if (status !== "active") {
      redirect("/?paywall=1");
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const captureUrls = buildCaptureUrls({
    appUrl,
    captureKey: session.user.captureKey,
    subdomain: session.user.subdomain
  });

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-[#0c121b]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <Link
              href="/dashboard"
              className="font-[family-name:var(--font-plex-mono)] text-xs uppercase tracking-[0.18em] text-cyan-300"
            >
              Webhook Replay Toolkit
            </Link>
            <p className="mt-1 text-sm text-slate-300">{session.user.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-white"
            >
              Overview
            </Link>
            <Link
              href="/dashboard/webhooks"
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-white"
            >
              Webhooks
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-8 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
            Your capture endpoint
          </p>
          <code className="mt-2 block overflow-x-auto rounded-md border border-cyan-500/30 bg-[#0b111a] p-2 font-[family-name:var(--font-plex-mono)] text-xs text-cyan-100">
            {captureUrls.pathUrl}
          </code>
          {captureUrls.subdomainUrl ? (
            <code className="mt-2 block overflow-x-auto rounded-md border border-cyan-500/20 bg-[#0b111a] p-2 font-[family-name:var(--font-plex-mono)] text-xs text-cyan-100">
              {captureUrls.subdomainUrl}
            </code>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  );
}
